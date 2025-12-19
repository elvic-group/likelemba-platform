# ✅ Green API Webhook Auto-Update - Complete Setup

**Created:** December 19, 2024  
**Status:** ✅ Ready to Use

---

## 🎯 What Was Created

### 1. Main Update Script
**File:** `backend/scripts/update-green-api-webhook.js`

A smart script that:
- ✅ Automatically detects your environment (production/local)
- ✅ Gets the correct webhook URL
- ✅ Checks current settings before updating
- ✅ Only updates if needed
- ✅ Verifies the update was successful

### 2. Scheduled Update Script
**File:** `backend/scripts/schedule-webhook-update.js`

Optional scheduler that:
- ✅ Runs webhook updates automatically on a schedule
- ✅ Can be enabled/disabled via environment variable
- ✅ Runs on app start (optional)

### 3. Documentation
**File:** `backend/scripts/WEBHOOK_UPDATE_README.md`

Complete documentation with:
- Usage examples
- Environment variable reference
- Troubleshooting guide
- CI/CD integration examples

---

## 🚀 Quick Start

### Basic Usage

```bash
# Update webhook URL (auto-detects environment)
npm run webhook:update
```

That's it! The script will:
1. Detect your environment
2. Get the correct webhook URL
3. Update Green API settings
4. Verify the update

### Custom URL

```bash
# Use a custom webhook URL
node scripts/update-green-api-webhook.js --url https://your-url.com/webhooks/greenapi
```

---

## 📋 How It Works

### Environment Detection

The script checks in this order:

1. **Custom URL** (if `--url` flag used)
2. **`WEBHOOK_BASE_URL`** environment variable
3. **`APP_URL`** environment variable
4. **Production** → Uses Heroku URL
5. **Local** → Detects ngrok URL

### Update Process

```
1. Check credentials ✅
2. Get target webhook URL ✅
3. Check current settings ✅
4. Compare URLs ✅
5. Update if needed ✅
6. Verify update ✅
```

---

## 🔧 Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Optional: Explicit webhook base URL
WEBHOOK_BASE_URL=https://likelemba-production-8eb76f5c732e.herokuapp.com

# Optional: Application URL (used as fallback)
APP_URL=https://likelemba-production-8eb76f5c732e.herokuapp.com

# Optional: Enable auto-update scheduler
WEBHOOK_AUTO_UPDATE=true
WEBHOOK_UPDATE_SCHEDULE=0 * * * *  # Every hour (cron format)
WEBHOOK_UPDATE_ON_START=true       # Run on app start
```

### Production (Heroku)

The script automatically uses:
```
https://likelemba-production-8eb76f5c732e.herokuapp.com/webhooks/greenapi
```

### Local Development

The script automatically detects ngrok:
```bash
# Start ngrok
npm run webhook:tunnel

# Update webhook (will use ngrok URL)
npm run webhook:update
```

---

## 📊 Usage Examples

### Example 1: Production Update

```bash
$ npm run webhook:update

🔧 Updating Green API Webhook URL...
📱 Instance ID: 7700330457
📋 Target Webhook URL: https://likelemba-production-8eb76f5c732e.herokuapp.com/webhooks/greenapi
🔍 Checking current webhook settings...
   Current URL: https://old-url.com/webhooks/greenapi
🔄 Webhook URL needs to be updated
📤 Updating webhook settings...
✅ Webhook URL updated successfully!
```

### Example 2: Already Up-to-Date

```bash
$ npm run webhook:update

🔧 Updating Green API Webhook URL...
📱 Instance ID: 7700330457
📋 Target Webhook URL: https://likelemba-production-8eb76f5c732e.herokuapp.com/webhooks/greenapi
🔍 Checking current webhook settings...
   Current URL: https://likelemba-production-8eb76f5c732e.herokuapp.com/webhooks/greenapi
✅ Webhook URL is already set correctly!
   No update needed.
```

### Example 3: Custom URL

```bash
$ node scripts/update-green-api-webhook.js --url https://my-domain.com/webhooks/greenapi

🔧 Updating Green API Webhook URL...
📋 Target Webhook URL: https://my-domain.com/webhooks/greenapi
✅ Webhook URL updated successfully!
```

---

## 🔄 Automated Updates

### Option 1: Heroku Scheduler

1. **Install addon:**
   ```bash
   heroku addons:create scheduler:standard --app likelemba-production
   ```

2. **Add job:**
   - Command: `node scripts/update-green-api-webhook.js`
   - Frequency: Every hour or daily

### Option 2: Cron Job

```bash
# Add to crontab (runs every hour)
0 * * * * cd /path/to/backend && npm run webhook:update >> /var/log/webhook-update.log 2>&1
```

### Option 3: In-App Scheduler

Add to `src/app.js`:

```javascript
// Enable auto-update
if (process.env.WEBHOOK_AUTO_UPDATE === 'true') {
  require('../scripts/schedule-webhook-update');
}
```

---

## ✅ Verification

After running the script:

```bash
# Check Green API state
node scripts/check-green-api-state.js

# Should show:
#   Webhook URL: https://likelemba-production-8eb76f5c732e.herokuapp.com/webhooks/greenapi
```

---

## 🐛 Troubleshooting

### "Could not determine webhook URL"

**Solution:**
```bash
# Set in .env
WEBHOOK_BASE_URL=https://your-url.com
```

### "ngrok not running" (local)

**Solution:**
```bash
# Start ngrok first
npm run webhook:tunnel
```

### "setSettings method not found"

**Solution:**
- Check Green API credentials
- Verify instance is authorized
- Update `@green-api/whatsapp-api-client` package

---

## 📚 Related Files

- `scripts/update-green-api-webhook.js` - Main update script
- `scripts/schedule-webhook-update.js` - Scheduler (optional)
- `scripts/WEBHOOK_UPDATE_README.md` - Full documentation
- `scripts/check-green-api-state.js` - Check current state
- `scripts/set-green-api-webhook.js` - Legacy script (still works)

---

## 🎯 Best Practices

1. **Run after deployment** - Always update webhook after deploying
2. **Use environment variables** - Don't hardcode URLs
3. **Verify after update** - Check logs to confirm webhooks work
4. **Monitor regularly** - Set up alerts if webhooks stop
5. **Document changes** - Keep track of webhook URL changes

---

## 🚀 Next Steps

1. **Test the script:**
   ```bash
   npm run webhook:update
   ```

2. **Verify it worked:**
   ```bash
   node scripts/check-green-api-state.js
   ```

3. **Send a test message** to your WhatsApp number

4. **Check logs:**
   ```bash
   heroku logs --tail --app likelemba-production
   ```

---

## ✅ Summary

You now have a **fully automated webhook update system** that:

- ✅ Detects your environment automatically
- ✅ Updates webhook URL when needed
- ✅ Verifies updates were successful
- ✅ Can run on a schedule
- ✅ Works in production and local development

**Just run `npm run webhook:update` whenever you need to update the webhook!** 🎉

---

**Questions?** Check `scripts/WEBHOOK_UPDATE_README.md` for detailed documentation.

