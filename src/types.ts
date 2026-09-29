export type SupportedLanguage = 'English' | 'Russian' | 'Uzbek';

export interface LanguageOption {
  code: string;
  name: SupportedLanguage;
  nativeName: string;
  flag: string;
  speechCode: string;
  speechRecognitionCode: string;
}

export const LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    speechCode: 'en-US',
    speechRecognitionCode: 'en-US',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    speechCode: 'ru-RU',
    speechRecognitionCode: 'ru-RU',
  },
  {
    code: 'uz',
    name: 'Uzbek',
    nativeName: 'O‘zbekcha',
    flag: '🇺🇿',
    speechCode: 'uz-UZ',
    speechRecognitionCode: 'uz-UZ',
  },
];

export interface HistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: SupportedLanguage;
  targetLang: SupportedLanguage;
  timestamp: number;
}
