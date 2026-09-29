import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// In-memory cache to save API quota and provide instant responses for repeated phrases
const translationCache = new Map<string, string>();

// Fallback dictionary for common phrases, greetings, questions, and sentences
const COMMON_DICTIONARY: Record<string, Record<string, string>> = {
  // English inputs
  'hello, how are you?': {
    Uzbek: 'Salom, qalaysiz?',
    Russian: 'Привет, как дела?',
  },
  'hello how are you': {
    Uzbek: 'Salom, qalaysiz?',
    Russian: 'Привет, как дела?',
  },
  'hello': {
    Uzbek: 'Salom',
    Russian: 'Привет',
  },
  'hi': {
    Uzbek: 'Salom',
    Russian: 'Привет',
  },
  'how are you?': {
    Uzbek: 'Qalaysiz?',
    Russian: 'Как дела?',
  },
  'how are you': {
    Uzbek: 'Qalaysiz?',
    Russian: 'Как дела?',
  },
  'good morning': {
    Uzbek: 'Xayrli tong',
    Russian: 'Доброе утро',
  },
  'good afternoon': {
    Uzbek: 'Xayrli kun',
    Russian: 'Добрый день',
  },
  'good evening': {
    Uzbek: 'Xayrli kech',
    Russian: 'Добрый вечер',
  },
  'good night': {
    Uzbek: 'Xayrli tun',
    Russian: 'Спокойной ночи',
  },
  'thank you': {
    Uzbek: 'Rahmat',
    Russian: 'Спасибо',
  },
  'thank you very much': {
    Uzbek: 'Katta rahmat',
    Russian: 'Большое спасибо',
  },
  'what is your name?': {
    Uzbek: 'Ismingiz nima?',
    Russian: 'Как тебя зовут?',
  },
  'what is your name': {
    Uzbek: 'Ismingiz nima?',
    Russian: 'Как тебя зовут?',
  },
  'my name is': {
    Uzbek: 'Mening ismim',
    Russian: 'Меня зовут',
  },
  'i am going to school.': {
    Uzbek: 'Men maktabga boryapman.',
    Russian: 'Я иду в школу.',
  },
  'i am going to school': {
    Uzbek: 'Men maktabga boryapman.',
    Russian: 'Я иду в школу.',
  },
  'where are you from?': {
    Uzbek: 'Qayerdansiz?',
    Russian: 'Откуда вы?',
  },
  'see you later': {
    Uzbek: 'Ko‘rishguncha',
    Russian: 'До встречи',
  },
  'goodbye': {
    Uzbek: 'Xayr',
    Russian: 'До свидания',
  },
  'welcome': {
    Uzbek: 'Xush kelibsiz',
    Russian: 'Добро пожаловать',
  },
  'yes': {
    Uzbek: 'Ha',
    Russian: 'Да',
  },
  'no': {
    Uzbek: 'Yo‘q',
    Russian: 'Нет',
  },
  'please': {
    Uzbek: 'Iltimos',
    Russian: 'Пожалуйста',
  },
  'i love learning languages.': {
    Uzbek: 'Men tillarni o‘rganishni yaxshi ko‘raman.',
    Russian: 'Я люблю учить языки.',
  },
  'i love learning languages': {
    Uzbek: 'Men tillarni o‘rganishni yaxshi ko‘raman.',
    Russian: 'Я люблю учить языки.',
  },

  // Uzbek inputs
  'men maktabga boryapman.': {
    Russian: 'Я иду в школу.',
    English: 'I am going to school.',
  },
  'men maktabga boryapman': {
    Russian: 'Я иду в школу.',
    English: 'I am going to school.',
  },
  'salom, qalaysiz?': {
    English: 'Hello, how are you?',
    Russian: 'Привет, как дела?',
  },
  'salom qalaysiz': {
    English: 'Hello, how are you?',
    Russian: 'Привет, как дела?',
  },
  'ismingiz nima?': {
    English: 'What is your name?',
    Russian: 'Как тебя зовут?',
  },
  'ismingiz nima': {
    English: 'What is your name?',
    Russian: 'Как тебя зовут?',
  },
  'salom': {
    English: 'Hello',
    Russian: 'Привет',
  },
  'qalaysiz?': {
    English: 'How are you?',
    Russian: 'Как дела?',
  },
  'qalaysiz': {
    English: 'How are you?',
    Russian: 'Как дела?',
  },
  'xayrli tong': {
    English: 'Good morning',
    Russian: 'Доброе утро',
  },
  'xayrli kun': {
    English: 'Good afternoon',
    Russian: 'Добрый день',
  },
  'xayrli kech': {
    English: 'Good evening',
    Russian: 'Добрый вечер',
  },
  'xayrli tun': {
    English: 'Good night',
    Russian: 'Спокойной ночи',
  },
  'rahmat': {
    English: 'Thank you',
    Russian: 'Спасибо',
  },
  'katta rahmat': {
    English: 'Thank you very much',
    Russian: 'Большое спасибо',
  },
  'xayr': {
    English: 'Goodbye',
    Russian: 'До свидания',
  },
  'ha': {
    English: 'Yes',
    Russian: 'Да',
  },
  'yo‘q': {
    English: 'No',
    Russian: 'Нет',
  },
  'yoq': {
    English: 'No',
    Russian: 'Нет',
  },
  'iltimos': {
    English: 'Please',
    Russian: 'Пожалуйста',
  },

  // Russian inputs
  'как тебя зовут?': {
    English: 'What is your name?',
    Uzbek: 'Ismingiz nima?',
  },
  'как тебя зовут': {
    English: 'What is your name?',
    Uzbek: 'Ismingiz nima?',
  },
  'как вас зовут?': {
    English: 'What is your name?',
    Uzbek: 'Ismingiz nima?',
  },
  'я иду в школу.': {
    English: 'I am going to school.',
    Uzbek: 'Men maktabga boryapman.',
  },
  'я иду в школу': {
    English: 'I am going to school.',
    Uzbek: 'Men maktabga boryapman.',
  },
  'привет, как дела?': {
    English: 'Hello, how are you?',
    Uzbek: 'Salom, qalaysiz?',
  },
  'привет как дела': {
    English: 'Hello, how are you?',
    Uzbek: 'Salom, qalaysiz?',
  },
  'привет': {
    English: 'Hello',
    Uzbek: 'Salom',
  },
  'как дела?': {
    English: 'How are you?',
    Uzbek: 'Qalaysiz?',
  },
  'как дела': {
    English: 'How are you?',
    Uzbek: 'Qalaysiz?',
  },
  'доброе утро': {
    English: 'Good morning',
    Uzbek: 'Xayrli tong',
  },
  'добрый день': {
    English: 'Good afternoon',
    Uzbek: 'Xayrli kun',
  },
  'добрый вечер': {
    English: 'Good evening',
    Uzbek: 'Xayrli kech',
  },
  'спокойной ночи': {
    English: 'Good night',
    Uzbek: 'Xayrli tun',
  },
  'спасибо': {
    English: 'Thank you',
    Uzbek: 'Rahmat',
  },
  'большое спасибо': {
    English: 'Thank you very much',
    Uzbek: 'Katta rahmat',
  },
  'до свидания': {
    English: 'Goodbye',
    Uzbek: 'Xayr',
  },
  'до встречи': {
    English: 'See you later',
    Uzbek: 'Ko‘rishguncha',
  },
  'да': {
    English: 'Yes',
    Uzbek: 'Ha',
  },
  'нет': {
    English: 'No',
    Uzbek: 'Yo‘q',
  },
  'пожалуйста': {
    English: 'Please',
    Uzbek: 'Iltimos',
  },
};

