
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef, useState } from 'react';
import { BuildingType, CityStats, Mission, NewsItem, GameMode, TeaMessage, ChatboardMessage } from '../types';
import { BUILDINGS, CAMPAIGN_GOAL } from '../constants';
import StudentTea from './StudentTea';
import Chatboard from './Chatboard';

interface UIOverlayProps {
  stats: CityStats;
  selectedTool: BuildingType;
  onSelectTool: (type: BuildingType) => void;
  currentGoal: Mission | null;
  newsFeed: NewsItem[];
  teaMessages: TeaMessage[];
  chatboardMessages: ChatboardMessage[]; // New Prop
  onClaimReward: () => void;
  isGeneratingGoal: boolean;
  timerState: { mode: 'focus' | 'break' | 'idle', timeLeft: number };
  onToggleTimer: () => void;
  onResetTimer: () => void;
  gameMode: GameMode;
  focusMultiplier: number;
  progressToNextMultiplier: number;
  onRotate: () => void;
  currentRotation: number;
  onOpenStats: () => void;
}

// Categorized Building System
type CategoryKey = 'tools' | 'nature' | 'campus' | 'biz' | 'sports' | 'decor';

const CATEGORIES: Record<CategoryKey, { label: string; icon: string; items: BuildingType[] }> = {
  tools: {
    label: 'Tools',
    icon: '🛠️',
    items: [BuildingType.None, BuildingType.Path]
  },
  nature: {
    label: 'Trees',
    icon: '🌲',
    items: [BuildingType.OakSeed, BuildingType.PineSeed, BuildingType.PalmSeed]
  },
  campus: {
    label: 'Campus',
    icon: '🏛️',
    items: [BuildingType.StudentDorm, BuildingType.LectureHall, BuildingType.ArrillagaHall, BuildingType.HooverTower, BuildingType.EngineeringQuad, BuildingType.DSchool, BuildingType.LiKaShing]
  },
  biz: {
    label: 'Biz',
    icon: '☕',
    items: [BuildingType.CoupaCafe, BuildingType.VapeStore, BuildingType.TraderJoes]
  },
  sports: {
    label: 'Sports',
    icon: '🏈',
    items: [BuildingType.TennisCourt, BuildingType.VolleyballCourt, BuildingType.FootballField, BuildingType.TrackField, BuildingType.Oval]
  },
  decor: {
    label: 'Decor',
    icon: '🎨',
    items: [
      BuildingType.StudySpot,
      BuildingType.PicnicTable,
      BuildingType.StreetLamp,
      BuildingType.RoseBush,
      BuildingType.GardenBed,
      BuildingType.Hedge,
      BuildingType.ClawFountain,
      BuildingType.RodinSculpture,
      BuildingType.TotemSculpture
    ]
  }
};

