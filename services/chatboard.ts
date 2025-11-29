/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { CEOVisitor, ChatboardMessage } from '../types';

/**
 * Generate a motivational chatboard message from a CEO
 */
export const generateChatboardMessage = (ceo: CEOVisitor, gameDay: number): ChatboardMessage => {
    const inspirationMessages = [
        "Dream big, work hard, and never give up on your vision.",
        "The best time to start is now. Don't wait for the perfect moment.",
        "Your Stanford education is just the beginning. Keep learning forever.",
        "Failure is not the opposite of success, it's part of success.",
        "Build something people want. Everything else is secondary.",
        "The future belongs to those who believe in their dreams.",
        "Take risks. You're young, brilliant, and at Stanford - you can do anything."
    ];

    const adviceMessages = [
        "Focus on solving real problems, not chasing trends.",
        "Surround yourself with people smarter than you.",
        "Customer feedback is gold. Listen more than you talk.",
        "Start small, think big, move fast.",
        "Your network is your net worth. Build genuine relationships.",
        "Execution beats ideas. Ship early, iterate often.",
        "Don't be afraid to pivot when the data tells you to."
    ];

    const challengeMessages = [
        "What impossible problem will you solve this year?",
        "Are you building something that matters?",
        "Challenge yourself: what would you do if you couldn't fail?",
        "The world needs your unique perspective. What will you create?",
        "Don't just join a company. Start one.",
        "Think 10x, not 10%. What's your moonshot?",
        "Your generation will solve climate change. Are you ready?"
    ];

    const categories: Array<{ messages: string[]; category: 'inspiration' | 'advice' | 'challenge' }> = [
        { messages: inspirationMessages, category: 'inspiration' },
        { messages: adviceMessages, category: 'advice' },
        { messages: challengeMessages, category: 'challenge' }
    ];

    const selected = categories[Math.floor(Math.random() * categories.length)];
    const message = selected.messages[Math.floor(Math.random() * selected.messages.length)];

    return {
        id: `chatboard_${ceo.id}_${gameDay}`,
        ceoName: ceo.event.ceoName,
        message: message,
        timestamp: gameDay,
        category: selected.category
    };
};
