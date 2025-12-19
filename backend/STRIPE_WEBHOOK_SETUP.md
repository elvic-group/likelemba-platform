# 🔗 Stripe Webhook Configuration Guide

**Complete step-by-step instructions for setting up Stripe webhooks for Likelemba production**

---

## 📋 Prerequisites

- ✅ Stripe account with API keys configured
- ✅ Heroku app deployed and running
- ✅ Access to Stripe Dashboard

---

## 🚀 Step-by-Step Instructions

### Step 1: Access Stripe Dashboard

1. Open your web browser
2. Navigate to: **https://dashboard.stripe.com/**
3. Log in with your Stripe account credentials
4. Ensure you're in the **correct account** (check the account name in the top right)

---

### Step 2: Navigate to Webhooks Section

1. In the left sidebar, look for **"Developers"** section
2. Click on **"Developers"** to expand the menu
3. Click on **"Webhooks"** (or go directly to: https://dashboard.stripe.com/webhooks)

**Visual Guide:**
```
Stripe Dashboard
├── Home
├── Payments
├── Products
├── Customers
├── Developers  ← Click here
│   ├── API keys
│   ├── Webhooks  ← Then click here
│   ├── Logs
│   └── ...
```

---

### Step 3: Add New Webhook Endpoint

1. On the Webhooks page, you'll see a list of existing webhooks (if any)
2. Click the **"+ Add endpoint"** button (usually in the top right corner)
   - Button text may also say **"Add webhook endpoint"** or **"Create endpoint"**

---

### Step 4: Enter Webhook URL

1. In the **"Endpoint URL"** field, enter:
   ```
   https://likelemba-production-8eb76f5c732e.herokuapp.com/webhooks/stripe
   ```
2. **Important:** 
   - Use HTTPS (not HTTP)
   - Include the full path `/webhooks/stripe`
   - No trailing slash

**What you'll see:**
```
┌─────────────────────────────────────────────────────────┐
│ Add webhook endpoint                                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ Endpoint URL *                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ https://likelemba-production-8eb76f5c732e... │     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ [Continue]                                                │
└─────────────────────────────────────────────────────────┘
```

---

### Step 5: Select Events to Listen To

1. After entering the URL, you'll see a list of events
2. You need to select the following events (check the boxes):

#### ✅ Required Events:

**Payment Events (Escrow Deposits):**
- ✅ `checkout.session.completed` - **CRITICAL for Escrow** - When checkout completes, funds are deposited to escrow
- ✅ `payment_intent.succeeded` - **CRITICAL for Escrow** - When payment succeeds, triggers escrow deposit
- ✅ `payment_intent.payment_failed` - When a payment fails
- ✅ `checkout.session.expired` - When a checkout session expires

**Dispute & Refund Events (Escrow Freezes/Releases):**
- ✅ `charge.dispute.created` - **CRITICAL for Escrow** - When dispute created, escrow funds are frozen
- ✅ `charge.dispute.updated` - When dispute is updated
- ✅ `charge.dispute.closed` - When dispute is resolved, escrow funds are unfrozen/released
- ✅ `charge.refunded` - When a refund is issued
- ✅ `charge.refund.updated` - When a refund status is updated

**Escrow Monitoring Events (Recommended):**
- ✅ `payment_intent.canceled` - When a payment is canceled before completion
- ✅ `charge.succeeded` - Additional confirmation of successful charge
- ✅ `charge.failed` - Additional confirmation of failed charge
- ✅ `payment_intent.amount_capturable_updated` - If using manual capture (future enhancement)

**How to select:**
- You can either:
  - **Option A:** Select events individually by checking each box
  - **Option B:** Use the search/filter to find specific events
  - **Option C:** Select "Select all events" (not recommended - too many events)

**Visual Guide:**
```
┌─────────────────────────────────────────────────────────┐
│ Select events to listen to                               │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ ☑ checkout.session.completed                            │
│ ☑ checkout.session.expired                              │
│ ☑ payment_intent.succeeded                              │
│ ☑ payment_intent.payment_failed                         │
│ ☑ charge.dispute.created                                │
│ ☑ charge.refunded                                       │
│ ☑ charge.refund.updated                                 │
│ ☐ payment_intent.canceled                               │
│ ☐ charge.succeeded                                      │
│ ... (more events)                                       │
│                                                           │
│ [Add endpoint]                                           │
└─────────────────────────────────────────────────────────┘
```

---

### Step 6: Create the Endpoint

1. After selecting the events, click **"Add endpoint"** or **"Create endpoint"** button
2. Stripe will create the webhook endpoint
3. You'll be redirected to the webhook details page

---

### Step 7: Copy the Webhook Signing Secret

1. On the webhook details page, you'll see:
   - Webhook URL
   - Events list
   - **"Signing secret"** section

2. In the **"Signing secret"** section:
   - You'll see: `whsec_...` (a long string starting with `whsec_`)
   - Click the **"Reveal"** button or **"Click to reveal"** link
   - The secret will be displayed

3. **Copy the entire secret** (it starts with `whsec_` and is quite long)
   - Example format: `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**Visual Guide:**
```
┌─────────────────────────────────────────────────────────┐
│ Webhook endpoint details                                 │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ Endpoint URL:                                            │
│ https://likelemba-production-8eb76f5c732e...           │
│                                                           │
│ Status: ✅ Enabled                                       │
│                                                           │
│ Signing secret                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx... │ │
│ │ [Reveal] [Copy]                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ Events:                                                   │
│ • checkout.session.completed                             │
│ • payment_intent.succeeded                               │
│ ...                                                       │
└─────────────────────────────────────────────────────────┘
```

**⚠️ Important:** 
- Keep this secret secure
- Don't share it publicly
- You'll need it in the next step

---

### Step 8: Set Webhook Secret on Heroku

Now you need to add this secret to your Heroku app's environment variables.

#### Option A: Using Heroku CLI (Recommended)

1. Open your terminal/command prompt
2. Navigate to your project directory:
   ```bash
   cd /Users/elvicmbaya/Likelemba
   ```
3. Run this command (replace `whsec_xxx...` with your actual secret):
   ```bash
   heroku config:set STRIPE_WEBHOOK_SECRET=whsec_xxx... --app likelemba-production
   ```
4. Press Enter
5. You should see: `Setting STRIPE_WEBHOOK_SECRET and restarting likelemba-production... done`

**Example:**
```bash
$ heroku config:set STRIPE_WEBHOOK_SECRET=whsec_abc123def456... --app likelemba-production
Setting STRIPE_WEBHOOK_SECRET and restarting likelemba-production... done
STRIPE_WEBHOOK_SECRET: whsec_abc123def456...
```

#### Option B: Using Heroku Dashboard

1. Go to: https://dashboard.heroku.com/apps/likelemba-production
2. Click on **"Settings"** tab
3. Scroll down to **"Config Vars"** section
4. Click **"Reveal Config Vars"** or **"Edit"**
5. Click **"Add"** or **"Edit"** button
6. Add:
   - **Key:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_xxx...` (paste your secret)
7. Click **"Save"** or **"Add"**

---

### Step 9: Verify Configuration

1. **Verify on Heroku:**
   ```bash
   heroku config:get STRIPE_WEBHOOK_SECRET --app likelemba-production
   ```
   Should display your webhook secret

2. **Verify on Stripe:**
   - Go back to Stripe Dashboard → Webhooks
   - Your endpoint should show:
     - ✅ Status: **Enabled**
     - ✅ URL: Your Heroku URL
     - ✅ Events: List of selected events

3. **Test the webhook:**
   - In Stripe Dashboard, click on your webhook endpoint
   - Click **"Send test webhook"** button
   - Select an event (e.g., `checkout.session.completed`)
   - Click **"Send test webhook"**
   - Check Heroku logs to verify it was received:
     ```bash
     heroku logs --tail --app likelemba-production
     ```

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] Webhook URL is correct: `https://likelemba-production-8eb76f5c732e.herokuapp.com/webhooks/stripe`
- [ ] All required events are selected
- [ ] Webhook status shows "Enabled" in Stripe
- [ ] `STRIPE_WEBHOOK_SECRET` is set on Heroku
- [ ] Test webhook was received successfully

