import React from 'react';
import { History, Trash2, ArrowRight, RotateCcw, Copy, Check } from 'lucide-react';
import { HistoryItem, LANGUAGES } from '../types.ts';

interface HistorySectionProps {
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onClear: () => void;
  onDeleteSingle: (id: string) => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  history,
  onRestore,
  onClear,
  onDeleteSingle,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLanguageFlag = (langName: string) => {
    return LANGUAGES.find((l) => l.name === langName)?.flag || '🌐';
  };

  const formatTimestamp = (time: number) => {
    try {
      const date = new Date(time);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <section className="w-full mt-10 pt-8 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-zinc-500" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Translation History
          </h2>
          {history.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
              {history.length}
            </span>
          )}
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear history
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No translations yet. Your recent translations will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onRestore(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onRestore(item);
                }
              }}
              className="group relative text-left p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer"
            >
              {/* Top metadata */}
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                <div className="flex items-center gap-1.5 font-medium">
                  <span>{getLanguageFlag(item.sourceLang)} {item.sourceLang}</span>
                  <ArrowRight className="w-3 h-3 text-zinc-400" />
                  <span>{getLanguageFlag(item.targetLang)} {item.targetLang}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400">{formatTimestamp(item.timestamp)}</span>
                  <button
                    type="button"
                    onClick={(e) => handleCopy(item.id, item.translatedText, e)}
                    title="Copy translation"
                    aria-label="Copy translation"
                    className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSingle(item.id);
                    }}
                    title="Remove from history"
                    aria-label="Remove from history"
                    className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Source Text */}
              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-1.5 font-normal">
                {item.sourceText}
              </p>

              {/* Translated Text */}
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                {item.translatedText}
              </p>

              {/* Hover indicator to restore */}
              <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-blue-600 dark:text-blue-400 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                <span className="inline-flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" />
                  Click to restore
                </span>
                <span className="text-zinc-400 group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
