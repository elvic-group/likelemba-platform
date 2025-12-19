/**
 * Receipts Templates - Complete Redesign
 * Clean, organized receipt history
 */
module.exports = {
  listReceipts: (receipts) => {
    if (receipts.length === 0) {
      return `🧾 My Receipts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 You have no receipts yet.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Make your first contribution to receive a receipt!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Reply MENU to go back`.trim();
    }

    let message = `🧾 My Receipts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Your Payment History:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;
    receipts.slice(0, 10).forEach((receipt, index) => {
      message += `${index + 1}️⃣ ${receipt.group_name}\n`;
      message += `   💰 ${receipt.amount} ${receipt.currency}\n`;
      message += `   📅 ${new Date(receipt.created_at).toLocaleDateString()}\n`;
      message += `   🧾 Ref: ${receipt.id.substring(0, 8)}\n\n`;
    });

    if (receipts.length > 10) {
      message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Showing 10 of ${receipts.length} receipts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Reply MENU to go back`;
    } else {
      message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Reply MENU to go back`;
    }

    return message.trim();
  },
};
