# ✅ Webhook Setup Complete & Ready!

## 🌐 Your Webhook URL

### 📱 Green API Webhook:
```
https://4c74463f8ed3.ngrok-free.app/webhooks/greenapi
```

---

## ✅ Status Check

- ✅ **Server**: Running on port 3000
- ✅ **ngrok**: Active and tunneling
- ✅ **Webhook endpoint**: `/webhooks/greenapi` ready
- ✅ **Routes**: Configured and working

---

## 🔧 Configure in Green API (Do This Now!)

### Step 1: Open Console
👉 https://console.green-api.com/

### Step 2: Set Webhook
1. Login
2. Select instance: **7700330457**
3. **Settings** → **Webhook Settings**
4. **Paste this URL:**
   ```
   https://4c74463f8ed3.ngrok-free.app/webhooks/greenapi
   ```
5. **Enable:**
   - ✅ `incomingMessageReceived`
   - ✅ `outgoingMessageStatus`
   - ✅ `deviceStatus`
6. **Save**

---

## 🧪 Test It!

### Option 1: Send WhatsApp Message
Send **"Hi"** to `+47 96701573`

**Expected:**
- Server receives webhook
- Welcome message sent
- Language selection menu

### Option 2: Check Server Logs
Watch for:
```
📨 Green API webhook received: incomingMessageReceived
📨 Message from 4796701573: Hi
👤 New user created: 4796701573
✅ Message sent to 4796701573
```

---

## 📊 Quick Commands

```bash
# Get webhook URL
npm run webhook:url

# Test webhook locally
curl -X POST http://localhost:3000/webhooks/greenapi \
  -H "Content-Type: application/json" \
  -d '{"typeWebhook":"incomingMessageReceived","senderData":{"sender":"4796701573@c.us"},"messageData":{"textMessageData":{"textMessage":"test"}}}'
```

---

## ⚠️ Important

- **Keep ngrok running** while testing
- **Keep server running** on port 3000
- If ngrok restarts, get new URL: `npm run webhook:url`
- Update Green API if URL changes

---

## 🎯 Next Action

**Copy this URL and configure in Green API:**
```
https://4c74463f8ed3.ngrok-free.app/webhooks/greenapi
```

**Then send "Hi" to test!** 🚀

---

**Status**: ✅ **READY TO USE**

