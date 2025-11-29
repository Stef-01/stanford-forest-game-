/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { CEOVisitor, Grid, BuildingType, TeaMessage } from '../types';
import { BUILDINGS } from '../constants';

/**
 * Get the next target building for a CEO to visit based on their discipline
 */
export const getCEOTargetBuilding = (ceo: CEOVisitor, grid: Grid): { x: number; y: number } | null => {
    // Map CEO events to relevant building types
    const disciplineMap: Record<string, BuildingType[]> = {
        'hp_engineering_quad': [BuildingType.EngineeringQuad, BuildingType.LectureHall],
        'nike_knight': [BuildingType.TrackField, BuildingType.FootballField],
        'trader_joes': [BuildingType.TraderJoes, BuildingType.CoupaCafe],
        'sun_microsystems': [BuildingType.EngineeringQuad],
        'cisco_systems': [BuildingType.EngineeringQuad],
        'yahoo_jerry_david': [BuildingType.EngineeringQuad, BuildingType.LectureHall],
        'google_larry_sergey': [BuildingType.EngineeringQuad],
        'netflix_hastings': [BuildingType.ArrillagaHall],
        'paypal_thiel': [BuildingType.ArrillagaHall],
        'linkedin_hoffman': [BuildingType.ArrillagaHall],
        'tesla_musk': [BuildingType.EngineeringQuad],
        'youtube_jawed': [BuildingType.EngineeringQuad],
        'instagram_systrom': [BuildingType.DSchool, BuildingType.ArrillagaHall],
        'snapchat_spiegel': [BuildingType.DSchool],
        'stripe_collison': [BuildingType.EngineeringQuad],
        'openai_altman': [BuildingType.EngineeringQuad],
        'nvidia_huang': [BuildingType.EngineeringQuad],
        'dschool_kelley': [BuildingType.DSchool]
    };

    const relevantBuildings = disciplineMap[ceo.event.id] || [BuildingType.Stanford];

    // Find unvisited buildings of relevant types
    const candidates: { x: number; y: number; type: BuildingType }[] = [];

    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            const tile = grid[y][x];
            if (relevantBuildings.includes(tile.buildingType) &&
                !ceo.visitedBuildings.includes(tile.buildingType)) {
                candidates.push({ x, y, type: tile.buildingType });
            }
        }
    }

    if (candidates.length === 0) return null;

    // Choose closest building
    const closest = candidates.reduce((best, curr) => {
        const distCurr = Math.abs(curr.x - ceo.x) + Math.abs(curr.y - ceo.y);
        const distBest = Math.abs(best.x - ceo.x) + Math.abs(best.y - ceo.y);
        return distCurr < distBest ? curr : best;
    });

    return { x: closest.x, y: closest.y };
};

/**
 * Generate a chat interaction message when CEO talks to students/faculty
 */
export const generateChatInteraction = (ceo: CEOVisitor, currentBuilding?: BuildingType): TeaMessage => {
    // Context-aware templates based on building type
    const buildingContextTemplates: Record<string, string[]> = {
        [BuildingType.EngineeringQuad]: [
            `${ceo.event.ceoName} is touring the Engineering labs!`,
            `Just saw ${ceo.event.ceoName} reviewing student projects in Engineering`,
            `${ceo.event.ceoName} is discussing AI research with professors`,
            `Engineering students are crowding around ${ceo.event.ceoName}!`
        ],
        [BuildingType.LectureHall]: [
            `${ceo.event.ceoName} just gave an impromptu lecture!`,
            `Students are taking notes as ${ceo.event.ceoName} speaks`,
            `${ceo.event.ceoName} is answering questions in the lecture hall`,
            `The lecture hall is packed to see ${ceo.event.ceoName}!`
        ],
        [BuildingType.DSchool]: [
            `${ceo.event.ceoName} is critiquing design prototypes at the d.school`,
            `Design thinking session with ${ceo.event.ceoName} happening now!`,
            `${ceo.event.ceoName} loves the creative energy at d.school`,
            `Students are pitching ideas to ${ceo.event.ceoName} at d.school`
        ],
        [BuildingType.ArrillagaHall]: [
            `${ceo.event.ceoName} is networking with business students`,
            `MBA students getting career advice from ${ceo.event.ceoName}`,
            `${ceo.event.ceoName} sharing entrepreneurship stories at Arrillaga`,
            `Business school is buzzing with ${ceo.event.ceoName}'s visit`
        ],
        [BuildingType.TrackField]: [
            `${ceo.event.ceoName} is watching the track team practice!`,
            `Athletes are starstruck seeing ${ceo.event.ceoName} at the track`,
            `${ceo.event.ceoName} is talking about discipline and performance`,
            `Track team getting motivational talk from ${ceo.event.ceoName}!`
        ]
    };

    // Faculty interaction templates
    const facultyTemplates = [
        `Professor just invited ${ceo.event.ceoName} to guest lecture next quarter`,
        `Faculty are discussing research collaboration with ${ceo.event.ceoName}`,
        `${ceo.event.ceoName} is meeting with department heads`,
        `Dean is giving ${ceo.event.ceoName} a campus tour`,
        `${ceo.event.ceoName} and professors talking about industry partnerships`
    ];

    // General student interaction templates
    const studentTemplates = [
        `Just saw ${ceo.event.ceoName} chatting with a CS student!`,
        `${ceo.event.ceoName} is giving career advice at the quad`,
        `OMG ${ceo.event.ceoName} just took a selfie with me!`,
        `${ceo.event.ceoName} stopped by my research lab!`,
        `Can't believe ${ceo.event.ceoName} is here on campus!`,
        `${ceo.event.ceoName} just shared startup tips with our class`,
        `Spotted ${ceo.event.ceoName} at the library!`,
        `${ceo.event.ceoName} is so down to earth, wow`,
        `Just got a LinkedIn connection from ${ceo.event.ceoName}!`,
        `${ceo.event.ceoName} signed my laptop!`,
        `${ceo.event.ceoName} is answering questions about their company`,
        `Students are asking ${ceo.event.ceoName} for internship advice`
    ];

    // Choose template based on context
    let templates: string[];
    const rand = Math.random();

    if (currentBuilding && buildingContextTemplates[currentBuilding] && rand > 0.3) {
        // 70% chance to use context-aware message if at a specific building
        templates = buildingContextTemplates[currentBuilding];
    } else if (rand > 0.7) {
        // 30% chance for faculty interaction
        templates = facultyTemplates;
    } else {
        // 70% chance for general student interaction
        templates = studentTemplates;
    }

    const senders = [
        "Excited Student",
        "CS Major",
        "MBA Candidate",
        "PhD Student",
        "Undergrad",
        "Grad Student",
        "Research Assistant",
        "Engineering Student",
        "Design Student",
        "Freshman"
    ];

    return {
        id: Date.now().toString() + Math.random(),
        text: templates[Math.floor(Math.random() * templates.length)],
        sender: senders[Math.floor(Math.random() * senders.length)],
        timestamp: Date.now(),
        type: 'event'
    };
};

