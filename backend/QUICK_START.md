# Likelemba Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment
```bash
# Copy example file
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

**Minimum required variables:**
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/likelemba
GREEN_ID_INSTANCE=your_instance_id
GREEN_API_TOKEN_INSTANCE=your_api_token
STRIPE_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...
```

### Step 3: Set Up Database
```bash
# Option A: Using script (recommended)
npm run db:setup

# Option B: Using npm script
npm run db:migrate

# Option C: Manual
psql $DATABASE_URL -f database/schema.sql
```

### Step 4: Verify Setup
```bash
# Check environment variables
npm run check:env

# Test connections
npm run test:connection

# Test platform
npm run test:platform
```

### Step 5: Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Step 6: Configure Webhooks

#### Green API
1. Go to https://console.green-api.com/
2. Select your instance
3. Webhook Settings → Set URL: `https://your-domain.com/webhooks/greenapi`
4. Enable: `incomingMessageReceived`, `outgoingMessageStatus`, `deviceStatus`

#### Stripe
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-domain.com/webhooks/stripe`
3. Select events: `payment_intent.*`, `charge.refunded`, `charge.dispute.*`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET` in `.env`

### Step 7: Test WhatsApp Flow
1. Send "Hi" to your Green API WhatsApp number
2. You should receive welcome message
3. Reply with "1" to see main menu
4. Test other commands

---

## 📋 Available Commands

```bash
# Development
npm run dev              # Start with nodemon (auto-reload)

# Database
npm run db:migrate       # Run database migrations
npm run db:setup         # Full database setup script

# Testing
npm run test:connection  # Test all connections
npm run test:platform   # Test platform functionality
npm run check:env        # Check environment variables

# Production
npm start                # Start production server
```

---

## 🧪 Testing Checklist

- [ ] Environment variables set (`npm run check:env`)
- [ ] Database connected (`npm run test:connection`)
- [ ] Platform tests pass (`npm run test:platform`)
- [ ] Server starts without errors
- [ ] Health endpoint works: `curl http://localhost:3000/health`
- [ ] Webhooks configured
- [ ] WhatsApp flow tested

---

## 🆘 Common Issues

### Database Connection Error
```bash
# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Green API Not Working
```bash
# Check credentials
npm run check:env

# Verify instance is authorized in Green API console
```

### Port Already in Use
```bash
# Change PORT in .env
PORT=3001

# Or kill existing process
lsof -ti:3000 | xargs kill
```

---

## 📚 Next Steps

1. Read `README.md` for detailed documentation
2. Read `DEPLOYMENT.md` for production deployment
3. Read `FEATURES_COMPLETE.md` for feature list
4. Customize templates in `src/templates/whatsapp/`
5. Add your mobile money provider integration

---

**Need Help?** Check the documentation or review logs for errors.

