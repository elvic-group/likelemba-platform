# 🤖 Agent & Platform Control - Contact-Only Response System

**Date:** December 19, 2024  
**Status:** ✅ **ACTIVE**

---

## 🎯 Core Principle

**ONLY RESPOND TO USERS WHO CONTACTED US FIRST**

The platform will:
- ✅ **Respond** to incoming messages from users
- ❌ **NOT send** messages to contacts automatically
- ❌ **NOT send** unsolicited notifications
- ✅ **Track** which users have contacted us

---

## 🔒 Contact Tracking System

### How It Works

1. **User sends message** → Webhook received
2. **User created/retrieved** → `has_contacted_us = TRUE` set
3. **Response sent** → Only if user contacted us first
4. **Notifications** → Only sent to users who contacted us

### Database Fields

```sql
has_contacted_us BOOLEAN DEFAULT FALSE
first_contact_at TIMESTAMP
```

---

## 📋 Message Sending Rules

### ✅ ALLOWED: Response Messages

These messages are **always allowed** (user contacted us first):

- Welcome messages (new users)
- Menu responses
- AI agent responses
- Service flow messages
- Error messages
- Help messages

### ❌ BLOCKED: Unsolicited Messages

These are **blocked** unless user contacted us:

- Automatic notifications (unless enabled)
- Reminders to non-contacted users
- Marketing messages
- Broadcast messages

---

## 🔧 Configuration

### Environment Variables

```bash
# Disable automatic notifications (default)
# Only responds to incoming messages
ENABLE_NOTIFICATIONS=false

# Enable notifications (only to users who contacted us)
ENABLE_NOTIFICATIONS=true
```

### Current Status

- ✅ **Notifications:** Disabled by default
- ✅ **Contact Tracking:** Active
- ✅ **Response-Only Mode:** Enabled

---

## 🛡️ Protection Features

### 1. Contact Verification

Every `sendMessage()` call checks:
```javascript
if (!user.has_contacted_us) {
  // Skip sending
  return;
}
```

### 2. Notification Filtering

All notifications check:
```javascript
if (!user.has_contacted_us) {
  // Skip notification
  return;
}
```

### 3. AI Agent Control

AI agent only responds to users who:
- Have sent at least one message
- Have `has_contacted_us = TRUE`

---

## 📊 User Flow

### New User

1. User sends "Hi" → Webhook received
2. User created → `has_contacted_us = TRUE`
3. Welcome message sent ✅
4. User can now receive responses ✅

### Existing User

1. User sends message → Webhook received
2. `has_contacted_us` verified → TRUE
3. Response sent ✅

### Non-Contacted User

1. System tries to send notification
2. `has_contacted_us` checked → FALSE
3. Message skipped ⏭️
4. No unsolicited message sent ✅

---

## 🚫 What's Blocked

### Automatic Notifications (Disabled by Default)

- ❌ Due contribution reminders
- ❌ Overdue payment reminders
- ❌ Quorum notifications
- ❌ Scheduled reminders

**Note:** These only work if:
1. `ENABLE_NOTIFICATIONS=true` is set
2. User has `has_contacted_us = TRUE`

### Broadcast Messages

- ❌ Mass messaging
- ❌ Marketing campaigns
- ❌ Group announcements (unless user contacted us)

---

## ✅ What's Allowed

### Response Messages

- ✅ Welcome messages (user just contacted us)
- ✅ Menu responses
- ✅ AI agent responses
- ✅ Service responses
- ✅ Help messages
- ✅ Error messages

### Notifications (If Enabled)

- ✅ Due reminders (only to contacted users)
- ✅ Overdue reminders (only to contacted users)
- ✅ Quorum notifications (only to contacted users)

---

## 🔍 Verification

### Check User Contact Status

```sql
SELECT phone_e164, has_contacted_us, first_contact_at 
FROM likelemba.users 
WHERE phone_e164 = '1234567890';
```

### Check Notification Settings

```bash
heroku config:get ENABLE_NOTIFICATIONS --app likelemba-production
```

---

## 🎯 Best Practices

1. **Always verify** `has_contacted_us` before sending
2. **Never send** to users who haven't contacted us
3. **Track first contact** with `first_contact_at`
4. **Respect opt-out** if user unsubscribes
5. **Monitor logs** for skipped messages

---

## 📝 Summary

**The platform now:**
- ✅ Only responds to incoming messages
- ✅ Tracks who has contacted us
- ✅ Blocks unsolicited messages
- ✅ Respects user privacy
- ✅ Prevents spam/abuse

**Your contacts are safe!** The platform will never send messages to them unless they message you first.

---

**Status:** ✅ Active and protecting your contacts

