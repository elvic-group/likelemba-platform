# 🚀 Likelemba - START HERE

## Quick Start (3 Steps)

### Step 1: Verify Environment ✅
```bash
npm run check:env
```
**Expected:** ✅ All required environment variables are set!

### Step 2: Set Up Database 🗄️
```bash
npm run db:migrate
```
**Expected:** ✅ Database migration completed successfully!

### Step 3: Verify Deployment ✅
```bash
npm run verify
```
**Expected:** ✅ All checks passed! Platform is ready for deployment.

---

## 🎯 Start the Server

```bash
# Standard start
npm start

# Or safe start (with checks)
npm run start:safe
```

**Expected output:**
```
🚀 Likelemba server running on port 3000
📱 Environment: production
📅 Starting notification scheduler...
✅ Notification scheduler started
```

---

## 🧪 Test the Platform

### 1. Health Check
```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "greenAPI": "configured",
    "stripe": "configured"
  }
}
```

### 2. Test WhatsApp Flow
1. Send **"Hi"** to your Green API WhatsApp number
2. You should receive welcome message
3. Reply with **"1"** to see main menu
4. Test other commands

---

## 📡 Configure Webhooks

### Green API Webhook
1. Go to: https://console.green-api.com/
2. Select your instance
3. **Webhook Settings** → Set URL: `https://your-domain.com/webhooks/greenapi`
4. Enable:
   - ✅ `incomingMessageReceived`
   - ✅ `outgoingMessageStatus`
   - ✅ `deviceStatus`

### Stripe Webhook
1. Go to: https://dashboard.stripe.com/webhooks
2. **Add endpoint**
3. URL: `https://your-domain.com/webhooks/stripe`
4. Select events:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `checkout.session.completed`
   - ✅ `charge.refunded`
   - ✅ `charge.dispute.*`
5. Copy webhook secret → Set `STRIPE_WEBHOOK_SECRET` in `.env`

---

## 📚 Available Commands

```bash
# Setup
npm run check:env        # Check environment variables
npm run db:migrate       # Set up database
npm run verify           # Verify deployment readiness

# Testing
npm run test:connection  # Test all connections
npm run test:platform    # Test platform functionality

# Running
npm start                # Start production server
npm run dev              # Start with auto-reload
npm run start:safe       # Start with safety checks
```

---

## 🆘 Troubleshooting

### Database Issues
```bash
# Check connection
psql $DATABASE_URL -c "SELECT 1;"

# If tables don't exist
npm run db:migrate

# If you need fresh start (CAREFUL - deletes all data!)
node scripts/reset-database.js
```

### Green API Issues
```bash
# Check credentials
npm run check:env

# Verify instance is authorized in Green API console
# Check webhook URL is accessible
```

### Server Won't Start
```bash
# Check if port is in use
lsof -ti:3000 | xargs kill

# Check logs for errors
npm start
```

---

## ✅ Success Checklist

- [ ] Environment variables set (`npm run check:env`)
- [ ] Database migrated (`npm run db:migrate`)
- [ ] Deployment verified (`npm run verify`)
- [ ] Server starts without errors
- [ ] Health endpoint works
- [ ] Webhooks configured
- [ ] WhatsApp flow tested

---

## 📖 Documentation

- **QUICK_START.md** - Detailed quick start
- **README.md** - Complete documentation
- **DEPLOYMENT.md** - Production deployment guide
- **FEATURES_COMPLETE.md** - All features list

---

**Ready?** Run `npm run verify` to check everything is set up correctly!

