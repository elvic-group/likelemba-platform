/**
 * WhatsApp Handler
 * Main orchestrator for incoming WhatsApp messages via Green API
 */
const { query } = require('../../config/database');
const greenAPI = require('../../config/greenapi');
const usersService = require('../users');
const groupsService = require('../groups');
const paymentsService = require('../payments');
const cyclesService = require('../cycles');
const aiAgentService = require('../aiAgent');
const templates = require('../../templates/whatsapp');

class WhatsAppHandler {
  /**
   * Handle incoming webhook from Green API
   */
  async handleWebhook(webhookData) {
    try {
      const { typeWebhook } = webhookData;

      // Only process incoming messages
      if (typeWebhook !== 'incomingMessageReceived') {
        console.log(`📨 Skipping webhook type: ${typeWebhook}`);
        return;
      }

      // Extract message data
      const { senderData, messageData } = webhookData;

      if (!senderData || !senderData.sender) {
        console.error('Missing sender data in webhook');
        return;
      }

      // Extract phone number (remove @c.us suffix)
      const phone = senderData.sender.replace('@c.us', '');
      const senderName = senderData.senderName || 'User';

      // Extract message text
      let message = '';
      if (messageData?.textMessageData?.textMessage) {
        message = messageData.textMessageData.textMessage;
      } else if (messageData?.textMessage) {
        message = messageData.textMessage;
      }

      // Skip if no text message
      if (!message || message.trim().length === 0) {
        console.log(`📨 Skipping webhook - no text message from ${phone}`);
        return;
      }

      console.log(`📨 Message from ${phone}: ${message}`);

      // Get or create user
      let user = await usersService.getUserByPhone(phone);

      if (!user) {
        try {
          user = await usersService.createUser(phone, senderName);
          console.log(`👤 New user created: ${phone}`);

          // Send welcome message
          await this.sendWelcomeMessage(phone, user.display_name || senderName);
          return;
        } catch (createError) {
          console.error('Error creating user:', createError);
          await this.sendMessage(
            phone,
            'Sorry, there was an error setting up your account. Please try again later.'
          );
          return;
        }
      } else {
        // Update last seen
        await query('UPDATE users SET last_seen_at = NOW() WHERE id = $1', [user.id]);
      }

      // Route message
      await this.routeMessage(user, message);
    } catch (error) {
      console.error('Error handling webhook:', error);
    }
  }

  /**
   * Route message to appropriate handler
   */
  async routeMessage(user, message) {
    try {
      const msg = message.toLowerCase().trim();

      // Universal commands (highest priority)
      if (['hi', 'hello', 'hey', 'menu', 'start', 'help'].includes(msg)) {
        if (msg === 'help') {
          return await this.sendHelp(user.phone);
        }
        return await this.sendMainMenu(user.phone, user.role);
      }

      // OTP verification flow
      if (user.current_step === 'awaiting_otp') {
        return await this.handleOTPVerification(user, message);
      }

      // Admin commands
      if (user.role === 'platform_admin' && msg === 'admin menu') {
        return await this.sendAdminMenu(user.phone);
      }

      // Group admin commands
      if (user.role === 'group_admin' && msg.startsWith('admin')) {
        return await this.sendGroupAdminMenu(user.phone);
      }

      // Service flow commands (if in service)
      if (user.current_service) {
        return await this.handleServiceFlow(user, message);
      }

      // Main menu selection (numbers)
      if (msg.match(/^[0-9]{1,2}$/)) {
        const option = parseInt(msg);
        return await this.handleMainMenuSelection(user, option);
      }

      // Natural language (AI agent)
      return await this.handleNaturalLanguage(user, message);
    } catch (error) {
      console.error('Error routing message:', error);
      await this.sendMessage(
        user.phone,
        'Sorry, I encountered an error. Please try again or type MENU for options.'
      );
    }
  }

  /**
   * Handle main menu selection
   */
  async handleMainMenuSelection(user, option) {
    switch (option) {
      case 1:
        // My Groups
        const groups = await groupsService.getUserGroups(user.id);
        const groupsMsg = templates.groups.listGroups(groups);
        await this.sendMessage(user.phone, groupsMsg);
        break;
      case 2:
        // Pay Contribution
        await this.handlePayContribution(user);
        break;
      case 3:
        // Next Payout
        await this.handleNextPayout(user);
        break;
      case 4:
        // My Receipts
        await this.handleMyReceipts(user);
        break;
      case 5:
        // Support
        await this.handleSupport(user);
        break;
      case 6:
        // Settings
        await this.handleSettings(user);
        break;
      default:
        await this.sendMessage(user.phone, 'Invalid option. Please choose 1-6.');
    }
  }

