import React from 'react';
import { Sparkles } from 'lucide-react';
import { SupportedLanguage } from '../types.ts';

interface Preset {
  sourceText: string;
  sourceLang: SupportedLanguage;
  targetLang: SupportedLanguage;
  label: string;
}

const PRESETS: Preset[] = [
  {
    sourceText: 'Hello, how are you?',
    sourceLang: 'English',
    targetLang: 'Uzbek',
    label: 'EN → UZ: "Hello, how are you?"',
  },
  {
    sourceText: 'Men maktabga boryapman.',
    sourceLang: 'Uzbek',
    targetLang: 'Russian',
    label: 'UZ → RU: "Men maktabga boryapman."',
  },
  {
    sourceText: 'Как тебя зовут?',
    sourceLang: 'Russian',
    targetLang: 'English',
    label: 'RU → EN: "Как тебя зовут?"',
  },
];

interface PresetChipsProps {
  onSelect: (preset: Preset) => void;
}

export const PresetChips: React.FC<PresetChipsProps> = ({ onSelect }) => {
  return (
    <div className="w-full flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mr-1">
        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
        Quick examples:
      </span>
      {PRESETS.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => onSelect(preset)}
          className="text-xs px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-700 text-zinc-700 dark:text-zinc-300 hover:scale-[1.02] active:scale-[0.98] transition-all font-medium shadow-xs cursor-pointer"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
};