/**
 * Generate a photo/social media buzz message with context-aware captions
 */
export const generatePhotoMessage = (ceo: CEOVisitor, currentBuilding?: BuildingType): { text: string; buzzIncrease: number } => {
    // Context-aware photo captions
    const buildingPhotoTemplates: Record<string, { text: string; buzzIncrease: number }[]> = {
        [BuildingType.EngineeringQuad]: [
            { text: `${ceo.event.ceoName} selfie with Engineering students goes viral!`, buzzIncrease: 8 },
            { text: `Epic photo: ${ceo.event.ceoName} in front of Engineering Quad!`, buzzIncrease: 7 },
            { text: `${ceo.event.ceoName} posing with student robotics project!`, buzzIncrease: 10 }
        ],
        [BuildingType.Stanford]: [
            { text: `Iconic: ${ceo.event.ceoName} at Stanford Memorial Church!`, buzzIncrease: 12 },
            { text: `${ceo.event.ceoName} photo at the heart of Stanford trending!`, buzzIncrease: 10 }
        ],
        [BuildingType.DSchool]: [
            { text: `${ceo.event.ceoName} design thinking photo session at d.school!`, buzzIncrease: 9 },
            { text: `Creative energy: ${ceo.event.ceoName} with d.school students!`, buzzIncrease: 8 }
        ],
        [BuildingType.HooverTower]: [
            { text: `${ceo.event.ceoName} at Hoover Tower - Stanford's most iconic shot!`, buzzIncrease: 15 },
            { text: `Legendary photo: ${ceo.event.ceoName} with Hoover Tower backdrop!`, buzzIncrease: 12 }
        ]
    };

    // General photo templates
    const generalTemplates = [
        { text: `${ceo.event.ceoName} photo goes viral on campus social media!`, buzzIncrease: 5 },
        { text: `Students posting selfies with ${ceo.event.ceoName} everywhere!`, buzzIncrease: 6 },
        { text: `${ceo.event.ceoName} Instagram story gets 10k likes!`, buzzIncrease: 7 },
        { text: `Campus buzz: ${ceo.event.ceoName} sighting trending!`, buzzIncrease: 5 },
        { text: `${ceo.event.ceoName} TikTok moment breaks the internet!`, buzzIncrease: 10 },
        { text: `Group photo with ${ceo.event.ceoName} becomes meme!`, buzzIncrease: 8 },
        { text: `${ceo.event.ceoName} candid shot gets 50k retweets!`, buzzIncrease: 9 }
    ];

    // Choose template based on context
    let photo: { text: string; buzzIncrease: number };

    if (currentBuilding && buildingPhotoTemplates[currentBuilding] && Math.random() > 0.4) {
        // 60% chance for context-aware photo if at special building
        const templates = buildingPhotoTemplates[currentBuilding];
        photo = templates[Math.floor(Math.random() * templates.length)];
    } else {
        photo = generalTemplates[Math.floor(Math.random() * generalTemplates.length)];
    }

    return photo;
};

/**
 * Update CEO position towards target
 */
export const updateCEOPosition = (ceo: CEOVisitor): CEOVisitor => {
    const dx = ceo.targetX - ceo.x;
    const dy = ceo.targetY - ceo.y;

    const newCEO = { ...ceo };

    // Move one step towards target
    if (Math.abs(dx) > Math.abs(dy)) {
        newCEO.x += dx > 0 ? 1 : -1;
    } else if (dy !== 0) {
        newCEO.y += dy > 0 ? 1 : -1;
    }

    // Check if reached target
    if (newCEO.x === newCEO.targetX && newCEO.y === newCEO.targetY) {
        newCEO.state = 'visiting_building';
        newCEO.timer = 3; // Visit for 3 ticks
    }

    return newCEO;
};

/**
 * Calculate legacy energy generated from CEO visit
 */
export const calculateLegacyEnergy = (ceo: CEOVisitor): number => {
    return ceo.visitedBuildings.length * 10 +
        ceo.chatsCompleted * 5 +
        ceo.photosGenerated * 3;
};
