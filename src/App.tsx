/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowUpDown,
  Volume2,
  Square,
  Mic,
  MicOff,
  Copy,
  Check,
  X,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { SupportedLanguage, HistoryItem } from './types.ts';
import { Header } from './components/Header.tsx';
import { LanguageDropdown } from './components/LanguageDropdown.tsx';
import { AudioWaveIndicator } from './components/AudioWaveIndicator.tsx';
import { HistorySection } from './components/HistorySection.tsx';
import { PresetChips } from './components/PresetChips.tsx';
import { EntranceScreen } from './components/EntranceScreen.tsx';
import { WordGame } from './components/WordGame.tsx';
import { ttsService, sttService } from './lib/speech.ts';

const MAX_CHARS = 5000;
const HISTORY_STORAGE_KEY = 'ai_translator_history_v1';
const THEME_STORAGE_KEY = 'ai_translator_theme_v1';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved !== null) {
        return saved === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Language selection state
  const [sourceLang, setSourceLang] = useState<SupportedLanguage>('English');
  const [targetLang, setTargetLang] = useState<SupportedLanguage>('Uzbek');

  // Input & Output text states
  const [inputText, setInputText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');

  // Status states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Audio & Speech states
  const [speakingWhich, setSpeakingWhich] = useState<'source' | 'target' | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);

  // App View & Entrance Screen states
  const [showEntrance, setShowEntrance] = useState<boolean>(() => {
    // Show entrance modal on first visit in session
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('ilmhub_visited') !== 'true';
      } catch {
        return true;
      }
    }
    return true;
  });
  const [activeTab, setActiveTab] = useState<'translator' | 'game'>('translator');

  const isSpeakingSource = speakingWhich === 'source';
  const isSpeakingTarget = speakingWhich === 'target';
  const isSpeaking = speakingWhich !== null;

  // History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore parse error
      }
    }
    return [];
  });

  // Refs for tracking translation requests & debouncing
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSwappingRef = useRef<boolean>(false);
  const latestTranslatedRef = useRef<string>('');
  const initialSpeechPrefixRef = useRef<string>('');

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  }, [darkMode]);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Clean up speech synthesis & speech recognition on unmount
  useEffect(() => {
    return () => {
      ttsService.stop();
      sttService.stopListening();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // In-memory client cache to instantly show translations for already-seen inputs
  const clientCacheRef = useRef<Map<string, string>>(new Map());

  // Main translation execution function
  const executeTranslation = useCallback(
    async (textToTranslate: string, src: SupportedLanguage, tgt: SupportedLanguage, manualTrigger = false) => {
      const trimmed = textToTranslate.trim();

      if (!trimmed) {
        setTranslatedText('');
        setIsLoading(false);
        if (manualTrigger) {
          setErrorMessage('Please enter some text.');
          setTimeout(() => setErrorMessage(null), 3500);
        }
        return;
      }

      // If source and target are the same, translation is identical
      if (src === tgt) {
        setTranslatedText(trimmed);
        setIsLoading(false);
        return;
      }

      const cacheKey = `${src}:${tgt}:${trimmed.toLowerCase()}`;
      if (clientCacheRef.current.has(cacheKey)) {
        setTranslatedText(clientCacheRef.current.get(cacheKey)!);
        setIsLoading(false);
        setErrorMessage(null);
        return;
      }

      // Abort previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: trimmed,
            sourceLanguage: src,
            targetLanguage: tgt,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          throw new Error(errData?.error || 'Translation failed. Please try again.');
        }

        const data = await response.json();
        const result = (data.translation || '').trim();

        if (result) {
          clientCacheRef.current.set(cacheKey, result);
        }

        setTranslatedText(result);
        latestTranslatedRef.current = result;

        // Add to history (only if meaningful and not a duplicate of latest entry)
        if (result && trimmed.length >= 2) {
          setHistory((prev) => {
            const isDuplicate =
              prev.length > 0 &&
              prev[0].sourceText === trimmed &&
              prev[0].translatedText === result &&
              prev[0].sourceLang === src &&
              prev[0].targetLang === tgt;

            if (isDuplicate) return prev;

            const newItem: HistoryItem = {
              id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
              sourceText: trimmed,
              translatedText: result,
              sourceLang: src,
              targetLang: tgt,
              timestamp: Date.now(),
            };

            // Keep max 40 entries
            return [newItem, ...prev.slice(0, 39)];
          });
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // Ignored because request was aborted for a newer input
          return;
        }
        console.error('Translation error:', err);
        setErrorMessage(err?.message || 'Translation failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Debounced auto-translation when input text changes
  useEffect(() => {
    if (isSwappingRef.current) {
      isSwappingRef.current = false;
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!inputText.trim()) {
      setTranslatedText('');
      setIsLoading(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      executeTranslation(inputText, sourceLang, targetLang, false);
    }, 800);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputText, sourceLang, targetLang, executeTranslation]);

  // Handle Manual Translate button click
  const handleTranslateClick = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    executeTranslation(inputText, sourceLang, targetLang, true);
  };

  // Handle Swap Languages
  const handleSwapLanguages = () => {
    // Stop any active speech before swapping
    ttsService.stop();
    setSpeakingWhich(null);

    isSwappingRef.current = true;
    const oldSource = sourceLang;
    const oldTarget = targetLang;
    const oldInput = inputText;
    const oldTranslated = translatedText;

    setSourceLang(oldTarget);
    setTargetLang(oldSource);

    // Swap text content: new top box gets current translated text
    if (oldTranslated) {
      setInputText(oldTranslated);
      setTranslatedText(oldInput);
      // Immediately run translation in the new direction
      executeTranslation(oldTranslated, oldTarget, oldSource, false);
    } else {
      setInputText('');
      setTranslatedText('');
    }
  };

  // Clear button handler
  const handleClear = () => {
    ttsService.stop();
    sttService.stopListening();
    setSpeakingWhich(null);
    setIsListening(false);
    setInputText('');
    setTranslatedText('');
    setErrorMessage(null);
  };

  // Copy button handler
  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Text-To-Speech (Speaker 🔊) handler for Source Text
  const handleToggleSpeechSource = () => {
    if (speakingWhich === 'source') {
      ttsService.stop();
      setSpeakingWhich(null);
      return;
    }

    if (!inputText.trim()) return;

    ttsService.stop();
    ttsService.speak(
      inputText,
      sourceLang,
      () => setSpeakingWhich('source'),
      () => setSpeakingWhich(null),
      (errMsg) => {
        setSpeakingWhich(null);
        setInfoMessage(errMsg);
        setTimeout(() => setInfoMessage(null), 4000);
      }
    );
  };

  // Text-To-Speech (Speaker 🔊) handler for Translated Text
  const handleToggleSpeechTarget = () => {
    if (speakingWhich === 'target') {
      ttsService.stop();
      setSpeakingWhich(null);
      return;
    }

    if (!translatedText.trim()) return;

    ttsService.stop();
    ttsService.speak(
      translatedText,
      targetLang,
      () => setSpeakingWhich('target'),
      () => setSpeakingWhich(null),
      (errMsg) => {
        setSpeakingWhich(null);
        setInfoMessage(errMsg);
        setTimeout(() => setInfoMessage(null), 4000);
      }
    );
  };

  // Voice Input (Microphone 🎤) handler
  const handleToggleVoiceInput = () => {
    if (isListening) {
      sttService.stopListening();
      setIsListening(false);
      return;
    }

    if (!sttService.isSupported()) {
      setInfoMessage(
        'Brauzeringiz ovozli kiritishni (microphone) qo‘llab-quvvatlamaydi. Iltimos Google Chrome yoki Microsoft Edge brauzeridan foydalaning.'
      );
      setTimeout(() => setInfoMessage(null), 6000);
      return;
    }

    // Stop speaking if currently active
    ttsService.stop();
    setSpeakingWhich(null);

    // Capture any existing text prefix so new speech appends naturally
    const current = inputText.trim();
    initialSpeechPrefixRef.current = current ? current + ' ' : '';

    sttService.startListening(sourceLang, {
      onStart: () => {
        setIsListening(true);
        setInfoMessage(null);
      },
      onResult: (transcript) => {
        const full = (initialSpeechPrefixRef.current + transcript).slice(0, MAX_CHARS);
        setInputText(full);
      },
      onEnd: () => {
        setIsListening(false);
      },
      onError: (errMsg) => {
        setIsListening(false);
        setInfoMessage(errMsg);
        setTimeout(() => setInfoMessage(null), 6000);
      },
    });
  };

  // Restore item from history
  const handleRestoreHistory = (item: HistoryItem) => {
    ttsService.stop();
    setSpeakingWhich(null);
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setInputText(item.sourceText);
    setTranslatedText(item.translatedText);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear entire history
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Delete single history item
  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      {/* Welcome / Entrance Splash Screen */}
      {showEntrance && (
        <EntranceScreen
          onEnterApp={() => {
            setShowEntrance(false);
            try {
              sessionStorage.setItem('ilmhub_visited', 'true');
            } catch {
              // ignore
            }
          }}
          onEnterGame={() => {
            setShowEntrance(false);
            setActiveTab('game');
            try {
              sessionStorage.setItem('ilmhub_visited', 'true');
            } catch {
              // ignore
            }
          }}
        />
      )}

      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="animate-entrance-down">
          <Header
            darkMode={darkMode}
            onToggleTheme={() => setDarkMode(!darkMode)}
            activeTab={activeTab}
            onSelectTab={(tab) => {
              ttsService.stop();
              setSpeakingWhich(null);
              setActiveTab(tab);
            }}
            onOpenEntrance={() => setShowEntrance(true)}
          />
        </div>

        {activeTab === 'game' ? (
          /* ================= LANGUAGE LEARNING GAME ================= */
          <WordGame onBackToTranslator={() => setActiveTab('translator')} />
        ) : (
          /* ================= MAIN TRANSLATOR INTERFACE ================= */
          <>
            {/* Quick Example Presets */}
            <div className="animate-entrance-up delay-100">
              <PresetChips
                onSelect={(preset) => {
                  ttsService.stop();
                  setSpeakingWhich(null);
                  setSourceLang(preset.sourceLang);
                  setTargetLang(preset.targetLang);
                  setInputText(preset.sourceText);
                  executeTranslation(preset.sourceText, preset.sourceLang, preset.targetLang, false);
                }}
              />
            </div>

            {/* Alerts & Notifications */}
            {infoMessage && (
              <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm flex items-center justify-between shadow-xs animate-entrance-down">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>{infoMessage}</span>
                </div>
                <button
                  onClick={() => setInfoMessage(null)}
                  className="text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-100 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm flex items-center justify-between shadow-xs animate-entrance-down">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-600 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-100 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* MAIN INTERFACE: TWO LARGE RECTANGULAR TRANSLATION BOXES ARRANGED VERTICALLY */}
            <div className="flex flex-col gap-3">
              {/* ================= TOP BOX (INPUT) ================= */}
              <div className="animate-entrance-up delay-150 relative w-full rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all p-5 flex flex-col justify-between min-h-[220px]">
                {/* Box Header: Top-right corner Language Selector */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    <span>Source Text</span>
                    {isListening && (
                      <AudioWaveIndicator color="bg-rose-500" label="Listening..." />
                    )}
                    {isSpeakingSource && (
                      <AudioWaveIndicator color="bg-blue-500" label="Speaking..." />
                    )}
                  </div>

                  {/* Language Selector in the TOP-RIGHT corner of the box */}
                  <div className="flex items-center gap-2">
                    <LanguageDropdown
                      selectedLanguage={sourceLang}
                      onChange={(newLang) => {
                        if (newLang === targetLang) {
                          // auto swap if user selects same language
                          handleSwapLanguages();
                        } else {
                          setSourceLang(newLang);
                        }
                      }}
                      otherSelectedLanguage={targetLang}
                    />
                  </div>
                </div>

                {/* Large Text Input Area */}
                <div className="my-3 flex-1 flex flex-col">
                  <textarea
                    value={inputText}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_CHARS) {
                        setInputText(e.target.value);
                      }
                    }}
                    placeholder="Type or speak your text here..."
                    rows={4}
                    className="w-full h-full min-h-[100px] resize-none bg-transparent text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 text-lg sm:text-xl font-normal leading-relaxed focus:outline-none"
                  />
                </div>

                {/* Listening Live Status */}
                {isListening && (
                  <div className="mb-2 py-1.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                      <span>Listening in <strong>{sourceLang}</strong>... Speak into your microphone</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleVoiceInput}
                      className="font-semibold text-rose-800 dark:text-rose-200 hover:underline cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                )}

                {/* Bottom Actions of Top Box: Microphone, Speaker, Clear & Character Count */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    {/* Microphone Button 🎤 */}
                    <button
                      type="button"
                      onClick={handleToggleVoiceInput}
                      title={isListening ? 'Stop listening' : 'Start voice input (Speak)'}
                      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                      className={`relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isListening
                          ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/30 ring-2 ring-rose-400 animate-pulse'
                          : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {isListening ? (
                        <MicOff className="w-5 h-5" />
                      ) : (
                        <Mic className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </button>

                    {/* Speaker Button 🔊 for Source Text */}
                    <button
                      type="button"
                      onClick={handleToggleSpeechSource}
                      disabled={!inputText.trim()}
                      title={isSpeakingSource ? 'Stop speech' : `Listen in ${sourceLang}`}
                      aria-label={isSpeakingSource ? 'Stop speech' : `Listen in ${sourceLang}`}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSpeakingSource
                          ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-400 animate-pulse'
                          : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      <Volume2 className={`w-5 h-5 ${isSpeakingSource ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                    </button>

                    {/* Clear Button */}
                    {inputText && (
                      <button
                        type="button"
                        onClick={handleClear}
                        title="Clear input"
                        aria-label="Clear input"
                        className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Character Counter */}
                  <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                    {inputText.length} / {MAX_CHARS}
                  </div>
                </div>
              </div>

              {/* ================= CONTROLS BETWEEN BOXES ================= */}
              <div className="animate-entrance-scale delay-200 flex items-center justify-center gap-3 py-1 px-4">
                {/* Swap Languages Button ⇅ */}
                <button
                  type="button"
                  onClick={handleSwapLanguages}
                  title="Swap languages"
                  aria-label="Swap languages"
                  className="group p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <ArrowUpDown className="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:rotate-180 transition-transform duration-300" />
                </button>

                {/* Prominent Translate Button */}
                <button
                  type="button"
                  onClick={handleTranslateClick}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 active:scale-98 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Translating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Translate</span>
                    </>
                  )}
                </button>
              </div>

              {/* ================= BOTTOM BOX (OUTPUT) ================= */}
              <div className="animate-entrance-up delay-250 relative w-full rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all p-5 flex flex-col justify-between min-h-[220px]">
                {/* Box Header: Top-right corner Language Selector */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    <span>Translation Result</span>
                    {isSpeakingTarget && (
                      <AudioWaveIndicator color="bg-emerald-500" label="Speaking..." />
                    )}
                  </div>

                  {/* Language Selector in the TOP-RIGHT corner of the bottom box */}
                  <div className="flex items-center gap-2">
                    <LanguageDropdown
                      selectedLanguage={targetLang}
                      onChange={(newLang) => {
                        if (newLang === sourceLang) {
                          handleSwapLanguages();
                        } else {
                          setTargetLang(newLang);
                        }
                      }}
                      otherSelectedLanguage={sourceLang}
                    />
                  </div>
                </div>

                {/* Large Output Area */}
                <div className="my-3 flex-1 flex flex-col justify-center">
                  {isLoading && !translatedText ? (
                    <div className="flex items-center gap-3 py-6 text-zinc-400 dark:text-zinc-500">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                      <span className="text-base italic">Generating natural translation...</span>
                    </div>
                  ) : translatedText ? (
                    <p className="text-zinc-900 dark:text-zinc-50 text-lg sm:text-xl font-medium leading-relaxed select-text whitespace-pre-wrap">
                      {translatedText}
                    </p>
                  ) : (
                    <p className="text-zinc-400 dark:text-zinc-500 text-lg sm:text-xl italic font-normal">
                      Translation will appear here automatically...
                    </p>
                  )}
                </div>

                {/* Bottom Actions of Bottom Box: Speaker 🔊, Stop ⏹, and Copy Button */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    {/* Speaker Button 🔊 */}
                    <button
                      type="button"
                      onClick={handleToggleSpeechTarget}
                      disabled={!translatedText}
                      title={isSpeakingTarget ? 'Stop speaking' : `Read aloud in ${targetLang}`}
                      aria-label={isSpeakingTarget ? 'Stop speaking' : `Read aloud in ${targetLang}`}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSpeakingTarget
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400 animate-pulse'
                          : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      <Volume2 className={`w-5 h-5 ${isSpeakingTarget ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                    </button>

                    {/* Stop Speech Button ⏹ */}
                    {isSpeakingTarget && (
                      <button
                        type="button"
                        onClick={() => {
                          ttsService.stop();
                          setSpeakingWhich(null);
                        }}
                        title="Stop playback"
                        aria-label="Stop playback"
                        className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <Square className="w-5 h-5 fill-current" />
                      </button>
                    )}

                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={handleCopy}
                      disabled={!translatedText}
                      title="Copy translation"
                      aria-label="Copy translation"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-zinc-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                    {translatedText ? `${targetLang} output` : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Translation History Section */}
            <div className="animate-entrance-up delay-300">
              <HistorySection
                history={history}
                onRestore={handleRestoreHistory}
                onClear={handleClearHistory}
                onDeleteSingle={handleDeleteHistoryItem}
              />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="animate-entrance-up delay-350 mt-12 text-center text-xs text-zinc-400 dark:text-zinc-600 py-4 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-4xl mx-auto w-full">
        <div>
          <strong>Ilmhub Translate</strong> • O‘zbek, Rus va Ingliz tillari
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab('game');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            🎮 So‘zlar O‘yini
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setShowEntrance(true)}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            Kirish oynasi
          </button>
        </div>
      </footer>
    </div>
  );
}
