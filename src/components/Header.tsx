import React from 'react';
import { Moon, Sun, Gamepad2, Languages, Sparkles, Home } from 'lucide-react';
import { IlmhubLogo } from './IlmhubLogo.tsx';

interface HeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  activeTab: 'translator' | 'game';
  onSelectTab: (tab: 'translator' | 'game') => void;
  onOpenEntrance: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleTheme,
  activeTab,
  onSelectTab,
  onOpenEntrance,
}) => {
  return (
    <header className="w-full flex flex-col md:flex-row items-center justify-between pb-5 mb-6 border-b border-zinc-200 dark:border-zinc-800 transition-colors gap-4">
      {/* Brand logo & title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenEntrance}
          title="Kirish oynasini ochish"
          className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl cursor-pointer"
        >
          <IlmhubLogo size={48} showBackground={true} className="animate-float-gentle hover:scale-105 transition-transform" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
              <span>Ilmhub</span>
              <span className="text-blue-600 dark:text-blue-400">Translate</span>
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 uppercase tracking-wider">
              <Sparkles className="w-2.5 h-2.5 text-blue-500" />
              AI
            </span>
          </div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
            English • Русский • O‘zbekcha
          </p>
        </div>
      </div>

      {/* Navigation tabs & actions */}
      <div className="flex items-center flex-wrap gap-2">
        {/* View Switcher: Tarjimon vs O'yin */}
        <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => onSelectTab('translator')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'translator'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Tarjimon</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('game')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'game'
                ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>So‘zlar O‘yini</span>
          </button>
        </div>

        {/* Welcome / Splash Screen Button */}
        <button
          type="button"
          onClick={onOpenEntrance}
          title="Kirish oynasini ochish"
          aria-label="Kirish oynasi"
          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/90 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all shadow-xs cursor-pointer"
        >
          <Home className="w-4 h-4" />
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={darkMode ? 'Light mode' : 'Dark mode'}
          title={darkMode ? 'Light mode' : 'Dark mode'}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all shadow-xs font-medium text-xs select-none cursor-pointer"
        >
          {darkMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-zinc-600" />
              <span>Dark</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
