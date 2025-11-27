
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { BuildingConfig, BuildingType } from './types';

// Map Settings
export const GRID_SIZE = 60;

// Game Settings
export const TICK_RATE_MS = 1000; // 1 Tick = 1 Day
export const INITIAL_MONEY = 25000; // Start with less to increase challenge
export const CAMPAIGN_GOAL = 1000000000; // $1 Billion

// Unlock Schedule Helper (Years -> Days)
export const YEAR_1 = 0;
export const YEAR_2 = 365;
export const YEAR_3 = 730;
export const YEAR_4 = 1095;
export const YEAR_5 = 1460;
export const YEAR_6 = 1825;
export const YEAR_7 = 2190;
export const YEAR_8 = 2555;
export const YEAR_9 = 2920;
export const YEAR_10 = 3285;

// Phase 1: Historical Timeline Mapping
export const HISTORICAL_START_YEAR = 1950;
export const HISTORICAL_END_YEAR = 2025;
export const TOTAL_GAME_YEARS = 10;
// Maps 1 game year to ~7.5 historical years
export const HISTORICAL_YEARS_PER_GAME_YEAR = (HISTORICAL_END_YEAR - HISTORICAL_START_YEAR) / TOTAL_GAME_YEARS;

export const getHistoricalYear = (gameDay: number): number => {
    const gameYear = gameDay / 365;
    return Math.floor(HISTORICAL_START_YEAR + (gameYear * HISTORICAL_YEARS_PER_GAME_YEAR));
};

