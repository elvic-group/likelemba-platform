# 🚀 Quick Webhook Setup - 2 Minutes

## Step 1: Start Server
```bash
cd backend
npm start
```
**Keep this terminal open!**

## Step 2: Start ngrok (New Terminal)
```bash
cd backend
npm run webhook:tunnel
```

**You'll see:**
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

## Step 3: Get Webhook URL (Another Terminal)
```bash
cd backend
npm run webhook:url
```

**Copy this URL:**
```
https://abc123.ngrok.io/webhooks/greenapi
```

## Step 4: Configure Green API

1. Go to: https://console.green-api.com/
2. Instance: `7700330457`
3. Settings → Webhook Settings
4. Paste: `https://abc123.ngrok.io/webhooks/greenapi`
5. Enable: `incomingMessageReceived`, `outgoingMessageStatus`, `deviceStatus`
6. Save

## Step 5: Test!

Send **"Hi"** to `+47 96701573`

---

## 📋 All Commands

```bash
# Terminal 1: Server
npm start

# Terminal 2: ngrok
npm run webhook:tunnel

# Terminal 3: Get URL
npm run webhook:url
```

---

## ⚠️ Important

- **Keep ngrok running** while testing
- URL changes if you restart ngrok
- Update Green API if URL changes

---

**That's it!** Your local webhook is ready! 🎉