  /**
   * Handle service flow
   */
  async handleServiceFlow(user, message) {
    // This will be implemented based on current service
    // For now, fallback to AI agent
    return await this.handleNaturalLanguage(user, message);
  }

  /**
   * Handle natural language with AI agent
   */
  async handleNaturalLanguage(user, message) {
    try {
      console.log(`🤖 AI Agent processing message from ${user.phone}: ${message.substring(0, 50)}...`);
      const response = await aiAgentService.processMessage(user, message);
      await this.sendMessage(user.phone, response);
    } catch (error) {
      console.error('AI Agent error:', error);
      // Provide helpful error message instead of just showing menu
      const errorMsg = error.message || 'AI service is temporarily unavailable';
      await this.sendMessage(
        user.phone,
        `⚠️ ${errorMsg}\n\nPlease use the menu options (type MENU) or try again later.`
      );
      // Don't fallback to menu automatically - let user decide
    }
  }

  /**
   * Send main menu
   */
  async sendMainMenu(phone, role = 'member') {
    const menu = templates.main.menu(role);
    await this.sendMessage(phone, menu);
  }

  /**
   * Send help
   */
  async sendHelp(phone) {
    const helpMsg = templates.main.help();
    await this.sendMessage(phone, helpMsg);
  }

  /**
   * Send admin menu
   */
  async sendAdminMenu(phone) {
    const menu = templates.admin.menu();
    await this.sendMessage(phone, menu);
  }

  /**
   * Send group admin menu
   */
  async sendGroupAdminMenu(phone) {
    const menu = templates.groupAdmin.menu();
    await this.sendMessage(phone, menu);
  }

  /**
   * Handle pay contribution flow
   */
  async handlePayContribution(user) {
    // Get user's pending contributions
    const contributions = await cyclesService.getPendingContributions(user.id);
    if (contributions.length === 0) {
      await this.sendMessage(user.phone, 'You have no pending contributions.');
      return;
    }

    const contributionsMsg = templates.contributions.listPending(contributions);
    await this.sendMessage(user.phone, contributionsMsg);
  }

  /**
   * Handle next payout
   */
  async handleNextPayout(user) {
    const nextPayout = await cyclesService.getNextPayout(user.id);
    if (!nextPayout) {
      await this.sendMessage(user.phone, 'You have no scheduled payouts.');
      return;
    }

    const payoutMsg = templates.payouts.nextPayout(nextPayout);
    await this.sendMessage(user.phone, payoutMsg);
  }

  /**
   * Handle my receipts
   */
  async handleMyReceipts(user) {
    const receipts = await paymentsService.getUserReceipts(user.id);
    if (receipts.length === 0) {
      await this.sendMessage(user.phone, 'You have no receipts yet.');
      return;
    }

    const receiptsMsg = templates.receipts.listReceipts(receipts);
    await this.sendMessage(user.phone, receiptsMsg);
  }

  /**
   * Handle support
   */
  async handleSupport(user) {
    const supportMsg = templates.support.menu();
    await this.sendMessage(user.phone, supportMsg);
  }

  /**
   * Handle settings
   */
  async handleSettings(user) {
    const settingsMsg = templates.settings.menu(user);
    await this.sendMessage(user.phone, settingsMsg);
  }

  /**
   * Handle OTP verification
   */
  async handleOTPVerification(user, message) {
    const otpService = require('../users/otp');
    const { query } = require('../../config/database');

    const otp = message.trim();
    const result = await otpService.verifyOTP(user.phone_e164, otp);

    if (result.success) {
      // Clear OTP step
      await query('UPDATE users SET current_step = NULL, updated_at = NOW() WHERE id = $1', [user.id]);
      
      await this.sendMessage(
        user.phone_e164,
        '✅ Verification successful! Welcome to Likelemba.'
      );
      await this.sendMainMenu(user.phone_e164, user.role);
    } else {
      await this.sendMessage(
        user.phone_e164,
        `❌ ${result.message || 'Invalid OTP'}. Please try again or type RESEND to get a new code.`
      );
    }
  }

  /**
   * Send welcome message
   */
  async sendWelcomeMessage(phone, name) {
    try {
      const welcomeText = templates.main.welcomeMessage(name);
      await this.sendMessage(phone, welcomeText);
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  }

  /**
   * Send WhatsApp message
   */
  async sendMessage(phone, text) {
    try {
      if (!phone || !text) {
        console.error('Invalid phone or message');
        return;
      }

      const formattedPhone = phone.includes('@c.us') ? phone : `${phone}@c.us`;

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
        console.warn('Error sending typing indicator:', typingError);
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

