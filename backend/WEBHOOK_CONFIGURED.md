# ✅ Webhook Configuration Ready

## 🌐 Your Webhook URL

### Green API Webhook:
```
https://4c74463f8ed3.ngrok-free.app/webhooks/greenapi
```

---

## 📋 Configure in Green API Console

### Step-by-Step:

1. **Open Green API Console**
   - Go to: https://console.green-api.com/
   - Login with your credentials

2. **Select Instance**
   - Find instance: `7700330457`
   - Click on it

3. **Navigate to Webhook Settings**
   - Click "Settings" tab
   - Or look for "Webhook Settings" / "Notifications"

4. **Set Webhook URL**
   - Find "Incoming webhook URL" field
   - Paste: `https://4c74463f8ed3.ngrok-free.app/webhooks/greenapi`
   - Click "Save" or "Apply"

5. **Enable Webhook Types**
   - ✅ `incomingMessageReceived` - Incoming messages
   - ✅ `outgoingMessageStatus` - Message delivery status
   - ✅ `deviceStatus` - Device connection status

6. **Verify**
   - Check that webhook URL is saved
   - Status should show as "Active" or "Connected"

---

## 🧪 Test Your Webhook

### Option 1: Send Test Message
1. Send **"Hi"** to `+47 96701573`
2. Check server logs - you should see:
   ```
   📨 Message from 4796701573: Hi
   ```
3. You should receive welcome message

### Option 2: Test Endpoint
```bash
npm run test:webhook
```

---

## 📊 Webhook Status

**Current Setup:**
- ✅ ngrok tunnel: Active
- ✅ Server: Running on port 3000
- ✅ Webhook endpoint: `/webhooks/greenapi`
- ⏭️ Green API: Needs configuration (see steps above)

---

## 🔄 If ngrok Restarts

If you restart ngrok, you'll get a new URL:

1. **Get new URL:**
   ```bash
   npm run webhook:url
   ```

2. **Update Green API:**
   - Go to console
   - Update webhook URL with new ngrok URL
   - Save

---

## ✅ Verification Checklist

- [ ] ngrok is running
- [ ] Server is running on port 3000
- [ ] Webhook URL copied
- [ ] Green API webhook configured
- [ ] Webhook types enabled
- [ ] Test message sent
- [ ] Welcome message received

---

## 🎯 Quick Commands

```bash
# Get webhook URL
npm run webhook:url

# Test webhook endpoint
npm run test:webhook

# Start ngrok (if not running)
npm run webhook:tunnel
```

---

**Status**: ✅ **READY TO CONFIGURE**
**Action**: Copy webhook URL and configure in Green API console

