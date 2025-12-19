# 🎯 Next Actions - Complete Webhook Setup

**Date:** December 19, 2024  
**Status:** Stripe Webhook Secret Configured ✅

---

## ✅ Completed

1. ✅ Stripe webhook secret added to local `.env`
2. ✅ Stripe webhook secret set on Heroku
3. ✅ Webhook handler code ready

---

## 🔥 Action Required: Configure Stripe Webhook Endpoint

### Step 1: Create Webhook Endpoint in Stripe Dashboard

1. **Go to Stripe Dashboard:**
   - Navigate to: https://dashboard.stripe.com/webhooks
   - Make sure you're logged in

2. **Click "Add endpoint"** (top right button)

3. **Enter Webhook URL:**
   ```
   https://likelemba-production-8eb76f5c732e.herokuapp.com/webhooks/stripe
   ```
   - ✅ Use HTTPS (required)
   - ✅ Include full path `/webhooks/stripe`
   - ✅ No trailing slash

4. **Select Events to Listen To:**
   
   Check these boxes:
   
   **Payment Events:**
   - ✅ `checkout.session.completed` - **CRITICAL** - Triggers escrow deposit
   - ✅ `payment_intent.succeeded` - **CRITICAL** - Payment success
   - ✅ `payment_intent.payment_failed` - Payment failures
   - ✅ `checkout.session.expired` - Expired checkouts
   
   **Dispute & Refund Events:**
   - ✅ `charge.dispute.created` - **CRITICAL** - Freezes escrow funds
   - ✅ `charge.dispute.updated` - Dispute updates
   - ✅ `charge.dispute.closed` - **CRITICAL** - Releases escrow funds
   - ✅ `charge.refunded` - Refund processing

5. **Click "Add endpoint"** to create it

6. **Copy the Signing Secret:**
   - After creating, click on the webhook endpoint
   - Click "Reveal" next to "Signing secret"
   - Copy the secret (should start with `whsec_...`)
   - **Note:** You already have this: `whsec_EtvFqVtmB37b1Ghns070eYMZ9Gp8mNg`

---

## ✅ Verify Configuration

### Test Stripe Webhook Endpoint

```bash
# Test if endpoint is accessible
curl -X POST https://likelemba-production-8eb76f5c732e.herokuapp.com/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type":"test"}'
```

Expected: Should return `{"received": true}` or similar (even if signature fails, endpoint is reachable)

### Check Heroku Logs

```bash
heroku logs --tail --app likelemba-production
```

Watch for webhook events when you test payments.

---

## 🔄 Optional: Configure Green API Webhook

If you haven't already configured the Green API webhook:

1. **Go to Green API Console:**
   - Navigate to: https://console.green-api.com/
   - Select instance: `7700330457`

2. **Navigate to Webhook Settings:**
   - Settings → Webhook Settings

3. **Set Webhook URL:**
   ```
   https://likelemba-production-8eb76f5c732e.herokuapp.com/webhooks/greenapi
   ```

4. **Enable Webhook Types:**
   - ✅ `incomingMessageReceived` - Incoming WhatsApp messages
   - ✅ `outgoingMessageStatus` - Message delivery status
   - ✅ `deviceStatus` - Device connection status

5. **Save Settings**

---

## 🧪 Test Complete Flow

Once both webhooks are configured:

1. **Test WhatsApp Message:**
   - Send a WhatsApp message to your Green API number
   - Check Heroku logs to see if webhook is received
   - Verify message is processed

2. **Test Payment Flow:**
   - Initiate a test payment through your platform
   - Check Stripe Dashboard → Webhooks → Your endpoint
   - Verify events are being received
   - Check Heroku logs for payment processing

---

## 📊 Verification Checklist

- [ ] Stripe webhook endpoint created in Stripe Dashboard
- [ ] Webhook URL set: `https://likelemba-production-8eb76f5c732e.herokuapp.com/webhooks/stripe`
- [ ] All required events selected
- [ ] Webhook secret matches: `whsec_EtvFqVtmB37b1Ghns070eYMZ9Gp8mNg`
- [ ] Heroku config has `STRIPE_WEBHOOK_SECRET` set
- [ ] Test webhook endpoint is accessible
- [ ] Green API webhook configured (optional but recommended)
- [ ] Test payment flow end-to-end

---

## 🚀 Once Complete

Your platform will be fully operational with:
- ✅ Payment processing with escrow
- ✅ Automatic dispute handling
- ✅ WhatsApp message processing
- ✅ Real-time webhook events

---

## 📝 Quick Reference

**Production URLs:**
- App: https://likelemba-production-8eb76f5c732e.herokuapp.com
- Stripe Webhook: https://likelemba-production-8eb76f5c732e.herokuapp.com/webhooks/stripe
- Green API Webhook: https://likelemba-production-8eb76f5c732e.herokuapp.com/webhooks/greenapi

**Heroku Commands:**
```bash
# View config
heroku config --app likelemba-production

# View logs
heroku logs --tail --app likelemba-production

# Check webhook secret
heroku config:get STRIPE_WEBHOOK_SECRET --app likelemba-production
```

---

**Next:** Go to Stripe Dashboard and create the webhook endpoint! 🎯


