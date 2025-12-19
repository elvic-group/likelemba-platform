/**
 * Translation Service with Auto-Detection
 * Detects user's language and translates accordingly
 */
const OpenAI = require('openai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Language code mapping for selection
const LANGUAGE_MAP = {
  '1': 'en',      // English
  '2': 'fr',      // Français
  '3': 'sw',      // Kiswahili
};

// Extended language support (detect more languages)
const DETECTABLE_LANGUAGES = {
  'en': 'English',
  'fr': 'Français',
  'sw': 'Kiswahili',
  'es': 'Español',
  'pt': 'Português',
  'ar': 'العربية',
  'hi': 'हिन्दी',
  'zh': '中文',
  'de': 'Deutsch',
  'it': 'Italiano',
  'ru': 'Русский',
  'ja': '日本語',
  'ko': '한국어',
  'nl': 'Nederlands',
  'pl': 'Polski',
  'tr': 'Türkçe',
  'vi': 'Tiếng Việt',
};

class TranslationService {
  constructor() {
    this.translationCache = new Map();
    this.languageCache = new Map();
  }

  /**
   * Detect language of user message
   */
  async detectLanguage(text) {
    try {
      if (!text || text.trim().length < 3) {
        return 'en'; // Default for very short messages
      }

      // Check cache first
      const cacheKey = text.substring(0, 100).toLowerCase();
      if (this.languageCache.has(cacheKey)) {
        return this.languageCache.get(cacheKey);
      }

      if (!process.env.OPENAI_API_KEY) {
        return 'en';
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a language detection expert. Detect the language of the following text and respond with ONLY the ISO 639-1 language code (e.g., 'en', 'fr', 'sw', 'es', 'ar', 'hi', etc.). 

If the text contains multiple languages, respond with the PRIMARY language code.
If uncertain, default to 'en'.
Respond with ONLY the language code, nothing else.`,
          },
          {
            role: 'user',
            content: text.substring(0, 500), // Limit to first 500 chars for detection
          },
        ],
        temperature: 0.1,
        max_tokens: 10,
      });

      const detectedLang = response.choices[0].message.content.trim().toLowerCase();
      
      // Validate detected language
      const validLang = Object.keys(DETECTABLE_LANGUAGES).includes(detectedLang) 
        ? detectedLang 
        : 'en';

      // Cache result
      if (this.languageCache.size > 200) {
        const firstKey = this.languageCache.keys().next().value;
        this.languageCache.delete(firstKey);
      }
      this.languageCache.set(cacheKey, validLang);

      return validLang;
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en'; // Default to English on error
    }
  }

  /**
   * Translate text to target language
   */
  async translate(text, targetLocale = 'en', sourceLocale = 'en') {
    try {
      // If same language, return as-is
      if (targetLocale === sourceLocale) {
        return text;
      }

      // If no API key, return original text
      if (!process.env.OPENAI_API_KEY) {
        console.warn('⚠️ OpenAI API key not set - translations disabled');
        return text;
      }

      // Cache translations
      const cacheKey = `${targetLocale}:${text.substring(0, 50)}`;
      if (this.translationCache.has(cacheKey)) {
        return this.translationCache.get(cacheKey);
      }

      const languageName = DETECTABLE_LANGUAGES[targetLocale] || targetLocale;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following WhatsApp message template to ${languageName}. 
            
CRITICAL RULES:
- Keep all emojis exactly as they are
- Keep all separators (━━━━━━━━━━━━━━━━━━━━) exactly as they are
- Keep all numbered options (1️⃣, 2️⃣, etc.) exactly as they are
- Keep all formatting and structure exactly the same
- Only translate the text content, not emojis or formatting
- Maintain the same tone and style
- Keep placeholders like ${name} or ${amount} exactly as they are
- Preserve all special characters and symbols`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const translated = response.choices[0].message.content.trim();

      // Cache the translation
      if (this.translationCache.size > 500) {
        const firstKey = this.translationCache.keys().next().value;
        this.translationCache.delete(firstKey);
      }
      this.translationCache.set(cacheKey, translated);

      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original on error
    }
  }

  /**
   * Get language code from selection
   */
  getLanguageCode(selection) {
    return LANGUAGE_MAP[selection] || 'en';
  }

  /**
   * Get language name
   */
  getLanguageName(locale) {
    return DETECTABLE_LANGUAGES[locale] || 'English';
  }

  /**
   * Check if locale is supported for templates
   */
  isTemplateSupported(locale) {
    // Templates are pre-translated for en, fr, sw
    // Other languages use AI translation
    return ['en', 'fr', 'sw'].includes(locale);
  }
}

module.exports = new TranslationService();

