# 🔄 Webhook Status & Queued Messages

## Current Status

### ✅ Server: Running
- Port: 3000
- Health: ✅ Healthy
- Webhook Endpoint: ✅ Working (`/webhooks/greenapi`)

### ⚠️ Issue: 5 Queued Webhooks

Green API has **5 webhooks queued** waiting to be delivered. These accumulated while the webhook endpoint was offline or unreachable.

## Solution

To process the queued webhooks, you need:

1. **ngrok tunnel running** (to make your server accessible from internet)
2. **Webhook URL configured** in Green API console

## Quick Fix Commands

### Start Everything (Recommended)

```bash
cd backend

# Terminal 1: Start server (if not running)
npm start

# Terminal 2: Start ngrok tunnel and configure webhook
npm run webhook:process-queue
```

This will:
- ✅ Start ngrok tunnel
- ✅ Get webhook URL
- ✅ Configure it in Green API automatically
- ✅ Keep tunnel running so queued webhooks can be delivered

### Manual Steps

If auto-configuration doesn't work:

1. **Start ngrok tunnel:**
   ```bash
   npm run webhook:start
   ```

2. **Get webhook URL:**
   ```bash
   npm run webhook:url
   ```

3. **Configure in Green API Console:**
   - Go to: https://console.green-api.com/
   - Instance: `7700330457`
   - Settings → Webhook Settings
   - Paste the webhook URL
   - Enable: `incomingMessageReceived`, `outgoingMessageStatus`, `deviceStatus`
   - Save

## What Happens Next

Once the webhook URL is active and configured:

1. ✅ Green API will automatically retry the 5 queued webhooks
2. ✅ They should be delivered within a few seconds
3. ✅ Check server logs to see incoming webhooks
4. ✅ The queue count should drop to 0

## Verify It's Working

1. **Check webhook is accessible:**
   ```bash
   npm run test:webhook:response https://YOUR-NGROK-URL.ngrok-free.app/webhooks/greenapi
   ```

2. **Check server logs:**
   ```bash
   tail -f /tmp/likelemba-server.log
   ```

3. **Check Green API dashboard:**
   - Queue count should decrease as webhooks are delivered
   - Should show "0" for both queues when done

## Troubleshooting

### ngrok tunnel shows "offline"
- Make sure the tunnel process is running
- Check: `pgrep -f ngrok`
- Restart: `npm run webhook:start`

### Webhooks not being delivered
- Verify webhook URL is configured in Green API console
- Check server logs for errors
- Make sure server is running on port 3000

### Queue count not decreasing
- Wait a few seconds (Green API retries automatically)
- Check if webhook URL is correct
- Verify tunnel is still active

---

**Next Steps:** Run `npm run webhook:process-queue` to start tunnel and configure webhook automatically!

