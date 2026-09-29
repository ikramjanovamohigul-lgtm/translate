import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { SupportedLanguage, LANGUAGES, LanguageOption } from '../types.ts';

interface LanguageDropdownProps {
  selectedLanguage: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
  otherSelectedLanguage?: SupportedLanguage;
  label?: string;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  selectedLanguage,
  onChange,
  otherSelectedLanguage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = LANGUAGES.find((l) => l.name === selectedLanguage) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang: LanguageOption) => {
    onChange(lang.name);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/90 dark:bg-zinc-800/90 hover:bg-zinc-100 dark:hover:bg-zinc-700/90 text-zinc-900 dark:text-zinc-100 text-sm font-semibold tracking-wide transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="text-base select-none leading-none">{currentOption.flag}</span>
        <span>{currentOption.nativeName}</span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1 text-[11px] font-semibold text-zinc-400 dark:text-zinc-400 tracking-wider uppercase">
            Select Language
          </div>
          {LANGUAGES.map((lang) => {
            const isSelected = lang.name === selectedLanguage;
            const isOpposite = lang.name === otherSelectedLanguage;

            return (
              <button
                key={lang.name}
                type="button"
                onClick={() => handleSelect(lang)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base select-none">{lang.flag}</span>
                  <div>
                    <span className="block leading-tight">{lang.nativeName}</span>
                    {lang.name !== lang.nativeName && (
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-400 block">
                        {lang.name}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected ? (
                  <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                ) : isOpposite ? (
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-400 font-normal">
                    paired
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
