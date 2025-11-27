
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Grid, TileData, BuildingType, CityStats, Mission, NewsItem, GameMode, StatCategory, SchoolType } from './types';
import { GRID_SIZE, BUILDINGS, TICK_RATE_MS, INITIAL_MONEY, CAMPAIGN_GOAL } from './constants';
import IsoMap from './components/IsoMap';
import UIOverlay from './components/UIOverlay';
import StartScreen from './components/StartScreen';
import StatsScreen from './components/StatsScreen';
import { getNextMission, generateLocalNews } from './services/localGameService';

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;
const MAX_CAMPAIGN_TICKS = 3650; // 10 Years approx

const createInitialGrid = (): Grid => {
  const grid: Grid = [];
  const center = Math.floor(GRID_SIZE / 2);

  for (let y = 0; y < GRID_SIZE; y++) {
    const row: TileData[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      let type = BuildingType.None;
      
      // Place Stanford Campus in center
      if (x === center && y === center) {
          type = BuildingType.Stanford;
      }
      
      // Place some initial trees far away
      const dist = Math.sqrt((x-center)**2 + (y-center)**2);
      if (type === BuildingType.None && dist > 18 && Math.random() > 0.92) {
          type = Math.random() > 0.6 ? BuildingType.OakTree : BuildingType.PineTree;
      }

      row.push({ x, y, buildingType: type, variant: type !== BuildingType.None ? 100 : 0, rotation: 0 });
    }
    grid.push(row);
  }
  return grid;
};

// Calculate All Metrics
const calculateMetrics = (counts: Record<string, number>, wellbeing: number): { metrics: Record<StatCategory, number>, schools: Record<SchoolType, number> } => {
    const metrics: Record<StatCategory, number> = {
        Innovation: 0, Research: 0, Prestige: 0, Culture: 0, Nature: 0, Wellbeing: wellbeing
    };
    const schools: Record<SchoolType, number> = {
        Engineering: 0, Medicine: 0, Business: 0, Law: 0, Humanities: 0, Sustainability: 0, Education: 0
    };

    // Base calculation from counts
    Object.keys(counts).forEach(key => {
        const type = key as BuildingType;
        const count = counts[type];
        const config = BUILDINGS[type];
        
        if (config.statBonuses) {
            Object.entries(config.statBonuses).forEach(([stat, val]) => {
                metrics[stat as StatCategory] += val * count;
            });
        }
        
        if (config.school) {
            schools[config.school] += 10 * count; // Base 10 points per building
            // Certain buildings give massive boosts to schools (defined implicitly via stats or manually here)
            if (type === BuildingType.EngineeringQuad && config.school === 'Engineering') schools['Engineering'] += 50;
        }
    });

    // Normalize / Cap (Soft Caps)
    const cap = (val: number) => Math.min(100, val);
    
    // Schools need to be balanced by general stats too
    schools.Engineering = cap(schools.Engineering + metrics.Innovation * 0.5);
    schools.Medicine = cap(schools.Medicine + metrics.Research * 0.5);
    schools.Business = cap(schools.Business + metrics.Prestige * 0.3);
    schools.Humanities = cap(schools.Humanities + metrics.Culture * 0.5);
    schools.Sustainability = cap(schools.Sustainability + metrics.Nature * 0.5);
    schools.Education = cap(schools.Education + metrics.Research * 0.3 + wellbeing * 0.2);
    schools.Law = cap(schools.Law + metrics.Prestige * 0.2 + metrics.Culture * 0.2); // Law inferred from prestige/culture

    // Cap Metrics
    Object.keys(metrics).forEach(k => {
        const key = k as StatCategory;
        if (key !== 'Wellbeing') metrics[key] = cap(metrics[key]);
    });

    return { metrics, schools };
}

// Calculate Well-being Score (0-100)
const calculateBaseWellbeing = (counts: Record<string, number>): number => {
    const dorms = counts[BuildingType.StudentDorm] || 0;
    
    if (dorms === 0) return 100;

    // Ratios
    // 1 Lecture Hall per 2 Dorms
    const lectureHalls = counts[BuildingType.LectureHall] || 0;
    const requiredLectureHalls = Math.ceil(dorms / 2);
    const educationScore = Math.min((lectureHalls / requiredLectureHalls), 1) * 100;

    // 2 Study Spots per 1 Dorm
    const studySpots = counts[BuildingType.StudySpot] || 0;
    const requiredStudy = dorms * 2;
    const studyScore = Math.min((studySpots / requiredStudy), 1) * 100;

    // 1 Cafe per 3 Dorms
    const cafes = counts[BuildingType.CoupaCafe] || 0;
    const requiredCafes = Math.ceil(dorms / 3);
    const foodScore = Math.min((cafes / requiredCafes), 1) * 100;

    // Base Score
    let score = (educationScore + studyScore + foodScore) / 3;

    return Math.max(0, Math.min(100, score));
};

