import { SupportedLanguage } from '../types.ts';

// Text-to-Speech (SpeechSynthesis / Tinglash)
class TextToSpeechService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isVoicesLoaded = false;
  // Retain utterance reference to prevent Chrome garbage-collection cancellation bug
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    try {
      this.voices = this.synth.getVoices() || [];
      if (this.voices.length > 0) {
        this.isVoicesLoaded = true;
      }
    } catch {
      // ignore
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getBestVoiceForLanguage(lang: SupportedLanguage): { voice: SpeechSynthesisVoice | null; langCode: string } {
    if (!this.isVoicesLoaded) {
      this.loadVoices();
    }

    if (lang === 'English') {
      const enVoice =
        this.voices.find((v) => v.lang === 'en-US') ||
        this.voices.find((v) => v.lang === 'en-GB') ||
        this.voices.find((v) => v.lang.toLowerCase().startsWith('en'));
      return { voice: enVoice || null, langCode: enVoice?.lang || 'en-US' };
    }

    if (lang === 'Russian') {
      const ruVoice =
        this.voices.find((v) => v.lang === 'ru-RU') ||
        this.voices.find((v) => v.lang.toLowerCase().startsWith('ru'));
      return { voice: ruVoice || null, langCode: ruVoice?.lang || 'ru-RU' };
    }

    if (lang === 'Uzbek') {
      // 1. Check for dedicated Uzbek voice
      const uzVoice =
        this.voices.find((v) => v.lang.toLowerCase().startsWith('uz')) ||
        this.voices.find((v) => v.name.toLowerCase().includes('uzbek'));
      if (uzVoice) {
        return { voice: uzVoice, langCode: uzVoice.lang };
      }

      // 2. Turkish (tr-TR) shares closely related Turkic Latin phonetics (a, o, u, i, e, sh, ch)
      const trVoice = this.voices.find((v) => v.lang.toLowerCase().startsWith('tr'));
      if (trVoice) {
        return { voice: trVoice, langCode: trVoice.lang };
      }

      // 3. Fallback to system default voice so audio never fails to play
      const defaultVoice = this.voices.find((v) => v.default) || this.voices[0] || null;
      return { voice: defaultVoice, langCode: defaultVoice?.lang || 'en-US' };
    }

    const defaultVoice = this.voices.find((v) => v.default) || this.voices[0] || null;
    return { voice: defaultVoice, langCode: defaultVoice?.lang || 'en-US' };
  }

  public speak(
    text: string,
    lang: SupportedLanguage,
    onStart: () => void,
    onEnd: () => void,
    onError: (errMsg: string) => void
  ) {
    if (!this.synth) {
      onError('Text-to-speech is not supported in this browser.');
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    try {
      // Chrome audio context unpause fix
      if (this.synth.paused) {
        this.synth.resume();
      }
      this.synth.cancel();

      const { voice, langCode } = this.getBestVoiceForLanguage(lang);
      const utterance = new SpeechSynthesisUtterance(trimmed);
      this.currentUtterance = utterance;

      if (voice) {
        utterance.voice = voice;
      }
      utterance.lang = langCode;
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        onStart();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        onEnd();
      };

      utterance.onerror = (e: any) => {
        this.currentUtterance = null;
        if (e.error === 'canceled' || e.error === 'interrupted') {
          onEnd();
          return;
        }
        onError('Audio playback could not be started.');
        onEnd();
      };

      this.synth.speak(utterance);

      // Chrome timeout watchdog: Chrome sometimes pauses utterances after 10-15s
      const timer = setInterval(() => {
        if (!this.synth || !this.currentUtterance) {
          clearInterval(timer);
          return;
        }
        if (this.synth.speaking && this.synth.paused) {
          this.synth.resume();
        }
      }, 5000);
    } catch (err: any) {
      onError(err?.message || 'Failed to start speech.');
      onEnd();
    }
  }

  public stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }
    this.currentUtterance = null;
  }
}

export const ttsService = new TextToSpeechService();

// Speech-to-Text (Microphone / Ovoz kiritish)
export interface SpeechRecognitionHandlers {
  onResult: (transcript: string) => void;
  onStart: () => void;
  onEnd: () => void;
  onError: (errorMessage: string) => void;
}

export class SpeechToTextService {
  private recognition: any = null;
  private isListening = false;
  private isManuallyStopped = false;

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  public startListening(lang: SupportedLanguage, handlers: SpeechRecognitionHandlers) {
    const SpeechRecognitionClass =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognitionClass) {
      handlers.onError('Brauzeringiz ovozli kiritishni (microphone) qo‘llab-quvvatlamaydi. Iltimos Google Chrome yoki Microsoft Edge brauzeridan foydalaning.');
      return;
    }

    // Stop any existing session
    if (this.isListening) {
      this.stopListening();
    }

    this.isManuallyStopped = false;

    try {
      const recognition = new SpeechRecognitionClass();
      this.recognition = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Assign primary language code
      if (lang === 'English') {
        recognition.lang = 'en-US';
      } else if (lang === 'Russian') {
        recognition.lang = 'ru-RU';
      } else if (lang === 'Uzbek') {
        // Uzbek standard code is uz-UZ
        recognition.lang = 'uz-UZ';
      }

      let accumulated = '';

      recognition.onstart = () => {
        this.isListening = true;
        handlers.onStart();
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const text = item[0].transcript;
          if (item.isFinal) {
            accumulated += (accumulated ? ' ' : '') + text.trim();
          } else {
            interim += text;
          }
        }

        const combined = (accumulated + (interim ? ' ' + interim : '')).trim();
        if (combined) {
          handlers.onResult(combined);
        }
      };

      recognition.onerror = (event: any) => {
        if (this.isManuallyStopped) {
          return;
        }

        const err = event?.error;
        let message = 'Mikrofon orqali ovozni aniqlashda xatolik yuz berdi.';

        if (err === 'not-allowed' || err === 'service-not-allowed') {
          message = 'Mikrofon ruxsati berilmadi. Iltimos, brauzer qatoridagi qulf belgisini bosib, mikrofon (Microphone)ga ruxsat bering.';
        } else if (err === 'no-speech') {
          message = 'Ovoz eshitilmadi. Iltimos, mikrofonga yaqinroq va aniqroq gapiring.';
        } else if (err === 'audio-capture') {
          message = 'Mikrofon topilmadi. Qurilmangizga mikrofon ulanganligini tekshiring.';
        } else if (err === 'network') {
          message = 'Tarmoq xatosi. Internet aloqasini tekshiring.';
        } else if (err === 'language-not-supported') {
          // If uz-UZ is not supported by Chrome server in this region, notify or fallback
          message = `${lang} tili uchun ovozni aniqlash ushbu brauzerda mavjud emas. Rus yoki Ingliz tillarini sinab ko'rishingiz mumkin.`;
        }

        handlers.onError(message);
        this.isListening = false;
        handlers.onEnd();
      };

      recognition.onend = () => {
        this.isListening = false;
        handlers.onEnd();
      };

      recognition.start();
    } catch (err: any) {
      handlers.onError(err?.message || 'Mikrofonni ishga tushirib bo‘lmadi.');
      this.isListening = false;
      handlers.onEnd();
    }
  }

  public stopListening() {
    this.isManuallyStopped = true;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        try {
          this.recognition.abort();
        } catch {
          // ignore
        }
      }
      this.recognition = null;
    }
    this.isListening = false;
  }
}

export const sttService = new SpeechToTextService();