export const BUILDINGS: Record<BuildingType, BuildingConfig> = {
  [BuildingType.None]: {
    type: BuildingType.None,
    cost: 0,
    name: 'Clear',
    description: 'Clear a tile',
    color: '#ef4444', 
    popGen: 0,
    incomeGen: 0,
    unlockDay: YEAR_1,
  },
  [BuildingType.Path]: {
    type: BuildingType.Path,
    cost: 200,
    name: 'Path',
    description: 'Students use this to travel.',
    color: '#d6d3d1', 
    popGen: 0,
    incomeGen: 0,
    unlockDay: YEAR_1,
    statBonuses: { Wellbeing: 1 }
  },
  [BuildingType.Stanford]: {
    type: BuildingType.Stanford,
    cost: 0,
    name: 'Mem. Church',
    description: 'The heart of campus.',
    color: '#fcd34d', 
    popGen: 50,
    incomeGen: 200, 
    unlockDay: YEAR_1,
    school: 'Humanities',
    statBonuses: { Prestige: 20, Culture: 25, Wellbeing: 10 }
  },
  [BuildingType.HooverTower]: {
    type: BuildingType.HooverTower,
    cost: 300000,
    name: 'Hoover Tower',
    description: 'Iconic 285ft landmark.',
    color: '#d4b896',
    popGen: 50,
    incomeGen: 400,
    unlockDay: YEAR_9, // Late Game Prestige
    statBonuses: { Prestige: 50, Innovation: 10 }
  },
  [BuildingType.EngineeringQuad]: {
    type: BuildingType.EngineeringQuad,
    cost: 750000,
    name: 'Eng. Quad',
    description: 'Science & Engineering Hub.',
    color: '#e6d7b9',
    popGen: 60,
    incomeGen: 600,
    unlockDay: YEAR_10, // Final Challenge
    school: 'Engineering',
    statBonuses: { Innovation: 40, Research: 40, Prestige: 20 }
  },
  [BuildingType.ArrillagaHall]: {
    type: BuildingType.ArrillagaHall,
    cost: 150000,
    name: 'Arrillaga Hall',
    description: 'Premier Dining & Events.',
    color: '#fdfcf5',
    popGen: 20,
    incomeGen: 300,
    unlockDay: YEAR_2,
    school: 'Business',
    statBonuses: { Wellbeing: 25, Culture: 10 }
  },
  [BuildingType.CoupaCafe]: {
    type: BuildingType.CoupaCafe,
    cost: 15000,
    name: 'Coupa Cafe',
    description: 'High revenue. Optimal: 1 per 3 Dorms.',
    color: '#15803d', 
    popGen: 2,
    incomeGen: 150, 
    unlockDay: 180, // 6 Months in
    school: 'Business',
    statBonuses: { Wellbeing: 5, Culture: 2 }
  },
  // Phase 1 New Building: Trader Joe's
  [BuildingType.TraderJoes]: {
    type: BuildingType.TraderJoes,
    cost: 25000,
    name: "Trader Joe's",
    description: 'Affordable, healthy food for students.',
    color: '#ef4444', 
    popGen: 5,
    incomeGen: 200,
    unlockDay: YEAR_4,
    school: 'Business',
    statBonuses: { Wellbeing: 10, Culture: 5 }
  },
  // Phase 1 New Building: d.school
  [BuildingType.DSchool]: {
    type: BuildingType.DSchool,
    cost: 120000,
    name: 'd.school',
    description: 'Hasso Plattner Institute of Design.',
    color: '#f472b6', 
    popGen: 15,
    incomeGen: 150,
    unlockDay: YEAR_5,
    school: 'Humanities', 
    statBonuses: { Innovation: 25, Culture: 25 }
  },
  [BuildingType.StudentDorm]: {
    type: BuildingType.StudentDorm,
    cost: 50000,
    name: 'Dorm',
    description: 'Housing. Requires amenities.',
    color: '#9a3412', 
    popGen: 20,
    incomeGen: 50, 
    unlockDay: YEAR_1,
    statBonuses: { Wellbeing: 5 }
  },
  [BuildingType.LectureHall]: {
    type: BuildingType.LectureHall,
    cost: 100000,
    name: 'Lecture Hall',
    description: 'Education. Optimal: 1 per 2 Dorms.',
    color: '#78716c', 
    popGen: 10,
    incomeGen: 100, 
    unlockDay: YEAR_3,
    school: 'Education',
    statBonuses: { Research: 10, Innovation: 5 }
  },
  [BuildingType.VapeStore]: {
    type: BuildingType.VapeStore,
    cost: 25000,
    name: 'Vape Shop',
    description: 'High short-term revenue, damages health.',
    color: '#7e22ce', 
    popGen: -5,
    incomeGen: 500, 
    unlockDay: YEAR_5, // Unlocks Year 5
    statBonuses: { Wellbeing: -10, Culture: -5 }
  },
  [BuildingType.OakSeed]: {
    type: BuildingType.OakSeed,
    cost: 500,
    name: 'Acorn',
    description: 'Plants an Oak Tree.',
    color: '#a3e635', 
    popGen: 1,
    incomeGen: 0,
    unlockDay: YEAR_1,
    school: 'Sustainability',
    statBonuses: { Nature: 1 }
  },
  [BuildingType.OakSapling]: {
    type: BuildingType.OakSapling,
    cost: 0, 
    name: 'Oak Sapling',
    description: 'Growing...',
    color: '#4ade80', 
    popGen: 2,
    incomeGen: 0,
    unlockDay: YEAR_1,
    statBonuses: { Nature: 2 }
  },
  [BuildingType.OakTree]: {
    type: BuildingType.OakTree,
    cost: 0,
    name: 'Oak Tree',
    description: 'A majestic oak.',
    color: '#15803d', 
    popGen: 10,
    incomeGen: 10, 
    unlockDay: YEAR_1,
    school: 'Sustainability',
    statBonuses: { Nature: 5 }
  },
  [BuildingType.PineSeed]: {
    type: BuildingType.PineSeed,
    cost: 500,
    name: 'Pine Cone',
    description: 'Plants a Pine Tree.',
    color: '#bef264', 
    popGen: 1,
    incomeGen: 0,
    unlockDay: YEAR_1,
    school: 'Sustainability',
    statBonuses: { Nature: 1 }
  },
  [BuildingType.PineSapling]: {
    type: BuildingType.PineSapling,
    cost: 0,
    name: 'Pine Sapling',
    description: 'Growing...',
    color: '#86efac', 
    popGen: 2,
    incomeGen: 0,
    unlockDay: YEAR_1,
    statBonuses: { Nature: 2 }
  },
  [BuildingType.PineTree]: {
    type: BuildingType.PineTree,
    cost: 0,
    name: 'Pine Tree',
    description: 'Tall and sturdy.',
    color: '#14532d', 
    popGen: 8,
    incomeGen: 10, 
    unlockDay: YEAR_1,
    school: 'Sustainability',
    statBonuses: { Nature: 4 }
  },
  [BuildingType.PalmSeed]: {
    type: BuildingType.PalmSeed,
    cost: 600,
    name: 'Coconut',
    description: 'Plants a Palm Tree.',
    color: '#d4a373', 
    popGen: 1,
    incomeGen: 0,
    unlockDay: YEAR_4, // Exotic unlock
    school: 'Sustainability',
    statBonuses: { Nature: 1 }
  },
  [BuildingType.PalmSapling]: {
    type: BuildingType.PalmSapling,
    cost: 0,
    name: 'Palm Sapling',
    description: 'Growing...',
    color: '#84cc16', 
    popGen: 2,
    incomeGen: 0,
    unlockDay: YEAR_4,
    statBonuses: { Nature: 2 }
  },
  [BuildingType.PalmTree]: {
    type: BuildingType.PalmTree,
    cost: 0,
    name: 'Palm Tree',
    description: 'Tropical vibes.',
    color: '#4d7c0f', 
    popGen: 8,
    incomeGen: 10,
    unlockDay: YEAR_4, 
    school: 'Sustainability',
    statBonuses: { Nature: 4 }
  },
  [BuildingType.StudySpot]: {
    type: BuildingType.StudySpot,
    cost: 5000,
    name: 'Study Spot',
    description: 'Bench & Table. Optimal: 2 per 1 Dorm.',
    color: '#78350f', 
    popGen: 5,
    incomeGen: 25,
    unlockDay: YEAR_1,
    school: 'Education',
    statBonuses: { Wellbeing: 2, Research: 1 }
  },
  [BuildingType.PicnicTable]: {
    type: BuildingType.PicnicTable,
    cost: 2000,
    name: 'Picnic Table',
    description: 'Social dining area.',
    color: '#92400e',
    popGen: 3,
    incomeGen: 10,
    unlockDay: YEAR_1,
    statBonuses: { Wellbeing: 3, Culture: 1 }
  },
  [BuildingType.StreetLamp]: {
    type: BuildingType.StreetLamp,
    cost: 1000,
    name: 'Street Lamp',
    description: 'Safety & Aesthetics.',
    color: '#1f2937',
    popGen: 1,
    incomeGen: 5,
    unlockDay: YEAR_1,
    statBonuses: { Wellbeing: 1 }
  },
  [BuildingType.RoseBush]: {
    type: BuildingType.RoseBush,
    cost: 1500,
    name: 'Rose Bush',
    description: 'Beautiful flowers.',
    color: '#e11d48',
    popGen: 5,
    incomeGen: 5,
    unlockDay: YEAR_2,
    statBonuses: { Nature: 2, Culture: 1 }
  },
  [BuildingType.GardenBed]: {
    type: BuildingType.GardenBed,
    cost: 3000,
    name: 'Garden Bed',
    description: 'Raised flower planter.',
    color: '#a8a29e',
    popGen: 8,
    incomeGen: 5,
    unlockDay: YEAR_2,
    statBonuses: { Nature: 3 }
  },
  [BuildingType.Hedge]: {
    type: BuildingType.Hedge,
    cost: 1000,
    name: 'Hedge',
    description: 'Manicured greenery.',
    color: '#166534',
    popGen: 2,
    incomeGen: 0,
    unlockDay: YEAR_1,
    statBonuses: { Nature: 1 }
  },
  [BuildingType.TennisCourt]: {
    type: BuildingType.TennisCourt,
    cost: 40000,
    name: 'Tennis Court',
    description: 'Recreation & Fitness.',
    color: '#3b82f6',
    popGen: 5,
    incomeGen: 80,
    unlockDay: YEAR_2,
    school: 'Education',
    statBonuses: { Wellbeing: 5, Prestige: 2 }
  },
  [BuildingType.VolleyballCourt]: {
    type: BuildingType.VolleyballCourt,
    cost: 25000,
    name: 'Beach Volleyball',
    description: 'Sand court for fun.',
    color: '#fcd34d',
    popGen: 5,
    incomeGen: 60,
    unlockDay: YEAR_3,
    statBonuses: { Wellbeing: 4, Culture: 1 }
  },
  [BuildingType.FootballField]: {
    type: BuildingType.FootballField,
    cost: 150000,
    name: 'Football Field',
    description: 'Major sports facility.',
    color: '#15803d',
    popGen: 15,
    incomeGen: 300,
    unlockDay: YEAR_7,
    school: 'Business',
    statBonuses: { Prestige: 15, Culture: 5, Wellbeing: 5 }
  },
  [BuildingType.TrackField]: {
    type: BuildingType.TrackField,
    cost: 120000,
    name: 'Track & Field',
    description: 'Athletics stadium.',
    color: '#ef4444',
    popGen: 15,
    incomeGen: 250,
    unlockDay: YEAR_5,
    school: 'Medicine',
    statBonuses: { Wellbeing: 10, Prestige: 5 }
  },
  [BuildingType.Oval]: {
    type: BuildingType.Oval,
    cost: 80000,
    name: 'The Oval',
    description: 'Large open park area.',
    color: '#4ade80',
    popGen: 30,
    incomeGen: 100,
    unlockDay: YEAR_8,
    school: 'Sustainability',
    statBonuses: { Nature: 20, Wellbeing: 10, Culture: 5 }
  },
  [BuildingType.ClawFountain]: {
    type: BuildingType.ClawFountain,
    cost: 45000,
    name: 'The Claw',
    description: 'Iconic Stanford Fountain.',
    color: '#0ea5e9',
    popGen: 25,
    incomeGen: 60,
    unlockDay: YEAR_4,
    school: 'Humanities',
    statBonuses: { Culture: 15, Prestige: 5 }
  },
  [BuildingType.RodinSculpture]: {
    type: BuildingType.RodinSculpture,
    cost: 60000,
    name: 'Rodin Sculpture',
    description: 'Bronze masterpiece.',
    color: '#573d27',
    popGen: 35,
    incomeGen: 50,
    unlockDay: YEAR_6,
    school: 'Humanities',
    statBonuses: { Culture: 25, Prestige: 10 }
  },
  [BuildingType.TotemSculpture]: {
    type: BuildingType.TotemSculpture,
    cost: 35000,
    name: 'PNG Totem',
    description: 'Carved wooden sculpture.',
    color: '#9a3412',
    popGen: 20,
    incomeGen: 40,
    unlockDay: YEAR_8,
    school: 'Humanities',
    statBonuses: { Culture: 15, Nature: 5 }
  },
};
