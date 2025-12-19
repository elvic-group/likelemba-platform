/**
 * Main Menu Templates - Complete Redesign
 * Beautiful, cohesive WhatsApp message templates for Likelemba
 * Community-focused with emojis that match the brand
 */
module.exports = {
  welcomeMessage: (name) => {
    return `🤝 Welcome to Likelemba, ${name}!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💎 Save money together with your community
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌟 Join hands with your community to build savings together

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌍 Choose your language:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ English
2️⃣ Français  
3️⃣ Kiswahili

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Reply with 1, 2, or 3 to continue`.trim();
  },

  menu: (role = 'member') => {
    if (role === 'platform_admin') {
      return `👑 Admin Dashboard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ Quick Actions:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ 👥 My Groups
2️⃣ 💳 Pay Contribution
3️⃣ 💰 Next Payout
4️⃣ 🧾 My Receipts
5️⃣ 🆘 Support
6️⃣ ⚙️ Settings
7️⃣ 🔐 Admin Panel

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 Or chat naturally with me!

💡 Reply with a number (1-7) or type your question`.trim();
    }

    if (role === 'group_admin') {
      return `👑 Group Admin Menu

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ Quick Actions:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ 👥 My Groups
2️⃣ 💳 Pay Contribution
3️⃣ 💰 Next Payout
4️⃣ 🧾 My Receipts
5️⃣ 🆘 Support
6️⃣ ⚙️ Settings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 Or chat naturally with me!

💡 Reply with a number (1-6) or type your question`.trim();
    }

    return `🏠 Main Menu

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤝 What would you like to do?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ 👥 My Groups
2️⃣ 💳 Pay Contribution
3️⃣ 💰 Next Payout
4️⃣ 🧾 My Receipts
5️⃣ 🆘 Support
6️⃣ ⚙️ Settings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 Or chat naturally with me!

💡 Reply with a number (1-6) or type your question`.trim();
  },

  help: () => {
    return `🆘 Help & Support Center

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ Quick Commands:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 MENU - Show main menu
❓ HELP - Show this help
⬅️ 0 or BACK - Go back one step

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI Assistant:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Just chat naturally! I can help you with:
✨ Creating savings groups
✨ Understanding how Likelemba works
✨ Payment questions
✨ General support

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Getting Started:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Create a savings group
2️⃣ Invite members via link
3️⃣ Set contribution rules
4️⃣ Track payouts & cycles

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ Your Safety:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ All funds held in escrow
✅ Transparent ledger
✅ Dispute resolution available

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 Need more help?
Reply SUPPORT or just ask me anything!

💡 Type MENU to continue, or chat with me! 🤖`.trim();
  },
};
