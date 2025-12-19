/**
 * Green API Configuration
 * WhatsApp Business API client setup
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const whatsAppClient = require('@green-api/whatsapp-api-client');

const idInstance = process.env.GREEN_ID_INSTANCE;
const apiTokenInstance = process.env.GREEN_API_TOKEN_INSTANCE;

if (!idInstance || !apiTokenInstance) {
  console.error('❌ Green API credentials missing!');
  // Return dummy object to prevent crashes
  module.exports = {
    message: {
      sendMessage: async () => {
        console.warn('⚠️ Green API not configured - message not sent');
        return { idMessage: 'dummy' };
      },
      sendFileByUrl: async () => {
        console.warn('⚠️ Green API not configured - file not sent');
        return { idMessage: 'dummy' };
      },
    },
    file: {
      sendFileByUpload: async () => {
        console.warn('⚠️ Green API not configured - file not sent');
        return { idMessage: 'dummy' };
      },
      sendFileByUrl: async () => {
        console.warn('⚠️ Green API not configured - file not sent');
        return { idMessage: 'dummy' };
      },
    },
    service: {
      sendTyping: async () => {
        console.warn('⚠️ Green API not configured - typing not sent');
        return {};
      },
    },
    account: {
      getStateInstance: async () => {
        return { stateInstance: 'notAuthorized' };
      },
    },
    service: {
      sendTyping: async () => {
        console.warn('⚠️ Green API not configured - typing not sent');
        return {};
      },
    },
  };
} else {
  const restAPI = whatsAppClient.restAPI({
    idInstance: idInstance,
    apiTokenInstance: apiTokenInstance,
  });
  
  console.log('✅ Green API client configured');
  module.exports = restAPI;
}

