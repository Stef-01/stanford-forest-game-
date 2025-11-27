
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export enum BuildingType {
  None = 'None',
  Path = 'Path',
  Stanford = 'Stanford',
  HooverTower = 'HooverTower',
  EngineeringQuad = 'EngineeringQuad',
  ArrillagaHall = 'ArrillagaHall',
  CoupaCafe = 'CoupaCafe',
  TraderJoes = 'TraderJoes', // New
  DSchool = 'DSchool', // New
  StudentDorm = 'StudentDorm',
  LectureHall = 'LectureHall',
  VapeStore = 'VapeStore',
  OakSeed = 'OakSeed',
  OakSapling = 'OakSapling',
  OakTree = 'OakTree',
  PineSeed = 'PineSeed',
  PineSapling = 'PineSapling',
  PineTree = 'PineTree',
  PalmSeed = 'PalmSeed',
  PalmSapling = 'PalmSapling',
  PalmTree = 'PalmTree',
  StudySpot = 'StudySpot',
  TennisCourt = 'TennisCourt',
  FootballField = 'FootballField',
  Oval = 'Oval',
  TrackField = 'TrackField',
  VolleyballCourt = 'VolleyballCourt',
  ClawFountain = 'ClawFountain',
  RodinSculpture = 'RodinSculpture',
  TotemSculpture = 'TotemSculpture',
  PicnicTable = 'PicnicTable',
  StreetLamp = 'StreetLamp',
  RoseBush = 'RoseBush',
  GardenBed = 'GardenBed',
  Hedge = 'Hedge',
}

export type GameMode = 'pomodoro' | 'standard' | 'creative';

export type SchoolType = 'Engineering' | 'Medicine' | 'Business' | 'Law' | 'Humanities' | 'Sustainability' | 'Education';

export type StatCategory = 'Innovation' | 'Research' | 'Prestige' | 'Culture' | 'Nature' | 'Wellbeing';

export interface BuildingConfig {
  type: BuildingType;
  cost: number;
  name: string;
  description: string;
  color: string; // Main color for 3D material
  popGen: number; // Nature score generation per tick
  incomeGen: number; // Base attraction value for students
  unlockDay: number; // Day the building becomes available (0 = start)
  school?: SchoolType; // Associated school
  statBonuses?: Partial<Record<StatCategory, number>>; // Bonus to specific stats
}

export interface TileData {
  x: number;
  y: number;
  buildingType: BuildingType;
  // Used for growth progress (0-100) or visual variety
  variant?: number;
  // Rotation (0 = 0deg, 1 = 90deg, 2 = 180deg, 3 = 270deg)
  rotation?: number;
}

export type Grid = TileData[][];

export interface CityStats {
  money: number; // Focus Points or USD
  population: number; // Nature Score
  day: number;
  wellbeing: number; // 0-100 percentage
  longTermHealthPenalty: number; // Cumulative penalty from unhealthy buildings
  gameWon: boolean;
  gameLost: boolean;
  campaignActive: boolean;
  
  // Advanced Stats (0-100 scale)
  metrics: Record<StatCategory, number>;
  schools: Record<SchoolType, number>;
}

export interface Mission {
  id: string;
  description: string;
  targetType: 'population' | 'money' | 'building_count' | 'wellbeing';
  targetValue: number;
  buildingType?: BuildingType; // If target is building_count
  reward: number;
  completed: boolean;
}

export interface NewsItem {
  id: string;
  text: string;
  type: 'positive' | 'negative' | 'neutral';
}

// Phase 1: Event Architecture
export interface AlumniEvent {
  id: string;
  triggerYear: number; // Game year (1-10) when this becomes available
  historicalYear: number; // The actual year (1950-2025) this represents
  ceoName: string;
  milestoneTitle: string;
  articleMessage: string;
  directQuote: string;
  studentDialogue: string[];
  buildingUnlock?: BuildingType; // If this event unlocks a building
  bonuses?: Partial<Record<StatCategory, number>>; // Permanent stat multiplier additions
  growthModifiers?: Partial<Record<SchoolType, number>>; // Permanent growth rate boosts
  visualTraits?: {
    outfit: 'suit' | 'casual' | 'leather_jacket' | 'sporty';
    accessory?: 'glasses' | 'none';
  };
}

export interface TeaMessage {
  id: string;
  text: string;
  sender: string; // e.g., "Grad Student", "Freshman", "System"
  timestamp: number; // Game Day
  type: 'gossip' | 'event' | 'quote';
}
