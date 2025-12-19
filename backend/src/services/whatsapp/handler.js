/**
 * WhatsApp Handler
 * Main orchestrator for incoming WhatsApp messages via Green API
 */
const { query } = require("../../config/database");
const greenAPI = require("../../config/greenapi");
const usersService = require("../users");
const groupsService = require("../groups");
const paymentsService = require("../payments");
const cyclesService = require("../cycles");
const aiAgentService = require("../aiAgent");
const templates = require("../../templates/whatsapp");
const translationService = require("../translation");
const templateTranslator = require("./templateTranslator");
const imageSender = require("./imageSender");

class WhatsAppHandler {
  constructor() {
    // Track processed message IDs to prevent duplicates
    this.processedMessages = new Map();
    // Clean up old entries every 5 minutes (keep last 1000 messages)
    setInterval(() => {
      if (this.processedMessages.size > 1000) {
        const entries = Array.from(this.processedMessages.entries());
        // Keep only the most recent 500 entries
        this.processedMessages.clear();
        entries.slice(-500).forEach(([key, value]) => {
          this.processedMessages.set(key, value);
        });
      }
    }, 5 * 60 * 1000);
  }
  /**
   * Handle incoming webhook from Green API
   */
  async handleWebhook(webhookData) {
    try {
      const { typeWebhook } = webhookData;

      // Only process incoming messages
      if (typeWebhook !== "incomingMessageReceived") {
        console.log(`📨 Skipping webhook type: ${typeWebhook}`);
        return;
      }

      // Extract message data
      const { senderData, messageData } = webhookData;

      if (!senderData || !senderData.sender) {
        console.error("Missing sender data in webhook");
        return;
      }

      // Extract message ID for deduplication
      const messageId = messageData?.idMessage || messageData?.id || null;

      // Prevent duplicate processing
      if (messageId && this.processedMessages.has(messageId)) {
        console.log(`⏭️ Skipping duplicate message: ${messageId}`);
        return;
      }

      // Mark message as processed
      if (messageId) {
        this.processedMessages.set(messageId, Date.now());
      }

      // Extract phone number (remove @c.us suffix)
      const phone = senderData.sender.replace("@c.us", "");
      const senderName = senderData.senderName || "User";

      // CRITICAL: Only respond to users who have contacted us first
      // This prevents sending messages to contacts who haven't initiated contact
      console.log(
        `📨 Incoming message from ${phone} (${senderName})${
          messageId ? ` [ID: ${messageId}]` : ""
        }`
      );

      // Extract message text - try multiple formats
      let message = "";

      // Try different message extraction paths
      if (messageData?.textMessageData?.textMessage) {
        message = messageData.textMessageData.textMessage;
      } else if (messageData?.textMessage) {
        message = messageData.textMessage;
      } else if (messageData?.extendedTextMessageData?.text) {
        message = messageData.extendedTextMessageData.text;
      } else if (
        messageData?.typeMessage === "textMessage" &&
        messageData.textMessageData?.textMessage
      ) {
        message = messageData.textMessageData.textMessage;
      } else if (typeof messageData === "string") {
        message = messageData;
      }

      // Debug: Log webhook structure if no message found
      if (!message || message.trim().length === 0) {
        console.log(`📨 Skipping webhook - no text message from ${phone}`);
        console.log(
          "🔍 Debug - Webhook structure:",
          JSON.stringify(
            {
              typeWebhook: webhookData.typeWebhook,
              hasMessageData: !!messageData,
              messageDataType: messageData?.typeMessage,
              messageDataKeys: messageData ? Object.keys(messageData) : [],
              fullMessageData: messageData,
            },
            null,
            2
          )
        );
        return;
      }

      console.log(`📨 Message from ${phone}: ${message}`);

      // Get or create user
      let user;
      try {
        user = await usersService.getUserByPhone(phone);
      } catch (dbError) {
        console.error("❌ Database error getting user:", dbError);
        // Try to send error message, but don't crash
        try {
          await this.sendMessage(
            phone,
            "⚠️ Service temporarily unavailable. Please try again in a moment."
          );
        } catch (sendError) {
          console.error("❌ Could not send error message:", sendError);
        }
        return;
      }

      if (!user) {
        try {
          // Create user and mark as having contacted us
          user = await usersService.createUser(phone, senderName);
          console.log(`👤 New user created: ${phone}`);

          // Mark that this user has contacted us (important for notification filtering)
          // Set step to language selection
          try {
            await query(
              `UPDATE users SET has_contacted_us = TRUE, first_contact_at = NOW(), current_step = 'selecting_language' WHERE id = $1`,
              [user.id]
            );
          } catch (updateError) {
            console.warn(
              "⚠️ Could not update contact flag:",
              updateError.message
            );
          }

          // Send welcome message (only because they contacted us first)
          await this.sendWelcomeMessage(phone, user.display_name || senderName);
          return;
        } catch (createError) {
          console.error("❌ Error creating user:", createError);
          try {
            await this.sendMessage(
              phone,
              "Sorry, there was an error setting up your account. Please try again later."
            );
          } catch (sendError) {
            console.error("❌ Could not send error message:", sendError);
          }
          return;
        }
      } else {
        // Update last seen and mark as having contacted us
        try {
          await query(
            `UPDATE users 
             SET last_seen_at = NOW(), 
                 has_contacted_us = TRUE,
                 first_contact_at = COALESCE(first_contact_at, NOW())
             WHERE id = $1`,
            [user.id]
          );
        } catch (updateError) {
          console.warn("⚠️ Could not update user status:", updateError.message);
          // Continue anyway - not critical
        }
      }

      // Ensure user has phone_e164 set (use phone from webhook if missing)
      if (!user.phone_e164 && !user.phone) {
        user.phone_e164 = phone;
      }

      // Route message
      try {
        await this.routeMessage(user, message, phone);
      } catch (routeError) {
        console.error("❌ Error routing message:", routeError);
        // Try to send error message
        try {
          await this.sendMessage(
            phone,
            "⚠️ Sorry, I encountered an error processing your message. Please try again or type MENU for options."
          );
        } catch (sendError) {
          console.error("❌ Could not send error message:", sendError);
        }
      }
    } catch (error) {
      console.error("Error handling webhook:", error);
    }
  }