function App() {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [grid, setGrid] = useState<Grid>(createInitialGrid);
  const [stats, setStats] = useState<CityStats>({ 
      money: INITIAL_MONEY, 
      population: 0, 
      day: 0, 
      wellbeing: 100, 
      longTermHealthPenalty: 0,
      gameWon: false,
      gameLost: false,
      campaignActive: true,
      metrics: { Innovation: 0, Research: 0, Prestige: 0, Culture: 0, Nature: 0, Wellbeing: 100 },
      schools: { Engineering: 0, Medicine: 0, Business: 0, Law: 0, Humanities: 0, Sustainability: 0, Education: 0 }
  });
  const [selectedTool, setSelectedTool] = useState<BuildingType>(BuildingType.OakSeed);
  const [rotation, setRotation] = useState<number>(0); 
  const [showStatsScreen, setShowStatsScreen] = useState(false);
  
  // Timer State
  const [timerState, setTimerState] = useState<{mode: 'idle' | 'focus' | 'break', timeLeft: number}>({
      mode: 'idle',
      timeLeft: FOCUS_TIME
  });

  const handleResetTimer = useCallback(() => {
    setTimerState({ mode: 'idle', timeLeft: FOCUS_TIME });
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 1) % 4);
  }, []);

  // Keyboard shortcut for rotation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'r') {
            handleRotate();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRotate]);
  
  // Focus Multiplier Calculations
  const timeElapsed = FOCUS_TIME - timerState.timeLeft; 
  let focusMultiplier = 1;
  let progressToNext = 0;

  if (timeElapsed < 60) {
      focusMultiplier = 1;
      progressToNext = (timeElapsed / 60) * 100;
  } else if (timeElapsed < 15 * 60) {
      focusMultiplier = 2;
      const t = timeElapsed - 60;
      const total = (15 * 60) - 60;
      progressToNext = (t / total) * 100;
  } else if (timeElapsed < 25 * 60) {
      focusMultiplier = 5;
      const t = timeElapsed - (15 * 60);
      const total = (10 * 60);
      progressToNext = (t / total) * 100;
  } else {
      focusMultiplier = 10;
      progressToNext = 100;
  }
  
  const [currentGoal, setCurrentGoal] = useState<Mission | null>(null);
  const [completedGoals, setCompletedGoals] = useState<string[]>([]);
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>([]);
  
  const pendingIncomeRef = useRef(0);
  const gridRef = useRef(grid);
  const statsRef = useRef(stats);
  const goalRef = useRef(currentGoal);
  const modeRef = useRef(gameMode);
  const timerStateRef = useRef(timerState);

  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { statsRef.current = stats; }, [stats]);
  useEffect(() => { goalRef.current = currentGoal; }, [currentGoal]);
  useEffect(() => { modeRef.current = gameMode; }, [gameMode]);
  useEffect(() => { timerStateRef.current = timerState; }, [timerState]);

  const addNewsItem = useCallback((item: NewsItem) => {
    setNewsFeed(prev => [...prev.slice(-12), item]); 
  }, []);

  const updateMission = useCallback(() => {
     if (!goalRef.current) {
         const next = getNextMission(completedGoals);
         if (next) setCurrentGoal(next);
     }
  }, [completedGoals]);

  const handleStudentVisit = useCallback((amount: number) => {
      pendingIncomeRef.current += amount;
  }, []);

  useEffect(() => {
      if (!gameMode || gameMode === 'standard') return;
      
      const timerId = setInterval(() => {
          setTimerState(prev => {
              if (prev.mode === 'idle') return prev;
              
              if (prev.timeLeft <= 1) {
                  const nextMode = prev.mode === 'focus' ? 'break' : 'idle';
                  const nextTime = nextMode === 'break' ? BREAK_TIME : FOCUS_TIME;
                  
                  if (prev.mode === 'focus') {
                      addNewsItem({id: Date.now().toString(), text: "Focus session complete! Large Bonus awarded.", type: 'positive'});
                      setStats(s => ({...s, money: s.money + 50000 * 16})); 
                  }
                  
                  return { mode: nextMode, timeLeft: nextTime };
              }
              return { ...prev, timeLeft: prev.timeLeft - 1 };
          });
      }, 1000);
      
      return () => clearInterval(timerId);
  }, [gameMode, addNewsItem]);

  const handleToggleTimer = () => {
      setTimerState(prev => {
          if (prev.mode === 'idle') return { mode: 'focus', timeLeft: FOCUS_TIME };
          if (prev.mode === 'focus') return { mode: 'idle', timeLeft: FOCUS_TIME }; 
          if (prev.mode === 'break') return { mode: 'idle', timeLeft: FOCUS_TIME }; 
          return prev;
      });
  };

  const startGame = (mode: GameMode) => {
      setGameMode(mode);
      if (mode === 'creative') {
          addNewsItem({ id: 'init', text: "Welcome to Creative Mode! Sandbox engaged. Unlocked all assets.", type: 'positive' });
      } else {
          addNewsItem({ id: 'init', text: "Consultant: 'We have 10 years to reach $1 Billion. Get to work.'", type: 'neutral' });
          updateMission();
      }
  };

  useEffect(() => {
    if (!gameMode) return;

    const intervalId = setInterval(() => {
      let natureScore = 0;
      let buildingCounts: Record<string, number> = {};
      let changed = false;

      const newGrid = gridRef.current.map(row => row.map(tile => {
          const t = {...tile};
          if (t.buildingType.includes('Sapling') || t.buildingType.includes('Seed')) {
              if (Math.random() > 0.8) {
                  t.variant = (t.variant || 0) + 10;
                  if (t.variant >= 100) {
                      if (t.buildingType === BuildingType.OakSeed) t.buildingType = BuildingType.OakSapling;
                      else if (t.buildingType === BuildingType.OakSapling) t.buildingType = BuildingType.OakTree;
                      else if (t.buildingType === BuildingType.PineSeed) t.buildingType = BuildingType.PineSapling;
                      else if (t.buildingType === BuildingType.PineSapling) t.buildingType = BuildingType.PineTree;
                      else if (t.buildingType === BuildingType.PalmSeed) t.buildingType = BuildingType.PalmSapling;
                      else if (t.buildingType === BuildingType.PalmSapling) t.buildingType = BuildingType.PalmTree;
                      t.variant = 0;
                      changed = true;
                  }
                  changed = true;
              }
          }
          if (t.buildingType !== BuildingType.None) {
            const config = BUILDINGS[t.buildingType];
            natureScore += config.popGen;
            buildingCounts[t.buildingType] = (buildingCounts[t.buildingType] || 0) + 1;
          }
          return t;
      }));
      
      if (changed) setGrid(newGrid);

      setStats(prev => {
        const vapeStores = buildingCounts[BuildingType.VapeStore] || 0;
        let newHealthPenalty = prev.longTermHealthPenalty;
        if (vapeStores > 0) newHealthPenalty += (vapeStores * 0.2); 
        else if (newHealthPenalty > 0) newHealthPenalty -= 0.1;
        newHealthPenalty = Math.max(0, newHealthPenalty);

        const baseWellbeing = calculateBaseWellbeing(buildingCounts);
        const finalWellbeing = Math.max(0, baseWellbeing - newHealthPenalty);
        
        // Calculate Advanced Stats
        const { metrics, schools } = calculateMetrics(buildingCounts, finalWellbeing);

        let newMoney = prev.money;
        
        const prestigeMultiplier = 1 + (prev.population / 100);
        
        if (modeRef.current === 'standard' || modeRef.current === 'creative') {
             const efficiency = Math.max(0.1, finalWellbeing / 100);
             const baseIncome = pendingIncomeRef.current;
             const finalIncome = Math.floor(baseIncome * efficiency * prestigeMultiplier);
             newMoney += finalIncome;
        } else {
             const tm = timerStateRef.current;
             const isFocusing = tm.mode === 'focus';
             const elapsed = FOCUS_TIME - tm.timeLeft;
             let m = 1;
             if (elapsed > 60) m = 2;
             if (elapsed > 15*60) m = 5;
             if (elapsed > 25*60) m = 10;

             if (isFocusing) {
                 const baseIncome = pendingIncomeRef.current;
                 const finalIncome = Math.ceil(baseIncome * m * prestigeMultiplier);
                 newMoney += finalIncome;
             }
        }
        
        pendingIncomeRef.current = 0;

        let won = prev.gameWon;
        let lost = prev.gameLost;
        let active = prev.campaignActive;
        const nextDay = prev.day + 1;

        if (active && modeRef.current !== 'creative') {
            if (newMoney >= CAMPAIGN_GOAL) {
                won = true;
                active = false;
                addNewsItem({id: 'win', text: "CONGRATULATIONS! $1 BILLION REVENUE ACHIEVED!", type: 'positive'});
            } else if (nextDay >= MAX_CAMPAIGN_TICKS) {
                lost = true;
                active = false;
                addNewsItem({id: 'loss', text: "DEADLINE REACHED. Campaign Failed.", type: 'negative'});
            }
        }

        const newStats: CityStats = {
          money: newMoney,
          population: natureScore,
          day: nextDay,
          wellbeing: finalWellbeing,
          longTermHealthPenalty: newHealthPenalty,
          gameWon: won,
          gameLost: lost,
          campaignActive: active,
          metrics,
          schools
        };
        
        const goal = goalRef.current;
        if (goal && !goal.completed && modeRef.current !== 'creative') {
          let isMet = false;
          if (goal.targetType === 'money' && newStats.money >= goal.targetValue) isMet = true;
          if (goal.targetType === 'population' && newStats.population >= goal.targetValue) isMet = true;
          if (goal.targetType === 'wellbeing' && newStats.wellbeing >= goal.targetValue) isMet = true;
          if (goal.targetType === 'building_count' && goal.buildingType) {
             const count = (buildingCounts[goal.buildingType] || 0) + 
                           (goal.buildingType === BuildingType.OakTree ? (buildingCounts[BuildingType.OakSapling] || 0) : 0);
            if (count >= goal.targetValue) isMet = true;
          }

          if (isMet) {
            setCurrentGoal({ ...goal, completed: true });
          }
        }
        return newStats;
      });
      
      if (Math.random() > 0.95 && modeRef.current !== 'creative') {
          addNewsItem(generateLocalNews(statsRef.current));
      }

      if (modeRef.current !== 'creative') {
        updateMission();
      }

    }, TICK_RATE_MS);

    return () => clearInterval(intervalId);
  }, [addNewsItem, gameMode, updateMission]);

  const handleTileClick = useCallback((x: number, y: number) => {
    if (!gameMode) return;
    const currentStats = statsRef.current;
    const tool = selectedTool;
    const isCreative = gameMode === 'creative';
    
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
    if (gridRef.current[y][x].buildingType === BuildingType.Stanford) return;

    const currentTile = gridRef.current[y][x];
    const buildingConfig = BUILDINGS[tool];

    if (gameMode === 'pomodoro' && timerStateRef.current.mode === 'focus' && tool !== BuildingType.None) {
        handleResetTimer();
        addNewsItem({id: 'break_focus', text: "Focus streak broken! Timer reset.", type: 'negative'});
    }

    if (tool === BuildingType.None) {
      if (currentTile.buildingType !== BuildingType.None) {
        setGrid(prev => {
            const n = prev.map(r => [...r]);
            n[y][x] = { ...currentTile, buildingType: BuildingType.None, variant: 0 };
            return n;
        });
      }
      return;
    }

    if (currentTile.buildingType === BuildingType.None) {
      if (isCreative || currentStats.money >= buildingConfig.cost) {
        if (!isCreative) {
            setStats(prev => ({ ...prev, money: prev.money - buildingConfig.cost }));
        }
        setGrid(prev => {
            const n = prev.map(r => [...r]);
            n[y][x] = { ...currentTile, buildingType: tool, variant: 0, rotation: rotation };
            return n;
        });
      } else {
        const msg = "Insufficient funds!";
        addNewsItem({id: Date.now().toString(), text: msg, type: 'negative'});
      }
    }
  }, [selectedTool, addNewsItem, gameMode, handleResetTimer, rotation]);

  const handleClaimReward = () => {
    if (currentGoal && currentGoal.completed) {
      if (gameMode === 'pomodoro' && timerStateRef.current.mode === 'focus') {
          handleResetTimer();
          addNewsItem({id: 'break_focus_claim', text: "Claiming rewards broke your focus streak!", type: 'negative'});
      }
      
      setStats(prev => ({ ...prev, money: prev.money + currentGoal.reward }));
      setCompletedGoals(prev => [...prev, currentGoal.id]);
      setCurrentGoal(null);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-teal-900">
      <IsoMap 
        grid={grid} 
        onTileClick={handleTileClick} 
        hoveredTool={selectedTool}
        onStudentVisit={handleStudentVisit}
        rotation={rotation}
      />
      
      {!gameMode && (
        <StartScreen onStart={startGame} />
      )}

      {gameMode && (
        <>
          <UIOverlay
            stats={stats}
            selectedTool={selectedTool}
            onSelectTool={setSelectedTool}
            currentGoal={currentGoal}
            newsFeed={newsFeed}
            onClaimReward={handleClaimReward}
            isGeneratingGoal={false} 
            timerState={timerState}
            onToggleTimer={handleToggleTimer}
            onResetTimer={handleResetTimer}
            gameMode={gameMode}
            focusMultiplier={focusMultiplier}
            progressToNextMultiplier={progressToNext}
            onRotate={handleRotate}
            currentRotation={rotation}
            onOpenStats={() => setShowStatsScreen(true)}
          />
          {showStatsScreen && (
            <StatsScreen 
              stats={stats} 
              completedGoals={completedGoals} 
              onClose={() => setShowStatsScreen(false)} 
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