// Number formatting helper
const formatCurrency = (amount: number, symbol: string) => {
  if (amount >= 1000000000) return `${symbol}${(amount / 1000000000).toFixed(2)}B`;
  if (amount >= 1000000) return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${symbol}${(amount / 1000).toFixed(0)}k`;
  return `${symbol}${Math.floor(amount)}`;
};

// Date formatting helper
const getGameDate = (ticks: number) => {
  // Start Date: Jan 1, 2024
  // 1 Tick = 1 Day
  const start = new Date(2024, 0, 1);
  const current = new Date(start);
  current.setDate(start.getDate() + ticks);

  return current.toLocaleString('default', { month: 'long', year: 'numeric' });
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const ToolButton: React.FC<{
  type: BuildingType;
  isSelected: boolean;
  onClick: () => void;
  money: number;
  currencySymbol: string;
  isCreative: boolean;
}> = ({ type, isSelected, onClick, money, currencySymbol, isCreative }) => {
  const config = BUILDINGS[type];
  const canAfford = isCreative || money >= config.cost;
  const isBulldoze = type === BuildingType.None;

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={!isBulldoze && !canAfford}
      className={`
        relative flex flex-row items-center justify-between rounded-xl border-2 transition-all shadow-lg backdrop-blur-md p-2 gap-3
        w-52 md:w-64 h-16 md:h-20 pointer-events-auto shrink-0
        ${isSelected ? 'border-amber-400 bg-amber-900/90 z-10 scale-105' : 'border-stone-600 bg-stone-900/95 hover:bg-stone-800'}
        ${!isBulldoze && !canAfford ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}
      `}
      title={config.description}
    >
      {/* Icon */}
      <div className={`w-10 h-10 md:w-14 md:h-14 rounded-lg border border-black/30 shadow-inner flex items-center justify-center overflow-hidden shrink-0`} style={{ backgroundColor: isBulldoze ? 'transparent' : config.color }}>
        {isBulldoze && <div className="w-full h-full bg-red-600 text-white flex justify-center items-center font-bold text-lg">✕</div>}
      </div>

      {/* Text Info */}
      <div className="flex flex-col items-start flex-1 min-w-0">
        <span className="text-xs md:text-sm font-bold text-stone-100 uppercase tracking-wide truncate w-full text-left">{config.name}</span>
        <span className="text-[10px] md:text-xs text-stone-400 truncate w-full text-left">{config.description.split('.')[0]}</span>
      </div>

      {/* Cost */}
      {config.cost > 0 && (
        <span className={`text-xs md:text-sm font-mono font-bold whitespace-nowrap px-2 py-1 rounded bg-black/40 ${canAfford ? 'text-green-300' : 'text-red-400'}`}>
          {isCreative ? 'FREE' : formatCurrency(config.cost, currencySymbol)}
        </span>
      )}
    </button>
  );
};

const CategoryGroup: React.FC<{
  categoryKey: CategoryKey;
  isSelected: boolean;
  selectedTool: BuildingType;
  onSelectTool: (t: BuildingType) => void;
  stats: CityStats;
  currencySymbol: string;
  gameMode: GameMode;
}> = ({ categoryKey, isSelected, selectedTool, onSelectTool, stats, currencySymbol, gameMode }) => {
  const [isHovered, setIsHovered] = useState(false);
  const data = CATEGORIES[categoryKey];
  const isCreative = gameMode === 'creative';

  // Filter items based on unlock day, unless Creative Mode
  const unlockedItems = data.items.filter(type => {
    if (isCreative) return true;
    if (type === BuildingType.None) return true;
    return stats.day >= BUILDINGS[type].unlockDay;
  });

  if (unlockedItems.length === 0) return null;

  // Check if any tool in this category is active
  const isActiveCategory = data.items.includes(selectedTool);

  return (
    <div
      className="relative flex flex-col items-center group z-20 pointer-events-auto h-full justify-end"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered(!isHovered)}
    >
      {/* Expanded Menu (Wide Cards) */}
      <div className={`
          absolute bottom-[80%] pb-6 flex flex-col-reverse items-center gap-2 transition-all duration-200 origin-bottom z-50
          ${isHovered ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 translate-y-4 invisible pointer-events-none'}
      `}>
        {/* Scroll container for overflow items */}
        <div className="max-h-[50vh] overflow-y-auto overflow-x-hidden flex flex-col-reverse gap-2 p-1 no-scrollbar">
          {unlockedItems.map(type => (
            <ToolButton
              key={type}
              type={type}
              isSelected={selectedTool === type}
              onClick={() => {
                onSelectTool(type);
                setIsHovered(false);
              }}
              money={stats.money}
              currencySymbol={currencySymbol}
              isCreative={isCreative}
            />
          ))}
        </div>
      </div>

      {/* Main Category Icon */}
      <button
        className={`
          w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 flex flex-col items-center justify-center transition-all shadow-xl z-20 relative
          ${isActiveCategory ? 'bg-amber-800 border-amber-400 text-amber-100 shadow-amber-500/20' : 'bg-stone-900/90 border-stone-600 text-stone-400 hover:bg-stone-800 hover:text-stone-200'}
          ${isHovered ? 'scale-105 border-stone-400 bg-stone-800' : ''}
        `}
      >
        <span className="text-3xl md:text-4xl mb-1 filter drop-shadow-md">{data.icon}</span>
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">{data.label}</span>
      </button>
    </div>
  );
};


const UIOverlay: React.FC<UIOverlayProps> = ({
  stats,
  selectedTool,
  onSelectTool,
  currentGoal,
  newsFeed,
  teaMessages,
  chatboardMessages,
  onClaimReward,
  timerState,
  onToggleTimer,
  onResetTimer,
  gameMode,
  focusMultiplier,
  progressToNextMultiplier,
  onRotate,
  currentRotation,
  onOpenStats
}) => {
  const newsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (newsRef.current) {
      newsRef.current.scrollTop = newsRef.current.scrollHeight;
    }
  }, [newsFeed]);

  const isFocusing = timerState.mode === 'focus';
  const isPomodoro = gameMode === 'pomodoro';
  const isCreative = gameMode === 'creative';
  const currencySymbol = isPomodoro ? 'FP' : '$';
  const moneyLabel = isPomodoro ? 'Focus Points' : 'Revenue';

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 md:p-4 font-sans z-10 text-stone-100">

      {/* Top Bar: Stats & Timer */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start pointer-events-auto gap-2 w-full max-w-full">

        {/* Game Status / Date Panel */}
        <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-600 shadow-2xl backdrop-blur-md flex flex-col justify-center min-w-[200px]">
          <div className="text-xl font-serif text-amber-100 font-bold flex items-center gap-2">
            <span>📅</span> {getGameDate(stats.day)}
          </div>
          {stats.campaignActive && !isCreative && (
            <div className="mt-2">
              <div className="flex justify-between text-[10px] uppercase text-stone-400 font-bold mb-1">
                <span>Campaign Progress</span>
                <span>Target: $1B</span>
              </div>
              <div className="h-2 bg-stone-950 rounded-full overflow-hidden border border-stone-700">
                <div
                  className="h-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, (stats.money / CAMPAIGN_GOAL) * 100)}%` }}
                />
              </div>
            </div>
          )}
          {isCreative && <div className="text-xs font-bold text-purple-400 mt-1 uppercase tracking-widest">Creative Mode</div>}
          {stats.gameWon && <div className="text-xs font-bold text-green-400 mt-1 uppercase tracking-widest animate-pulse">Campaign Complete!</div>}
          {stats.gameLost && <div className="text-xs font-bold text-red-400 mt-1 uppercase tracking-widest">Time Expired</div>}
        </div>

        {/* Timer Panel (Only in Pomodoro Mode) */}
        {isPomodoro && (
          <div className={`
                bg-stone-900/90 p-4 rounded-xl border border-stone-600 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center w-full md:w-64 transition-all
                ${isFocusing ? 'border-amber-500/50 shadow-amber-500/20' : ''}
            `}>
            <div className="text-xs uppercase tracking-widest text-stone-400 font-bold mb-1">
              {timerState.mode === 'idle' ? 'Ready to Focus' : timerState.mode === 'focus' ? 'Focusing...' : 'Break Time'}
            </div>
            <div className={`text-4xl md:text-5xl font-mono font-black mb-3 ${isFocusing ? 'text-amber-400' : 'text-green-400'}`}>
              {formatTime(timerState.timeLeft)}
            </div>

            {/* Focus Multiplier Bar */}
            {isFocusing && (
              <div className="w-full mb-3 bg-stone-800 rounded-lg p-2 border border-stone-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-amber-200 font-bold">Multiplier: {focusMultiplier}x</span>
                  <span className="text-[9px] text-stone-400 uppercase">
                    {focusMultiplier < 10 ? 'Next Level' : 'Max Level'}
                  </span>
                </div>
                <div className="h-2 bg-stone-950 rounded-full overflow-hidden w-full relative">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-1000"
                    style={{ width: `${progressToNextMultiplier}%` }}
                  />
                  {/* Milestones markers */}
                  <div className="absolute top-0 bottom-0 left-[4%] w-px bg-white/20" title="1 min"></div>
                  <div className="absolute top-0 bottom-0 left-[60%] w-px bg-white/20" title="15 min"></div>
                </div>
                <div className="text-[8px] text-stone-500 flex justify-between mt-1 font-mono">
                  <span>0m</span>
                  <span>1m</span>
                  <span>15m</span>
                  <span>25m</span>
                </div>
                <div className="text-[9px] text-red-300 text-center mt-2 italic animate-pulse">
                  Interacting will reset streak!
                </div>
              </div>
            )}

            <div className="flex gap-2 w-full">
              <button onClick={onToggleTimer} className={`flex-1 py-2 rounded font-bold uppercase text-xs tracking-wider transition-colors ${isFocusing ? 'bg-red-900/50 hover:bg-red-800/50 text-red-200 border border-red-700' : 'bg-green-700 hover:bg-green-600 text-white border border-green-500'}`}>
                {timerState.mode === 'idle' ? 'Start Focus' : (isFocusing ? 'Give Up' : 'Skip Break')}
              </button>
              {timerState.mode !== 'idle' && (
                <button onClick={onResetTimer} className="px-3 py-2 rounded bg-stone-700 hover:bg-stone-600 text-stone-300 font-bold border border-stone-500">
                  ↻
                </button>
              )}
            </div>
          </div>
        )}

        {/* Resource Stats with Stats Button */}
        <div className="bg-stone-900/90 p-2 md:p-3 rounded-xl border border-stone-700 shadow-2xl backdrop-blur-md flex flex-col gap-2 min-w-[300px]">
          <div className="flex gap-4 md:gap-8 items-center justify-center md:justify-start">
            <div className="flex flex-col items-center flex-1">
              <span className="text-[8px] md:text-[10px] text-stone-400 uppercase font-bold tracking-widest">{moneyLabel}</span>
              <span className="text-lg md:text-2xl font-black text-amber-400 font-mono">
                {isCreative ? '∞' : formatCurrency(stats.money, isPomodoro ? '' : '$')}
              </span>
            </div>
            <div className="w-px h-8 bg-stone-700"></div>
            <div className="flex flex-col items-center">
              <span className="text-[8px] md:text-[10px] text-stone-400 uppercase font-bold tracking-widest">Nature Score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-base md:text-xl font-bold text-green-400 font-mono">{Math.floor(stats.population)}</span>
                <span className="text-[9px] text-stone-500">•</span>
                <span className="text-[10px] md:text-xs font-semibold text-blue-400">{Math.floor(stats.population * 2.5)}👥</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-stone-700 pt-2">
            <button
              onClick={onOpenStats}
              className="bg-stone-700 hover:bg-stone-600 text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wide transition-colors flex items-center gap-2 flex-1 justify-center"
            >
              <span>📊</span> View Analytics
            </button>
            <div className="flex flex-col items-end flex-1">
              <div className="flex items-center gap-2 w-full justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] md:text-[10px] text-stone-400 uppercase font-bold tracking-wider">Student Wellbeing</span>
                  <span className="text-xs md:text-sm font-bold text-white font-mono">
                    {Math.round(stats.wellbeing)}%
                  </span>
                  <div className="h-1.5 w-16 bg-stone-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${stats.wellbeing > 70 ? 'bg-blue-500' : stats.wellbeing > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${stats.wellbeing}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission Panel - Hidden in Creative */}
          {!isCreative && (
            <div className={`w-full md:w-80 bg-stone-900/90 text-stone-200 rounded-xl border border-stone-600 shadow-xl backdrop-blur-md overflow-hidden`}>
              <div className="bg-stone-800/80 px-3 py-2 flex justify-between items-center border-b border-stone-700">
                <span className="font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                  Current Mission
                </span>
              </div>

              <div className="p-3 md:p-4">
                {currentGoal ? (
                  <>
                    <p className="text-xs md:text-sm font-medium text-stone-300 mb-2 italic">"{currentGoal.description}"</p>
                    <div className="flex justify-between items-center mt-2 bg-stone-950/30 p-2 rounded border border-stone-700">
                      <div className="text-xs text-stone-400">
                        Target: <span className="font-mono font-bold text-white">{formatCurrency(currentGoal.targetValue, currentGoal.targetType === 'money' ? currencySymbol : '')} {currentGoal.targetType === 'population' ? 'Score' : (currentGoal.targetType === 'wellbeing' ? '%' : (currentGoal.targetType === 'money' ? '' : 'Assets'))}</span>
                      </div>
                      <div className="text-xs text-amber-300 font-bold font-mono">+ {formatCurrency(currentGoal.reward, currencySymbol)}</div>
                    </div>
                    {currentGoal.completed && (
                      <button onClick={onClaimReward} className="mt-3 w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-1.5 px-4 rounded animate-bounce text-xs uppercase tracking-wide">
                        Collect Reward
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-stone-500 italic py-2">No active missions.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar Elements (Absolute Positioned) */}

        {/* Toolbar - Bottom Left */}
        <div className="absolute bottom-4 left-4 pointer-events-auto z-50 flex gap-2 md:gap-4 bg-stone-900/80 p-3 rounded-2xl border border-stone-600/50 backdrop-blur-xl shadow-2xl justify-center w-auto flex-wrap items-center">

          {/* Rotate Button */}
          <button
            onClick={onRotate}
            className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 flex flex-col items-center justify-center transition-all shadow-xl bg-stone-800/90 border-stone-500 text-stone-300 hover:bg-stone-700 hover:text-white"
            title="Rotate Object (R)"
          >
            <span className="text-3xl md:text-4xl mb-1 filter drop-shadow-md" style={{ transform: `rotate(${currentRotation * 90}deg)`, transition: 'transform 0.2s' }}>↻</span>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Rotate</span>
          </button>

          <div className="w-px h-12 bg-stone-600/50 mx-1"></div>

          {(Object.keys(CATEGORIES) as CategoryKey[]).map(key => (
            <CategoryGroup
              key={key}
              categoryKey={key}
              isSelected={false} // Selection is handled per tool
              selectedTool={selectedTool}
              onSelectTool={onSelectTool}
              stats={stats}
              currencySymbol={currencySymbol}
              gameMode={gameMode}
            />
          ))}
        </div>

        {/* Bottom Right: News Feed & Notifications */}
        <div className="absolute bottom-1 right-2 md:right-4 pointer-events-none flex flex-col-reverse items-end gap-2 z-40">
          <div className="pointer-events-auto flex flex-col gap-2 items-end">
            {/* Student Tea Chat */}
            <StudentTea messages={teaMessages} />

            {/* News Feed */}
            <div className="w-full md:w-80 h-24 md:h-32 bg-black/60 text-stone-200 rounded-xl border border-stone-700 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden relative">
              <div className="bg-stone-800/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-400 border-b border-stone-700">
                Campus Updates
              </div>

              <div ref={newsRef} className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 text-[10px] md:text-xs font-serif italic scroll-smooth">
                {newsFeed.map((news) => (
                  <div key={news.id} className="text-stone-300 opacity-80 leading-tight">
                    • {news.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Campus Chatboard */}
        <Chatboard messages={chatboardMessages} />

        {/* Footer */}
        <div className="absolute bottom-1 right-2 text-[10px] text-teal-800/50 pointer-events-none">
          <a href="https://github.com/yourusername/stanford-forest-focus" target="_blank" rel="noopener noreferrer" className="pointer-events-auto hover:text-teal-900">
            Stanford Forest Focus
          </a>
        </div>
      </div>
    </div>
  );
};


export default UIOverlay;