  /**
   * Route message to appropriate handler
   */
  async routeMessage(user, message, phoneFromWebhook = null) {
    try {
      const msg = message.toLowerCase().trim();

      // Get phone number - prioritize webhook phone, then user object
      const userPhone = phoneFromWebhook || user.phone_e164 || user.phone;

      if (!userPhone) {
        console.error("❌ No phone number available for user:", user.id);
        return;
      }

      // Detect language for non-command messages (for translation)
      let detectedLanguage = null;
      if (
        !["hi", "hello", "hey", "menu", "start", "help"].includes(msg) &&
        !msg.match(/^[0-9]{1,2}$/)
      ) {
        detectedLanguage = await translationService.detectLanguage(message);
        console.log(
          `🌍 Detected language: ${detectedLanguage} for message: ${message.substring(
            0,
            50
          )}`
        );

        // Update user locale if consistently using different language
        if (detectedLanguage !== user.locale && detectedLanguage !== "en") {
          await this.updateLocaleIfConsistent(user, detectedLanguage);
        }
      }

      // Universal commands (highest priority)
      if (["hi", "hello", "hey", "menu", "start", "help"].includes(msg)) {
        if (msg === "help") {
          return await this.sendHelp(userPhone, detectedLanguage);
        }
        return await this.sendMainMenu(userPhone, user.role, detectedLanguage);
      }

      // Language selection (for new users or when locale is not set)
      if (
        user.current_step === "selecting_language" ||
        !user.locale ||
        user.locale === "en"
      ) {
        if (msg === "1" || msg === "2" || msg === "3") {
          return await this.handleLanguageSelection(user, msg, userPhone);
        }
      }

      // OTP verification flow
      if (user.current_step === "awaiting_otp") {
        return await this.handleOTPVerification(user, message);
      }

      // Admin commands
      if (user.role === "platform_admin" && msg === "admin menu") {
        return await this.sendAdminMenu(userPhone, detectedLanguage);
      }

      // Group admin commands
      if (user.role === "group_admin" && msg.startsWith("admin")) {
        return await this.sendGroupAdminMenu(userPhone, detectedLanguage);
      }

      // Service flow commands (if in service)
      if (user.current_service) {
        return await this.handleServiceFlow(user, message, userPhone);
      }

      // Main menu selection (numbers)
      if (msg.match(/^[0-9]{1,2}$/)) {
        const option = parseInt(msg);
        return await this.handleMainMenuSelection(
          user,
          option,
          userPhone,
          detectedLanguage
        );
      }

      // Natural language (AI agent)
      return await this.handleNaturalLanguage(
        user,
        message,
        userPhone,
        detectedLanguage
      );
    } catch (error) {
      console.error("Error routing message:", error);
      const userPhone = phoneFromWebhook || user.phone_e164 || user.phone;
      if (userPhone) {
        await this.sendMessage(
          userPhone,
          "Sorry, I encountered an error. Please try again or type MENU for options."
        );
      }
    }
  }

