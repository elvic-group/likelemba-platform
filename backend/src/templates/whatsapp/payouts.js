/**
 * Payouts Templates
 */
module.exports = {
  nextPayout: (payout) => {
    if (!payout) {
      return `💰 **Next Payout**

You have no scheduled payouts.`.trim();
    }

    return `💰 **Next Payout**

**${payout.group_name}**
Amount: **${payout.amount} ${payout.currency}**
Scheduled: **${new Date(payout.scheduled_at).toLocaleDateString()}**

Status: ${payout.status}`.trim();
  },

  quorumMet: (groupName, payoutDate, recipientName) => {
    return `🎯 **Great news!**

**${groupName}** has reached the required contributions for this cycle.

Next payout: **${new Date(payoutDate).toLocaleDateString()}** to **${recipientName}**.`.trim();
  },

  payoutScheduled: (payoutDate, amount, currency, recipientName) => {
    return `💰 **Payout scheduled**

On **${new Date(payoutDate).toLocaleDateString()}**, **${amount} ${currency}** will be released to **${recipientName}**.

Reply **OK** to confirm, or **DISPUTE** if something is wrong.`.trim();
  },

  payoutCompleted: (amount, currency, recipientName, groupName, payoutRef) => {
    return `🎉 **Payout sent!**

**${amount} ${currency}** has been paid to **${recipientName}** for **${groupName}**.
Ref: **${payoutRef}**`.trim();
  },
};

