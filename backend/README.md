# Likelemba WhatsApp ROSCA Platform

> **WhatsApp-first rotating savings groups platform with transparent ledgers, automated reminders, mobile-money + Stripe payments, and escrow + refunds + disputes.**

## 🚀 Overview

Likelemba is a WhatsApp Business platform built with Green API that enables communities to create and manage rotating savings groups (ROSCA). The platform features:

- **WhatsApp-first interface** via Green API
- **Dual payment methods**: Mobile Money (M-Pesa, Orange, Tigo) + Stripe
- **Escrow system** with automated release rules
- **Refund & dispute management**
- **AI Agent** for natural language interaction
- **Event-driven architecture** with immutable ledger
- **Multi-role system**: Members, Group Admins, Platform Admins

## 📋 Features

### Core Features
- ✅ User onboarding via WhatsApp
- ✅ Group creation and management
- ✅ Contribution tracking and payments
- ✅ Cycle (round) management
- ✅ Automated payout scheduling
- ✅ Escrow account management
- ✅ Refund processing
- ✅ Dispute resolution
- ✅ AI-powered natural language support
- ✅ Transparent ledger with hash chain

### Payment Methods
- **Stripe**: Card and bank payments
- **Mobile Money**: M-Pesa, Orange Money, Tigo Pesa (via provider APIs)

## 🏗️ Architecture

### Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.2.1
- **Database**: PostgreSQL
- **WhatsApp**: Green API (@green-api/whatsapp-api-client)
- **Payments**: Stripe
- **AI**: OpenAI (GPT-4o-mini)
- **Queue**: BullMQ (Redis)

### Project Structure
```
backend/
├── src/
│   ├── app.js                 # Express app entry point
│   ├── config/               # Configuration modules
│   │   ├── database.js       # PostgreSQL connection
│   │   ├── greenapi.js        # Green API client
│   │   └── stripe.js         # Stripe client
│   ├── routes/               # API routes
│   │   ├── webhooks/         # Webhook handlers
│   │   └── api/              # REST API endpoints
│   ├── services/             # Business logic
│   │   ├── whatsapp/         # WhatsApp handler
│   │   ├── users/            # User management
│   │   ├── groups/            # Group management
│   │   ├── cycles/           # Cycle management
│   │   ├── payments/         # Payment processing
│   │   ├── escrow/           # Escrow management
│   │   ├── ledger/           # Event store
│   │   ├── disputes/         # Dispute management
│   │   ├── refunds/          # Refund processing
│   │   └── aiAgent/          # AI Agent service
│   └── templates/            # WhatsApp message templates
│       └── whatsapp/
├── database/
│   └── schema.sql            # Database schema
├── package.json
└── Procfile                  # Heroku deployment
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Green API account and instance
- Stripe account (for card payments)
- OpenAI API key (for AI Agent)
- Redis (for queues)

### Installation

1. **Clone and install dependencies:**
```bash
cd backend
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. **Set up database:**
```bash
# Create database
createdb likelemba

# Run schema
psql likelemba < database/schema.sql
```

4. **Start the server:**
```bash
npm start
# or for development
npm run dev
```

### Environment Variables

Required environment variables (see `.env.example`):

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/likelemba

# Green API
GREEN_ID_INSTANCE=your_instance_id
GREEN_API_TOKEN_INSTANCE=your_api_token
GREEN_PHONE=your_phone_number

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI
OPENAI_API_KEY=sk-...

# JWT
JWT_SECRET=your-secret-key

# App
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:3000
```

## 📡 Webhook Configuration

### Green API Webhook
1. Go to Green API Console: https://console.green-api.com/
2. Select your instance
3. Navigate to "Webhook Settings"
4. Set webhook URL: `https://your-domain.com/webhooks/greenapi`
5. Enable webhook types:
   - ✅ `incomingMessageReceived`
   - ✅ `outgoingMessageStatus`
   - ✅ `deviceStatus`

### Stripe Webhook
1. Go to Stripe Dashboard: https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-domain.com/webhooks/stripe`
3. Select events:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `checkout.session.completed`
   - ✅ `charge.refunded`
   - ✅ `charge.dispute.*`

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/health
```

### Test Webhook (Local)
Use ngrok or similar to expose local server:
```bash
ngrok http 3000
# Use ngrok URL in webhook settings
```

### Test WhatsApp Message
Send a message to your Green API number:
```
Hi
```
Should receive welcome message and menu.

## 📚 API Documentation

### Webhooks

#### POST `/webhooks/greenapi`
Green API incoming message webhook.

#### POST `/webhooks/stripe`
Stripe webhook events.

#### POST `/webhooks/mobilemoney`
Mobile Money provider webhooks.

### REST API

#### GET `/api/v1/groups`
Get user's groups.

#### GET `/api/v1/groups/:id`
Get group by ID.

#### POST `/api/v1/groups`
Create new group.

## 🔒 Security

- ✅ Parameterized SQL queries (SQL injection prevention)
- ✅ JWT authentication for API endpoints
- ✅ Webhook signature verification (Stripe)
- ✅ PIN-based 2FA for sensitive actions
- ✅ Encrypted PII at rest
- ✅ Rate limiting (implemented in services)

## 📊 Database Schema

Key tables:
- `users` - User accounts
- `groups` - Savings groups
- `group_members` - Group membership
- `cycles` - Savings rounds
- `contributions` - Member contributions
- `payments` - Payment records
- `escrow_accounts` - Escrow balances
- `escrow_transactions` - Escrow movements
- `payouts` - Payout records
- `refunds` - Refund records
- `disputes` - Dispute cases
- `ledger_events` - Immutable event store

See `database/schema.sql` for full schema.

## 🚢 Deployment

### Heroku

1. **Create Heroku app:**
```bash
heroku create likelemba-production
```

2. **Add PostgreSQL:**
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

3. **Set environment variables:**
```bash
heroku config:set DATABASE_URL=...
heroku config:set GREEN_ID_INSTANCE=...
# ... etc
```

4. **Run migrations:**
```bash
heroku run psql $DATABASE_URL -f database/schema.sql
```

5. **Deploy:**
```bash
git push heroku main
```

### Railway

1. Connect GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

## 📝 Development

### Code Standards
- Follow existing service patterns
- Use async/await (no callbacks)
- Parameterized SQL queries
- Error handling with try-catch
- Use templates for WhatsApp messages

### Adding a New Service
1. Create service in `src/services/[service-name]/index.js`
2. Add route in `src/routes/api/[service].js`
3. Create templates in `src/templates/whatsapp/[service].js`
4. Update WhatsApp handler to route to service

## 🤝 Contributing

1. Follow the code standards
2. Test all changes
3. Update documentation
4. Submit pull request

## 📄 License

MIT

## 🆘 Support

For issues or questions:
- Check documentation
- Review logs
- Contact support team

---

**Built with ❤️ for community savings groups**