  /**
   * Handle language selection
   */
  async handleLanguageSelection(user, message, userPhone = null) {
    const phone = userPhone || user.phone_e164 || user.phone;
    const msg = message.trim();
    const locale = translationService.getLanguageCode(msg);
    const languageName = translationService.getLanguageName(locale);

    try {
      // Update user locale
      await query(
        `UPDATE users SET locale = $1, current_step = NULL, updated_at = NOW() WHERE id = $2`,
        [locale, user.id]
      );

      // Refresh user object
      user = await usersService.getUserById(user.id);

      // Send confirmation in selected language
      const confirmationMsg =
        locale === "en"
          ? `✅ Language set to English!\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💡 Type MENU to see the main menu`
          : await translationService.translate(
              `✅ Language set to ${languageName}!\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💡 Type MENU to see the main menu`,
              locale
            );

      await this.sendMessage(phone, confirmationMsg);

      // Send main menu in selected language
      await this.sendMainMenu(phone, user.role, locale);
    } catch (error) {
      console.error("Error setting language:", error);
      await this.sendMessage(
        phone,
        "Sorry, there was an error setting your language. Please try again."
      );
    }
  }

  /**
   * Update locale if user consistently uses a different language
   */
  async updateLocaleIfConsistent(user, detectedLanguage) {
    try {
      // Check last 3 messages to see if user is consistently using this language
      const recentMessages = await query(
        `SELECT content FROM likelemba.conversation_history 
         WHERE user_id = $1 AND role = 'user' 
         ORDER BY created_at DESC LIMIT 3`,
        [user.id]
      );

      if (recentMessages.rows.length >= 2) {
        // If 2+ recent messages detected in same language, update locale
        const languages = await Promise.all(
          recentMessages.rows.map((r) =>
            translationService.detectLanguage(r.content)
          )
        );

        const sameLanguageCount = languages.filter(
          (l) => l === detectedLanguage
        ).length;

        if (sameLanguageCount >= 2) {
          await query(
            `UPDATE users SET locale = $1, updated_at = NOW() WHERE id = $2`,
            [detectedLanguage, user.id]
          );
          console.log(
            `✅ Updated user locale to ${detectedLanguage} (consistent usage)`
          );
        }
      }
    } catch (error) {
      console.warn("⚠️ Could not check language consistency:", error.message);
    }
  }

  /**
   * Handle main menu selection
   */
  async handleMainMenuSelection(
    user,
    option,
    userPhone = null,
    detectedLanguage = null
  ) {
    const phone = userPhone || user.phone_e164 || user.phone;

    switch (option) {
      case 1:
        // My Groups
        const groups = await groupsService.getUserGroups(user.id);
        const groupsMsg = await templateTranslator.listGroups(
          user,
          groups,
          detectedLanguage
        );
        await this.sendMessage(phone, groupsMsg);
        break;
      case 2:
        // Pay Contribution
        await this.handlePayContribution(user, phone, detectedLanguage);
        break;
      case 3:
        // Next Payout
        await this.handleNextPayout(user, phone, detectedLanguage);
        break;
      case 4:
        // My Receipts
        await this.handleMyReceipts(user, phone, detectedLanguage);
        break;
      case 5:
        // Support
        await this.handleSupport(user, phone, detectedLanguage);
        break;
      case 6:
        // Settings
        await this.handleSettings(user, phone, detectedLanguage);
        break;
      default:
        const errorMsg =
          detectedLanguage && detectedLanguage !== "en"
            ? await translationService.translate(
                "Invalid option. Please choose 1-6.",
                detectedLanguage
              )
            : "Invalid option. Please choose 1-6.";
        await this.sendMessage(phone, errorMsg);
    }
  }

