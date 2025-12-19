# 🌐 Local Webhook Setup for Testing

## Quick Setup (3 Steps)

### Step 1: Install ngrok

**macOS:**
```bash
brew install ngrok/ngrok/ngrok
```

**Or download from:**
https://ngrok.com/download

**Verify installation:**
```bash
ngrok version
```

### Step 2: Start Your Server

```bash
cd backend
npm start
```

**Keep this terminal running!**

### Step 3: Start ngrok Tunnel

**In a NEW terminal:**
```bash
cd backend
npm run webhook:tunnel
```

**Or manually:**
```bash
ngrok http 3000
```

---

## 📋 Get Your Webhook URLs

**In another terminal (while ngrok is running):**
```bash
cd backend
npm run webhook:url
```

**You'll see:**
```
✅ ngrok tunnel is active!

📋 Your Webhook URLs:

   🌐 Base URL: https://abc123.ngrok.io

   📱 Green API Webhook:
      https://abc123.ngrok.io/webhooks/greenapi

   💳 Stripe Webhook:
      https://abc123.ngrok.io/webhooks/stripe
```

---

## 🔧 Configure Green API Webhook

### 1. Copy the Green API Webhook URL
From the output above, copy: `https://abc123.ngrok.io/webhooks/greenapi`

### 2. Go to Green API Console
https://console.green-api.com/

### 3. Select Your Instance
Instance ID: `7700330457`

### 4. Navigate to Webhook Settings
- Click on your instance
- Go to "Settings" or "Webhook Settings"

### 5. Set Webhook URL
- Paste: `https://abc123.ngrok.io/webhooks/greenapi`
- Replace `abc123` with your actual ngrok URL

### 6. Enable Webhook Types
- ✅ `incomingMessageReceived`
- ✅ `outgoingMessageStatus`
- ✅ `deviceStatus`

### 7. Save Settings

---

## 🧪 Test It

1. **Send "Hi"** to your WhatsApp number: `+47 96701573`
2. **Check server logs** - you should see:
   ```
   📨 Message from 4796701573: Hi
   👤 New user created: 4796701573
   ✅ Message sent to 4796701573
   ```
3. **Check WhatsApp** - you should receive welcome message

---

## 📊 Quick Commands

```bash
# Start ngrok tunnel
npm run webhook:tunnel

# Get webhook URLs (while ngrok is running)
npm run webhook:url

# Start server
npm start

# Test welcome message
npm run test:welcome
```

---

## ⚠️ Important Notes

### Keep ngrok Running
- **ngrok must stay running** while testing
- If you restart ngrok, you'll get a **new URL**
- **Update Green API** with the new URL if it changes

### Free ngrok Limitations
- URL changes on each restart
- Session timeout after 2 hours
- For stable testing, consider ngrok paid plan

### ngrok Alternatives
- **localtunnel**: `npx localtunnel --port 3000`
- **serveo**: `ssh -R 80:localhost:3000 serveo.net`
- **Cloudflare Tunnel**: Free and stable

---

## 🔄 Complete Testing Setup

### Terminal 1: Server
```bash
cd backend
npm start
```

### Terminal 2: ngrok
```bash
cd backend
npm run webhook:tunnel
```

### Terminal 3: Testing
```bash
cd backend
# Get webhook URL
npm run webhook:url

# Test welcome message
npm run test:welcome
```

---

## ✅ Verification Checklist

- [ ] ngrok installed
- [ ] Server running on port 3000
- [ ] ngrok tunnel active
- [ ] Webhook URL copied
- [ ] Green API webhook configured
- [ ] Test message sent
- [ ] Welcome message received

---

## 🆘 Troubleshooting

### "ngrok not found"
```bash
# Install ngrok
brew install ngrok/ngrok/ngrok
```

### "Server not running"
```bash
# Start server first
npm start
```

### "Could not connect to ngrok API"
- Make sure ngrok is running
- Check ngrok is on port 4040 (default)

### Webhook not receiving messages
- Verify webhook URL in Green API console
- Check server logs for incoming requests
- Ensure ngrok is still running

---

## 🎯 Next Steps

1. ✅ Start server
2. ✅ Start ngrok
3. ✅ Get webhook URL
4. ✅ Configure in Green API
5. ✅ Test with WhatsApp message

---

**Ready to test!** Start ngrok and configure your webhook URL! 🚀

