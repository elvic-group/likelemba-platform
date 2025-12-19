# 💰 Complete Fee Breakdown: Stripe + Platform Commission

**Quick reference for all fees and revenue calculations**

---

## 📊 Fee Structure Summary

### For KES 1,000 Payment (Local Card)

```
User Pays:                    KES 1,000.00
                              ─────────────
Stripe Processing Fee:        KES    45.00  (3.5% + KES 10)
Platform Commission (5%):     KES    50.00
                              ─────────────
Total Fees:                   KES    95.00  (9.5%)
                              ─────────────
Net to Escrow:                KES   950.00
Platform Net Revenue:         KES     5.00  (Commission - Stripe Fee)
```

### For KES 5,000 Payment (Local Card)

```
User Pays:                    KES 5,000.00
                              ─────────────
Stripe Processing Fee:        KES   185.00  (3.5% + KES 10)
Platform Commission (5%):     KES   250.00
                              ─────────────
Total Fees:                   KES   435.00  (8.7%)
                              ─────────────
Net to Escrow:                KES 4,750.00
Platform Net Revenue:         KES    65.00  (Commission - Stripe Fee)
```

---

## 💳 Stripe Fee Details

### Local Cards (Kenya)
- **Rate:** 3.5% + KES 10 fixed
- **Formula:** `(Amount × 0.035) + 10`

### International Cards
- **Rate:** 5% + KES 10 fixed
- **Formula:** `(Amount × 0.05) + 10`
- **Note:** Includes 1.5% international fee

### Currency Conversion
- **Additional:** 1% if card currency ≠ KES

---

## 🎯 Platform Commission

- **Rate:** 5% of gross amount
- **Formula:** `Amount × 0.05`
- **Applied to:** Gross payment amount (before Stripe fees)

---

## 📈 Revenue Analysis

### Platform Net Revenue by Transaction Size

| Payment | Stripe Fee | Platform Commission | Platform Net | Margin |
|---------|-----------|---------------------|--------------|--------|
| KES 500 | KES 27.50 | KES 25.00 | **-KES 2.50** | -0.5% |
| KES 1,000 | KES 45.00 | KES 50.00 | **KES 5.00** | 0.5% |
| KES 2,000 | KES 80.00 | KES 100.00 | **KES 20.00** | 1.0% |
| KES 5,000 | KES 185.00 | KES 250.00 | **KES 65.00** | 1.3% |
| KES 10,000 | KES 360.00 | KES 500.00 | **KES 140.00** | 1.4% |

**Break-even:** ~KES 1,000 per transaction

---

## 🔧 Implementation Status

✅ **Stripe Fee Calculator:** `backend/src/services/payments/stripeFeeCalculator.js`
✅ **Fee Tracking:** Added to payments table
✅ **Webhook Integration:** Retrieves actual Stripe fees
✅ **Complete Fee Calculation:** `calculateCompleteFees()` method

---

## 📝 Key Points

1. **Stripe fees** are deducted automatically by Stripe
2. **Platform commission** is calculated on gross amount
3. **Net to escrow** = Gross - Platform Commission
4. **Platform net revenue** = Commission - Stripe Fee
5. **Break-even** at ~KES 1,000 per transaction

---

**See `STRIPE_FEES_GUIDE.md` for complete details.**

