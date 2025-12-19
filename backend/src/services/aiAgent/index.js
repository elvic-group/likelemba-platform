/**
 * AI Agent Service
 * OpenAI Agents SDK with Function Calling
 * Converts natural language to structured actions via tools
 */
const OpenAI = require('openai');
const { query } = require('../../config/database');
const usersService = require('../users');
const groupsService = require('../groups');
const paymentsService = require('../payments');
const cyclesService = require('../cycles');
const disputesService = require('../disputes');
const refundsService = require('../refunds');
const greenAPI = require('../../config/greenapi');

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIAgentService {
  /**
   * Define available tools/functions for the AI agent
   */
  getTools() {
    return [
      {
        type: 'function',
        function: {
          name: 'get_user_profile',
          description: 'Get the current user\'s profile information including role, status, and groups',
          parameters: {
            type: 'object',
            properties: {
              user_id: {
                type: 'string',
                description: 'The user ID to get profile for (must be the current user)',
              },
            },
            required: ['user_id'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'list_groups',
          description: 'List all groups that the user is a member of',
          parameters: {
            type: 'object',
            properties: {
              user_id: {
                type: 'string',
                description: 'The user ID to list groups for (must be the current user)',
              },
            },
            required: ['user_id'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'create_group',
          description: 'Create a new savings group. Requires user to be authenticated.',
          parameters: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the group',
              },
              contribution_amount: {
                type: 'number',
                description: 'Amount each member contributes per cycle',
              },
              frequency: {
                type: 'string',
                enum: ['daily', 'weekly', 'biweekly', 'monthly'],
                description: 'How often contributions are made',
              },
              members_count: {
                type: 'integer',
                description: 'Total number of members in the group',
              },
              currency: {
                type: 'string',
                enum: ['KES', 'UGX', 'TZS', 'USD', 'EUR'],
                description: 'Currency code',
              },
              start_date: {
                type: 'string',
                description: 'Start date in ISO format (YYYY-MM-DD)',
              },
              payout_order_type: {
                type: 'string',
                enum: ['random', 'fixed', 'bid'],
                description: 'How payout order is determined',
                default: 'random',
              },
            },
            required: ['name', 'contribution_amount', 'frequency', 'members_count', 'currency', 'start_date'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'initiate_payment',
          description: 'Initiate a payment for a pending contribution. Returns payment link or instructions.',
          parameters: {
            type: 'object',
            properties: {
              contribution_id: {
                type: 'string',
                description: 'The contribution ID to pay for',
              },
              amount: {
                type: 'number',
                description: 'Payment amount (must match contribution amount)',
              },
              currency: {
                type: 'string',
                description: 'Currency code',
              },
            },
            required: ['contribution_id', 'amount', 'currency'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_payment_status',
          description: 'Get the status of a payment by payment ID',
          parameters: {
            type: 'object',
            properties: {
              payment_id: {
                type: 'string',
                description: 'The payment ID to check status for',
              },
            },
            required: ['payment_id'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'open_dispute',
          description: 'Open a dispute for a group or cycle. Requires confirmation for high-risk actions.',
          parameters: {
            type: 'object',
            properties: {
              group_id: {
                type: 'string',
                description: 'The group ID the dispute is about',
              },
              cycle_id: {
                type: 'string',
                description: 'The cycle ID the dispute is about (optional)',
              },
              dispute_type: {
                type: 'string',
                enum: ['payment', 'payout', 'member', 'other'],
                description: 'Type of dispute',
              },
              title: {
                type: 'string',
                description: 'Short title of the dispute',
              },
              description: {
                type: 'string',
                description: 'Detailed description of the dispute',
              },
            },
            required: ['group_id', 'dispute_type', 'title', 'description'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'request_refund',
          description: 'Request a refund for a payment. Requires confirmation and may require PIN for high amounts.',
          parameters: {
            type: 'object',
            properties: {
              payment_id: {
                type: 'string',
                description: 'The payment ID to request refund for',
              },
              amount: {
                type: 'number',
                description: 'Refund amount (must be <= payment amount)',
              },
              currency: {
                type: 'string',
                description: 'Currency code',
              },
              reason: {
                type: 'string',
                description: 'Reason for refund request',
              },
            },
            required: ['payment_id', 'amount', 'currency', 'reason'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_pending_contributions',
          description: 'Get all pending contributions for the user',
          parameters: {
            type: 'object',
            properties: {
              user_id: {
                type: 'string',
                description: 'The user ID to get contributions for (must be the current user)',
              },
            },
            required: ['user_id'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_next_payout',
          description: 'Get the next scheduled payout for the user',
          parameters: {
            type: 'object',
            properties: {
              user_id: {
                type: 'string',
                description: 'The user ID to get payout for (must be the current user)',
              },
            },
            required: ['user_id'],
          },
        },
      },
    ];
  }

  /**
   * Process user message with AI agent (with function calling)
   * @param {Object} user - User object
   * @param {string} message - User message
   * @param {string} detectedLanguage - Detected language code (optional)
   */
  async processMessage(user, message, detectedLanguage = null) {
    try {
      // Use detected language or user's locale
      const responseLanguage = detectedLanguage || user.locale || 'en';
      
      // Load conversation history
      const history = await this.getConversationHistory(user.id, 20);

      // Build messages array
      const messages = [
        {
          role: 'system',
          content: this.getSystemPrompt(user, responseLanguage),
        },
        ...history.map((h) => {
          const msg = {
            role: h.role,
            content: h.content,
          };
          if (h.tool_calls) {
            msg.tool_calls = h.tool_calls;
          }
          return msg;
        }),
        {
          role: 'user',
          content: message,
        },
      ];

      // Call OpenAI with function calling
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        tools: this.getTools(),
        tool_choice: 'auto', // Let the model decide when to use tools
        temperature: 0.7,
        max_tokens: 1000,
      });

      const assistantMessage = completion.choices[0].message;

      // Save user message first
      await this.saveConversation(user.id, 'user', message);

      // Handle tool calls if any
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        // Don't save tool_calls to database - we only save the final response
        // This prevents errors when loading history (tool_calls without tool responses)

        // Execute tool calls
        const toolResults = [];
        for (const toolCall of assistantMessage.tool_calls) {
          try {
            const result = await this.executeTool(user, toolCall);
            toolResults.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              name: toolCall.function.name,
              content: JSON.stringify(result),
            });
          } catch (error) {
            console.error(`Error executing tool ${toolCall.function.name}:`, error);
            toolResults.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              name: toolCall.function.name,
              content: JSON.stringify({ error: error.message }),
            });
          }
        }

        // Get final response from OpenAI after tool execution
        const finalMessages = [
          ...messages,
          assistantMessage,
          ...toolResults,
        ];

        const finalCompletion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: finalMessages,
          tools: this.getTools(),
          tool_choice: 'auto',
          temperature: 0.7,
          max_tokens: 1000,
        });

        const finalResponse = finalCompletion.choices[0].message.content;

        // Save final response only (not tool_calls - prevents history loading errors)
        await this.saveConversation(user.id, 'assistant', finalResponse);

        return finalResponse;
      } else {
        // No tool calls, just return the response
        const response = assistantMessage.content;

        // Save assistant response (user message already saved above)
        await this.saveConversation(user.id, 'assistant', response);

        return response;
      }
    } catch (error) {
      console.error('AI Agent error:', error);
      // Provide helpful error message
      if (error.message && error.message.includes('API key')) {
        throw new Error('AI service is temporarily unavailable. Please use the menu options (1-6) for now.');
      }
      throw error;
    }
  }

  /**
   * Execute a tool call with permission checks
   */
  async executeTool(user, toolCall) {
    const { name, arguments: args } = toolCall.function;
    const params = JSON.parse(args);

    console.log(`🔧 Executing tool: ${name}`, params);

    // Permission checks and tool execution
    switch (name) {
      case 'get_user_profile':
        if (params.user_id !== user.id) {
          throw new Error('Permission denied: You can only view your own profile');
        }
        return await this.toolGetUserProfile(user.id);

      case 'list_groups':
        if (params.user_id !== user.id) {
          throw new Error('Permission denied: You can only list your own groups');
        }
        return await this.toolListGroups(user.id);

      case 'create_group':
        // Check if user needs confirmation (this would be handled in the conversation flow)
        return await this.toolCreateGroup(user.id, params);

      case 'initiate_payment':
        return await this.toolInitiatePayment(user.id, params);

      case 'get_payment_status':
        return await this.toolGetPaymentStatus(params.payment_id);

      case 'open_dispute':
        // High-risk action - requires confirmation (handled in conversation)
        return await this.toolOpenDispute(user.id, params);

      case 'request_refund':
        // High-risk action - requires confirmation and PIN for high amounts
        return await this.toolRequestRefund(user.id, params);

      case 'get_pending_contributions':
        if (params.user_id !== user.id) {
          throw new Error('Permission denied: You can only view your own contributions');
        }
        return await this.toolGetPendingContributions(user.id);

      case 'get_next_payout':
        if (params.user_id !== user.id) {
          throw new Error('Permission denied: You can only view your own payouts');
        }
        return await this.toolGetNextPayout(user.id);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  /**
   * Tool: Get user profile
   */
  async toolGetUserProfile(userId) {
    const user = await usersService.getUserById(userId);
    if (!user) {
      return { error: 'User not found' };
    }

    return {
      id: user.id,
      phone: user.phone_e164,
      display_name: user.display_name,
      role: user.role,
      status: user.status,
      locale: user.locale,
      created_at: user.created_at,
    };
  }

  /**
   * Tool: List groups
   */
  async toolListGroups(userId) {
    const groups = await groupsService.getUserGroups(userId);
    return {
      groups: groups.map((g) => ({
        id: g.id,
        name: g.name,
        currency: g.currency,
        contribution_amount: parseFloat(g.contribution_amount),
        frequency: g.frequency,
        members_count: g.members_count,
        status: g.status,
        member_role: g.member_role,
        created_at: g.created_at,
      })),
      count: groups.length,
    };
  }

  /**
   * Tool: Create group
   */
  async toolCreateGroup(userId, params) {
    try {
      const group = await groupsService.createGroup({
        ownerUserId: userId,
        name: params.name,
        currency: params.currency || 'KES',
        contributionAmount: params.contribution_amount,
        frequency: params.frequency,
        startDate: params.start_date,
        membersCount: params.members_count,
        payoutOrderType: params.payout_order_type || 'random',
      });

      return {
        success: true,
        group: {
          id: group.id,
          name: group.name,
          invite_code: group.invite_code,
          invite_link: group.invite_link,
          currency: group.currency,
          contribution_amount: parseFloat(group.contribution_amount),
          frequency: group.frequency,
          members_count: group.members_count,
        },
        message: `Group "${group.name}" created successfully! Invite code: ${group.invite_code}`,
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Tool: Initiate payment
   */
  async toolInitiatePayment(userId, params) {
    try {
      // Get contribution to verify it belongs to user
      const contribution = await query(
        'SELECT * FROM likelemba.contributions WHERE id = $1 AND user_id = $2',
        [params.contribution_id, userId]
      );

      if (!contribution.rows[0]) {
        return { error: 'Contribution not found or access denied' };
      }

      const contributionData = contribution.rows[0];

      // Verify amount matches
      if (Math.abs(parseFloat(contributionData.amount) - params.amount) > 0.01) {
        return { error: 'Payment amount does not match contribution amount' };
      }

      // Create Stripe checkout session
      const checkout = await paymentsService.createStripeCheckoutSession(
        params.contribution_id,
        params.amount,
        params.currency || contributionData.currency,
        { userId }
      );

      return {
        success: true,
        payment_id: checkout.paymentId,
        checkout_url: checkout.url,
        message: `Payment link created. Amount: ${params.currency || 'KES'} ${params.amount}`,
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Tool: Get payment status
   */
  async toolGetPaymentStatus(paymentId) {
    const payment = await paymentsService.getPaymentById(paymentId);
    if (!payment) {
      return { error: 'Payment not found' };
    }

    return {
      id: payment.id,
      status: payment.status,
      amount: parseFloat(payment.amount),
      currency: payment.currency,
      provider: payment.provider,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
    };
  }

  /**
   * Tool: Open dispute
   */
  async toolOpenDispute(userId, params) {
    try {
      const dispute = await disputesService.openDispute({
        groupId: params.group_id,
        cycleId: params.cycle_id || null,
        openedByUserId: userId,
        disputeType: params.dispute_type,
        title: params.title,
        description: params.description,
      });

      return {
        success: true,
        dispute: {
          id: dispute.id,
          dispute_type: dispute.dispute_type,
          title: dispute.title,
          status: dispute.status,
        },
        message: 'Dispute opened successfully. Our team will review it shortly.',
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Tool: Request refund
   */
  async toolRequestRefund(userId, params) {
    try {
      // Verify payment belongs to user
      const payment = await paymentsService.getPaymentById(params.payment_id);
      if (!payment) {
        return { error: 'Payment not found' };
      }

      // Get contribution to verify user ownership
      const contribution = await query(
        'SELECT * FROM likelemba.contributions WHERE id = $1 AND user_id = $2',
        [payment.contribution_id, userId]
      );

      if (!contribution.rows[0]) {
        return { error: 'Payment does not belong to you' };
      }

      // High amount check (would require PIN - handled in conversation flow)
      const refund = await refundsService.requestRefund({
        paymentId: params.payment_id,
        amount: params.amount,
        currency: params.currency,
        reason: params.reason,
        requestedByUserId: userId,
      });

      return {
        success: true,
        refund: {
          id: refund.id,
          amount: parseFloat(refund.amount),
          currency: refund.currency,
          status: refund.status,
        },
        message: 'Refund request submitted. It will be reviewed by our team.',
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Tool: Get pending contributions
   */
  async toolGetPendingContributions(userId) {
    const contributions = await cyclesService.getPendingContributions(userId);
    return {
      contributions: contributions.map((c) => ({
        id: c.id,
        group_id: c.group_id,
        group_name: c.group_name,
        amount: parseFloat(c.amount),
        currency: c.currency,
        due_at: c.due_at,
        status: c.status,
      })),
      count: contributions.length,
    };
  }

  /**
   * Tool: Get next payout
   */
  async toolGetNextPayout(userId) {
    const payout = await cyclesService.getNextPayout(userId);
    if (!payout) {
      return { message: 'No scheduled payouts' };
    }

    return {
      payout: {
        id: payout.id,
        group_id: payout.group_id,
        group_name: payout.group_name,
        amount: parseFloat(payout.amount),
        currency: payout.currency,
        payout_date: payout.payout_date,
        status: payout.status,
      },
    };
  }

  /**
   * Get language name from locale code
   */
  getLanguageName(locale) {
    const names = {
      'en': 'English',
      'fr': 'Français',
      'sw': 'Kiswahili',
      'es': 'Español',
      'pt': 'Português',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'zh': 'Chinese',
      'de': 'German',
      'it': 'Italian',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'nl': 'Dutch',
      'pl': 'Polish',
      'tr': 'Turkish',
      'vi': 'Vietnamese',
    };
    return names[locale] || 'English';
  }

  /**
   * Get system prompt for AI agent
   * @param {Object} user - User object
   * @param {string} detectedLanguage - Detected language code (optional)
   */
  getSystemPrompt(user, detectedLanguage = null) {
    const language = detectedLanguage || user.locale || 'en';
    const languageName = this.getLanguageName(language);
    
    const languageInstruction = language === 'en'
      ? 'IMPORTANT: Respond in English.'
      : `IMPORTANT: Respond in ${languageName}. All your responses must be in ${languageName}. Always match the language the user is speaking.`;

    return `You are Likelemba Assistant, a helpful WhatsApp bot for rotating savings groups (ROSCA).

${languageInstruction}

Your job: help users create and manage savings groups, pay contributions, track payouts, and contact support.

CRITICAL RULES:
- Always respond in the same language the user is speaking
- If user switches languages, switch with them
- Never claim funds are received unless verified by payment webhooks.
- For any payout order change, refund, or member removal: ask for confirmation + require PIN.
- Use tools only when the user has permission for the requested action.
- If user asks for illegal activity, refuse and offer safe alternatives.
- Keep responses short and WhatsApp-friendly (under 500 characters when possible).
- Use emojis sparingly for clarity.
- When user asks to create a group, use the create_group tool with all required parameters.
- When user asks to pay, use initiate_payment tool.
- When user asks about their groups, use list_groups tool.
- Always be helpful, friendly, and concise.

User role: ${user.role}
User phone: ${user.phone_e164}
User language preference: ${user.locale || 'en'}
Detected language: ${language}

Available menu commands:
- Type numbers (1-6) for main menu options
- Type "menu" to see main menu
- Type "help" for assistance
- Type "0" or "back" to go back

Keep responses conversational, helpful, and concise.`;
  }

  /**
   * Get conversation history
   * IMPORTANT: We don't save tool responses separately, so we exclude tool_calls
   * from history to prevent OpenAI errors about missing tool responses
   */
  async getConversationHistory(userId, limit = 20) {
    try {
      const result = await query(
        `SELECT role, content, tool_calls_json
         FROM likelemba.conversation_history 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2`,
        [userId, limit]
      );

      return result.rows.reverse().map((row) => {
        const message = {
          role: row.role,
          content: row.content || '',
        };

        // CRITICAL FIX: Don't include tool_calls in history
        // Since we don't save tool responses separately, including tool_calls
        // causes OpenAI to expect tool responses that don't exist in history
        // The final assistant response (after tool execution) is sufficient for context
        // if (row.tool_calls_json) {
        //   const toolCalls = typeof row.tool_calls_json === 'string' 
        //     ? JSON.parse(row.tool_calls_json) 
        //     : row.tool_calls_json;
        //   message.tool_calls = toolCalls;
        // }

        return message;
      });
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  /**
   * Save conversation message
   */
  async saveConversation(userId, role, content, toolCalls = null) {
    try {
      await query(
        `INSERT INTO likelemba.conversation_history (user_id, role, content, tool_calls_json)
         VALUES ($1, $2, $3, $4)`,
        [
          userId,
          role,
          content || '',
          toolCalls ? JSON.stringify(toolCalls) : null,
        ]
      );
    } catch (error) {
      console.error('Error saving conversation (non-fatal):', error.message);
      // If table doesn't exist, we'll just skip saving history
    }
  }
}

module.exports = new AIAgentService();
