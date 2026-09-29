import React, { useState } from 'react';
import { IlmhubLogo } from './IlmhubLogo.tsx';
import { ArrowRight, Gamepad2, Sparkles, Languages, CheckCircle2 } from 'lucide-react';
import { soundService } from '../lib/sounds.ts';

interface EntranceScreenProps {
  onEnterApp: () => void;
  onEnterGame: () => void;
}

export const EntranceScreen: React.FC<EntranceScreenProps> = ({
  onEnterApp,
  onEnterGame,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleEnterApp = () => {
    soundService.playClick();
    setIsExiting(true);
    setTimeout(() => {
      onEnterApp();
    }, 450);
  };

  const handleEnterGame = () => {
    soundService.playClick();
    setIsExiting(true);
    setTimeout(() => {
      onEnterGame();
    }, 450);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-radial from-blue-900/20 via-zinc-950 to-zinc-950 text-white px-4 transition-all duration-500 ${
        isExiting
          ? 'opacity-0 scale-105 pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-lg w-full text-center flex flex-col items-center">
        {/* Animated Ilmhub Logo Container */}
        <div className="relative mb-6 group">
          {/* Glowing pulse rings */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition duration-700 animate-pulse"></div>
          
          <div className="relative p-3 rounded-3xl bg-zinc-900/90 border border-white/10 shadow-2xl backdrop-blur-md">
            <IlmhubLogo size={96} showBackground={true} className="drop-shadow-lg" />
          </div>

          <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-amber-500 text-zinc-950 shadow-md">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
        </div>

        {/* Brand Name: Ilmhub Translate */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold mb-3">
          <Languages className="w-3.5 h-3.5" />
          <span>Zamonaviy AI Tarjimon & Til O‘yini</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-2">
          Ilmhub <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Translate</span>
        </h1>

        <p className="text-zinc-400 text-sm sm:text-base max-w-sm mb-8 leading-relaxed">
          Ingliz, Rus va O‘zbek tillari o‘rtasida sun’iy intellekt yordamida tezkor, aniq va tabiiy tarjima qiling.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-xs mb-8 text-xs text-zinc-300">
          <div className="flex flex-col items-center p-2 rounded-xl bg-white/5 border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-blue-400 mb-1" />
            <span className="font-medium">Ovozli kiritish</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-white/5 border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="font-medium">Ovoz chiqarish</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-white/5 border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-amber-400 mb-1" />
            <span className="font-medium">So‘zlar o‘yini</span>
          </div>
        </div>

        {/* Primary Call to Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            type="button"
            onClick={handleEnterApp}
            className="w-full flex-1 group inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Ilmhub Translate ga kirish</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={handleEnterGame}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-200 font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            <span>O‘yinni o‘ynash</span>
          </button>
        </div>

        <div className="mt-8 text-xs text-zinc-500 font-medium">
          Ilmhub Academy platformasi uchun maxsus ishlab chiqilgan
        </div>
      </div>
    </div>
  );
};
