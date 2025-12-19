/**
 * Settings Templates
 */
module.exports = {
  menu: (user) => {
    return `⚙️ Settings

1) Change Language
2) Set PIN
3) Notification Preferences
4) Account Info

Current language: ${user.locale || 'en'}
PIN: ${user.pin_hash ? 'Set' : 'Not set'}

Reply with a number.`.trim();
  },
};

