import React, { useState, useEffect } from 'react';
import { Volume2, Trophy, RotateCcw, Heart, Flame, Sparkles, ArrowLeft, Check, X, Timer } from 'lucide-react';
import { ttsService } from '../lib/speech.ts';
import { soundService } from '../lib/sounds.ts';
import { SupportedLanguage } from '../types.ts';

interface QuizQuestion {
  id: number;
  word: string;
  wordLang: SupportedLanguage;
  translation: string;
  translationLang: SupportedLanguage;
  options: string[];
  correctIndex: number;
  category: 'IT & Texnologiya' | 'Ta’lim & Bilim' | 'Kundalik so‘zlar';
  hint?: string;
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    word: 'Knowledge',
    wordLang: 'English',
    translation: 'Bilim',
    translationLang: 'Uzbek',
    options: ['Bilim', 'Kitob', 'Maktab', 'Harakat'],
    correctIndex: 0,
    category: 'Ta’lim & Bilim',
  },
  {
    id: 2,
    word: 'Dasturchi',
    wordLang: 'Uzbek',
    translation: 'Developer',
    translationLang: 'English',
    options: ['Designer', 'Developer', 'Manager', 'Teacher'],
    correctIndex: 1,
    category: 'IT & Texnologiya',
  },
  {
    id: 3,
    word: 'Artificial Intelligence',
    wordLang: 'English',
    translation: 'Sun’iy intellekt',
    translationLang: 'Uzbek',
    options: ['Bulutli tizim', 'Kiberxavfsizlik', 'Sun’iy intellekt', 'Ma’lumotlar bazasi'],
    correctIndex: 2,
    category: 'IT & Texnologiya',
  },
  {
    id: 4,
    word: 'Учиться',
    wordLang: 'Russian',
    translation: 'O‘qimoq / O‘rganmoq',
    translationLang: 'Uzbek',
    options: ['Yozmoq', 'Gapirmoq', 'O‘qimoq / O‘rganmoq', 'Tinglamoq'],
    correctIndex: 2,
    category: 'Ta’lim & Bilim',
  },
  {
    id: 5,
    word: 'Algoritm',
    wordLang: 'Uzbek',
    translation: 'Algorithm',
    translationLang: 'English',
    options: ['Hardware', 'Algorithm', 'Network', 'Compiler'],
    correctIndex: 1,
    category: 'IT & Texnologiya',
  },
  {
    id: 6,
    word: 'Experience',
    wordLang: 'English',
    translation: 'Tajriba',
    translationLang: 'Uzbek',
    options: ['Imkoniyat', 'Tajriba', 'Muvaffaqiyat', 'Vaqt'],
    correctIndex: 1,
    category: 'Ta’lim & Bilim',
  },
  {
    id: 7,
    word: 'Muvaffaqiyat',
    wordLang: 'Uzbek',
    translation: 'Success',
    translationLang: 'English',
    options: ['Victory', 'Success', 'Progress', 'Future'],
    correctIndex: 1,
    category: 'Kundalik so‘zlar',
  },
  {
    id: 8,
    word: 'Вдохновение',
    wordLang: 'Russian',
    translation: 'Ilhom',
    translationLang: 'Uzbek',
    options: ['Quvonch', 'Ilhom', 'Umid', 'Do‘stlik'],
    correctIndex: 1,
    category: 'Kundalik so‘zlar',
  },
  {
    id: 9,
    word: 'Innovation',
    wordLang: 'English',
    translation: 'Yangilik / Innovatsiya',
    translationLang: 'Uzbek',
    options: ['Qadriyat', 'Yangilik / Innovatsiya', 'Xotira', 'Tadqiqot'],
    correctIndex: 1,
    category: 'IT & Texnologiya',
  },
  {
    id: 10,
    word: 'Kelajak',
    wordLang: 'Uzbek',
    translation: 'Future',
    translationLang: 'English',
    options: ['Present', 'History', 'Future', 'Dream'],
    correctIndex: 2,
    category: 'Kundalik so‘zlar',
  },
];

interface WordGameProps {
  onBackToTranslator: () => void;
}

