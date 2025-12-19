# MuntuShop Platform - Development Rules

> **Comprehensive development rules and standards for MuntuShop WhatsApp Platform**

---

## 📋 Quick Reference

This file contains project documentation. For **development rules and standards**, see:

**👉 [`muntushop-platform-rules.mdc`](../muntushop-platform-rules.mdc)** - Complete development rules

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Current Status & What's Working](#current-status--whats-working)
3. [Development History & Milestones](#development-history--milestones)
4. [Issue Resolution History](#issue-resolution-history)
5. [Architecture & Tech Stack](#architecture--tech-stack)
6. [Project Structure](#project-structure)
7. [All 11 Services](#all-11-services)
8. [Development Guidelines](#development-guidelines)
9. [Code Standards](#code-standards)
10. [API Documentation](#api-documentation)
11. [Database Schema](#database-schema)
12. [Environment Variables](#environment-variables)
13. [Deployment](#deployment)
14. [Testing](#testing)
15. [Troubleshooting Guide](#troubleshooting-guide)
16. [Change Log](#change-log)

---

## 🎯 Project Overview

### Purpose

MuntuShop is a multi-service WhatsApp platform that enables businesses to offer 11 integrated services through WhatsApp messaging. Users interact with the platform via WhatsApp, and all services are accessible through a unified menu system powered by AI.

### Core Features

- **11 Integrated Services**: Shopping, IPTV, Messaging, Support, Appointments, Groups, Money, Courses, News, Marketing, B2B
- **WhatsApp Integration**: Full automation via Green API
- **AI Agent**: Intelligent conversational AI powered by OpenAI (GPT-3.5-turbo) for natural language interactions
- **Payment Processing**: Complete Stripe integration with refunds, escrow, and dispute management
- **Admin Panel**: Complete admin dashboard for managing orders, products, and users
- **RESTful API**: Comprehensive API for all platform features

### Service Pricing

All services are currently priced at **$1.00 each** (configurable per service) for testing. Production pricing can be customized per service.

---

## ✅ Current Status & What's Working

### 🎉 Production Status: **FULLY OPERATIONAL**

**Production URL:** https://muntushop-production-f2ffb28d626e.herokuapp.com/  
**WhatsApp Number:** +47 96701573  
**Deployment Platform:** Heroku  
**Current Version:** v27+  
**Status:** ✅ Live and Running

### ✅ What's Working

#### 1. **All 11 Services - Fully Functional** ✅

- ✅ Shopping Store - Complete checkout flow with Stripe payments
- ✅ Bulk Messaging - Subscription packages with payment
- ✅ Customer Support - Ticket system with plans
- ✅ Appointment Booking - Multi-service booking system
- ✅ Group Management - WhatsApp group automation
- ✅ Money Assistant - Transaction tracking
- ✅ Online Courses - Course catalog and enrollment
- ✅ News & Updates - Subscription-based news delivery
- ✅ Marketing Services - Campaign management
- ✅ B2B Wholesale - Bulk ordering system
- ✅ IPTV Subscriptions - Full subscription with M3U delivery

#### 2. **AI Agent Integration** ✅

- ✅ OpenAI GPT-3.5-turbo integration
- ✅ Natural language processing
- ✅ Conversation history tracking
- ✅ Context-aware responses
- ✅ Fallback handling

#### 3. **Payment System** ✅

- ✅ Stripe checkout sessions
- ✅ Payment webhooks
- ✅ Refund system (full & partial)
- ✅ Escrow system (7-day hold)
- ✅ Dispute management
- ✅ Automatic WhatsApp confirmations

#### 4. **IPTV Service** ✅

- ✅ Subscription packages (Basic/Standard/Premium)
- ✅ Automatic credential delivery
- ✅ M3U playlist URL generation
- ✅ Setup instructions (3 methods)
- ✅ Xtream Codes integration

#### 5. **Database** ✅

- ✅ PostgreSQL 17.6 on Heroku
- ✅ 44+ tables fully structured
- ✅ All migrations applied
- ✅ Conversation history table
- ✅ Payment tracking tables

#### 6. **WhatsApp Integration** ✅

- ✅ Green API webhook receiving
- ✅ Message routing system
- ✅ Service flow management
- ✅ Template-based messaging
- ✅ Multi-step conversation handling

#### 7. **Deployment** ✅

- ✅ Heroku production deployment
- ✅ Environment variables configured
- ✅ Database connected
- ✅ Webhooks configured
- ✅ Health endpoints working

---

## 📈 Development History & Milestones

### December 16, 2025 - Major Milestones

#### v10 - Initial Heroku Deployment ✅

- ✅ Deployed to Heroku production
- ✅ AI Agent with OpenAI integration
- ✅ Complete message template system
- ✅ Conversation state manager
- ✅ Database integration

#### v11 - All Services Working ✅

- ✅ Fixed "Coming Soon" issue for all services
- ✅ Created service-specific message templates
- ✅ Implemented ServiceHandler for conversation flows
- ✅ Built complete navigation system
- ✅ All 11 services fully operational

#### v12 - Stripe Payment Integration ✅

- ✅ Complete Stripe payment processing
- ✅ Shopping checkout flow
- ✅ Subscription payment flows
- ✅ Webhook endpoint created
- ✅ WhatsApp payment confirmations

#### v14 - IPTV Service Complete ✅

- ✅ IPTV credentials integration
- ✅ Automatic M3U playlist delivery
- ✅ Complete setup instructions
- ✅ Credentials configured on Heroku

#### v27 - Refund, Escrow & Dispute System ✅

- ✅ Full refund system (full & partial)
- ✅ Escrow payment holding (7-day auto-release)
- ✅ Dispute management system
- ✅ Evidence submission system
- ✅ Database migrations for payment tracking

### December 18-19, 2024 - Project Cleanup

- ✅ Removed duplicate nested directories
- ✅ Organized legacy code
- ✅ Consolidated documentation
- ✅ Updated project structure
- ✅ Added AI Agent documentation

---

## 🔧 Issue Resolution History

### Issue #1: All Services Showing "Coming Soon" ❌ → ✅

**Problem:** All 11 services were showing "Coming Soon" instead of working menus and flows.

**Root Cause:** Missing service-specific message templates and service handler implementation.

**Solution:**

- Created complete service-specific message templates (`templates/whatsapp/allServices.js`)
- Implemented ServiceHandler for managing conversation flows
- Updated AI agent to route to proper service handlers
- Built full navigation system for all 11 services

**Files Created/Modified:**

- `services/serviceHandler.js` - Service flow management
- `templates/whatsapp/allServices.js` - All service templates
- `services/aiAgent.js` - Updated routing logic
- `services/conversationManager.js` - State tracking

**Result:** ✅ All 11 services now fully functional with complete navigation

---

### Issue #2: PostgreSQL Database Connection ❌ → ✅

**Problem:** Database connection issues on Railway/Heroku deployment.

**Root Cause:**

- Incorrect DATABASE_URL format
- Missing database migrations
- Connection pool configuration issues

**Solution:**

- Fixed DATABASE_URL environment variable format
- Created proper database connection configuration
- Applied all database migrations in correct order
- Added connection pooling with proper error handling

**Files Modified:**

- `backend/src/config/database.js` - Fixed connection logic
- `backend/database/schema.sql` - Complete schema
- `database/migrations/*.sql` - All migrations

**Result:** ✅ Database connection stable, all tables created successfully

---

### Issue #3: Stripe Payment Integration Missing ❌ → ✅

**Problem:** No payment processing after order creation.

**Root Cause:** Missing Stripe integration and webhook handling.

**Solution:**

- Created PaymentService with Stripe SDK
- Implemented checkout session creation
- Added webhook endpoint with signature verification
- Integrated WhatsApp payment confirmations
- Added payment tracking in database

**Files Created:**

- `services/paymentService.js` - Complete payment service
- `routes/webhooks/stripe.js` - Webhook handler

**Files Modified:**

- `services/serviceHandler.js` - Added payment flows
- `server_example.js` - Added Stripe webhook endpoint

**Result:** ✅ Complete payment processing with automatic confirmations

---

### Issue #4: IPTV Credentials Not Delivered ❌ → ✅

**Problem:** IPTV subscriptions weren't delivering channel access after payment.

**Root Cause:** Missing IPTV credential integration in payment flow.

**Solution:**

- Integrated IPTV credentials into payment system
- Automatic M3U playlist URL delivery
- Complete setup instructions for 3 methods (IPTV Smarters, VLC, Any IPTV app)
- Credentials configured on Heroku environment variables

**Files Modified:**

- `services/paymentService.js` - Added IPTV credential delivery
- `templates/whatsapp/iptv.js` - Setup instructions

**Environment Variables Added:**

- `IPTV_ACCOUNT`
- `IPTV_PASSWORD`
- `IPTV_M3U_URL`
- `IPTV_SMARTERS_APP_URL`

**Result:** ✅ Customers receive complete IPTV setup with credentials immediately after payment

---

### Issue #5: AI Agent Not Responding ❌ → ✅

**Problem:** AI agent not processing natural language messages.

**Root Cause:** Missing OpenAI integration and conversation history.

**Solution:**

- Created AI Agent service with OpenAI SDK
- Implemented conversation history storage
- Added context-aware message processing
- Created database migration for conversation_history table

**Files Created:**

- `backend/src/services/aiAgent.js` - AI conversation handler
- `database/migrations/add_ai_agent_conversation_history.sql` - Migration

**Result:** ✅ AI agent now intelligently responds to natural language with context

---

### Issue #6: Payment Refunds & Disputes Missing ❌ → ✅

**Problem:** No system for handling refunds, escrow, or disputes.

**Root Cause:** Missing payment management features.

**Solution:**

- Implemented full refund system (full & partial)
- Created escrow system with 7-day auto-release
- Added dispute management with evidence submission
- Database migrations for payment tracking

**Files Created:**

- `services/stripeRefundService.js` - Refund management
- `database/migrations/add_refund_escrow_dispute_support.sql` - Migration

**Result:** ✅ Complete payment management system with refunds, escrow, and disputes

---

## 🏗️ Architecture & Tech Stack

### Backend Stack

- **Runtime**: Node.js 18+ (24.12.0 on Heroku)
- **Framework**: Express.js 5.2.1
- **Database**: PostgreSQL 8.16.3 (17.6 on Heroku)
- **ORM**: Native pg driver
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Security**: Helmet 8.1.0, CORS 2.8.5
- **Logging**: Morgan 1.10.1

### External Services

- **WhatsApp**: Green API (@green-api/whatsapp-api-client 0.4.4)
- **Payments**: Stripe 20.0.0
- **AI Services**: OpenAI SDK 6.14.0 (GPT-3.5-turbo)
- **Cloud Services**: Google Cloud Speech-to-Text, Text-to-Speech
- **Utilities**: bcryptjs, uuid, dotenv

### Project Type

- **Type**: CommonJS (ES Modules not used)
- **Package Manager**: npm
- **Deployment**: Heroku (production), Railway compatible

---

## 📁 Project Structure

```
Muntushop-2/
├── .cursor/                    # Cursor IDE rules and configuration
│   ├── rules/                  # Project-specific coding rules
│   └── commands/               # Cursor commands
│
├── backend/                    # Main backend application
│   ├── src/
│   │   ├── app.js             # Express app entry point
│   │   ├── config/            # Configuration modules
│   │   │   ├── database.js    # PostgreSQL connection
│   │   │   ├── greenapi.js    # Green API client
│   │   │   ├── stripe.js      # Stripe client
│   │   │   └── whatsapp.config.js
│   │   ├── routes/            # API route handlers
│   │   │   ├── admin/         # Admin routes
│   │   │   ├── api/           # Public API routes
│   │   │   └── webhooks/      # Webhook handlers
│   │   ├── services/          # Business logic services
│   │   │   ├── greenapi/      # WhatsApp handler
│   │   │   ├── iptv/          # IPTV service
│   │   │   ├── shopping/      # Shopping service
│   │   │   ├── payments.js    # Payment service
│   │   │   ├── aiAgent.js     # AI Agent service
│   │   │   └── whatsapp_service.js
│   │   ├── templates/         # WhatsApp message templates
│   │   │   ├── whatsapp/      # WhatsApp templates
│   │   │   └── emails/        # Email templates
│   │   ├── middleware/        # Express middleware
│   │   └── utils/             # Utility functions
│   ├── database/
│   │   └── schema.sql         # Database schema
│   ├── prisma/                # Prisma config (if used)
│   ├── package.json           # Backend dependencies
│   ├── Procfile              # Heroku deployment config
│   └── nixpacks.toml         # Nixpacks config
│
├── docs/                      # Documentation files
│   ├── Md-files/             # Additional documentation
│   └── *.md                  # Various guides and docs
│
├── scripts/                   # Deployment and utility scripts
│   ├── deploy-*.sh           # Deployment scripts
│   └── *.py                  # Python utilities
│
├── tests/                     # Test files
│   ├── test_*.js             # Test scripts
│   └── test_*.json           # Test data
│
├── database/                  # Database migration files
│   └── migrations/           # SQL migration files
│
├── legacy/                    # Old/unused code (archived)
│   ├── services/             # Legacy service files
│   └── templates/            # Legacy templates
│
├── services/                   # Additional services
│   └── metamcp/              # MetaMCP service
│
├── cursor-commands/           # Cursor command templates
├── .env                       # Environment variables (not in git)
├── package.json               # Root package.json
├── Procfile                   # Root Procfile
├── railway.json               # Railway config
├── railway.toml               # Railway config
└── README.md                  # This file
```

### Key Directories

- **`backend/src/`**: All application source code
- **`backend/src/routes/`**: API route definitions
- **`backend/src/services/`**: Business logic and service implementations
- **`backend/src/templates/`**: Message templates for WhatsApp
- **`backend/src/config/`**: Configuration and client setup
- **`docs/`**: All project documentation
- **`tests/`**: Test files and test data
- **`legacy/`**: Archived code (not actively used)

---

## 🛍️ All 11 Services

### 1. 🛍️ Shopping Store ✅

**Status:** Fully Operational  
**Features:**

- Browse by category (Phone, Fashion, Electronics, Home, Games)
- View products with ratings and reviews
- Product detail pages
- Add to cart system
- Complete checkout flow with Stripe
- Order tracking

**Try it:** Send `1` to +47 96701573

---

### 2. 📢 Bulk Messaging ✅

**Status:** Fully Operational  
**Features:**

- Starter package (1,000 messages)
- Business package (5,000 messages)
- Enterprise package (20,000 messages)
- Campaign creation
- Analytics dashboard
- Contact management

**Try it:** Send `2` to +47 96701573

---

### 3. 💬 Customer Support ✅

**Status:** Fully Operational  
**Features:**

- Basic plan (10 tickets/month)
- Standard plan (50 tickets/month)
- Premium plan (Unlimited)
- Create support tickets
- Track ticket status
- View ticket history

**Try it:** Send `3` to +47 96701573

---

### 4. 📅 Appointment Booking ✅

**Status:** Fully Operational  
**Features:**

- Doctor consultation
- Salon/Barbershop
- Dental checkup
- Fitness training
- Car service
- Legal consultation

**Try it:** Send `4` to +47 96701573

---

### 5. 👥 Group Management ✅

**Status:** Fully Operational  
**Features:**

- Auto welcome messages
- Member moderation
- Scheduled announcements
- Payment collection
- Group analytics

**Try it:** Send `5` to +47 96701573

---

### 6. 💰 Money Assistant ✅

**Status:** Fully Operational  
**Features:**

- Track transactions
- Monthly reports
- Budget alerts
- Receipt storage
- Export to Excel

**Try it:** Send `6` to +47 96701573

---

### 7. 📚 Online Courses ✅

**Status:** Fully Operational  
**Features:**

- Programming courses
- Business courses
- Language learning
- Design courses
- Marketing courses

**Try it:** Send `7` to +47 96701573

---

### 8. 📰 News & Updates ✅

**Status:** Fully Operational  
**Features:**

- Basic plan (3 updates/day)
- Premium plan (Unlimited)
- Topic customization
- Breaking news alerts
- Local & international news

**Try it:** Send `8` to +47 96701573

---

### 9. 📊 Marketing Services ✅

**Status:** Fully Operational  
**Features:**

- Startup package (2 campaigns)
- Growth package (8 campaigns)
- Enterprise (Unlimited)
- Campaign creation
- Analytics and reports

**Try it:** Send `9` to +47 96701573

---

### 10. 🏪 B2B Wholesale ✅

**Status:** Fully Operational  
**Features:**

- Browse wholesale catalog
- Place bulk orders
- Order history
- Invoice management
- Delivery scheduling

**Try it:** Send `10` to +47 96701573

---

### 11. 📺 IPTV Subscriptions ✅

**Status:** Fully Operational  
**Features:**

- Basic (500 channels) - $1.00/month
- Standard (800 channels) - $1.00/month
- Premium (1200+ channels) - $1.00/month
- HD/4K quality
- Automatic credential delivery
- M3U playlist URL
- Setup instructions (3 methods)

**Try it:** Send `11` to +47 96701573

**Setup Methods:**

1. IPTV Smarters Pro (Recommended)
2. VLC Media Player
3. Any IPTV App

---

## 💻 Development Guidelines

### Getting Started

#### Prerequisites

- Node.js 18 or higher
- PostgreSQL database (local or remote)
- Green API account and credentials
- Stripe account and API keys
- OpenAI API key (optional, for AI Agent features)

#### Installation

```bash
# 1. Install root dependencies
npm install

# 2. Install backend dependencies
cd backend
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Run database migrations
psql $DATABASE_URL -f backend/database/schema.sql

# 5. Run additional migrations (if needed)
psql $DATABASE_URL -f database/migrations/add_ai_agent_conversation_history.sql
psql $DATABASE_URL -f database/migrations/add_refund_escrow_dispute_support.sql

# 6. Start the development server
npm start
# or
npm run dev
```

### Development Workflow

1. **Always work from `backend/src/` directory**
2. **Follow the existing service patterns** (see Services Documentation)
3. **Update templates** when adding new message flows
4. **Test locally** before committing
5. **Update this README** when making significant changes

### NPM Scripts

#### Root Level

```bash
npm start          # Start backend server
npm run dev        # Start backend in dev mode
npm test           # Run tests
```

#### Backend Level

```bash
cd backend
npm start          # Start server
npm run dev        # Start server (same as start)
npm run migrate    # Run database migrations
```

---

## 📝 Code Standards

### General Principles

- **Use async/await** - No callbacks
- **Parameterized queries** - Always use `$1, $2, ...` for SQL
- **Error handling** - Always wrap in try-catch
- **Descriptive names** - No abbreviations
- **Single responsibility** - One service per file
- **DRY principle** - Don't repeat code

### Code Style

#### JavaScript/Node.js

```javascript
// ✅ DO: Use async/await
async function getUser(id) {
  const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
}

// ❌ DON'T: Use callbacks
function getUser(id, callback) {
  db.query("SELECT * FROM users WHERE id = $1", [id], (err, result) => {
    callback(err, result.rows[0]);
  });
}

// ✅ DO: Parameterized queries (prevents SQL injection)
const result = await db.query("SELECT * FROM users WHERE phone = $1", [phone]);

// ❌ DON'T: String concatenation (SQL injection risk)
const result = await db.query(`SELECT * FROM users WHERE phone = '${phone}'`);
```

#### File Organization

- **One service per file**
- **Group related functions**
- **Export single instance for services**
- **Use index.js for module exports**

### Error Handling Pattern

```javascript
// Service method
async function serviceMethod() {
  try {
    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Service error:", error);
    throw error; // Let route handler catch it
  }
}

// Route handler
router.get("/endpoint", async (req, res) => {
  try {
    const data = await serviceMethod();
    res.json(data);
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({
      error: error.message,
      code: "INTERNAL_ERROR",
    });
  }
});
```

### Database Query Patterns

```javascript
// Single result
const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
const user = result.rows[0];

// Multiple results
const result = await db.query("SELECT * FROM users WHERE is_active = true");
const users = result.rows;

// Insert with RETURNING
const result = await db.query(
  `
  INSERT INTO products (name, price) 
  VALUES ($1, $2) 
  RETURNING *
`,
  [name, price]
);
const newProduct = result.rows[0];

// Update
await db.query(
  `
  UPDATE users 
  SET name = $1, updated_at = NOW() 
  WHERE id = $2
`,
  [name, userId]
);

// Transaction
const client = await db.connect();
try {
  await client.query("BEGIN");
  // ... multiple queries
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
}
```

---

## 🔌 API Documentation

### Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://muntushop-production-f2ffb28d626e.herokuapp.com`

### Authentication

Most endpoints require JWT authentication via Bearer token:

```
Authorization: Bearer <token>
```

### Endpoints

#### Health Check

```
GET /health
```

Returns server status and uptime.

#### Webhooks

```
POST /webhooks/greenapi    # WhatsApp webhooks
POST /webhooks/stripe      # Stripe webhooks
```

#### Public API Routes

All API routes are prefixed with `/api/v1/`:

- `GET/POST /api/v1/auth` - Authentication
- `GET/POST /api/v1/products` - Products management
- `GET/POST /api/v1/orders` - Orders management
- `GET/POST /api/v1/cart` - Shopping cart
- `GET/POST /api/v1/messaging` - Bulk messaging
- `GET/POST /api/v1/support` - Customer support
- `GET/POST /api/v1/appointments` - Appointment booking
- `GET/POST /api/v1/groups` - Group management
- `GET/POST /api/v1/money` - Money assistant
- `GET/POST /api/v1/courses` - Online courses
- `GET/POST /api/v1/news` - News & updates
- `GET/POST /api/v1/marketing` - Marketing services
- `GET/POST /api/v1/b2b` - B2B wholesale
- `GET/POST /api/v1/iptv` - IPTV subscriptions
- `GET/POST /api/v1/payments` - Payment processing

#### Payment Management Routes

- `POST /api/refund/create` - Create refund (full or partial)
- `POST /api/escrow/release` - Release escrow payment
- `GET /api/dispute/:orderNumber` - Get dispute info
- `POST /api/dispute/submit-evidence` - Submit dispute evidence

#### Admin Routes

- `GET/POST /api/v1/admin/*` - Admin operations

### Response Format

#### Success Response

```json
{
  "data": {...},
  "message": "Success message"
}
```

#### Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

---

## 🗄️ Database Schema

### Main Tables

- **users** - User accounts and session data
- **products** - Product catalog
- **orders** - Order management (with refund, escrow, dispute columns)
- **cart_items** - Shopping cart
- **payments** - Payment transactions
- **subscriptions** - Service subscriptions
- **admin_users** - Admin accounts
- **support_tickets** - Support system
- **conversation_history** - AI Agent conversation tracking
- **payment_disputes** - Dispute management

### Schema Location

- **Main Schema**: `backend/database/schema.sql`
- **Migrations**: `database/migrations/*.sql`

### Running Migrations

```bash
# Run main schema
psql $DATABASE_URL -f backend/database/schema.sql

# Run specific migration
psql $DATABASE_URL -f database/migrations/[migration-name].sql

# Run all migrations
for file in database/migrations/*.sql; do
  psql $DATABASE_URL -f "$file"
done
```

### Key Migrations

- `add_ai_agent_conversation_history.sql` - AI conversation tracking
- `add_refund_escrow_dispute_support.sql` - Payment management
- `add_admin_features.sql` - Admin system
- `add_user_addresses.sql` - User address management

---

## 🔐 Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Green API (WhatsApp)
GREEN_ID_INSTANCE=your_instance_id
GREEN_API_TOKEN_INSTANCE=your_token

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
PORT=3000
```

### Optional Variables

```bash
# OpenAI (for AI Agent)
OPENAI_API_KEY=sk-xxxxx

# Google Cloud (for Speech-to-Text and Text-to-Speech)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# IPTV
IPTV_ACCOUNT=your_iptv_username
IPTV_PASSWORD=your_iptv_password
IPTV_M3U_URL=http://server.com/get.php?username=xxx&password=xxx&type=m3u_plus
IPTV_SMARTERS_APP_URL=https://www.iptvsmarters.com/#downloads
IPTV_SERVER_URL=http://server.com
```

### Environment File Location

- **Development**: Root `.env` file (not in git)
- **Production**: Set via Heroku dashboard or Railway

---

## 🚀 Deployment

### Heroku Deployment (Current Production)

**Status:** ✅ Deployed and Running

**Production URL:** https://muntushop-production-f2ffb28d626e.herokuapp.com/

#### Deployment Steps

1. **Install Heroku CLI**

   ```bash
   npm install -g heroku-cli
   ```

2. **Login to Heroku**

   ```bash
   heroku login
   ```

3. **Create Heroku App** (if not exists)

   ```bash
   heroku create muntushop-production
   ```

4. **Set Environment Variables**

   ```bash
   heroku config:set KEY=value --app muntushop-production
   ```

5. **Deploy**

   ```bash
   git push heroku main
   ```

6. **Run Database Migrations**

   ```bash
   heroku run psql $DATABASE_URL -f backend/database/schema.sql --app muntushop-production
   ```

7. **Configure Webhooks**
   - Green API: Set webhook URL in dashboard
   - Stripe: Add webhook endpoint and copy secret

### Railway Deployment (Alternative)

1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Railway auto-deploys on push to main branch
4. Add PostgreSQL database via Railway dashboard

### Manual Deployment

```bash
# Build and deploy
npm install
cd backend
npm install
npm start
```

### Database Setup (Production)

```bash
# Run migrations
psql $DATABASE_URL -f backend/database/schema.sql

# Run additional migrations
for file in database/migrations/*.sql; do
  psql $DATABASE_URL -f "$file"
done
```

---

## 🧪 Testing

### Test Structure

- **Location**: `tests/` directory
- **Test Files**: `test_*.js`
- **Test Data**: `test_*.json`

### Running Tests

```bash
# Run all tests
npm test

# Run specific test
node tests/test_whatsapp.js
node tests/test_db_connection.js
```

### Test Files

- `test_whatsapp.js` - WhatsApp integration tests
- `test_db_connection.js` - Database connection tests
- `test_webhook.json` - Webhook test data
- `test_service_webhook.json` - Service webhook test data

### Testing Services via WhatsApp

Send messages to **+47 96701573**:

```
MENU          # See all services
1             # Shopping Store
2             # Bulk Messaging
3             # Customer Support
...           # Continue for all services
HELP          # Get assistance
```

---

## 🔍 Troubleshooting Guide

### Issue: Database Connection Failed

**Symptoms:** "Connection refused" or "Database not found"

**Solutions:**

1. Check `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
2. Verify database exists and is accessible
3. Check firewall/network settings
4. Verify credentials are correct

**Commands:**

```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"

# Check environment variable
echo $DATABASE_URL
```

---

### Issue: WhatsApp Messages Not Received

**Symptoms:** No response from bot

**Solutions:**

1. Verify Green API webhook URL is set correctly
2. Check webhook is enabled in Green API dashboard
3. Verify `GREEN_ID_INSTANCE` and `GREEN_API_TOKEN_INSTANCE` are correct
4. Check Heroku logs for errors

**Commands:**

```bash
# View logs
heroku logs --tail --app muntushop-production

# Test webhook
curl -X POST https://your-app.herokuapp.com/webhooks/greenapi \
  -H "Content-Type: application/json" \
  -d @tests/test_webhook.json
```

---

### Issue: Stripe Payments Not Working

**Symptoms:** Payment link not received or webhook not processing

**Solutions:**

1. Verify `STRIPE_SECRET_KEY` is set (live or test key)
2. Check `STRIPE_WEBHOOK_SECRET` is configured
3. Verify webhook URL in Stripe dashboard matches production URL
4. Check webhook events are selected correctly

**Commands:**

```bash
# Check Stripe config
heroku config --app muntushop-production | grep STRIPE

# Test webhook locally
stripe listen --forward-to http://localhost:3000/webhooks/stripe
```

---

### Issue: AI Agent Not Responding

**Symptoms:** No AI responses to natural language

**Solutions:**

1. Verify `OPENAI_API_KEY` is set
2. Check conversation_history table exists
3. Verify OpenAI API key is valid and has credits
4. Check logs for OpenAI API errors

**Commands:**

```bash
# Check OpenAI key
heroku config --app muntushop-production | grep OPENAI

# Test OpenAI connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

### Issue: IPTV Credentials Not Delivered

**Symptoms:** Payment successful but no IPTV credentials received

**Solutions:**

1. Verify IPTV environment variables are set:
   - `IPTV_ACCOUNT`
   - `IPTV_PASSWORD`
   - `IPTV_M3U_URL`
2. Check payment webhook is processing correctly
3. Verify WhatsApp message sending is working

**Commands:**

```bash
# Check IPTV config
heroku config --app muntushop-production | grep IPTV
```

---

### Issue: Services Showing "Coming Soon"

**Symptoms:** All services return "Coming Soon" message

**Solutions:**

1. Verify service templates exist in `backend/src/templates/whatsapp/`
2. Check ServiceHandler is routing correctly
3. Verify service files are in `backend/src/services/`
4. Check logs for routing errors

---

### Issue: Refund/Escrow Not Working

**Symptoms:** Refund endpoints return errors

**Solutions:**

1. Verify database migrations are applied:
   - `add_refund_escrow_dispute_support.sql`
2. Check Stripe webhook secret is configured
3. Verify order exists in database
4. Check Stripe refund permissions

---

## 📊 Change Log

> **This section tracks all significant changes to the project**

### 2024-12-19 - Master README Update

- ✅ Created comprehensive master README with all project information
- ✅ Added "What's Working" section
- ✅ Added "Issue Resolution History" section
- ✅ Added "Development History & Milestones" section
- ✅ Added comprehensive troubleshooting guide
- ✅ Updated all service documentation

### 2024-12-19 - AI Agent Integration

- ✅ Added AI Agent service with OpenAI integration
- ✅ Implemented conversation history storage in PostgreSQL
- ✅ Added natural language processing for non-menu messages
- ✅ Created AI Agent setup documentation (`AI_AGENT_SETUP.md`)
- ✅ Added database migration for conversation history table

### 2024-12-18 - Project Cleanup & Restructure

- ✅ Removed duplicate nested `backend/backend/` directory
- ✅ Moved duplicate root services/templates to `legacy/` directory
- ✅ Consolidated all documentation into `docs/` directory
- ✅ Organized test files into `tests/` directory
- ✅ Moved deployment scripts to `scripts/` directory
- ✅ Updated root `package.json` with proper scripts
- ✅ Created comprehensive README.md as project documentation
- ✅ Preserved all `.cursor` rules and configuration files
- ✅ Restored `CURSOR-RULES.md` to root directory

### 2024-12-16 - Major Feature Releases

#### v27 - Refund, Escrow & Dispute System

- ✅ Full refund system (full & partial)
- ✅ Escrow payment holding (7-day auto-release)
- ✅ Dispute management system
- ✅ Evidence submission system
- ✅ Database migrations for payment tracking

#### v14 - IPTV Service Complete

- ✅ IPTV credentials integration
- ✅ Automatic M3U playlist delivery
- ✅ Complete setup instructions (3 methods)
- ✅ Credentials configured on Heroku

#### v12 - Stripe Payment Integration

- ✅ Complete Stripe payment processing
- ✅ Shopping checkout flow
- ✅ Subscription payment flows
- ✅ Webhook endpoint created
- ✅ WhatsApp payment confirmations

#### v11 - All Services Working

- ✅ Fixed "Coming Soon" issue for all services
- ✅ Created service-specific message templates
- ✅ Implemented ServiceHandler for conversation flows
- ✅ Built complete navigation system
- ✅ All 11 services fully operational

#### v10 - Initial Heroku Deployment

- ✅ Deployed to Heroku production
- ✅ AI Agent with OpenAI integration
- ✅ Complete message template system
- ✅ Conversation state manager
- ✅ Database integration

### Future Changes

- All future changes will be documented here
- Include date, description, and affected areas
- Link to related issues or PRs when applicable

---

## 📚 Additional Documentation

### Documentation Files

All detailed documentation is located in the `docs/` directory:

- **Setup Guides**: `QUICK-START.md`, `DEPLOYMENT-STEPS.md`, `AI_AGENT_SETUP.md`
- **API Documentation**: `COMPLETE-API-IMPLEMENTATION.md`
- **Service Guides**: `ALL_SERVICES_WORKING.md`
- **Deployment**: `HEROKU_DEPLOYMENT_SUCCESS.md`, `RAILWAY_GITHUB_SETUP.md`
- **Database**: `FIX-POSTGRESQL.md`, `POSTGRESQL-FIX.md`
- **Payment**: `STRIPE_INTEGRATION_COMPLETE.md`, `STRIPE_REFUND_ESCROW_SETUP.md`
- **IPTV**: `IPTV_SETUP_COMPLETE.md`, `IPTV_TIER_SYSTEM_COMPLETE.md`

### Cursor Rules

- **Location**: `.cursor/rules/` directory
- **Purpose**: Project-specific coding rules and guidelines
- **Files**: Various `.mdc` files for different aspects

---

## 🤝 Contributing

### Code Contribution Guidelines

1. **Follow code standards** outlined in this document
2. **Update README.md** when making significant changes
3. **Test locally** before submitting
4. **Document changes** in the Change Log section
5. **Preserve existing structure** - don't break working code

### Commit Messages

Use conventional commit format:

```
feat: add new shopping feature
fix: resolve payment processing bug
docs: update API documentation
refactor: reorganize service structure
```

---

## 📞 Support & Contact

- **Phone**: +47 96701573
- **Email**: support@muntushop.com
- **Business Hours**: Mon-Fri 9AM-6PM, Sat 10AM-4PM
- **Production URL**: https://muntushop-production-f2ffb28d626e.herokuapp.com/

---

## 📄 License

ISC License

---

## 🔄 Version History

- **v1.0.0** - Initial platform release with 11 services
- **v10** - Heroku deployment with AI Agent
- **v11** - All services working
- **v12** - Stripe payment integration
- **v14** - IPTV service complete
- **v27** - Refund, escrow & dispute system
- **Current version**: **v27+**

---

**Last Updated**: December 19, 2024  
**Maintained By**: MuntuShop Development Team  
**Status**: ✅ Production Ready - All Systems Operational

---

> **Note**: This README.md serves as the master documentation for the MuntuShop platform. It consolidates all project information, what worked, how issues were fixed, and provides a comprehensive guide for developers and users. Keep it updated with all significant changes to the project.

---

---

## 📚 Development Rules

For complete development rules, coding standards, and best practices, refer to:

**👉 [`../muntushop-platform-rules.mdc`](../muntushop-platform-rules.mdc)**

This comprehensive rules document covers:

- Architecture patterns
- Code standards
- Database rules
- API conventions
- WhatsApp integration rules
- Payment processing rules
- Security guidelines
- Testing standards
- Deployment procedures

---

## alwaysApply: true