  /**
   * Handle service flow
   */
  async handleServiceFlow(user, message, userPhone = null) {
    // This will be implemented based on current service
    // For now, fallback to AI agent with language detection
    const detectedLanguage = await translationService.detectLanguage(message);
    return await this.handleNaturalLanguage(
      user,
      message,
      userPhone,
      detectedLanguage
    );
  }

  /**
   * Handle natural language with AI agent
   * Only responds to users who have contacted us first
   * Auto-detects language and responds accordingly
   */
  async handleNaturalLanguage(
    user,
    message,
    userPhone = null,
    detectedLanguage = null
  ) {
    try {
      const phone = userPhone || user.phone_e164 || user.phone;
      if (!phone) {
        console.error("❌ No phone number available for AI agent");
        return;
      }

      // Verify user has contacted us first
      try {
        const userCheck = await query(
          `SELECT has_contacted_us FROM users WHERE id = $1`,
          [user.id]
        );

        if (userCheck.rows.length > 0 && !userCheck.rows[0].has_contacted_us) {
          console.log(
            `⏭️ Skipping AI response to ${phone} - user has not contacted us first`
          );
          // Still send a polite message explaining they need to initiate
          await this.sendMessage(
            phone,
            "👋 Hi! I can only respond to messages you send me. Please send me a message first, and I'll be happy to help!",
            true // Allow this one message
          );
          return;
        }
      } catch (checkError) {
        console.warn(
          "⚠️ Could not verify contact status for AI:",
          checkError.message
        );
        // Continue if check fails (don't block)
      }

      // Auto-detect language if not provided
      if (!detectedLanguage) {
        detectedLanguage = await translationService.detectLanguage(message);
        console.log(
          `🌍 Auto-detected language: ${detectedLanguage} for message: ${message.substring(
            0,
            50
          )}`
        );
      }

      // Update user locale if different (learn from usage)
      if (detectedLanguage !== user.locale && detectedLanguage !== "en") {
        try {
          await query(
            `UPDATE users SET locale = $1, updated_at = NOW() WHERE id = $2`,
            [detectedLanguage, user.id]
          );
          // Refresh user object
          user = await usersService.getUserById(user.id);
          console.log(
            `✅ Updated user locale to ${detectedLanguage} based on message`
          );
        } catch (updateError) {
          console.warn("⚠️ Could not update locale:", updateError.message);
        }
      }

      console.log(
        `🤖 AI Agent processing message from ${phone} in ${detectedLanguage}: ${message.substring(
          0,
          50
        )}...`
      );
      const response = await aiAgentService.processMessage(
        user,
        message,
        detectedLanguage
      );
      await this.sendMessage(phone, response);
    } catch (error) {
      console.error("AI Agent error:", error);
      // Provide helpful error message instead of just showing menu
      const phone = userPhone || user.phone_e164 || user.phone;
      if (phone) {
        const errorMsg =
          error.message || "AI service is temporarily unavailable";
        await this.sendMessage(
          phone,
          `⚠️ ${errorMsg}\n\nPlease use the menu options (type MENU) or try again later.`
        );
      } else {
        console.error("❌ Cannot send AI error message - no phone number");
      }
      // Don't fallback to menu automatically - let user decide
    }
  }

  /**
   * Send main menu
   */
  async sendMainMenu(phone, role = "member", detectedLanguage = null) {
    const user = await usersService.getUserByPhone(phone);
    const menu = await templateTranslator.menu(user, role, detectedLanguage);
    await this.sendMessage(phone, menu);
  }