---

## 🧪 Testing the Webhook

### Test from Stripe Dashboard:

1. Go to your webhook endpoint in Stripe
2. Click **"Send test webhook"**
3. Select event: `checkout.session.completed`
4. Click **"Send test webhook"**
5. Check Heroku logs:
   ```bash
   heroku logs --tail --app likelemba-production | grep -i stripe
   ```

### Test with Real Payment:

1. Create a test payment through your application
2. Complete the checkout
3. Check Heroku logs for webhook delivery:
   ```bash
   heroku logs --tail --app likelemba-production
   ```
4. Verify in Stripe Dashboard → Webhooks → Your endpoint → **"Recent deliveries"**
   - Should show successful deliveries (green checkmarks)

---

## 🔍 Troubleshooting

### Issue: Webhook not receiving events

**Check:**
1. Webhook URL is correct and accessible
2. `STRIPE_WEBHOOK_SECRET` is set correctly on Heroku
3. Webhook is enabled in Stripe Dashboard
4. Events are selected correctly
5. Check Heroku logs for errors:
   ```bash
   heroku logs --tail --app likelemba-production
   ```

### Issue: "Invalid signature" errors

**Solution:**
- Verify `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe Dashboard
- Make sure you copied the entire secret (it's long)
- Re-copy and update on Heroku:
  ```bash
  heroku config:set STRIPE_WEBHOOK_SECRET=whsec_xxx... --app likelemba-production
  ```

### Issue: Webhook shows as "Failed" in Stripe

**Check:**
1. Heroku app is running: `heroku ps --app likelemba-production`
2. Webhook endpoint is accessible:
   ```bash
   curl https://likelemba-production-8eb76f5c732e.herokuapp.com/webhooks/stripe
   ```
3. Check Heroku logs for error messages

---

## 📝 Quick Reference

### Webhook URL
```
https://likelemba-production-8eb76f5c732e.herokuapp.com/webhooks/stripe
```

### Required Events

**Escrow Deposit Events:**
- `checkout.session.completed` - Triggers escrow deposit
- `payment_intent.succeeded` - Triggers escrow deposit

**Escrow Release Events:**
- `charge.refunded` - Triggers escrow refund/release

**Escrow Freeze Events (Disputes):**
- `charge.dispute.created` - Triggers escrow freeze
- `charge.dispute.updated` - Updates dispute status
- `charge.dispute.closed` - Triggers escrow unfreeze/release

**Other Required Events:**
- `checkout.session.expired`
- `payment_intent.payment_failed`
- `charge.refund.updated`

### Set Secret Command
```bash
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_xxx... --app likelemba-production
```

### Verify Secret
```bash
heroku config:get STRIPE_WEBHOOK_SECRET --app likelemba-production
```

### View Logs
```bash
heroku logs --tail --app likelemba-production
```

---

## ✅ Completion

Once all steps are completed:

1. ✅ Webhook is configured in Stripe
2. ✅ Secret is set on Heroku
3. ✅ Test webhook was successful
4. ✅ Real payments trigger webhooks correctly

Your Stripe webhook integration is now complete! 🎉

---

## 🔒 Escrow Functionality with Stripe

### How Escrow Works with Stripe Events

Your Likelemba platform uses **application-level escrow** where funds are held in your database until released. Here's how Stripe events trigger escrow operations:

#### 1. **Escrow Deposit Flow** 💰

**When:** User makes a contribution payment

**Stripe Events Triggered:**
1. `checkout.session.completed` → Payment session completed
2. `payment_intent.succeeded` → Payment successfully processed

**What Happens:**
- Payment status updated to `succeeded`
- Contribution marked as `paid`
- **Funds deposited to escrow account** (application-level)
- Ledger event recorded: `payment.captured`
- Escrow balance increased

**Code Flow:**
```
Stripe Webhook → handlePaymentSuccess() → escrowService.deposit()
```

#### 2. **Escrow Release Flow** 🚀

**When:** Cycle payout is processed (scheduled or manual)

**Stripe Events:**
- No direct Stripe event (application-triggered)
- Uses `charge.refunded` if refund is needed

**What Happens:**
- Escrow balance checked
- Funds released from escrow
- Payout created and processed
- Ledger event recorded: `escrow.funds.released`

**Code Flow:**
```
Cycle Scheduler → processCyclePayout() → escrowService.release()
```

#### 3. **Escrow Freeze Flow** ❄️ (Disputes)

**When:** Dispute is opened

**Stripe Events:**
1. `charge.dispute.created` → Dispute opened
2. `charge.dispute.updated` → Dispute updated
3. `charge.dispute.closed` → Dispute resolved

**What Happens:**
- **50% of escrow balance is frozen** (moved from available to frozen)
- Dispute record created
- Ledger event recorded: `escrow.funds.frozen`

**Code Flow:**
```
Stripe Webhook → handleDispute() → escrowService.freeze()
```

#### 4. **Escrow Unfreeze Flow** 🔓 (Dispute Resolution)

**When:** Dispute is resolved

**Stripe Events:**
- `charge.dispute.closed` → Dispute closed/resolved

**What Happens:**
- If dispute resolved in favor of customer: Funds unfrozen and refunded
- If dispute dismissed: Funds unfrozen and returned to available
- Ledger event recorded: `escrow.funds.unfrozen`

**Code Flow:**
```
Stripe Webhook → handleDispute() → escrowService.unfreeze()
```

### Escrow Event Mapping

| Stripe Event | Escrow Action | Description |
|--------------|---------------|-------------|
| `payment_intent.succeeded` | **Deposit** | Funds added to escrow when payment succeeds |
| `checkout.session.completed` | **Deposit** | Alternative trigger for escrow deposit |
| `charge.dispute.created` | **Freeze** | 50% of escrow frozen when dispute opens |
| `charge.dispute.closed` | **Unfreeze** | Escrow unfrozen when dispute resolved |
| `charge.refunded` | **Release** | Escrow released for refunds |
| Cycle Payout (App) | **Release** | Escrow released for payouts |

### Important Notes

1. **Application-Level Escrow**: Funds are held in your database, not by Stripe
2. **Automatic Capture**: Current implementation uses automatic capture (funds captured immediately)
3. **Dispute Protection**: 50% of escrow is frozen when disputes are opened
4. **Manual Release**: Escrow releases are triggered by application logic (cycle scheduler), not Stripe events

### Future Enhancements (Optional)

If you want to use Stripe's built-in escrow features:

1. **Payment Holds**: Use `capture_method: 'manual'` to hold funds
2. **Additional Events Needed**:
   - `payment_intent.amount_capturable_updated`
   - `payment_intent.capture_failed`
   - `payment_intent.canceled`

---

**Need Help?**
- Stripe Webhook Docs: https://stripe.com/docs/webhooks
- Stripe Escrow Guide: https://stripe.com/docs/payments/capture-later
- Heroku Config Vars: https://devcenter.heroku.com/articles/config-vars
- Check deployment status: `backend/DEPLOYMENT_STATUS.md`
- Escrow Service Code: `backend/src/services/escrow/index.js`

