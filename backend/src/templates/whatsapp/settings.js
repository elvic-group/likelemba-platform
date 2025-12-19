/**
 * Settings Templates - Enhanced
 */
module.exports = {
  menu: (user) => {
    return `⚙️ Settings

━━━━━━━━━━━━━━━━━━━━
Account Settings:
━━━━━━━━━━━━━━━━━━━━

1️⃣ Change Language
2️⃣ Set PIN
3️⃣ Notification Preferences
4️⃣ Account Info

━━━━━━━━━━━━━━━━━━━━
Current Settings:
━━━━━━━━━━━━━━━━━━━━

🌐 Language: ${user.locale || 'English'}
🔒 PIN: ${user.pin_hash ? '✅ Set' : '❌ Not set'}

━━━━━━━━━━━━━━━━━━━━
💡 Reply with a number (1-4)`.trim();
  },
};