  /**
   * Send help
   */
  async sendHelp(phone, detectedLanguage = null) {
    const user = await usersService.getUserByPhone(phone);
    const helpMsg = await templateTranslator.help(user, detectedLanguage);
    await this.sendMessage(phone, helpMsg);
  }

  /**
   * Send admin menu
   */
  async sendAdminMenu(phone, detectedLanguage = null) {
    const user = await usersService.getUserByPhone(phone);
    const menu = await templateTranslator.adminMenu(user, detectedLanguage);
    await this.sendMessage(phone, menu);
  }

  /**
   * Send group admin menu
   */
  async sendGroupAdminMenu(phone, detectedLanguage = null) {
    const user = await usersService.getUserByPhone(phone);
    const menu = await templateTranslator.groupAdminMenu(
      user,
      detectedLanguage
    );
    await this.sendMessage(phone, menu);
  }

  /**
   * Handle pay contribution flow
   */
  async handlePayContribution(user, userPhone = null, detectedLanguage = null) {
    const phone = userPhone || user.phone_e164 || user.phone;
    // Get user's pending contributions
    const contributions = await cyclesService.getPendingContributions(user.id);
    if (contributions.length === 0) {
      const emptyMsg =
        detectedLanguage && detectedLanguage !== "en"
          ? await translationService.translate(
              "You have no pending contributions.",
              detectedLanguage
            )
          : "You have no pending contributions.";
      await this.sendMessage(phone, emptyMsg);
      return;
    }

    const contributionsMsg = await templateTranslator.listPending(
      user,
      contributions,
      detectedLanguage
    );
    await this.sendMessage(phone, contributionsMsg);
  }

  /**
   * Handle next payout
   */
  async handleNextPayout(user, userPhone = null, detectedLanguage = null) {
    const phone = userPhone || user.phone_e164 || user.phone;
    const nextPayout = await cyclesService.getNextPayout(user.id);
    if (!nextPayout) {
      const emptyMsg =
        detectedLanguage && detectedLanguage !== "en"
          ? await translationService.translate(
              "You have no scheduled payouts.",
              detectedLanguage
            )
          : "You have no scheduled payouts.";
      await this.sendMessage(phone, emptyMsg);
      return;
    }

    const payoutMsg = await templateTranslator.nextPayout(
      user,
      nextPayout,
      detectedLanguage
    );
    await this.sendMessage(phone, payoutMsg);
  }

  /**
   * Handle my receipts
   */
  async handleMyReceipts(user, userPhone = null, detectedLanguage = null) {
    const phone = userPhone || user.phone_e164 || user.phone;
    const receipts = await paymentsService.getUserReceipts(user.id);
    if (receipts.length === 0) {
      const emptyMsg =
        detectedLanguage && detectedLanguage !== "en"
          ? await translationService.translate(
              "You have no receipts yet.",
              detectedLanguage
            )
          : "You have no receipts yet.";
      await this.sendMessage(phone, emptyMsg);
      return;
    }

    const receiptsMsg = await templateTranslator.listReceipts(
      user,
      receipts,
      detectedLanguage
    );
    await this.sendMessage(phone, receiptsMsg);
  }

  /**
   * Handle support
   */
  async handleSupport(user, userPhone = null, detectedLanguage = null) {
    const phone = userPhone || user.phone_e164 || user.phone;
    const supportMsg = await templateTranslator.supportMenu(
      user,
      detectedLanguage
    );
    await this.sendMessage(phone, supportMsg);
  }

  /**
   * Handle settings
   */
  async handleSettings(user, userPhone = null, detectedLanguage = null) {
    const phone = userPhone || user.phone_e164 || user.phone;
    const settingsMsg = await templateTranslator.settingsMenu(
      user,
      detectedLanguage
    );
    await this.sendMessage(phone, settingsMsg);
  }

