/**
 * Payouts Templates - Enhanced
 */
module.exports = {
  nextPayout: (payout) => {
    if (!payout) {
      return `💰 Next Payout

━━━━━━━━━━━━━━━━━━━━
You have no scheduled payouts at this time.
━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━
💡 Reply MENU to go back
💡 Or ask me anything!`.trim();
    }

    const scheduledDate = new Date(payout.scheduled_at);
    const statusEmoji = payout.status === 'scheduled' ? '📅' : payout.status === 'completed' ? '✅' : '⏳';
    
    return `💰 Next Payout

━━━━━━━━━━━━━━━━━━━━
Upcoming Payout:
━━━━━━━━━━━━━━━━━━━━

📛 Group: ${payout.group_name}
💰 Amount: ${payout.amount} ${payout.currency}
📅 Scheduled: ${scheduledDate.toLocaleDateString()}
${statusEmoji} Status: ${payout.status}

━━━━━━━━━━━━━━━━━━━━
💡 Reply MENU to go back`.trim();
  },

  quorumMet: (groupName, payoutDate, recipientName) => {
    return `🎯 Great News!

━━━━━━━━━━━━━━━━━━━━
${groupName} has reached the required contributions!
━━━━━━━━━━━━━━━━━━━━

✅ Quorum met for this cycle

━━━━━━━━━━━━━━━━━━━━
📅 Next Payout: ${new Date(payoutDate).toLocaleDateString()}
👤 Recipient: ${recipientName}

━━━━━━━━━━━━━━━━━━━━
🎉 Congratulations to all members!

━━━━━━━━━━━━━━━━━━━━
💡 Reply MENU to go back`.trim();
  },

  payoutScheduled: (payoutDate, amount, currency, recipientName) => {
    return `💰 Payout Scheduled

━━━━━━━━━━━━━━━━━━━━
Payout Details:
━━━━━━━━━━━━━━━━━━━━

📅 Date: ${new Date(payoutDate).toLocaleDateString()}
💰 Amount: ${amount} ${currency}
👤 Recipient: ${recipientName}

━━━━━━━━━━━━━━━━━━━━
The payout will be released on the scheduled date.

━━━━━━━━━━━━━━━━━━━━
What would you like to do?

1️⃣ Confirm
2️⃣ Dispute
3️⃣ Get Help

━━━━━━━━━━━━━━━━━━━━
💡 Reply OK to confirm
💡 Reply DISPUTE if something is wrong`.trim();
  },

  payoutCompleted: (amount, currency, recipientName, groupName, payoutRef) => {
    return `🎉 Payout Sent!

━━━━━━━━━━━━━━━━━━━━
Payment Completed:
━━━━━━━━━━━━━━━━━━━━

💰 Amount: ${amount} ${currency}
👤 Recipient: ${recipientName}
📛 Group: ${groupName}
📋 Reference: ${payoutRef.substring(0, 8)}

━━━━━━━━━━━━━━━━━━━━
✅ Payout has been successfully processed!

━━━━━━━━━━━━━━━━━━━━
💡 Reply MENU to go back`.trim();
  },
};
