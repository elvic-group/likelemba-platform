/**
 * Receipts Templates
 */
module.exports = {
  listReceipts: (receipts) => {
    if (receipts.length === 0) {
      return `🧾 My Receipts

You have no receipts yet.`.trim();
    }

    let message = `🧾 My Receipts\n\n`;
    receipts.slice(0, 10).forEach((receipt, index) => {
      message += `${index + 1}. ${receipt.group_name}\n`;
      message += `   Amount: ${receipt.amount} ${receipt.currency}\n`;
      message += `   Date: ${new Date(receipt.created_at).toLocaleDateString()}\n`;
      message += `   Ref: ${receipt.id.substring(0, 8)}\n\n`;
    });

    if (receipts.length > 10) {
      message += `Showing 10 of ${receipts.length} receipts.`;
    }

    return message.trim();
  },
};

