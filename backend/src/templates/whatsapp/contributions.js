/**
 * Contributions Templates - Enhanced
 */
module.exports = {
  listPending: (contributions) => {
    if (contributions.length === 0) {
      return `💳 Pay Contribution

━━━━━━━━━━━━━━━━━━━━
✅ Great news! You have no pending contributions.
━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━
💡 Reply MENU to go back
💡 Or ask me anything!`.trim();
    }

    let message = `💳 Pending Contributions

━━━━━━━━━━━━━━━━━━━━
Your Due Payments:
━━━━━━━━━━━━━━━━━━━━

`;
    contributions.forEach((contribution, index) => {
      const dueDate = new Date(contribution.due_at);
      const isOverdue = dueDate < new Date();
      const statusEmoji = isOverdue ? '🔴' : '🟡';
      
      message += `${index + 1}️⃣ ${statusEmoji} ${contribution.group_name}\n`;
      message += `   💰 ${contribution.amount} ${contribution.currency}\n`;
      message += `   📅 Due: ${dueDate.toLocaleDateString()}\n`;
      if (isOverdue) {
        const daysLate = Math.floor((new Date() - dueDate) / (1000 * 60 * 60 * 24));
        message += `   ⚠️ ${daysLate} day(s) overdue\n`;
      }
      message += `\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━
💡 Reply with contribution number to pay
💡 Reply MENU to go back`;

    return message.trim();
  },

  dueReminder: (contribution, groupName, userName) => {
    const dueDate = new Date(contribution.due_at);
    return `⏰ Payment Reminder

━━━━━━━━━━━━━━━━━━━━
Hi ${userName}!
━━━━━━━━━━━━━━━━━━━━

Your contribution is due soon:

💰 Amount: ${contribution.amount} ${contribution.currency}
📅 Due Date: ${dueDate.toLocaleDateString()}
📛 Group: ${groupName}

━━━━━━━━━━━━━━━━━━━━
What would you like to do?

1️⃣ Pay Now
2️⃣ View Status
3️⃣ Get Help

━━━━━━━━━━━━━━━━━━━━
💡 Reply PAY to pay now
💡 Reply STATUS to see your history`.trim();
  },

  paymentMethodSelection: () => {
    return `💳 Choose Payment Method

━━━━━━━━━━━━━━━━━━━━
How would you like to pay?
━━━━━━━━━━━━━━━━━━━━

1️⃣ Mobile Money
   📱 M-Pesa / Orange / Tigo

2️⃣ Card or Bank
   💳 Stripe (Secure)

━━━━━━━━━━━━━━━━━━━━
💡 Reply 1 or 2 to continue`.trim();
  },

  mobileMoneyRequestSent: (amount, currency, paymentRef) => {
    return `📲 Payment Request Sent!

━━━━━━━━━━━━━━━━━━━━
Payment Details:
━━━━━━━━━━━━━━━━━━━━

💰 Amount: ${amount} ${currency}
📋 Reference: ${paymentRef}

━━━━━━━━━━━━━━━━━━━━
📱 Please confirm the prompt on your phone to complete payment.

⏳ I'll notify you as soon as payment is received!

━━━━━━━━━━━━━━━━━━━━
💡 Reply STATUS to check payment status`.trim();
  },

  stripePaymentLink: (stripeLink) => {
    return `🔒 Secure Payment Link

━━━━━━━━━━━━━━━━━━━━
Click the link below to pay securely:
━━━━━━━━━━━━━━━━━━━━

${stripeLink}

━━━━━━━━━━━━━━━━━━━━
✅ Secure payment via Stripe
📧 You'll receive a receipt here after payment

━━━━━━━━━━━━━━━━━━━━
💡 Reply STATUS to check payment status`.trim();
  },

  paymentSuccess: (amount, currency, groupName, paidAt, receiptId, userName) => {
    return `✅ Payment Successful!

━━━━━━━━━━━━━━━━━━━━
Thank you, ${userName}! 🙏
━━━━━━━━━━━━━━━━━━━━

💰 Amount: ${amount} ${currency}
📛 Group: ${groupName}
📅 Date: ${new Date(paidAt).toLocaleDateString()}
🧾 Receipt: ${receiptId.substring(0, 8)}

━━━━━━━━━━━━━━━━━━━━
✅ Your contribution has been recorded!

━━━━━━━━━━━━━━━━━━━━
💡 Reply RECEIPTS to view all receipts
💡 Reply MENU to go back`.trim();
  },

  latePaymentNudge: (groupName, userName, daysLate, amount, currency) => {
    return `⚠️ Payment Overdue

━━━━━━━━━━━━━━━━━━━━
Hi ${userName},
━━━━━━━━━━━━━━━━━━━━

Your contribution is overdue:

📛 Group: ${groupName}
💰 Amount: ${amount} ${currency}
📅 Days Late: ${daysLate} day(s)

━━━━━━━━━━━━━━━━━━━━
What would you like to do?

1️⃣ Pay Now
2️⃣ Get Help
3️⃣ Contact Support

━━━━━━━━━━━━━━━━━━━━
💡 Reply PAY to settle now
💡 Reply HELP if you need assistance`.trim();
  },
};
