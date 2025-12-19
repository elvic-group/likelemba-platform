/**
 * Stripe Fee Calculator
 * Calculates Stripe processing fees based on payment amount and type
 */

// Stripe fee structure for Kenya (KES)
// Based on Stripe's standard pricing for online payments
const STRIPE_FEE_CONFIG = {
  // Local cards (Kenya)
  local: {
    percentage: 0.035, // 3.5%
    fixed: 10, // KES 10 per transaction
  },
  // International cards
  international: {
    percentage: 0.05, // 5% (3.5% + 1.5% international fee)
    fixed: 10, // KES 10 per transaction
  },
  // Currency conversion (if needed)
  currencyConversion: {
    percentage: 0.01, // 1% additional
  },
};

class StripeFeeCalculator {
  /**
   * Calculate Stripe processing fee
   * @param {number} amount - Payment amount in KES
   * @param {Object} options - Fee calculation options
   * @param {string} options.cardType - 'local' or 'international' (default: 'local')
   * @param {boolean} options.currencyConversion - Whether currency conversion is needed (default: false)
   * @returns {Object} Fee breakdown
   */
  calculateFee(amount, options = {}) {
    const {
      cardType = 'local',
      currencyConversion = false,
    } = options;

    // Get base fee structure
    const baseFee = STRIPE_FEE_CONFIG[cardType] || STRIPE_FEE_CONFIG.local;
    
    // Calculate percentage fee
    const percentageFee = amount * baseFee.percentage;
    
    // Calculate currency conversion fee if needed
    const conversionFee = currencyConversion 
      ? amount * STRIPE_FEE_CONFIG.currencyConversion.percentage 
      : 0;
    
    // Total Stripe fee
    const totalFee = percentageFee + baseFee.fixed + conversionFee;
    
    // Amount after Stripe fee (what Stripe deposits to merchant account)
    const amountAfterStripeFee = amount - totalFee;
    
    return {
      grossAmount: parseFloat(amount.toFixed(2)),
      stripeFee: parseFloat(totalFee.toFixed(2)),
      stripeFeePercentage: parseFloat((totalFee / amount * 100).toFixed(2)),
      stripeFeeBreakdown: {
        percentageFee: parseFloat(percentageFee.toFixed(2)),
        fixedFee: baseFee.fixed,
        conversionFee: parseFloat(conversionFee.toFixed(2)),
        cardType,
        currencyConversion,
      },
      amountAfterStripeFee: parseFloat(amountAfterStripeFee.toFixed(2)),
    };
  }

  /**
   * Calculate fees for local card (Kenya)
   * @param {number} amount - Payment amount
   * @returns {Object} Fee breakdown
   */
  calculateLocalFee(amount) {
    return this.calculateFee(amount, { cardType: 'local' });
  }

  /**
   * Calculate fees for international card
   * @param {number} amount - Payment amount
   * @returns {Object} Fee breakdown
   */
  calculateInternationalFee(amount) {
    return this.calculateFee(amount, { cardType: 'international' });
  }

  /**
   * Estimate Stripe fee from actual Stripe charge object
   * This can be called after payment succeeds to get actual fees
   * @param {Object} charge - Stripe charge object
   * @returns {Object} Actual fee breakdown
   */
  getActualFeeFromCharge(charge) {
    if (!charge || !charge.balance_transaction) {
      return null;
    }

    // Stripe provides fee details in balance_transaction
    // For now, we'll estimate based on amount
    // In production, you'd fetch the balance_transaction to get exact fees
    const amount = charge.amount / 100; // Convert from cents
    const currency = charge.currency.toUpperCase();
    
    // Estimate based on card type
    const cardType = charge.payment_method_details?.card?.country === 'KE' 
      ? 'local' 
      : 'international';
    
    return this.calculateFee(amount, { 
      cardType,
      currencyConversion: currency !== 'KES',
    });
  }
}

module.exports = new StripeFeeCalculator();

