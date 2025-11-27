
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Mission, BuildingType, CityStats, NewsItem, Grid } from '../types';

const MISSIONS: Omit<Mission, 'completed'>[] = [
    {
        id: 'm1',
        description: "Plant 3 Oak Trees to start your forest.",
        targetType: 'building_count',
        buildingType: BuildingType.OakTree,
        targetValue: 3,
        reward: 50000
    },
    {
        id: 'm2',
        description: "Build a Path network of 10 tiles.",
        targetType: 'building_count',
        buildingType: BuildingType.Path,
        targetValue: 10,
        reward: 20000
    },
    {
        id: 'm3',
        description: "Create 2 Study Spots for students.",
        targetType: 'building_count',
        buildingType: BuildingType.StudySpot,
        targetValue: 2,
        reward: 100000
    },
    {
        id: 'm4',
        description: "Reach 100 Nature Score.",
        targetType: 'population',
        targetValue: 100,
        reward: 75000
    },
    {
        id: 'm5',
        description: "Build a Student Dorm for residents.",
        targetType: 'building_count',
        buildingType: BuildingType.StudentDorm,
        targetValue: 1,
        reward: 250000
    },
    {
        id: 'm6',
        description: "Build a Lecture Hall for classes.",
        targetType: 'building_count',
        buildingType: BuildingType.LectureHall,
        targetValue: 1,
        reward: 300000
    },
    {
        id: 'm7',
        description: "Maintain 90% Student Well-being.",
        targetType: 'wellbeing',
        targetValue: 90,
        reward: 200000
    },
    {
        id: 'm8',
        description: "Build a Coupa Cafe to serve coffee.",
        targetType: 'building_count',
        buildingType: BuildingType.CoupaCafe,
        targetValue: 1,
        reward: 200000
    },
    {
        id: 'm9',
        description: "Reach $2,000,000 in Revenue.",
        targetType: 'money',
        targetValue: 2000000,
        reward: 500000
    },
    {
        id: 'm10',
        description: "Expand the forest to 30 Pine Trees.",
        targetType: 'building_count',
        buildingType: BuildingType.PineTree,
        targetValue: 30,
        reward: 250000
    }
];

export const getNextMission = (completedIds: string[]): Mission | null => {
    const next = MISSIONS.find(m => !completedIds.includes(m.id));
    return next ? { ...next, completed: false } : null;
};

const NEWS_TEMPLATES = [
    "Students are loving the new study spots!",
    "The forest air is helping everyone focus.",
    "A squirrel was seen stealing a bagel at Coupa.",
    "Midterms are approaching, coffee consumption is up.",
    "The campus looks beautiful this time of year.",
    "More trees mean more shade for studying.",
    "Students are requesting more walking paths.",
    "Focus levels are at an all-time high.",
    "Someone left a laptop in the quad... and it's still there.",
    "The band is practicing nearby.",
    "Local residents appreciate the greenery.",
    "Alumni are visiting to see the new forest.",
    "Dorm life is buzzing with activity."
];

export const generateLocalNews = (stats: CityStats): NewsItem => {
    if (stats.wellbeing < 50) {
        return {
             id: Date.now().toString() + Math.random(),
             text: "Students are protesting lack of amenities!",
             type: 'negative'
        };
    }
    const text = NEWS_TEMPLATES[Math.floor(Math.random() * NEWS_TEMPLATES.length)];
    return {
        id: Date.now().toString() + Math.random(),
        text,
        type: 'neutral'
    };
};
