# Likelemba Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Green API account and instance
- Stripe account
- OpenAI API key
- Domain name (for webhooks)
- SSL certificate (HTTPS required for webhooks)

---

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
```bash
# Check environment variables
node scripts/check-env.js

# Verify all required variables are set
```

### 2. Database Setup
```bash
# Option A: Using script
chmod +x scripts/setup-database.sh
./scripts/setup-database.sh

# Option B: Using npm script
npm run db:migrate

# Option C: Manual
psql $DATABASE_URL -f database/schema.sql
```

### 3. Test Connections
```bash
# Test all connections
node scripts/test-connection.js

# Test platform functionality
node scripts/test-platform.js
```

---

## 🌐 Deployment Options

### Option 1: Heroku Deployment

#### Initial Setup
```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create likelemba-production

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set GREEN_ID_INSTANCE=your_instance_id
heroku config:set GREEN_API_TOKEN_INSTANCE=your_token
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...
heroku config:set OPENAI_API_KEY=sk-...
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set ADMIN_KEY=$(openssl rand -base64 32)
```

#### Deploy
```bash
# Add Heroku remote
heroku git:remote -a likelemba-production

# Deploy
git push heroku main

# Run migrations
heroku run psql $DATABASE_URL -f database/schema.sql

# Check logs
heroku logs --tail
```

#### Configure Webhooks
1. **Green API:**
   - URL: `https://likelemba-production.herokuapp.com/webhooks/greenapi`
   - Set in Green API console

2. **Stripe:**
   - URL: `https://likelemba-production.herokuapp.com/webhooks/stripe`
   - Add in Stripe dashboard

---

### Option 2: Railway Deployment

#### Setup
1. Connect GitHub repository to Railway
2. Create new project
3. Add PostgreSQL service
4. Set environment variables in Railway dashboard
5. Deploy automatically on push

#### Environment Variables in Railway
- `DATABASE_URL` (auto-set by PostgreSQL service)
- `GREEN_ID_INSTANCE`
- `GREEN_API_TOKEN_INSTANCE`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `OPENAI_API_KEY`
- `JWT_SECRET`
- `ADMIN_KEY`
- `NODE_ENV=production`
- `PORT=3000`

#### Run Migrations
```bash
# Via Railway CLI
railway run psql $DATABASE_URL -f database/schema.sql

# Or via Railway dashboard terminal
```

---

### Option 3: VPS/Cloud Server (DigitalOcean, AWS, etc.)

#### Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 for process management
sudo npm install -g pm2
```

#### Application Setup
```bash
# Clone repository
git clone https://github.com/your-org/likelemba.git
cd likelemba/backend

# Install dependencies
npm install --production

# Set up environment
cp .env.example .env
nano .env  # Edit with your values

# Set up database
createdb likelemba
npm run db:migrate

# Start with PM2
pm2 start src/app.js --name likelemba
pm2 save
pm2 startup  # Set up auto-start on boot
```

#### Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/likelemba
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/likelemba /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Set up SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔧 Post-Deployment Configuration

### 1. Verify Health Check
```bash
curl https://your-domain.com/health
```

Expected response:
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

### 2. Configure Webhooks

#### Green API
1. Go to https://console.green-api.com/
2. Select your instance
3. Navigate to "Webhook Settings"
4. Set URL: `https://your-domain.com/webhooks/greenapi`
5. Enable:
   - ✅ `incomingMessageReceived`
   - ✅ `outgoingMessageStatus`
   - ✅ `deviceStatus`

#### Stripe
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://your-domain.com/webhooks/stripe`
4. Select events:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `checkout.session.completed`
   - ✅ `charge.refunded`
   - ✅ `charge.dispute.created`
   - ✅ `charge.dispute.updated`
   - ✅ `charge.dispute.closed`
5. Copy webhook signing secret
6. Set `STRIPE_WEBHOOK_SECRET` in environment

### 3. Test Webhooks

#### Test Green API Webhook
```bash
# Send test message to your WhatsApp number
# Check server logs for webhook receipt
```

#### Test Stripe Webhook
```bash
# Use Stripe CLI for local testing
stripe listen --forward-to https://your-domain.com/webhooks/stripe

# Or use Stripe dashboard to send test events
```

### 4. Verify Cron Jobs
```bash
# Check server logs for scheduler start
# Should see: "📅 Starting notification scheduler..."
# Should see: "✅ Notification scheduler started"
```

---

## 📊 Monitoring

### Health Monitoring
```bash
# Set up uptime monitoring
# Use services like:
# - UptimeRobot
# - Pingdom
# - StatusCake

# Monitor endpoint: /health
```

### Log Monitoring
```bash
# Heroku
heroku logs --tail

# Railway
railway logs

# PM2
pm2 logs likelemba

# Or use logging services:
# - Loggly
# - Papertrail
# - Datadog
```

### Database Monitoring
```bash
# Check database size
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size(current_database()));"

# Check table sizes
psql $DATABASE_URL -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

---

## 🔒 Security Checklist

- [ ] All environment variables set (no defaults in code)
- [ ] Database credentials secure
- [ ] HTTPS enabled (SSL certificate)
- [ ] Webhook signatures verified (Stripe)
- [ ] Rate limiting implemented (if needed)
- [ ] CORS configured properly
- [ ] Helmet.js security headers enabled
- [ ] Admin API key protected
- [ ] Regular security updates
- [ ] Database backups configured

---

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check if database exists
psql $DATABASE_URL -l

# Verify credentials
echo $DATABASE_URL
```

### Green API Issues
```bash
# Check instance state
# Use Green API console or API

# Verify webhook URL is accessible
curl https://your-domain.com/webhooks/greenapi
```

### Stripe Webhook Issues
```bash
# Verify webhook secret
echo $STRIPE_WEBHOOK_SECRET

# Test webhook endpoint
curl -X POST https://your-domain.com/webhooks/stripe \
  -H "stripe-signature: test" \
  -d '{"type":"test"}'
```

### Cron Jobs Not Running
```bash
# Check server logs for scheduler errors
# Verify node-cron is installed
npm list node-cron

# Check if scheduler started
# Look for: "✅ Notification scheduler started"
```

---

## 📈 Scaling Considerations

### Database
- Consider connection pooling
- Set up read replicas for high traffic
- Monitor query performance

### Application
- Use PM2 cluster mode for multiple processes
- Set up load balancer for multiple servers
- Consider Redis for caching

### Monitoring
- Set up application performance monitoring (APM)
- Monitor error rates
- Track response times

---

## 🔄 Updates and Maintenance

### Updating Application
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Run migrations (if any)
npm run db:migrate

# Restart application
pm2 restart likelemba
# or
heroku restart
```

### Database Backups
```bash
# Heroku
heroku pg:backups:capture

# Manual
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

---

## 📞 Support

For issues:
1. Check logs
2. Verify environment variables
3. Test webhook endpoints
4. Check database connectivity
5. Review documentation

---

**Last Updated**: December 19, 2024

