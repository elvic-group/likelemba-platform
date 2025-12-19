# 🔑 Get New ngrok Authtoken

## The authtoken is invalid

Your current authtoken has been reset, revoked, or is from an account you no longer have access to.

## Steps to Fix

### 1. Get Your New Authtoken

1. Go to: **https://dashboard.ngrok.com/get-started/your-authtoken**
2. Sign in to your ngrok account
3. Copy your authtoken (it looks like: `2abc123...xyz789_ABC123def456GHI789`)

### 2. Update the Authtoken

Once you have the new authtoken, run:

```bash
ngrok config add-authtoken YOUR_NEW_AUTHTOKEN_HERE
```

Replace `YOUR_NEW_AUTHTOKEN_HERE` with the authtoken you copied from the dashboard.

### 3. Verify It Works

```bash
ngrok config check
```

You should see: `Valid configuration file...`

### 4. Test the Tunnel

```bash
cd backend
npm run webhook:start
```

---

## Quick Command Reference

```bash
# 1. Get new token from dashboard, then:
ngrok config add-authtoken <YOUR_NEW_TOKEN>

# 2. Verify
ngrok config check

# 3. Test
cd backend
npm run webhook:start
```

---

**Note**: Make sure you're using the authtoken from your ngrok dashboard, not an API key or credential ID.