export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) {
    return '';
  }

  if (sourceLanguage === targetLanguage) {
    return trimmed;
  }

  const cacheKey = `${sourceLanguage}:${targetLanguage}:${trimmed.toLowerCase()}`;

  // 1. Check in-memory cache
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // 2. Check offline dictionary for instant match
  const normalized = trimmed.toLowerCase();
  if (COMMON_DICTIONARY[normalized] && COMMON_DICTIONARY[normalized][targetLanguage]) {
    const cached = COMMON_DICTIONARY[normalized][targetLanguage];
    translationCache.set(cacheKey, cached);
    return cached;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    if (COMMON_DICTIONARY[normalized] && COMMON_DICTIONARY[normalized][targetLanguage]) {
      return COMMON_DICTIONARY[normalized][targetLanguage];
    }
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const systemInstruction = `You are a professional, expert linguist and native-level translator specializing in English, Russian, and Uzbek languages.
Translate the text from ${sourceLanguage} to ${targetLanguage}.

STRICT REQUIREMENTS:
1. Provide a natural, fluent, and idiomatically accurate translation that sounds like a native speaker of ${targetLanguage}.
2. Preserve original meaning, tone, emotion, formality, and punctuation.
3. For Uzbek (O‘zbekcha): Use modern Latin script (lotin yozuvi) with standard characters (o‘, g‘, sh, ch, etc.) with grammatical correctness, natural suffix agglutination, and correct word order.
4. For Russian (Русский): Use grammatically correct contemporary Russian with appropriate declensions, cases, and gender agreements.
5. For English: Use natural English phrasing, correct tense, and active/passive voice as fits context.
6. OUTPUT ONLY THE TRANSLATED TEXT. Do NOT provide quotes, introductory remarks, pronunciation guides, notes, or explanations.`;

  // Multi-tier model fallback: primary model 'gemini-3.8-flash', fallback to 'gemini-3.1-flash-lite'
  // This completely solves 429 quota exhaustion or 503 high demand spikes
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: trimmed,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      const translated = response.text?.trim();
      if (translated) {
        // Cache result for instant future lookups
        translationCache.set(cacheKey, translated);
        // Limit cache size to prevent memory bloat
        if (translationCache.size > 1000) {
          const firstKey = translationCache.keys().next().value;
          if (firstKey) translationCache.delete(firstKey);
        }
        return translated;
      }
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.code;
      const message = err?.message || '';

      // If it's 429 (quota/rate-limit) or 503 (high demand) or 404, try the next model
      const shouldFallback =
        status === 429 ||
        status === 503 ||
        status === 404 ||
        message.includes('429') ||
        message.includes('quota') ||
        message.includes('RESOURCE_EXHAUSTED') ||
        message.includes('503') ||
        message.includes('high demand') ||
        message.includes('overloaded');

      if (shouldFallback) {
        continue;
      }
      break;
    }
  }

  // 3. Fallback dictionary check (in case punctuation variations exist)
  const stripped = normalized.replace(/[.?!,]/g, '').trim();
  if (COMMON_DICTIONARY[stripped] && COMMON_DICTIONARY[stripped][targetLanguage]) {
    const fallbackRes = COMMON_DICTIONARY[stripped][targetLanguage];
    translationCache.set(cacheKey, fallbackRes);
    return fallbackRes;
  }

  const cleanMessage =
    lastError?.message?.includes('quota') || lastError?.message?.includes('RESOURCE_EXHAUSTED')
      ? 'The AI model quota is temporarily busy. Please wait a moment and try again.'
      : lastError?.message || 'Translation failed. Please try again.';

  throw new Error(cleanMessage);
}