  /**
   * Handle OTP verification
   */
  async handleOTPVerification(user, message) {
    const otpService = require("../users/otp");
    const { query } = require("../../config/database");

    const otp = message.trim();
    const result = await otpService.verifyOTP(user.phone_e164, otp);

    if (result.success) {
      // Clear OTP step
      await query(
        "UPDATE users SET current_step = NULL, updated_at = NOW() WHERE id = $1",
        [user.id]
      );

      // Refresh user to get updated locale
      user = await usersService.getUserById(user.id);
      const detectedLanguage = user.locale || "en";

      const successMsg =
        detectedLanguage !== "en"
          ? await translationService.translate(
              "✅ Verification successful! Welcome to Likelemba.",
              detectedLanguage
            )
          : "✅ Verification successful! Welcome to Likelemba.";

      await this.sendMessage(user.phone_e164, successMsg);
      await this.sendMainMenu(user.phone_e164, user.role, detectedLanguage);
    } else {
      // Refresh user to get updated locale
      user = await usersService.getUserById(user.id);
      const detectedLanguage = user.locale || "en";

      const errorMsg =
        detectedLanguage !== "en"
          ? await translationService.translate(
              `❌ ${
                result.message || "Invalid OTP"
              }. Please try again or type RESEND to get a new code.`,
              detectedLanguage
            )
          : `❌ ${
              result.message || "Invalid OTP"
            }. Please try again or type RESEND to get a new code.`;

      await this.sendMessage(user.phone_e164, errorMsg);
    }
  }

  /**
   * Send welcome message
   */
  async sendWelcomeMessage(phone, name) {
    try {
      const user = await usersService.getUserByPhone(phone);

      // Send logo first (if available)
      const logoPath = "backend/assets/images/likelemba-logo-banner.png";
      await imageSender.sendImage(phone, logoPath, "").catch((err) => {
        console.log("Logo not sent (non-critical):", err.message);
      });

      // Small delay before sending text message
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Send welcome text message
      const welcomeText = await templateTranslator.welcomeMessage(user, name);
      await this.sendMessage(phone, welcomeText);
    } catch (error) {
      console.error("Error sending welcome message:", error);
    }
  }

  /**
   * Send WhatsApp message
   * IMPORTANT: Only sends to users who have contacted us first
   */
  async sendMessage(phone, text, allowUncontacted = false) {
    try {
      if (!phone || !text) {
        console.error("Invalid phone or message");
        return;
      }

      // CRITICAL: Only send to users who have contacted us first (unless explicitly allowed)
      // This prevents sending messages to contacts who haven't initiated contact
      if (!allowUncontacted) {
        try {
          const userCheck = await query(
            `SELECT has_contacted_us FROM users WHERE phone_e164 = $1 OR phone = $1`,
            [phone]
          );

          // FIX: If user doesn't exist OR hasn't contacted us, don't send
          if (userCheck.rows.length === 0) {
            console.log(
              `⏭️ Skipping message to ${phone} - user does not exist in database`
            );
            return;
          }

          if (!userCheck.rows[0].has_contacted_us) {
            console.log(
              `⏭️ Skipping message to ${phone} - user has not contacted us first`
            );
            return;
          }
        } catch (checkError) {
          // If check fails, DON'T send message (fail safe)
          console.error(
            "❌ Error checking contact status - NOT sending message:",
            checkError.message
          );
          return; // Changed from continue to return - fail safe
        }
      }

      const formattedPhone = phone.includes("@c.us") ? phone : `${phone}@c.us`;

      // Calculate typing time based on message length
      const typingTime = this.calculateTypingTime(text);

      // Send typing indicator
      try {
        if (greenAPI.service && greenAPI.service.sendTyping) {
          await greenAPI.service.sendTyping({
            chatId: formattedPhone,
            typingTime: typingTime,
          });
          await this.sleep(typingTime);
        }
      } catch (typingError) {
        console.warn("Error sending typing indicator:", typingError);
      }

      // Send message
      await greenAPI.message.sendMessage(formattedPhone, null, text);

      console.log(`✅ Message sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Error sending message to ${phone}:`, error);
    }
  }

  /**
   * Calculate typing time based on message length
   */
  calculateTypingTime(message) {
    const words = message.split(/\s+/).length;
    const estimatedTime = (words / 40) * 60 * 1000; // 40 words per minute
    return Math.max(1000, Math.min(5000, Math.ceil(estimatedTime)));
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new WhatsAppHandler();
