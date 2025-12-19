/**
 * Payments Service
 * Payment processing and management
 */
const { query } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const stripe = require('../../config/stripe');
const escrowService = require('../escrow');
const ledgerService = require('../ledger');
const stripeFeeCalculator = require('./stripeFeeCalculator');

// Platform commission rate (5% = 0.05)
const PLATFORM_COMMISSION_RATE = parseFloat(process.env.PLATFORM_COMMISSION_RATE || '0.05');

class PaymentsService {
  /**
   * Calculate platform commission
   * @param {number} grossAmount - Gross payment amount
   * @returns {Object} Commission breakdown
   */
  calculateCommission(grossAmount) {
    const commissionAmount = grossAmount * PLATFORM_COMMISSION_RATE;
    const netAmount = grossAmount - commissionAmount;
    
    return {
      grossAmount: parseFloat(grossAmount.toFixed(2)),
      commissionAmount: parseFloat(commissionAmount.toFixed(2)),
      commissionRate: PLATFORM_COMMISSION_RATE,
      netAmount: parseFloat(netAmount.toFixed(2)),
    };
  }

  /**
   * Calculate complete fee breakdown (Stripe + Platform)
   * @param {number} grossAmount - Gross payment amount
   * @param {Object} options - Stripe fee options
   * @returns {Object} Complete fee breakdown
   */
  calculateCompleteFees(grossAmount, options = {}) {
    // Calculate Stripe fee
    const stripeFee = stripeFeeCalculator.calculateFee(grossAmount, options);
    
    // Calculate platform commission (on gross amount)
    const platformCommission = this.calculateCommission(grossAmount);
    
    // Net amount after platform commission (goes to escrow)
    const netToEscrow = platformCommission.netAmount;
    
    // Platform net revenue (commission minus Stripe fee)
    const platformNetRevenue = platformCommission.commissionAmount - stripeFee.stripeFee;
    
    return {
      grossAmount: grossAmount,
      
      // Stripe fees
      stripeFee: stripeFee.stripeFee,
      stripeFeePercentage: stripeFee.stripeFeePercentage,
      stripeFeeBreakdown: stripeFee.stripeFeeBreakdown,
      amountAfterStripeFee: stripeFee.amountAfterStripeFee,
      
      // Platform commission
      platformCommission: platformCommission.commissionAmount,
      platformCommissionRate: platformCommission.commissionRate,
      
      // Net amounts
      netToEscrow: netToEscrow,
      platformNetRevenue: parseFloat(platformNetRevenue.toFixed(2)),
      
      // Summary
      totalFees: stripeFee.stripeFee + platformCommission.commissionAmount,
      totalFeesPercentage: parseFloat(((stripeFee.stripeFee + platformCommission.commissionAmount) / grossAmount * 100).toFixed(2)),
    };
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId) {
    try {
      const result = await query('SELECT * FROM payments WHERE id = $1', [paymentId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting payment:', error);
      throw error;
    }
  }

  /**
   * Get payment by provider reference
   */
  async getPaymentByProviderRef(providerRef) {
    try {
      const result = await query('SELECT * FROM payments WHERE provider_ref = $1', [providerRef]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting payment by provider ref:', error);
      throw error;
    }
  }

  /**
   * Create Stripe payment intent
   */
  async createStripePaymentIntent(contributionId, amount, currency = 'KES', metadata = {}) {
    try {
      const contribution = await query('SELECT * FROM contributions WHERE id = $1', [contributionId]);
      if (!contribution.rows[0]) {
        throw new Error('Contribution not found');
      }

      const paymentId = uuidv4();
      const amountInCents = Math.round(amount * 100); // Stripe uses cents

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        metadata: {
          payment_id: paymentId,
          contribution_id: contributionId,
          ...metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Calculate commission
      const commission = this.calculateCommission(amount);

      // Create payment record with commission
      await query(
        `INSERT INTO payments (
          id, contribution_id, provider, provider_ref, amount, currency, status,
          platform_commission, commission_rate, net_amount
        ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, $9)`,
        [
          paymentId, 
          contributionId, 
          'stripe', 
          paymentIntent.id, 
          amount, 
          currency,
          commission.commissionAmount,
          commission.commissionRate,
          commission.netAmount
        ]
      );

      // Record ledger event
      await ledgerService.recordEvent({
        eventType: 'payment.intent.created',
        subjectType: 'payment',
        subjectId: paymentId,
        payload: {
          provider: 'stripe',
          amount,
          currency,
          paymentIntentId: paymentIntent.id,
        },
      });

      return {
        paymentId,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Error creating Stripe payment intent:', error);
      throw error;
    }
  }

  /**
   * Create Stripe checkout session
   */
  async createStripeCheckoutSession(contributionId, amount, currency = 'KES', metadata = {}) {
    try {
      const contribution = await query('SELECT * FROM contributions WHERE id = $1', [contributionId]);
      if (!contribution.rows[0]) {
        throw new Error('Contribution not found');
      }

      const paymentId = uuidv4();
      const amountInCents = Math.round(amount * 100);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: 'Likelemba Contribution',
                description: 'Group contribution payment',
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.APP_URL || 'https://likelemba.com'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL || 'https://likelemba.com'}/payment/cancel`,
        metadata: {
          payment_id: paymentId,
          contribution_id: contributionId,
          ...metadata,
        },
      });

      // Calculate commission
      const commission = this.calculateCommission(amount);

      // Create payment record with commission
      await query(
        `INSERT INTO payments (
          id, contribution_id, provider, provider_ref, amount, currency, status,
          platform_commission, commission_rate, net_amount
        ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, $9)`,
        [
          paymentId, 
          contributionId, 
          'stripe', 
          session.id, 
          amount, 
          currency,
          commission.commissionAmount,
          commission.commissionRate,
          commission.netAmount
        ]
      );

      return {
        paymentId,
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error);
      throw error;
    }
  }

  /**
   * Handle payment success
   */
  async handlePaymentSuccess(paymentId, providerRef, providerData = {}) {
    try {
      // Update payment status
      await query(
        `UPDATE payments 
         SET status = 'succeeded', raw_payload_json = $1, updated_at = NOW()
         WHERE id = $2`,
        [JSON.stringify(providerData), paymentId]
      );

      // Get payment and contribution
      const payment = await this.getPaymentById(paymentId);
      const contribution = await query('SELECT * FROM contributions WHERE id = $1', [payment.contribution_id]);

      if (contribution.rows[0]) {
        // Calculate Stripe fee from charge data if available
        let stripeFee = 0;
        let stripeFeeDetails = null;
        
        if (providerData.charge) {
          const charge = providerData.charge;
          // Get actual Stripe fee from balance transaction
          if (charge.balance_transaction) {
            try {
              const balanceTransaction = await stripe.balanceTransactions.retrieve(charge.balance_transaction);
              stripeFee = balanceTransaction.fee / 100; // Convert from cents
              stripeFeeDetails = {
                fee: stripeFee,
                net: balanceTransaction.net / 100,
                currency: balanceTransaction.currency.toUpperCase(),
              };
            } catch (error) {
              console.error('Error retrieving balance transaction:', error);
              // Fallback to estimated fee
              const estimated = stripeFeeCalculator.calculateFee(payment.amount);
              stripeFee = estimated.stripeFee;
              stripeFeeDetails = estimated;
            }
          } else {
            // Estimate fee if balance transaction not available
            const estimated = stripeFeeCalculator.calculateFee(payment.amount);
            stripeFee = estimated.stripeFee;
            stripeFeeDetails = estimated;
          }
        } else {
          // Estimate fee if charge not available
          const estimated = stripeFeeCalculator.calculateFee(payment.amount);
          stripeFee = estimated.stripeFee;
          stripeFeeDetails = estimated;
        }

        // Update payment with Stripe fee
        await query(
          `UPDATE payments 
           SET stripe_fee = $1, stripe_fee_details = $2, updated_at = NOW()
           WHERE id = $3`,
          [stripeFee, JSON.stringify(stripeFeeDetails), paymentId]
        );

        // Update contribution
        await query(
          `UPDATE contributions 
           SET status = 'paid', paid_at = NOW(), updated_at = NOW()
           WHERE id = $1`,
          [payment.contribution_id]
        );

        // Get cycle and group info for commission tracking
        const cycle = await query('SELECT * FROM cycles WHERE id = $1', [contribution.rows[0].cycle_id]);
        
        if (cycle.rows[0]) {
          // Use net amount (after commission) for escrow deposit
          const netAmount = payment.net_amount || (payment.amount - (payment.platform_commission || 0));
          
          // Record escrow deposit (net amount only)
          await escrowService.deposit(
            cycle.rows[0].group_id, 
            cycle.rows[0].id, 
            netAmount, 
            paymentId,
            `Contribution payment (commission: ${payment.platform_commission || 0} ${payment.currency}, Stripe fee: ${stripeFee.toFixed(2)} ${payment.currency})`
          );

          // Record platform commission
          const commissionAmount = payment.platform_commission || 0;
          const commissionRate = payment.commission_rate || PLATFORM_COMMISSION_RATE;
          
          if (commissionAmount > 0) {
            await query(
              `INSERT INTO platform_commissions (
                payment_id, contribution_id, group_id, cycle_id,
                gross_amount, commission_amount, commission_rate, net_amount, currency, status
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'collected')`,
              [
                paymentId,
                payment.contribution_id,
                cycle.rows[0].group_id,
                cycle.rows[0].id,
                payment.amount,
                commissionAmount,
                commissionRate,
                netAmount,
                payment.currency
              ]
            );
          }
        }

        // Record ledger event
        await ledgerService.recordEvent({
          eventType: 'payment.captured',
          subjectType: 'payment',
          subjectId: paymentId,
          payload: {
            provider: payment.provider,
            grossAmount: payment.amount,
            stripeFee: stripeFee,
            platformCommission: payment.platform_commission || 0,
            netAmount: payment.net_amount || payment.amount,
            platformNetRevenue: (payment.platform_commission || 0) - stripeFee,
            currency: payment.currency,
            providerRef,
          },
        });
      }

      return payment;
    } catch (error) {
      console.error('Error handling payment success:', error);
      throw error;
    }
  }

  /**
   * Get user receipts
   */
  async getUserReceipts(userId) {
    try {
      const result = await query(
        `SELECT p.*, c.cycle_id, cy.group_id, g.name as group_name
         FROM payments p
         INNER JOIN contributions c ON p.contribution_id = c.id
         INNER JOIN cycles cy ON c.cycle_id = cy.id
         INNER JOIN groups g ON cy.group_id = g.id
         WHERE c.user_id = $1
         AND p.status = 'succeeded'
         ORDER BY p.created_at DESC
         LIMIT 50`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting user receipts:', error);
      throw error;
    }
  }
}

module.exports = new PaymentsService();

