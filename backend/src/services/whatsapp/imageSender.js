/**
 * Image Sender Service
 * Handles sending images via Green API
 */
const greenAPI = require('../../config/greenapi');
const path = require('path');
const FormData = require('form-data');
const fs = require('fs');

class ImageSender {
  /**
   * Send image from file path
   */
  async sendImage(phone, imagePath, caption = '') {
    try {
      if (!phone || !imagePath) {
        console.error('Invalid phone or image path');
        return null;
      }

      const chatId = phone.includes('@c.us') ? phone : `${phone}@c.us`;
      
      // Resolve absolute path
      const absolutePath = path.isAbsolute(imagePath) 
        ? imagePath 
        : path.resolve(__dirname, '../../..', imagePath);

      // Check if file exists
      if (!fs.existsSync(absolutePath)) {
        console.error(`Image file not found: ${absolutePath}`);
        return null;
      }

      // Create FormData with file
      // Ensure PNG with transparency is preserved
      const formData = new FormData();
      formData.append('chatId', chatId);
      
      // Read file to ensure it's properly handled
      const fileStream = fs.createReadStream(absolutePath);
      const stats = fs.statSync(absolutePath);
      
      formData.append('file', fileStream, {
        filename: path.basename(imagePath),
        contentType: 'image/png',
        knownLength: stats.size,
      });
      
      if (caption) {
        formData.append('caption', caption);
      }

      // Send file using Green API
      const response = await greenAPI.file.sendFileByUpload(formData);

      console.log(`✅ Image sent to ${phone}: ${path.basename(imagePath)}`);
      return response;
    } catch (error) {
      console.error(`❌ Error sending image to ${phone}:`, error);
      return null;
    }
  }

  /**
   * Send image from URL
   */
  async sendImageFromURL(phone, imageUrl, caption = '') {
    try {
      if (!phone || !imageUrl) {
        console.error('Invalid phone or image URL');
        return null;
      }

      const chatId = phone.includes('@c.us') ? phone : `${phone}@c.us`;
      
      const response = await greenAPI.file.sendFileByUrl(
        chatId,
        imageUrl,
        'image.png',
        caption
      );

      console.log(`✅ Image sent from URL to ${phone}`);
      return response;
    } catch (error) {
      console.error(`❌ Error sending image from URL to ${phone}:`, error);
      return null;
    }
  }

}

module.exports = new ImageSender();

