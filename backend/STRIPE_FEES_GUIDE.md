# 💳 Stripe Fees & Commission Breakdown

**Complete guide to Stripe processing fees and platform commission for Likelemba**

---

## 📊 Fee Structure Overview

### Complete Payment Breakdown

When a user makes a payment, here's what happens:

```
User Pays: KES 1,000
  ↓
┌─────────────────────────────────────┐
│ Stripe Processing Fee               │
│ • Local card: 3.5% + KES 10        │
│ • International: 5% + KES 10        │
│ • Currency conversion: +1%          │
│ Example: ~KES 35-50                  │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ Platform Commission (5%)            │
│ • Calculated on gross amount        │
│ • Example: KES 50                   │
└─────────────────────────────────────┘
  ↓
Net to Escrow: KES 950
Platform Net Revenue: KES 50 - Stripe Fee = ~KES 10-15
```

---

## 💰 Stripe Fee Structure

### For Kenya (KES)

**Local Cards (Kenya):**
- **Percentage:** 3.5% of transaction amount
- **Fixed Fee:** KES 10 per transaction
- **Total Fee:** `(Amount × 0.035) + 10`

**International Cards:**
- **Percentage:** 5% of transaction amount (3.5% + 1.5% international fee)
- **Fixed Fee:** KES 10 per transaction
- **Total Fee:** `(Amount × 0.05) + 10`

**Currency Conversion (if needed):**
- **Additional:** 1% of transaction amount
- Applied when card currency differs from KES

### Fee Examples

| Payment Amount | Card Type | Stripe Fee | Percentage |
|----------------|-----------|------------|------------|
| KES 100 | Local | KES 13.50 | 13.5% |
| KES 500 | Local | KES 27.50 | 5.5% |
| KES 1,000 | Local | KES 45.00 | 4.5% |
| KES 5,000 | Local | KES 185.00 | 3.7% |
| KES 10,000 | Local | KES 360.00 | 3.6% |
| KES 1,000 | International | KES 60.00 | 6.0% |
| KES 5,000 | International | KES 260.00 | 5.2% |

**Note:** Fixed fee (KES 10) has more impact on smaller transactions.

---

## 🎯 Complete Fee Breakdown Example

### Example: KES 1,000 Payment (Local Card)

```
┌─────────────────────────────────────────────┐
│ Payment Breakdown                           │
├─────────────────────────────────────────────┤
│ Gross Amount (User Pays)      KES 1,000.00  │
│                                               │
│ Stripe Processing Fee:                      │
│   • Percentage (3.5%)         KES   35.00   │
│   • Fixed Fee                 KES   10.00   │
│   • Total Stripe Fee          KES   45.00   │
│                                               │
│ Platform Commission (5%):     KES   50.00   │
│                                               │
│ Net to Escrow:                KES  950.00   │
│                                               │
│ Platform Net Revenue:                        │
│   • Commission                KES   50.00   │
│   • Less Stripe Fee          KES  -45.00   │
│   • Net Revenue              KES    5.00   │
└─────────────────────────────────────────────┘
```

### Example: KES 5,000 Payment (Local Card)

```
┌─────────────────────────────────────────────┐
│ Payment Breakdown                           │
├─────────────────────────────────────────────┤
│ Gross Amount (User Pays)      KES 5,000.00  │
│                                               │
│ Stripe Processing Fee:                      │
│   • Percentage (3.5%)         KES  175.00   │
│   • Fixed Fee                 KES   10.00   │
│   • Total Stripe Fee          KES  185.00   │
│                                               │
│ Platform Commission (5%):     KES  250.00   │
│                                               │
│ Net to Escrow:                KES 4,750.00   │
│                                               │
│ Platform Net Revenue:                        │
│   • Commission                KES  250.00   │
│   • Less Stripe Fee          KES -185.00   │
│   • Net Revenue              KES   65.00   │
└─────────────────────────────────────────────┘
```

---

## 📈 Revenue Analysis

### Platform Revenue by Transaction Size

| Payment | Stripe Fee | Platform Commission | Platform Net Revenue | Margin |
|---------|-----------|---------------------|---------------------|--------|
| KES 100 | KES 13.50 | KES 5.00 | **-KES 8.50** | -8.5% |
| KES 500 | KES 27.50 | KES 25.00 | **-KES 2.50** | -0.5% |
| KES 1,000 | KES 45.00 | KES 50.00 | **KES 5.00** | 0.5% |
| KES 2,000 | KES 80.00 | KES 100.00 | **KES 20.00** | 1.0% |
| KES 5,000 | KES 185.00 | KES 250.00 | **KES 65.00** | 1.3% |
| KES 10,000 | KES 360.00 | KES 500.00 | **KES 140.00** | 1.4% |

