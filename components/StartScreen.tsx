
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { GameMode } from '../types';

interface StartScreenProps {
  onStart: (mode: GameMode) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 text-white font-sans p-6 bg-black/60 backdrop-blur-md">
      <div className="max-w-4xl w-full bg-stone-900/95 p-8 md:p-12 rounded-2xl border border-stone-700 shadow-2xl relative overflow-hidden animate-fade-in text-center">
        
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <h1 className="text-4xl md:text-6xl font-black mb-2 text-amber-100 tracking-tight font-serif">
          Stanford Forest
        </h1>
        <h2 className="text-xl md:text-2xl text-stone-400 mb-6 font-serif italic">
          The Billion Dollar Campus
        </h2>
        
        <div className="mb-8 text-stone-300 text-sm md:text-base bg-stone-950/50 p-4 rounded-lg border border-stone-800 inline-block">
            <p className="mb-2"><strong className="text-white">Role:</strong> Management Consultant</p>
            <p className="mb-2"><strong className="text-white">Objective:</strong> Reach <span className="text-amber-400 font-bold">$1,000,000,000</span> Revenue.</p>
            <p><strong className="text-white">Deadline:</strong> You have <span className="text-white font-bold">10 Years</span>.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Pomodoro Mode */}
            <button 
                onClick={() => onStart('pomodoro')}
                className="group relative flex flex-col items-center p-6 bg-stone-800/50 hover:bg-stone-800 border border-stone-600 hover:border-amber-500 rounded-xl transition-all hover:scale-[1.02] text-left"
            >
                <div className="w-10 h-10 rounded-full bg-amber-900/50 text-amber-400 flex items-center justify-center text-xl mb-3 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    ⏱
                </div>
                <h3 className="text-lg font-bold text-amber-100 mb-1">Focus Mode</h3>
                <p className="text-stone-400 text-xs text-center">
                    Campaign + Pomodoro Timer. Students study harder when you focus.
                </p>
            </button>

            {/* Standard Mode */}
            <button 
                onClick={() => onStart('standard')}
                className="group relative flex flex-col items-center p-6 bg-stone-800/50 hover:bg-stone-800 border border-stone-600 hover:border-green-500 rounded-xl transition-all hover:scale-[1.02] text-left"
            >
                <div className="w-10 h-10 rounded-full bg-green-900/50 text-green-400 flex items-center justify-center text-xl mb-3 group-hover:bg-green-500 group-hover:text-white transition-colors">
                    🌲
                </div>
                <h3 className="text-lg font-bold text-green-100 mb-1">Standard Mode</h3>
                <p className="text-stone-400 text-xs text-center">
                    Classic City-Builder Campaign. Optimize well-being to maximize revenue.
                </p>
            </button>

            {/* Creative Mode */}
            <button 
                onClick={() => onStart('creative')}
                className="group relative flex flex-col items-center p-6 bg-stone-800/50 hover:bg-stone-800 border border-stone-600 hover:border-purple-500 rounded-xl transition-all hover:scale-[1.02] text-left"
            >
                <div className="w-10 h-10 rounded-full bg-purple-900/50 text-purple-400 flex items-center justify-center text-xl mb-3 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    ✨
                </div>
                <h3 className="text-lg font-bold text-purple-100 mb-1">Creative Mode</h3>
                <p className="text-stone-400 text-xs text-center">
                    Unlimited Money. Everything Unlocked. No Time Limit. Just Build.
                </p>
            </button>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
