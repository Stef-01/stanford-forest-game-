/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Legacy Energy Unlock Thresholds
 * As CEOs visit campus and generate legacy energy, new research areas unlock
 */
export const LEGACY_ENERGY_UNLOCKS: Record<number, string> = {
    25: "Quantum Computing Lab Unlocked",
    50: "AI Research Center Unlocked",
    75: "Biotech Innovation Hub Unlocked",
    100: "Fusion Energy Breakthrough",
    150: "Nanotechnology Institute Unlocked",
    200: "Space Technology Research Center",
    300: "Advanced Materials Lab Unlocked",
    500: "Nobel Prize Research Milestone"
};

/**
 * Event Tier Definitions
 * Tier 1: Transformational ($100M+ donations)
 * Tier 2: Major ($10M-$100M donations)
 * Tier 3: Standard ($1M-$10M donations)
 */
export interface EventTier {
    tier: 1 | 2 | 3;
    donationAmount: number;
    buzzThreshold: number; // Minimum buzz required for donation
    legacyMultiplier: number; // Multiplier for legacy energy
    description: string;
}

export const EVENT_TIERS: Record<number, EventTier> = {
    1: {
        tier: 1,
        donationAmount: 100000000, // $100M
        buzzThreshold: 80,
        legacyMultiplier: 2.0,
        description: "Transformational Impact"
    },
    2: {
        tier: 2,
        donationAmount: 25000000, // $25M
        buzzThreshold: 60,
        legacyMultiplier: 1.5,
        description: "Major Contribution"
    },
    3: {
        tier: 3,
        donationAmount: 5000000, // $5M
        buzzThreshold: 40,
        legacyMultiplier: 1.0,
        description: "Significant Gift"
    }
};
