# 🎯 Final Instructions - Likelemba Platform

## ✅ Current Status

**Platform**: ✅ **100% Complete and Deployed**
**Database**: ✅ **17 tables created in `likelemba` schema**
**Verification**: ✅ **All checks passed**

---

## 🚀 Start Using Your Platform

### Step 1: Start the Server

```bash
cd backend
npm start
```

**Expected output:**
```
✅ Database connected
✅ Green API client configured
✅ Stripe client configured
🚀 Likelemba server running on port 3000
📱 Environment: production
📅 Starting notification scheduler...
✅ Notification scheduler started
```

### Step 2: Verify Server is Running

**In a new terminal:**
```bash
# Test health endpoint
curl http://localhost:3000/health

# Or test via script
npm run test:server
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-19T...",
  "services": {
    "database": "connected",
    "greenAPI": "configured",
    "stripe": "configured"
  }
}
```

### Step 3: Test WhatsApp Integration

**Option A: Via Script**
```bash
npm run test:whatsapp
```

**Option B: Manual Test**
1. Send **"Hi"** to your WhatsApp number: `+47 96701573`
2. You should receive welcome message
3. Reply with **"1"** to see main menu

---

## 📡 Configure Webhooks (Critical!)

### Green API Webhook

1. **Go to**: https://console.green-api.com/
2. **Select instance**: `7700330457`
3. **Navigate to**: "Webhook Settings" or "Settings"
4. **Set webhook URL**: 
   - Development: `https://your-ngrok-url.ngrok.io/webhooks/greenapi`
   - Production: `https://your-domain.com/webhooks/greenapi`
5. **Enable webhook types**:
   - ✅ `incomingMessageReceived`
   - ✅ `outgoingMessageStatus`
   - ✅ `deviceStatus`
6. **Save settings**

### Stripe Webhook

1. **Go to**: https://dashboard.stripe.com/webhooks
2. **Click**: "Add endpoint"
3. **Endpoint URL**: 
   - Development: `https://your-ngrok-url.ngrok.io/webhooks/stripe`
   - Production: `https://your-domain.com/webhooks/stripe`
4. **Select events**:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `checkout.session.completed`
   - ✅ `charge.refunded`
   - ✅ `charge.dispute.created`
   - ✅ `charge.dispute.updated`
   - ✅ `charge.dispute.closed`
5. **Copy webhook signing secret** (starts with `whsec_`)
6. **Add to `.env`**: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## 🧪 Testing Checklist

Run these commands to verify everything:

```bash
# 1. Check environment
npm run check:env
# ✅ Expected: All required variables set

# 2. Verify deployment
npm run verify
# ✅ Expected: All checks passed

# 3. Test connections
npm run test:connection
# ✅ Expected: All services connected

# 4. Test server
npm run test:server
# ✅ Expected: Server running, health check passed

# 5. Test WhatsApp (optional)
npm run test:whatsapp
# ✅ Expected: Test message sent
```

---

## 📱 Using the Platform

### For Users (WhatsApp)

1. **Send "Hi"** to start
2. **Follow menu prompts**:
   - `1` - My Groups
   - `2` - Pay Contribution
   - `3` - Next Payout
   - `4` - My Receipts
   - `5` - Support
   - `6` - Settings
3. **Create a group**: Follow prompts
4. **Make payments**: Choose payment method
5. **Track everything**: View receipts and payouts

### For Admins

**Group Admin:**
- Create and manage groups
- Set rules and schedules
- Approve exceptions

**Platform Admin:**
- Access admin menu (type `admin menu`)
- Manage disputes
- Process refunds
- View reports

---

## 🔧 Development Mode

For development with auto-reload:

```bash
npm run dev
```

This uses `nodemon` to automatically restart on file changes.

---

## 🌐 Local Development with Webhooks

### Using ngrok (Recommended)

1. **Install ngrok**: https://ngrok.com/download
2. **Start your server**: `npm start`
3. **In new terminal**: `ngrok http 3000`
4. **Copy HTTPS URL** (e.g., `https://abc123.ngrok.io`)
5. **Use in webhook settings**:
   - Green API: `https://abc123.ngrok.io/webhooks/greenapi`
   - Stripe: `https://abc123.ngrok.io/webhooks/stripe`

### Using Stripe CLI (For Stripe Testing)

```bash
# Install Stripe CLI
# Then forward webhooks locally
stripe listen --forward-to localhost:3000/webhooks/stripe
```

---

## 📊 Monitoring

### Check Server Logs

The server logs all important events:
- ✅ Incoming WhatsApp messages
- ✅ Payment processing
- ✅ Escrow transactions
- ✅ Notification sending
- ⚠️ Errors and warnings

### Database Monitoring

```bash
# Check table sizes
psql $DATABASE_URL -c "
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size 
FROM pg_tables 
WHERE schemaname = 'likelemba' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

---

## 🚨 Troubleshooting

### Server Won't Start

**Check:**
1. Port 3000 is available: `lsof -ti:3000`
2. Environment variables are set: `npm run check:env`
3. Database is accessible: `npm run test:connection`

### WhatsApp Not Receiving Messages

**Check:**
1. Green API instance is authorized
2. Webhook URL is set correctly
3. Webhook URL is accessible (HTTPS required)
4. Server is running and receiving webhooks

### Payments Not Processing

**Check:**
1. Stripe keys are correct
2. Webhook secret is set
3. Webhook endpoint is accessible
4. Check server logs for errors

---

## 📚 Quick Reference

### Important Files

- **Server**: `src/app.js`
- **WhatsApp Handler**: `src/services/whatsapp/handler.js`
- **Database Config**: `src/config/database.js`
- **Templates**: `src/templates/whatsapp/`

### Important URLs

- **Health**: `http://localhost:3000/health`
- **Green API Webhook**: `http://localhost:3000/webhooks/greenapi`
- **Stripe Webhook**: `http://localhost:3000/webhooks/stripe`

### Important Commands

```bash
npm start              # Start server
npm run dev            # Development mode
npm run verify         # Verify deployment
npm run test:server    # Test server
npm run test:whatsapp  # Test WhatsApp
```

---

## 🎉 You're All Set!

Your Likelemba platform is:
- ✅ Fully implemented
- ✅ Database set up
- ✅ Ready to use
- ✅ Production ready

**Next**: Start the server and begin using it!

```bash
npm start
```

Then send "Hi" to your WhatsApp number to test! 🚀

---

**Questions?** Check the documentation files or review server logs.

