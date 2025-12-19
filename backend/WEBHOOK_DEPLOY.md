# 🚀 Webhook Deployment Guide

## Quick Deploy Using ngrok SDK

Deploy your webhook using ngrok programmatically - no separate terminal needed!

### Option 1: Start Tunnel Only

```bash
cd backend
npm run webhook:start
```

This will:
- ✅ Start ngrok tunnel programmatically
- ✅ Display your webhook URLs
- ✅ Save webhook URL to `WEBHOOK_URL.txt`
- ✅ Keep running (Ctrl+C to stop)

### Option 2: Quick Deploy (Recommended)

```bash
cd backend
npm run webhook:deploy
```

This will:
- ✅ Start ngrok tunnel
- ✅ Display webhook URLs
- ✅ Show configuration instructions

### Option 3: Auto-Configure Green API

```bash
cd backend
npm run webhook:deploy:auto
```

This will:
- ✅ Start ngrok tunnel
- ✅ Automatically configure webhook in Green API
- ✅ Save webhook URL

---

## Prerequisites

1. **Server must be running:**
   ```bash
   npm start
   ```

2. **ngrok authtoken configured:**
   ```bash
   ngrok config add-authtoken YOUR_TOKEN
   ```
   (Already done ✅)

---

## Usage Examples

### Basic Usage (Terminal 1: Server)
```bash
cd backend
npm start
```

### Basic Usage (Terminal 2: Tunnel)
```bash
cd backend
npm run webhook:start
```

**Output:**
```
🚀 Starting ngrok tunnel programmatically...

✅ Server detected on port 3000

✅ ngrok tunnel created successfully!

📋 Your Webhook URLs:

   🌐 Base URL: https://abc123.ngrok-free.app

   📱 Green API Webhook:
      https://abc123.ngrok-free.app/webhooks/greenapi
```

### Auto-Configure (Terminal 2)
```bash
cd backend
npm run webhook:deploy:auto
```

This automatically sets the webhook URL in Green API console.

---

## Benefits of SDK Approach

✅ **Single Command** - No need to manage separate ngrok process  
✅ **Programmatic Control** - Can integrate into deployment scripts  
✅ **Automatic URL** - Get webhook URL directly in code  
✅ **Error Handling** - Better error messages and validation  
✅ **Clean Shutdown** - Proper cleanup on exit  

---

## Comparison with Command-Line ngrok

### Old Way (Command-Line)
```bash
# Terminal 1
npm start

# Terminal 2  
npm run webhook:tunnel  # Runs ngrok http 3000

# Terminal 3
npm run webhook:url     # Gets URL from ngrok API
```

### New Way (SDK - Recommended)
```bash
# Terminal 1
npm start

# Terminal 2
npm run webhook:start   # Does everything!
```

---

## Scripts Available

| Script | Command | Description |
|--------|---------|-------------|
| `webhook:start` | `npm run webhook:start` | Start tunnel using SDK |
| `webhook:deploy` | `npm run webhook:deploy` | Deploy with instructions |
| `webhook:deploy:auto` | `npm run webhook:deploy:auto` | Auto-configure Green API |
| `webhook:tunnel` | `npm run webhook:tunnel` | Old way (command-line) |
| `webhook:url` | `npm run webhook:url` | Get URL from running tunnel |

---

## Troubleshooting

### "Server not responding"
Make sure your server is running:
```bash
npm start
```

### "ngrok authtoken error"
Verify authtoken is configured:
```bash
ngrok config check
```

### "Port already in use"
Another ngrok tunnel might be running:
```bash
pgrep -f ngrok
kill <PID>
```

---

## Next Steps

1. ✅ Start server: `npm start`
2. ✅ Start tunnel: `npm run webhook:start`
3. ✅ Copy webhook URL
4. ✅ Configure in Green API (or use `webhook:deploy:auto`)
5. ✅ Test with WhatsApp message

---

**Ready to deploy!** 🚀

