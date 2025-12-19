/**
 * Template Translator
 * Wraps template functions to auto-translate based on user locale or detected language
 */
const templates = require('../../templates/whatsapp');
const translationService = require('../translation');

class TemplateTranslator {
  /**
   * Get translated template
   */
  async getTranslatedTemplate(templateFunction, user, detectedLanguage = null, ...args) {
    try {
      // Get template in English (source)
      const englishTemplate = typeof templateFunction === 'function' 
        ? templateFunction(...args)
        : templateFunction;
      
      // Use detected language or user's locale preference
      const targetLanguage = detectedLanguage || user?.locale || 'en';
      
      // If English, return as-is
      if (targetLanguage === 'en') {
        return englishTemplate;
      }
      
      // Translate to target language
      const translated = await translationService.translate(
        englishTemplate,
        targetLanguage,
        'en'
      );
      
      return translated;
    } catch (error) {
      console.error('Template translation error:', error);
      // Return original if translation fails
      return typeof templateFunction === 'function' 
        ? templateFunction(...args)
        : templateFunction;
    }
  }

  /**
   * Main menu templates
   */
  async welcomeMessage(user, name, detectedLanguage = null) {
    const template = templates.main.welcomeMessage(name);
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  async menu(user, role = 'member', detectedLanguage = null) {
    const template = templates.main.menu(role);
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  async help(user, detectedLanguage = null) {
    const template = templates.main.help();
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  /**
   * Groups templates
   */
  async listGroups(user, groups, detectedLanguage = null) {
    const template = templates.groups.listGroups(groups);
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  async groupCreated(user, group, detectedLanguage = null) {
    const template = templates.groups.groupCreated(group);
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  async joinGroup(user, group, detectedLanguage = null) {
    const template = templates.groups.joinGroup(group);
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  async groupDetails(user, group, members, detectedLanguage = null) {
    const template = templates.groups.groupDetails(group, members);
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  /**
   * Contributions templates
   */
  async listPending(user, contributions, detectedLanguage = null) {
    const template = templates.contributions.listPending(contributions);
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  async dueReminder(user, contribution, groupName, userName, detectedLanguage = null) {
    const template = templates.contributions.dueReminder(contribution, groupName, userName);
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  async paymentMethodSelection(user, detectedLanguage = null) {
    const template = templates.contributions.paymentMethodSelection();
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  async mobileMoneyRequestSent(user, amount, currency, paymentRef, detectedLanguage = null) {
    const template = templates.contributions.mobileMoneyRequestSent(amount, currency, paymentRef);
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  async stripePaymentLink(user, stripeLink, detectedLanguage = null) {
    const template = templates.contributions.stripePaymentLink(stripeLink);
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  async paymentSuccess(user, amount, currency, groupName, paidAt, receiptId, userName, detectedLanguage = null) {
    const template = templates.contributions.paymentSuccess(amount, currency, groupName, paidAt, receiptId, userName);
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  async latePaymentNudge(user, groupName, userName, daysLate, amount, currency, detectedLanguage = null) {
    const template = templates.contributions.latePaymentNudge(groupName, userName, daysLate, amount, currency);
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  /**
   * Payouts templates
   */
  async nextPayout(user, payout, detectedLanguage = null) {
    const template = templates.payouts.nextPayout(payout);
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  async quorumMet(user, groupName, payoutDate, recipientName, detectedLanguage = null) {
    const template = templates.payouts.quorumMet(groupName, payoutDate, recipientName);
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  async payoutScheduled(user, payoutDate, amount, currency, recipientName, detectedLanguage = null) {
    const template = templates.payouts.payoutScheduled(payoutDate, amount, currency, recipientName);
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  async payoutCompleted(user, amount, currency, recipientName, groupName, payoutRef, detectedLanguage = null) {
    const template = templates.payouts.payoutCompleted(amount, currency, recipientName, groupName, payoutRef);
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  /**
   * Receipts templates
   */
  async listReceipts(user, receipts, detectedLanguage = null) {
    const template = templates.receipts.listReceipts(receipts);
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  /**
   * Support templates
   */
  async supportMenu(user, detectedLanguage = null) {
    const template = templates.support.menu();
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  async supportHandoff(user, detectedLanguage = null) {
    const template = templates.support.handoff();
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  /**
   * Settings templates
   */
  async settingsMenu(user, detectedLanguage = null) {
    const template = templates.settings.menu(user);
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  /**
   * Admin templates
   */
  async adminMenu(user, detectedLanguage = null) {
    const template = templates.admin.menu();
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }

  async groupAdminMenu(user, detectedLanguage = null) {
    const template = templates.groupAdmin.menu();
    return await this.getTranslatedTemplate(template, user, detectedLanguage);
  }
}

module.exports = new TemplateTranslator();