export const WordGame: React.FC<WordGameProps> = ({ onBackToTranslator }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isSpeakingWord, setIsSpeakingWord] = useState(false);

  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem('ilmhub_game_highscore');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const question = QUESTIONS[currentQuestionIndex];

  // Question countdown timer
  useEffect(() => {
    if (gameOver || isAnswered) return;

    if (timeLeft <= 0) {
      handleTimeOut();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, gameOver]);

  const handleTimeOut = () => {
    setIsAnswered(true);
    soundService.playWrong();
    const newLives = lives - 1;
    setLives(newLives);
    setStreak(0);

    if (newLives <= 0) {
      setTimeout(() => setGameOver(true), 1200);
    }
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered || gameOver) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === question.correctIndex;

    if (isCorrect) {
      soundService.playCorrect();
      const bonus = Math.max(5, timeLeft);
      const points = 10 + streak * 2 + bonus;
      const newScore = score + points;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);

      if (newScore > highScore) {
        setHighScore(newScore);
        try {
          localStorage.setItem('ilmhub_game_highscore', newScore.toString());
        } catch {
          // ignore
        }
      }
    } else {
      soundService.playWrong();
      const newLives = lives - 1;
      setLives(newLives);
      setStreak(0);

      if (newLives <= 0) {
        setTimeout(() => setGameOver(true), 1200);
        return;
      }
    }
  };

  const handleNextQuestion = () => {
    soundService.playClick();
    if (currentQuestionIndex + 1 < QUESTIONS.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(15);
    } else {
      soundService.playWin();
      setGameOver(true);
    }
  };

  const handleRestart = () => {
    soundService.playClick();
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setLives(3);
    setSelectedOption(null);
    setIsAnswered(false);
    setGameOver(false);
    setTimeLeft(15);
  };

  const handleSpeakQuestion = () => {
    if (isSpeakingWord) return;
    setIsSpeakingWord(true);
    ttsService.speak(
      question.word,
      question.wordLang,
      () => setIsSpeakingWord(true),
      () => setIsSpeakingWord(false),
      () => setIsSpeakingWord(false)
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-6 animate-entrance-up">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => {
            soundService.playClick();
            onBackToTranslator();
          }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tarjimonga qaytish</span>
        </button>

        {/* Stats Row */}
        <div className="flex items-center gap-3">
          {/* Hearts / Lives */}
          <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 px-2.5 py-1 rounded-xl">
            {[1, 2, 3].map((heart) => (
              <Heart
                key={heart}
                className={`w-4 h-4 ${
                  heart <= lives
                    ? 'text-rose-500 fill-rose-500 animate-pulse'
                    : 'text-zinc-300 dark:text-zinc-700'
                }`}
              />
            ))}
          </div>

          {/* Streak */}
          {streak > 1 && (
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 px-2.5 py-1 rounded-xl text-amber-700 dark:text-amber-300 text-xs font-bold animate-bounce">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{streak}x</span>
            </div>
          )}

          {/* Score Badge */}
          <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 px-3 py-1 rounded-xl text-blue-700 dark:text-blue-300 text-xs font-bold">
            <Trophy className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{score} ball</span>
          </div>
        </div>
      </div>

      {!gameOver ? (
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 sm:p-8">
          {/* Progress bar & Timer */}
          <div className="flex items-center justify-between mb-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span>
              Savol {currentQuestionIndex + 1} / {QUESTIONS.length}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium">
              {question.category}
            </span>
            <div className="flex items-center gap-1.5">
              <Timer className={`w-3.5 h-3.5 ${timeLeft <= 5 ? 'text-rose-500 animate-spin' : 'text-blue-500'}`} />
              <span className={`font-mono ${timeLeft <= 5 ? 'text-rose-600 font-bold' : ''}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%`,
              }}
            ></div>
          </div>

          {/* Central Question Card */}
          <div className="text-center py-6 px-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 mb-6 relative">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 block">
              {question.wordLang} → {question.translationLang}
            </span>

            <div className="flex items-center justify-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                {question.word}
              </h2>

              <button
                type="button"
                onClick={handleSpeakQuestion}
                title="Talaffuzni tinglash"
                className="p-2 rounded-xl bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-200 hover:text-blue-600 shadow-xs border border-zinc-200 dark:border-zinc-600 transition-colors cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mt-2">
              Ushbu so‘zning to‘g‘ri tarjimasini tanlang:
            </p>
          </div>

          {/* 4 Answer Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {question.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = idx === question.correctIndex;

              let btnStyle =
                'bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30';

              if (isAnswered) {
                if (isCorrectAnswer) {
                  btnStyle =
                    'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold shadow-md shadow-emerald-500/20';
                } else if (isSelected) {
                  btnStyle =
                    'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-200 font-bold shadow-md shadow-rose-500/20';
                } else {
                  btnStyle = 'opacity-40 border-zinc-200 dark:border-zinc-800';
                }
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-2xl border text-left font-medium text-sm sm:text-base flex items-center justify-between transition-all cursor-pointer ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrectAnswer && (
                    <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  {isAnswered && isSelected && !isCorrectAnswer && (
                    <X className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Next Button after answering */}
          {isAnswered && (
            <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/30 transition-all cursor-pointer"
              >
                {currentQuestionIndex + 1 < QUESTIONS.length ? 'Keyingi savol →' : 'Natijani ko‘rish 🏆'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Game Over Screen */
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-8 text-center animate-entrance-scale">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800">
            <Trophy className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-2">
            {lives > 0 ? 'Ajoyib natija! 🎉' : 'O‘yin yakunlandi!'}
          </h2>

          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            {lives > 0
              ? 'Barcha so‘zlar testini muvaffaqiyatli yakunladingiz!'
              : 'Jonlaringiz tugadi, lekin bilim oshirishda davom eting!'}
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-8 text-left">
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
              <span className="text-xs text-zinc-400 block font-medium">To‘plangan ball</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{score}</span>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
              <span className="text-xs text-zinc-400 block font-medium">Rekord ball</span>
              <span className="text-2xl font-bold text-amber-500">{highScore}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRestart}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Qayta o‘ynash</span>
            </button>

            <button
              type="button"
              onClick={onBackToTranslator}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-sm transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Tarjimonga qaytish</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
