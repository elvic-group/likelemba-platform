# Auto-Language Detection & Translation System

## Overview

The Likelemba platform now automatically detects the language users are speaking and responds in that language, regardless of their initial language selection. This provides a seamless, multilingual experience for users worldwide.

## Features

### 🌍 Auto-Language Detection
- Automatically detects the language of incoming messages
- Supports 15+ languages including:
  - English, Français, Kiswahili
  - Español, Português, العربية
  - Hindi, Chinese, German, Italian
  - Russian, Japanese, Korean, and more

### 🔄 Smart Language Adaptation
- System responds in the detected language automatically
- AI agent adapts to user's language in real-time
- Templates are translated on-the-fly
- User locale updates based on consistent language usage

### 💬 Seamless Experience
- No manual language switching needed
- Works for both menu commands and natural language
- Handles mixed-language conversations
- Caches translations for performance

## How It Works

### 1. Message Processing Flow

```
User sends message → Language detected → System responds in detected language
```

### 2. Language Detection

When a user sends a message:
1. System analyzes the message text
2. Detects the primary language using AI
3. Updates user locale if consistently using a different language
4. Responds in the detected language

### 3. Translation System

**Translation Service** (`backend/src/services/translation/index.js`):
- Detects language from text
- Translates templates to target language
- Caches translations for performance
- Handles 15+ languages

**Template Translator** (`backend/src/services/whatsapp/templateTranslator.js`):
- Wraps all template functions
- Automatically translates based on user locale or detected language
- Preserves emojis, formatting, and structure

### 4. AI Agent Integration

The AI agent:
- Receives detected language as parameter
- System prompt includes language instruction
- Responds in the same language user is speaking
- Adapts if user switches languages mid-conversation

## Implementation Details

### New Services

1. **Translation Service** (`backend/src/services/translation/index.js`)
   - `detectLanguage(text)` - Detects language from message
   - `translate(text, targetLocale, sourceLocale)` - Translates text
   - `getLanguageCode(selection)` - Maps selection to locale
   - `getLanguageName(locale)` - Gets language display name

2. **Template Translator** (`backend/src/services/whatsapp/templateTranslator.js`)
   - Wraps all template functions
   - Applies translation based on user locale or detected language
   - Maintains template structure and formatting

### Updated Components

1. **WhatsApp Handler** (`backend/src/services/whatsapp/handler.js`)
   - Detects language for non-command messages
   - Updates user locale based on consistent usage
   - Passes detected language to all template calls
   - Handles language selection for new users

2. **AI Agent** (`backend/src/services/aiAgent/index.js`)
   - Accepts `detectedLanguage` parameter
   - System prompt includes language instruction
   - Responds in detected language

3. **Notification Scheduler** (`backend/src/services/notifications/scheduler.js`)
   - Uses template translator for all notifications
   - Sends notifications in user's preferred language

## Usage Examples

### Example 1: User Speaks French

```
User: "Bonjour, je veux créer un groupe"
  ↓
System detects: French (fr)
  ↓
System responds in French:
"Bonjour! Je peux vous aider à créer un groupe d'épargne..."
  ↓
All subsequent templates translated to French
```

### Example 2: User Switches Languages

```
User: "Hello, I want to create a group"
  ↓
System detects: English (en)
  ↓
System responds in English:
"Hello! I can help you create a savings group..."
  ↓
User: "¿Cómo puedo pagar?"
  ↓
System detects: Spanish (es)
  ↓
System responds in Spanish:
"Para pagar, puede usar..."
```

### Example 3: Language Selection (New Users)

```
New user sends first message
  ↓
Welcome message with language selection:
"🌍 Choose your language:
1️⃣ English
2️⃣ Français
3️⃣ Kiswahili"
  ↓
User selects: 2
  ↓
System sets locale to 'fr'
  ↓
All messages in French
```

## Language Detection Logic

1. **For Command Messages** (menu, help, numbers):
   - Uses user's saved locale preference
   - No detection needed

2. **For Natural Language Messages**:
   - Detects language from message text
   - Updates locale if user consistently uses different language
   - Responds in detected language

3. **Consistency Check**:
   - Checks last 3 messages
   - Updates locale if 2+ messages in same language
   - Prevents switching on one-off messages

## Performance Optimizations

1. **Translation Caching**:
   - Caches translations to avoid repeated API calls
   - Limits cache size to 500 entries
   - Uses LRU-style eviction

2. **Language Detection Caching**:
   - Caches language detection results
   - Limits cache size to 200 entries
   - Reduces API calls for similar messages

3. **Smart Detection**:
   - Only detects for non-command messages
   - Skips detection for very short messages (< 3 chars)
   - Uses cached results when available

## Configuration

### Environment Variables

- `OPENAI_API_KEY` - Required for language detection and translation
- If not set, system defaults to English

### Supported Languages

The system supports detection and translation for:
- English (en)
- Français (fr)
- Kiswahili (sw)
- Español (es)
- Português (pt)
- العربية (ar)
- Hindi (hi)
- Chinese (zh)
- German (de)
- Italian (it)
- Russian (ru)
- Japanese (ja)
- Korean (ko)
- Dutch (nl)
- Polish (pl)
- Turkish (tr)
- Vietnamese (vi)

## Error Handling

- If language detection fails → Defaults to English
- If translation fails → Returns original text
- If API key missing → Disables translation, uses English
- All errors are logged but don't break the flow

## Testing

To test the system:

1. **Send message in different language**:
   ```
   User: "Hola, ¿cómo estás?"
   Expected: System responds in Spanish
   ```

2. **Switch languages mid-conversation**:
   ```
   User: "Hello"
   System: "Hello! How can I help?"
   User: "Bonjour"
   System: "Bonjour! Comment puis-je vous aider?"
   ```

3. **Check locale update**:
   ```
   User sends 3 messages in French
   Expected: User locale updated to 'fr'
   ```

## Future Enhancements

- Add more languages
- Improve detection accuracy
- Add language preference in settings
- Support regional dialects
- Add translation quality metrics

## Files Modified

- `backend/src/services/translation/index.js` (NEW)
- `backend/src/services/whatsapp/templateTranslator.js` (NEW)
- `backend/src/services/whatsapp/handler.js` (UPDATED)
- `backend/src/services/aiAgent/index.js` (UPDATED)
- `backend/src/services/notifications/scheduler.js` (UPDATED)

## Notes

- Language detection uses OpenAI GPT-4o-mini for accuracy
- Translations preserve all formatting, emojis, and structure
- System learns from user behavior and updates locale automatically
- Works seamlessly with existing menu system and AI agent

---

**Last Updated**: December 19, 2024  
**Version**: 1.0.0  
**Status**: Active

