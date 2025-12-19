# 🔄 Green API Webhook Auto-Update Script

## Overview

The `update-green-api-webhook.js` script automatically updates the Green API webhook URL to point to your current server URL. It's smart enough to detect your environment and use the appropriate URL.

## Features

✅ **Automatic Environment Detection**
- Detects production vs local development
- Uses Heroku URL for production
- Detects ngrok URL for local development

✅ **Smart URL Detection**
- Checks `WEBHOOK_BASE_URL` environment variable
- Falls back to `APP_URL` environment variable
- Uses production default if in production
- Detects ngrok tunnel for local development

✅ **Update Verification**
- Checks current webhook settings before updating
- Only updates if URL has changed
- Verifies the update was successful

✅ **Error Handling**
- Clear error messages
- Helpful troubleshooting tips
- Manual configuration instructions if needed

## Usage

### Basic Usage

```bash
# Update webhook URL (auto-detects environment)
npm run webhook:update

# Or directly
node scripts/update-green-api-webhook.js
```

### Custom URL

```bash
# Use a custom webhook URL
node scripts/update-green-api-webhook.js --url https://your-custom-url.com/webhooks/greenapi
```

## Environment Variables

The script uses these environment variables (in order of priority):

1. **`WEBHOOK_BASE_URL`** - Explicit webhook base URL
   ```bash
   WEBHOOK_BASE_URL=https://likelemba-production-8eb76f5c732e.herokuapp.com
   ```

2. **`APP_URL`** - Application base URL
   ```bash
   APP_URL=https://likelemba-production-8eb76f5c732e.herokuapp.com
   ```

3. **`NODE_ENV`** - Environment detection
   - `production` → Uses Heroku production URL
   - `development` → Tries to detect ngrok URL

## Examples

### Production (Heroku)

```bash
# Automatically uses Heroku URL
npm run webhook:update
```

Output:
```
📋 Target Webhook URL: https://likelemba-production-8eb76f5c732e.herokuapp.com/webhooks/greenapi
✅ Webhook URL updated successfully!
```

### Local Development (ngrok)

```bash
# Start ngrok first
npm run webhook:tunnel

# Then update webhook
npm run webhook:update
```

Output:
```
📋 Target Webhook URL: https://abc123.ngrok-free.app/webhooks/greenapi
✅ Webhook URL updated successfully!
```

### Custom URL

```bash
node scripts/update-green-api-webhook.js --url https://my-custom-domain.com/webhooks/greenapi
```

## When to Run

### Manual Updates

Run this script when:
- ✅ After deploying to a new environment
- ✅ After changing your server URL
- ✅ After restarting ngrok (local development)
- ✅ When webhook stops receiving messages
- ✅ After setting up a new Green API instance

### Automated Updates

You can schedule this script to run automatically:

#### Option 1: Cron Job (Linux/Mac)

```bash
# Add to crontab (runs every hour)
0 * * * * cd /path/to/backend && npm run webhook:update >> /var/log/webhook-update.log 2>&1
```

#### Option 2: Heroku Scheduler

1. Install Heroku Scheduler addon:
   ```bash
   heroku addons:create scheduler:standard --app likelemba-production
   ```

2. Add job:
   - Command: `node scripts/update-green-api-webhook.js`
   - Frequency: Every hour or daily

#### Option 3: Node-cron (In-app)

Add to your app.js:
```javascript
const cron = require('node-cron');

// Run every hour
cron.schedule('0 * * * *', async () => {
  require('./scripts/update-green-api-webhook.js');
});
```

## Troubleshooting

### Error: "Could not determine webhook URL"

**Solution:**
- Set `WEBHOOK_BASE_URL` in `.env`
- Or set `APP_URL` in `.env`
- Or use `--url` flag with custom URL

### Error: "ngrok not running"

**Solution:**
- Start ngrok: `npm run webhook:tunnel`
- Or set `WEBHOOK_BASE_URL` to your server URL

### Error: "setSettings method not found"

**Solution:**
- Check Green API SDK version
- Verify credentials are correct
- Update `@green-api/whatsapp-api-client` package

### Webhook URL not updating

**Solution:**
1. Check Green API credentials
2. Verify instance is authorized
3. Check instance ID is correct
4. Try manual update in Green API console

## Verification

After running the script, verify it worked:

```bash
# Check Green API state
node scripts/check-green-api-state.js

# Test webhook endpoint
curl -X POST https://your-url.com/webhooks/greenapi \
  -H "Content-Type: application/json" \
  -d '{"typeWebhook":"test"}'
```

## Integration with CI/CD

### GitHub Actions

```yaml
name: Update Webhook
on:
  push:
    branches: [main]

jobs:
  update-webhook:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run webhook:update
        env:
          GREEN_ID_INSTANCE: ${{ secrets.GREEN_ID_INSTANCE }}
          GREEN_API_TOKEN_INSTANCE: ${{ secrets.GREEN_API_TOKEN_INSTANCE }}
          WEBHOOK_BASE_URL: ${{ secrets.WEBHOOK_BASE_URL }}
```

## Best Practices

1. **Run after deployment** - Always update webhook after deploying
2. **Use environment variables** - Don't hardcode URLs
3. **Verify after update** - Check logs to confirm webhooks are received
4. **Monitor regularly** - Set up alerts if webhooks stop working
5. **Document changes** - Keep track of webhook URL changes

## Related Scripts

- `check-green-api-state.js` - Check instance status
- `set-green-api-webhook.js` - Simple webhook setter (legacy)
- `get-webhook-url.js` - Get current webhook URL

## Support

If you encounter issues:
1. Check the error message for specific guidance
2. Verify environment variables are set
3. Check Green API console manually
4. Review Heroku logs for webhook errors

---

**Last Updated:** December 19, 2024

