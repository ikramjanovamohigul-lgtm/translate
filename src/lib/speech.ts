import { SupportedLanguage } from '../types.ts';

// Text-to-Speech (SpeechSynthesis)
class TextToSpeechService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isVoicesLoaded = false;

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
    this.voices = this.synth.getVoices();
    if (this.voices.length > 0) {
      this.isVoicesLoaded = true;
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getBestVoiceForLanguage(lang: SupportedLanguage): SpeechSynthesisVoice | null {
    if (!this.isVoicesLoaded) {
      this.loadVoices();
    }

    if (lang === 'English') {
      const enVoice =
        this.voices.find((v) => v.lang === 'en-US') ||
        this.voices.find((v) => v.lang === 'en-GB') ||
        this.voices.find((v) => v.lang.toLowerCase().startsWith('en'));
      return enVoice || null;
    }

    if (lang === 'Russian') {
      const ruVoice =
        this.voices.find((v) => v.lang === 'ru-RU') ||
        this.voices.find((v) => v.lang.toLowerCase().startsWith('ru'));
      return ruVoice || null;
    }

    if (lang === 'Uzbek') {
      const uzVoice =
        this.voices.find((v) => v.lang === 'uz-UZ') ||
        this.voices.find((v) => v.lang.toLowerCase().startsWith('uz'));
      return uzVoice || null;
    }

    return null;
  }

  public speak(
    text: string,
    lang: SupportedLanguage,
    onStart: () => void,
    onEnd: () => void,
    onError: (errMsg: string) => void,
    onFallbackWarning?: (warning: string) => void
  ) {
    if (!this.synth) {
      onError('Text-to-speech is not supported in this browser.');
      return;
    }

    // Cancel any previous utterances
    this.synth.cancel();

    if (!text.trim()) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = this.getBestVoiceForLanguage(lang);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      if (lang === 'English') utterance.lang = 'en-US';
      else if (lang === 'Russian') utterance.lang = 'ru-RU';
      else if (lang === 'Uzbek') {
        utterance.lang = 'uz-UZ';
        if (onFallbackWarning) {
          onFallbackWarning(
            'Notice: Your browser/device does not have a native Uzbek voice installed. System default voice will be used.'
          );
        }
      }
    }

    utterance.rate = 0.95; // Slightly clearer rate for comprehension
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      onStart();
    };

    utterance.onend = () => {
      onEnd();
    };

    utterance.onerror = (e) => {
      // If manually canceled by user, don't trigger error
      if (e.error === 'canceled' || e.error === 'interrupted') {
        onEnd();
        return;
      }
      onError(`Speech playback error (${e.error || 'unknown'}).`);
      onEnd();
    };

    try {
      this.synth.speak(utterance);
    } catch (err: any) {
      onError(err?.message || 'Failed to start speech.');
      onEnd();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const ttsService = new TextToSpeechService();

// Speech-to-Text (SpeechRecognition)
export interface SpeechRecognitionHandlers {
  onResult: (transcript: string) => void;
  onStart: () => void;
  onEnd: () => void;
  onError: (errorMessage: string) => void;
}

export class SpeechToTextService {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(
      typeof window !== 'undefined' &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  }

  public startListening(lang: SupportedLanguage, handlers: SpeechRecognitionHandlers) {
    if (!this.recognition) {
      handlers.onError('Speech recognition is not supported in this browser. (Use Chrome or Edge for voice input)');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    // Assign language
    if (lang === 'English') {
      this.recognition.lang = 'en-US';
    } else if (lang === 'Russian') {
      this.recognition.lang = 'ru-RU';
    } else if (lang === 'Uzbek') {
      this.recognition.lang = 'uz-UZ';
    }

    let finalTranscript = '';

    this.recognition.onstart = () => {
      this.isListening = true;
      handlers.onStart();
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }
      handlers.onResult(finalTranscript || interim);
    };

    this.recognition.onerror = (event: any) => {
      let message = 'Microphone speech recognition error.';
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        message = 'Microphone permission was denied. Please allow microphone access in your browser.';
      } else if (event.error === 'no-speech') {
        message = 'No speech detected. Please speak clearly into your microphone.';
      } else if (event.error === 'language-not-supported') {
        message = `Voice recognition for ${lang} is not supported by your current browser.`;
      }
      handlers.onError(message);
      this.isListening = false;
      handlers.onEnd();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      handlers.onEnd();
    };

    try {
      this.recognition.start();
    } catch (err: any) {
      handlers.onError(err?.message || 'Could not access microphone.');
      this.isListening = false;
      handlers.onEnd();
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.isListening = false;
    }
  }
}

export const sttService = new SpeechToTextService();
