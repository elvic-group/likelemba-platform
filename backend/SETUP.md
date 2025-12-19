# Likelemba Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
# Edit .env with your credentials
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `GREEN_ID_INSTANCE` - Green API instance ID
- `GREEN_API_TOKEN_INSTANCE` - Green API token
- `STRIPE_SECRET_KEY` - Stripe secret key
- `OPENAI_API_KEY` - OpenAI API key (for AI Agent)

### 3. Set Up Database

**Option A: Using Migration Script**
```bash
npm run db:migrate
```

**Option B: Manual SQL**
```bash
# Create database
createdb likelemba

# Run schema
psql likelemba < database/schema.sql
```

**Option C: Using psql directly**
```bash
psql $DATABASE_URL -f database/schema.sql
```

### 4. Test Connections
```bash
node scripts/test-connection.js
```

### 5. Test Platform
```bash
node scripts/test-platform.js
```

### 6. Start Server
```bash
npm start
# or for development
npm run dev
```

## Webhook Configuration

### Green API Webhook
1. Go to https://console.green-api.com/
2. Select your instance
3. Navigate to "Webhook Settings"
4. Set URL: `https://your-domain.com/webhooks/greenapi`
5. Enable: `incomingMessageReceived`, `outgoingMessageStatus`, `deviceStatus`

### Stripe Webhook
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-domain.com/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `charge.refunded`
   - `charge.dispute.*`

## Testing WhatsApp Flow

1. Start the server
2. Send "Hi" to your Green API WhatsApp number
3. You should receive welcome message
4. Reply with "1" to see main menu
5. Test other commands

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running
- Verify database exists

### Green API Issues
- Verify credentials in `.env`
- Check instance is authorized in Green API console
- Verify webhook URL is accessible

### Stripe Issues
- Verify API keys are correct
- Check webhook secret matches
- Use test keys for development

## Next Steps

After setup:
1. Configure webhooks
2. Test basic WhatsApp flow
3. Create a test group
4. Test payment flow
5. Monitor logs for errors

