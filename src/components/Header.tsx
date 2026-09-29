import React from 'react';
import { Languages, Moon, Sun, Sparkles } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, onToggleTheme }) => {
  return (
    <header className="w-full flex flex-col sm:flex-row items-center justify-between pb-6 mb-6 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="flex items-center gap-3 mb-4 sm:mb-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Languages className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              AI Translator
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              <Sparkles className="w-3 h-3 text-blue-500" />
              AI Powered
            </span>
          </div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
            English • Русский • O‘zbekcha
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleTheme}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="relative inline-flex items-center justify-center p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-5 h-5 text-zinc-600 hover:-rotate-12 transition-transform" />
          )}
        </button>
      </div>
    </header>
  );
};
