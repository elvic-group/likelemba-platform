/**
 * Contributions Templates
 */
module.exports = {
  listPending: (contributions) => {
    if (contributions.length === 0) {
      return `💳 **Pay Contribution**

You have no pending contributions.`.trim();
    }

    let message = `💳 **Pending Contributions**\n\n`;
    contributions.forEach((contribution, index) => {
      message += `${index + 1}. **${contribution.group_name}**\n`;
      message += `   Amount: ${contribution.amount} ${contribution.currency}\n`;
      message += `   Due: ${new Date(contribution.due_at).toLocaleDateString()}\n\n`;
    });

    message += `Reply with contribution number to pay, or **MENU** to go back.`;

    return message.trim();
  },

  dueReminder: (contribution, groupName, userName) => {
    return `⏰ **Payment reminder — ${groupName}**

Hi ${userName}, your contribution of **${contribution.amount} ${contribution.currency}** is due on **${new Date(contribution.due_at).toLocaleDateString()}**.

Reply:
**PAY** to pay now ✅
**STATUS** to see your history
**HELP** if you have an issue`.trim();
  },

  paymentMethodSelection: () => {
    return `💳 **Choose payment method**

1) Mobile Money (M‑Pesa / Orange / Tigo)
2) Card/Bank (Stripe)

Reply **1** or **2**.`.trim();
  },

  mobileMoneyRequestSent: (amount, currency, paymentRef) => {
    return `📲 Mobile Money request sent!

Please confirm the prompt on your phone to pay **${amount} ${currency}**.

I'll notify you as soon as it's received.
Ref: **${paymentRef}**`.trim();
  },

  stripePaymentLink: (stripeLink) => {
    return `🔒 Secure payment link (Stripe):
${stripeLink}

After payment, you'll receive a receipt here.`.trim();
  },

  paymentSuccess: (amount, currency, groupName, paidAt, receiptId, userName) => {
    return `✅ **Payment received**

**${amount} ${currency}** for **${groupName}**
Date: **${new Date(paidAt).toLocaleDateString()}**
Receipt: **${receiptId}**

Thank you, ${userName} 🙏`.trim();
  },

  latePaymentNudge: (groupName, userName, daysLate, amount, currency) => {
    return `👀 Quick reminder, ${userName}

Your contribution for **${groupName}** is overdue by **${daysLate}** day(s).
Amount due: **${amount} ${currency}**

Reply **PAY** to settle now, or **HELP** if you need assistance.`.trim();
  },
};

