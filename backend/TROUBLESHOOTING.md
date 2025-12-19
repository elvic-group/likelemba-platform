# 🔧 Troubleshooting Webhook Setup

## Common Errors & Solutions

### Error: "Could not connect to ngrok API"

**Problem**: ngrok is not running

**Solution**:
```bash
# Start ngrok
npm run webhook:tunnel

# Or manually
ngrok http 3000
```

**Verify**:
```bash
npm run check:setup
```

---

### Error: "Server not running"

**Problem**: Server is not running on port 3000

**Solution**:
```bash
# Start server
cd backend
npm start
```

**Verify**:
```bash
curl http://localhost:3000/health
```

**Expected**: `{"status":"healthy",...}`

---

### Error: "No ngrok tunnel found"

**Problem**: ngrok is not running or not connected

**Solution**:
1. Check if ngrok is running:
   ```bash
   pgrep -f "ngrok http"
   ```

2. If not running, start it:
   ```bash
   npm run webhook:tunnel
   ```

3. Wait a few seconds for ngrok to start

4. Check again:
   ```bash
   npm run webhook:url
   ```

---

### Error: "Cannot POST /webhooks/greenapi"

**Problem**: Route not found (404)

**This is normal for local testing!** The webhook endpoint works when:
- Green API sends webhooks through ngrok
- The route is properly configured in Green API console

**Solution**: Configure webhook in Green API console first, then test with actual WhatsApp message.

---

### Error: "Port 3000 already in use"

**Problem**: Another process is using port 3000

**Solution**:
```bash
# Find process using port 3000
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)

# Start server again
npm start
```

---

### Error: "ngrok: command not found"

**Problem**: ngrok is not installed

**Solution**:
```bash
# macOS
brew install ngrok/ngrok/ngrok

# Or download from
# https://ngrok.com/download
```

**Verify**:
```bash
ngrok version
```

---

## Quick Diagnostic Commands

### Check Everything
```bash
npm run check:setup
```

### Check Server Only
```bash
curl http://localhost:3000/health
```

### Check ngrok Only
```bash
curl http://localhost:4040/api/tunnels
```

### Get Webhook URL
```bash
npm run webhook:url
```

---

## Complete Setup Checklist

- [ ] Server running: `npm start`
- [ ] ngrok running: `npm run webhook:tunnel`
- [ ] Webhook URL obtained: `npm run webhook:url`
- [ ] Webhook configured in Green API console
- [ ] Test message sent to WhatsApp

---

## Still Having Issues?

1. **Check logs**:
   ```bash
   # Server logs
   tail -f /tmp/server.log
   
   # ngrok logs
   tail -f /tmp/ngrok.log
   ```

2. **Restart everything**:
   ```bash
   # Kill all processes
   pkill -f "node.*app.js"
   pkill -f "ngrok"
   
   # Start fresh
   npm start
   npm run webhook:tunnel
   ```

3. **Verify environment**:
   ```bash
   npm run check:env
   ```

---

## Success Indicators

✅ Server responds: `curl http://localhost:3000/health`
✅ ngrok responds: `curl http://localhost:4040/api/tunnels`
✅ Webhook URL obtained: `npm run webhook:url`
✅ Green API webhook configured
✅ Test message works

---

**Need more help?** Check the logs and error messages for specific details.

