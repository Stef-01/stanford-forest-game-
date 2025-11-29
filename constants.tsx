
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { BuildingConfig, BuildingType, AlumniEvent } from './types';

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

// Phase 1: Alumni Events Database
export const ALUMNI_EVENTS: AlumniEvent[] = [
  {
    id: 'hewlett_packard',
    triggerYear: 1,
    historicalYear: 1939, // Founding of HP (Technically earlier, but fits early game)
    ceoName: 'Bill Hewlett & Dave Packard',
    milestoneTitle: 'The Garage Era',
    articleMessage: "Two students formalize their partnership in a Palo Alto garage. 'Silicon Valley' is born.",
    directQuote: "Make a contribution. That's the only way to be happy.",
    studentDialogue: [
      "Did you hear about Bill and Dave?",
      "They say they're building oscillators.",
      "Garages are the new labs."
    ],
    buildingUnlock: BuildingType.EngineeringQuad, // Early unlock for fun or just logic
    bonuses: { Entrepreneurial: 1.2 },
    visualTraits: { outfit: 'suit', accessory: 'glasses' }
  },
  {
    id: 'nike_knight',
    triggerYear: 2,
    historicalYear: 1962,
    ceoName: 'Phil Knight',
    milestoneTitle: 'Blue Ribbon Sports',
    articleMessage: "A business grad starts importing shoes from Japan. A global athletic empire begins.",
    directQuote: "Play by the rules, but be ferocious.",
    studentDialogue: [
      "Nice shoes!",
      "I think he ran track here.",
      "Just do it? What does that mean?"
    ],
    buildingUnlock: BuildingType.TrackField,
    bonuses: { Wellbeing: 1.15, Culture: 1.1, Execution: 1.1 },
    visualTraits: { outfit: 'sporty' }
  },
  {
    id: 'trader_joes',
    triggerYear: 3,
    historicalYear: 1967, // First TJ's
    ceoName: 'Joe Coulombe',
    milestoneTitle: 'Trader Joe\'s Opens',
    articleMessage: "Alum Joe Coulombe opens a nautical-themed grocery store. Two-Buck Chuck is coming.",
    directQuote: "I wanted to create a store for overeducated and underpaid people.",
    studentDialogue: [
      "Finally, affordable snacks!",
      "I love the Hawaiian shirts.",
      "Cookie Butter is life."
    ],
    buildingUnlock: BuildingType.TraderJoes,
    bonuses: { Wellbeing: 1.2, Equity: 1.1 },
    visualTraits: { outfit: 'casual' }
  },
  {
    id: 'sun_microsystems',
    triggerYear: 4,
    historicalYear: 1982,
    ceoName: 'Scott McNealy',
    milestoneTitle: 'The Network is the Computer',
    articleMessage: "Sun Microsystems founded. Stanford University Network (SUN) terminals go global.",
    directQuote: "Get the right people on the bus.",
    studentDialogue: [
      "My workstation is so fast now.",
      "Java is the future.",
      "Pizza boxes everywhere in the lab."
    ],
    bonuses: { Entrepreneurial: 1.1, Academic: 1.1, AI: 1.05 },
    visualTraits: { outfit: 'suit' }
  },
  {
    id: 'cisco_systems',
    triggerYear: 4,
    historicalYear: 1984,
    ceoName: 'Sandy Lerner & Len Bosack',
    milestoneTitle: 'Connecting the World',
    articleMessage: "Stanford staff members invent the multi-protocol router. The internet backbone is formed.",
    directQuote: "We just wanted to email each other across campus.",
    studentDialogue: [
      "The network is actually working!",
      "Routers? What are those?",
      "They got married and started a company?"
    ],
    bonuses: { Academic: 1.15, Execution: 1.1 },
    visualTraits: { outfit: 'casual', accessory: 'glasses' }
  },
  {
    id: 'yahoo_jerry_david',
    triggerYear: 5,
    historicalYear: 1994,
    ceoName: 'Jerry Yang & David Filo',
    milestoneTitle: 'Jerry and David\'s Guide',
    articleMessage: "Two PhD students create a directory of the web in a trailer. It's called Yahoo!",
    directQuote: "We were just trying to keep track of our favorite links.",
    studentDialogue: [
      "Have you seen this 'web' thing?",
      "Yahoooooo!",
      "I'm procrastinating on my thesis too."
    ],
    bonuses: { Culture: 1.1, Entrepreneurial: 1.05 },
    visualTraits: { outfit: 'casual' }
  },
  {
    id: 'google_larry_sergey',
    triggerYear: 6,
    historicalYear: 1998,
    ceoName: 'Larry Page & Sergey Brin',
    milestoneTitle: 'BackRub -> Google',
    articleMessage: "A search engine running on Stanford servers is consuming all the bandwidth. Google is incorporated.",
    directQuote: "Organize the world's information.",
    studentDialogue: [
      "The servers are down again.",
      "I'm feeling lucky.",
      "They tried to sell it for $1M?"
    ],
    bonuses: { Entrepreneurial: 1.3, Academic: 1.2, AI: 1.1 },
    visualTraits: { outfit: 'casual', accessory: 'glasses' }
  },
  {
    id: 'netflix_hastings',
    triggerYear: 6,
    historicalYear: 1997,
    ceoName: 'Reed Hastings',
    milestoneTitle: 'No Late Fees',
    articleMessage: "After a massive Blockbuster fine, Reed Hastings starts a DVD-by-mail service.",
    directQuote: "Stone age companies don't adapt.",
    studentDialogue: [
      "DVDs in the mail? Weird.",
      "Blockbuster is invincible though.",
      "I hate late fees."
    ],
    bonuses: { Culture: 1.15, Wellbeing: 1.05, Execution: 1.1 },
    visualTraits: { outfit: 'casual' }
  },
  {
    id: 'paypal_thiel',
    triggerYear: 7,
    historicalYear: 1998,
    ceoName: 'Peter Thiel',
    milestoneTitle: 'The PayPal Mafia',
    articleMessage: "Digital currency takes off. The 'PayPal Mafia' will spawn Tesla, LinkedIn, and more.",
    directQuote: "Competition is for losers.",
    studentDialogue: [
      "Sending money by email?",
      "He's teaching a class on startups.",
      "Zero to One."
    ],
    bonuses: { Donor: 1.1, Entrepreneurial: 1.1 },
    visualTraits: { outfit: 'suit' }
  },
  {
    id: 'linkedin_hoffman',
    triggerYear: 7,
    historicalYear: 2002,
    ceoName: 'Reid Hoffman',
    milestoneTitle: 'Professional Networking',
    articleMessage: "Social networking goes corporate. LinkedIn connects the world's professionals.",
    directQuote: "If you aren't embarrassed by the first version of your product, you launched too late.",
    studentDialogue: [
      "Add me on LinkedIn.",
      "I need an internship.",
      "Networking is key."
    ],
    bonuses: { Donor: 1.15, Execution: 1.05 },
    visualTraits: { outfit: 'casual', accessory: 'glasses' }
  },
  {
    id: 'tesla_musk',
    triggerYear: 8,
    historicalYear: 2003, // Musk joined early
    ceoName: 'Elon Musk',
    milestoneTitle: 'Electric Revolution',
    articleMessage: "Tesla Motors sets out to prove electric cars can be better than gasoline cars.",
    directQuote: "I would like to die on Mars. Just not on impact.",
    studentDialogue: [
      "Electric cars? No way.",
      "He's also doing rockets?",
      "Iron Man IRL."
    ],
    bonuses: { Entrepreneurial: 1.25, Wellbeing: 1.1, AI: 1.1 },
    visualTraits: { outfit: 'leather_jacket' }
  },
  {
    id: 'youtube_jawed',
    triggerYear: 8,
    historicalYear: 2005,
    ceoName: 'Jawed Karim',
    milestoneTitle: 'Me at the zoo',
    articleMessage: "The first video is uploaded to YouTube. Broadcast Yourself.",
    directQuote: "The interesting thing about that is...",
    studentDialogue: [
      "Cat videos forever.",
      "Buffering...",
      "I'm going to be a vlogger."
    ],
    bonuses: { Culture: 1.2 },
    visualTraits: { outfit: 'casual' }
  },
  {
    id: 'instagram_systrom',
    triggerYear: 9,
    historicalYear: 2010,
    ceoName: 'Kevin Systrom',
    milestoneTitle: 'Do it for the Gram',
    articleMessage: "A check-in app pivots to photo filters. Instagram is born.",
    directQuote: "Focus on the solution, not the problem.",
    studentDialogue: [
      "What filter should I use?",
      "Square photos only.",
      "Mayfield Fellows program works!"
    ],
    bonuses: { Culture: 1.25, Wellbeing: 0.95 }, // Slight wellbeing hit for social media
    visualTraits: { outfit: 'casual' }
  },
  {
    id: 'snapchat_spiegel',
    triggerYear: 9,
    historicalYear: 2011,
    ceoName: 'Evan Spiegel',
    milestoneTitle: 'Ghost Mode',
    articleMessage: "Disappearing photos app launches from a Kappa Sigma frat house.",
    directQuote: "Life is more fun when you live in the moment.",
    studentDialogue: [
      "It disappears?",
      "Don't screenshot it!",
      "Product design class project?"
    ],
    bonuses: { Culture: 1.1 },
    visualTraits: { outfit: 'casual' }
  },
  {
    id: 'stripe_collison',
    triggerYear: 9,
    historicalYear: 2010,
    ceoName: 'Patrick & John Collison',
    milestoneTitle: 'Payments Infrastructure',
    articleMessage: "Seven lines of code to accept payments. The internet's GDP grows.",
    directQuote: "Increase the GDP of the internet.",
    studentDialogue: [
      "The API is so clean.",
      "They dropped out too?",
      "Payments solved."
    ],
    bonuses: { Entrepreneurial: 1.15, Donor: 1.1, Execution: 1.1 },
    visualTraits: { outfit: 'casual' }
  },
  {
    id: 'theranos_holmes',
    triggerYear: 9,
    historicalYear: 2014, // Peak valuation
    ceoName: 'Elizabeth Holmes',
    milestoneTitle: 'Bad Blood',
    articleMessage: "Revolutionary blood testing startup reaches $9B valuation. But is it real?",
    directQuote: "This changes everything.",
    studentDialogue: [
      "One drop of blood?",
      "The voice is deep.",
      "Steve Jobs vibes."
    ],
    bonuses: { Donor: -1.1, Entrepreneurial: -1.1 }, // Penalty event!
    visualTraits: { outfit: 'suit' } // Black turtleneck implied
  },
  {
    id: 'openai_altman',
    triggerYear: 10,
    historicalYear: 2015,
    ceoName: 'Sam Altman',
    milestoneTitle: 'Artificial General Intelligence',
    articleMessage: "OpenAI is founded to ensure AGI benefits all of humanity.",
    directQuote: "AI will be the greatest technology humanity has yet developed.",
    studentDialogue: [
      "Will it take our jobs?",
      "ChatGPT wrote my essay.",
      "Scale is all you need."
    ],
    bonuses: { Entrepreneurial: 1.5, Academic: 1.3, AI: 1.5 },
    visualTraits: { outfit: 'casual' }
  },
  {
    id: 'nvidia_huang',
    triggerYear: 10,
    historicalYear: 2023, // Trillion dollar club
    ceoName: 'Jensen Huang',
    milestoneTitle: 'The AI Factory',
    articleMessage: "NVIDIA hits $1 Trillion valuation. GPUs power the AI revolution.",
    directQuote: "The more you buy, the more you save.",
    studentDialogue: [
      "Leather jacket season.",
      "H100s are gold.",
      "Accelerated computing."
    ],
    bonuses: { Entrepreneurial: 1.4, Donor: 1.3, AI: 1.4 },
    visualTraits: { outfit: 'leather_jacket' }
  },
  {
    id: 'dschool_kelley',
    triggerYear: 5,
    historicalYear: 2004,
    ceoName: 'David Kelley',
    milestoneTitle: 'Design Thinking',
    articleMessage: "The Hasso Plattner Institute of Design (d.school) opens. Empathy meets engineering.",
    directQuote: "Fail faster to succeed sooner.",
    studentDialogue: [
      "Post-it notes everywhere.",
      "Human-centered design.",
      "I'm taking a class there."
    ],
    buildingUnlock: BuildingType.DSchool,
    bonuses: { Entrepreneurial: 1.2, Culture: 1.2 },
    visualTraits: { outfit: 'casual', accessory: 'glasses' }
  }
];

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
    statBonuses: { Donor: 20, Culture: 25, Wellbeing: 10 },
    interactionOffset: { x: 0, z: 0.8 } // Stand in front
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
    statBonuses: { Donor: 50, Entrepreneurial: 10, Execution: 20 }
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
    statBonuses: { Entrepreneurial: 40, Academic: 40, Donor: 20, AI: 30 },
    interactionOffset: { x: 0, z: 0.9 } // Stand at entrance
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
    statBonuses: { Wellbeing: 25, Culture: 10, Execution: 10 }
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
    statBonuses: { Wellbeing: 10, Culture: 5, Equity: 10 }
  },
  // Phase 1 New Building: d.school
  [BuildingType.DSchool]: {
    type: BuildingType.DSchool,
    cost: 120000,
    name: 'Glass Square Installation',
    description: 'Hasso Plattner Institute of Design.',
    color: '#f472b6',
    popGen: 15,
    incomeGen: 150,
    unlockDay: YEAR_5,
    school: 'Humanities',
    statBonuses: { Entrepreneurial: 25, Culture: 25 }
  },
  // Li Ka Shing Center for Learning and Knowledge
  [BuildingType.LiKaShing]: {
    type: BuildingType.LiKaShing,
    cost: 200000,
    name: 'Li Ka Shing Center',
    description: 'Center for Learning and Knowledge - Modern medical education facility.',
    color: '#8B2942', // Burgundy canopy color
    popGen: 25,
    incomeGen: 350,
    unlockDay: YEAR_6,
    school: 'Medicine',
    statBonuses: { Academic: 30, Wellbeing: 15, Donor: 20 }
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
    statBonuses: { Wellbeing: 5, Equity: 2 }
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
    statBonuses: { Academic: 10, Entrepreneurial: 5 }
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
    statBonuses: { Wellbeing: 1 }
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
    statBonuses: { Wellbeing: 2 }
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
    statBonuses: { Wellbeing: 5 }
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
    statBonuses: { Wellbeing: 1 }
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
    statBonuses: { Wellbeing: 2 }
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
    statBonuses: { Wellbeing: 4 }
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
    statBonuses: { Wellbeing: 1 }
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
    statBonuses: { Wellbeing: 2 }
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
    statBonuses: { Wellbeing: 4 }
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
    statBonuses: { Wellbeing: 2, Academic: 1 }
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
    statBonuses: { Wellbeing: 2, Culture: 1 }
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
    statBonuses: { Wellbeing: 3 }
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
    statBonuses: { Wellbeing: 1 }
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
    statBonuses: { Wellbeing: 5, Donor: 2 }
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
    statBonuses: { Donor: 15, Culture: 5, Wellbeing: 5 }
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
    statBonuses: { Wellbeing: 10, Donor: 5 }
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
    statBonuses: { Wellbeing: 30, Culture: 5 },
    interactionOffset: { x: 0, z: 0 },
    interactionRadius: 0.4 // Scatter around center
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
    statBonuses: { Culture: 15, Donor: 5 }
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
    statBonuses: { Culture: 25, Donor: 10 }
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
    statBonuses: { Culture: 15, Wellbeing: 5 }
  },
};