**Key Insights:**
- ✅ **Break-even point:** ~KES 1,000 (platform commission covers Stripe fee)
- ✅ **Profitable above:** KES 1,000+
- ⚠️ **Loss on small payments:** Below KES 1,000 (Stripe fee > commission)

---

## 💡 Recommendations

### 1. Minimum Contribution Amount

**Recommendation:** Set minimum contribution of **KES 1,000**

**Reason:**
- Ensures platform commission covers Stripe fees
- Prevents losses on small transactions
- Still accessible for most users

### 2. Fee Transparency

**Show users:**
```
💳 Payment Summary

Contribution: KES 1,000
Platform Fee (5%): KES 50
Payment Processing Fee: KES 45
Net to Escrow: KES 950

Total You Pay: KES 1,000
```

### 3. Consider Minimum Fee

**Alternative:** Add minimum platform commission

```javascript
// Example: Minimum KES 50 commission
const commission = Math.max(
  amount * 0.05,  // 5%
  50              // Minimum KES 50
);
```

This ensures profitability even on small transactions.

---

## 🔧 Implementation

### Stripe Fee Calculator

Located in: `backend/src/services/payments/stripeFeeCalculator.js`

**Usage:**
```javascript
const stripeFeeCalculator = require('./stripeFeeCalculator');

// Calculate local card fee
const fee = stripeFeeCalculator.calculateLocalFee(1000);
// {
//   grossAmount: 1000,
//   stripeFee: 45,
//   stripeFeePercentage: 4.5,
//   amountAfterStripeFee: 955
// }

// Calculate international card fee
const intlFee = stripeFeeCalculator.calculateInternationalFee(1000);
// {
//   grossAmount: 1000,
//   stripeFee: 60,
//   stripeFeePercentage: 6.0,
//   amountAfterStripeFee: 940
// }
```

### Complete Fee Calculation

```javascript
const paymentsService = require('./src/services/payments');

// Calculate all fees
const fees = paymentsService.calculateCompleteFees(1000, {
  cardType: 'local',
  currencyConversion: false
});

// Result:
{
  grossAmount: 1000,
  stripeFee: 45,
  stripeFeePercentage: 4.5,
  platformCommission: 50,
  platformCommissionRate: 0.05,
  netToEscrow: 950,
  platformNetRevenue: 5,
  totalFees: 95,
  totalFeesPercentage: 9.5
}
```

---

## 📊 Database Tracking

### Payments Table

Now tracks:
- `stripe_fee` - Actual Stripe processing fee
- `stripe_fee_details` - JSON breakdown (percentage, fixed, card type)

### Query Stripe Fees

```sql
-- Total Stripe fees paid
SELECT 
  SUM(stripe_fee) as total_stripe_fees,
  COUNT(*) as transaction_count,
  AVG(stripe_fee) as avg_stripe_fee
FROM payments
WHERE provider = 'stripe'
  AND status = 'succeeded'
  AND stripe_fee > 0;

-- Platform net revenue
SELECT 
  SUM(platform_commission - stripe_fee) as net_revenue,
  SUM(platform_commission) as total_commission,
  SUM(stripe_fee) as total_stripe_fees
FROM payments
WHERE provider = 'stripe'
  AND status = 'succeeded';
```

---

## 🎯 Summary

### Fee Structure

| Fee Type | Rate | Example (KES 1,000) |
|----------|------|---------------------|
| **Stripe Fee (Local)** | 3.5% + KES 10 | KES 45 |
| **Stripe Fee (International)** | 5% + KES 10 | KES 60 |
| **Platform Commission** | 5% | KES 50 |
| **Total Fees** | ~9.5% | KES 95 |

### Revenue Flow

```
User Payment → Stripe Fee → Platform Commission → Net to Escrow
KES 1,000    → KES 45    → KES 50              → KES 950

Platform Net: KES 50 - KES 45 = KES 5 per transaction
```

### Key Points

1. ✅ Stripe fees are automatically deducted by Stripe
2. ✅ Platform commission is calculated on gross amount
3. ✅ Net to escrow = Gross - Platform Commission
4. ✅ Platform net revenue = Commission - Stripe Fee
5. ✅ Break-even at ~KES 1,000 per transaction

---

**Next Steps:**
- Set minimum contribution amount (recommended: KES 1,000)
- Update WhatsApp templates to show fee breakdown
- Monitor Stripe fees vs platform revenue
- Consider minimum commission for small transactions

