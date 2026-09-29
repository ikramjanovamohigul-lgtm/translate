import React from 'react';

interface AudioWaveIndicatorProps {
  color?: string;
  label?: string;
}

export const AudioWaveIndicator: React.FC<AudioWaveIndicatorProps> = ({
  color = 'bg-blue-600 dark:bg-blue-400',
  label = 'Speaking...',
}) => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-medium text-blue-700 dark:text-blue-300">
      <div className="flex items-end gap-1 h-3.5">
        <span className={`w-1 h-2.5 rounded-full animate-bounce ${color}`} style={{ animationDelay: '0ms' }} />
        <span className={`w-1 h-3.5 rounded-full animate-bounce ${color}`} style={{ animationDelay: '150ms' }} />
        <span className={`w-1 h-1.5 rounded-full animate-bounce ${color}`} style={{ animationDelay: '300ms' }} />
        <span className={`w-1 h-3 rounded-full animate-bounce ${color}`} style={{ animationDelay: '450ms' }} />
      </div>
      <span>{label}</span>
    </div>
  );
};
