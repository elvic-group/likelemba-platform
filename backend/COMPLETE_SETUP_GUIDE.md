# Complete Setup Guide - Likelemba Platform

## 🎯 Current Status

✅ **Platform Code**: 100% Complete
✅ **Environment Variables**: All Set
⚠️ **Database**: Needs Setup (existing tables with different structure)

---

## 📋 Step-by-Step Setup

### Step 1: Check Current Database State

```bash
cd backend
node scripts/check-existing-tables.js
```

This shows what tables exist and helps you decide the best approach.

### Step 2: Choose Database Setup Option

#### Option A: Fresh Database (Recommended)
Best for development or if you don't need existing data.

```bash
# Create new database
createdb likelemba_dev

# Update .env
DATABASE_URL=postgresql://user:password@localhost:5432/likelemba_dev

# Run migration
npm run db:migrate
```

#### Option B: Reset Existing Database
⚠️ **WARNING**: Deletes all existing data!

```bash
node scripts/reset-database.js
# Type "yes" to confirm
```

#### Option C: Use Script (Automated)
```bash
chmod +x scripts/create-fresh-db.sh
./scripts/create-fresh-db.sh
```

### Step 3: Verify Setup

```bash
npm run verify
```

**Expected output:**
```
✅ All checks passed! Platform is ready for deployment.
```

### Step 4: Start Server

```bash
npm start
```

**Expected output:**
```
🚀 Likelemba server running on port 3000
📅 Starting notification scheduler...
✅ Notification scheduler started
```

### Step 5: Test Health Endpoint

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

### Step 6: Configure Webhooks

#### Green API Webhook
1. Go to: https://console.green-api.com/
2. Select instance: `7700330457`
3. **Webhook Settings**
4. URL: `https://your-domain.com/webhooks/greenapi`
5. Enable: `incomingMessageReceived`, `outgoingMessageStatus`, `deviceStatus`

#### Stripe Webhook
1. Go to: https://dashboard.stripe.com/webhooks
2. **Add endpoint**
3. URL: `https://your-domain.com/webhooks/stripe`
4. Select events: `payment_intent.*`, `charge.refunded`, `charge.dispute.*`
5. Copy webhook secret → Add to `.env` as `STRIPE_WEBHOOK_SECRET`

### Step 7: Test WhatsApp Flow

1. Send **"Hi"** to your Green API WhatsApp number: `+47 96701573`
2. You should receive welcome message
3. Reply with **"1"** to see main menu
4. Test other commands

---

## 🧪 Testing Checklist

Run these commands to verify everything works:

```bash
# 1. Check environment
npm run check:env
# Expected: ✅ All required environment variables are set!

# 2. Test connections
npm run test:connection
# Expected: ✅ Database connected, ✅ Green API configured, ✅ Stripe configured

# 3. Verify deployment
npm run verify
# Expected: ✅ All checks passed!

# 4. Test platform (after database setup)
npm run test:platform
# Expected: ✅ All tests passed!
```

---

## 📊 Current Configuration

Based on your environment:

✅ **Database**: Heroku PostgreSQL (connected)
✅ **Green API**: Instance `7700330457` (configured)
✅ **Stripe**: Live keys (configured)
✅ **OpenAI**: API key (configured)

⚠️ **Action Needed**: Set up database tables

---

## 🚀 Quick Commands Reference

```bash
# Setup
npm run check:env          # Check environment
npm run db:migrate         # Set up database
npm run verify             # Verify everything

# Testing
npm run test:connection    # Test connections
npm run test:platform      # Test functionality

# Running
npm start                  # Start server
npm run dev                # Development mode
npm run start:safe         # Start with checks

# Database
node scripts/check-existing-tables.js  # Check tables
node scripts/reset-database.js         # Reset (careful!)
./scripts/create-fresh-db.sh           # Create fresh DB
```

---

## 🆘 Troubleshooting

### Database Issues

**Problem**: "column does not exist" errors
**Solution**: Database has old schema. Use fresh database or reset.

```bash
# Check what exists
node scripts/check-existing-tables.js

# Option 1: Fresh database
createdb likelemba_new
# Update DATABASE_URL in .env
npm run db:migrate

# Option 2: Reset (deletes data!)
node scripts/reset-database.js
```

### Green API Issues

**Problem**: Instance not authorized
**Solution**: 
1. Go to Green API console
2. Authorize instance with QR code
3. Verify webhook URL is accessible

### Server Won't Start

**Problem**: Port already in use
**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Or change port in .env
PORT=3001
```

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ `npm run verify` shows all checks passed
2. ✅ Server starts without errors
3. ✅ Health endpoint returns `{"status": "healthy"}`
4. ✅ Sending "Hi" to WhatsApp returns welcome message
5. ✅ Menu navigation works

---

## 📚 Documentation Files

- **START_HERE.md** - Quick start guide
- **QUICK_START.md** - 5-minute setup
- **DATABASE_SETUP.md** - Database setup options
- **DEPLOYMENT.md** - Production deployment
- **README.md** - Complete documentation

---

## 🎉 Next Steps After Setup

1. ✅ Database tables created
2. ✅ Server running
3. ✅ Webhooks configured
4. ✅ WhatsApp flow tested
5. 🚀 **Ready for production use!**

---

**Current Status**: Platform complete, database setup needed
**Action Required**: Choose database setup option and run migration

