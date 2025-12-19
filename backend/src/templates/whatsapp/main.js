/**
 * Main Menu Templates
 */
module.exports = {
  welcomeMessage: (name) => {
    return `👋 Hi ${name}! Welcome to Likelemba — save money together with your community.

Choose language:
1️⃣ English  2️⃣ Français  3️⃣ Kiswahili

Reply with 1, 2, or 3.`.trim();
  },

  menu: (role = 'member') => {
    if (role === 'platform_admin') {
      return `✅ Admin Menu
1) My Groups
2) Pay Contribution
3) Next Payout
4) Receipts
5) Support
6) Settings
7) Admin Panel

💬 Or just chat with me naturally!

Reply with a number or type your question.`.trim();
    }

    if (role === 'group_admin') {
      return `✅ Menu
1) My Groups
2) Pay Contribution
3) Next Payout
4) Receipts
5) Support
6) Settings

💬 Or just chat with me naturally!

Reply with a number or type your question.`.trim();
    }

    return `✅ Menu
1) My Groups
2) Pay Contribution
3) Next Payout
4) Receipts
5) Support
6) Settings

💬 Or just chat with me naturally!

Reply with a number or type your question.`.trim();
  },

  help: () => {
    return `🆘 Help & Support

Main Commands:
• Type MENU - Show main menu
• Type HELP - Show this help
• Type 0 or BACK - Go back one step

AI Assistant:
• Chat naturally! Just type your question or request
• The AI assistant can help you with:
  - Creating groups
  - Understanding how Likelemba works
  - Payment questions
  - General support

Getting Started:
• Create a savings group
• Invite members via link
• Set contribution rules
• Track payouts

Need Help?
Reply SUPPORT to contact our team, or just ask me anything!

Safety:
• All funds are held in escrow
• Transparent ledger
• Dispute resolution available

Type MENU to continue, or just chat with me! 🤖`.trim();
  },
};

