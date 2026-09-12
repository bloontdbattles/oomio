import { getLegalMoves } from "../rules/cardRules.js";
import { getTrickWinnerPlay, getLedSuit } from "../rules/trickRules.js";
import { buildKnowledge } from "./aiKnowledge.js";
import { DIFFICULTY_CONFIG, AI_DIFFICULTY } from "./aiDifficulty.js";
import {
    sortLowToHigh,
    findCheapestWinningCard,
    findLowestNonTrump,
    findLowestCard,
    canCardBeatCurrentWinner,
} from "./aiCardSelection.js";

function chooseLead(legalMoves, state, difficulty) {
    const config = DIFFICULTY_CONFIG[difficulty];

    if (difficulty === AI_DIFFICULTY.EASY) {
        return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }

    // On a lead, conserve trump unless it is strategically necessary.
    const nonTrump = legalMoves.filter((c) => c.suit !== state.trumpSuit);

    if (nonTrump.length) {
        // Medium: lead a low card. This avoids throwing away a high trump.
        return sortLowToHigh(nonTrump, state.trumpSuit)[0];
    }

    // If only trump cards are available, use the lowest trump.
    return sortLowToHigh(legalMoves, state.trumpSuit)[0];
}

export function chooseCard({ state, mySeat, difficulty = AI_DIFFICULTY.MEDIUM }) {
    const player = state.players.find((p) => p.seat === mySeat);
    if (!player) throw new Error(`Unknown AI seat ${mySeat}`);

    const legalMoves = getLegalMoves(player.hand, state.currentTrick, state.trumpSuit);
    if (!legalMoves.length) throw new Error("AI has no legal moves.");

    if (legalMoves.length === 1) return legalMoves[0];

    if (!state.currentTrick.length) {
        return chooseLead(legalMoves, state, difficulty);
    }

    if (difficulty === AI_DIFFICULTY.EASY) {
        return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }

    const knowledge = buildKnowledge(state, mySeat);
    const winner = getTrickWinnerPlay(state.currentTrick, state.trumpSuit);
    const partnerIsWinning = winner && winner.team === player.team;
    const canWin = legalMoves.some((card) => canCardBeatCurrentWinner(card, state));

    // Core team-play rule:
    // If partner is winning and no opponent can realistically overturn it with
    // the information currently visible, avoid wasting a trump/high card.
    if (partnerIsWinning) {
        const trumpMoves = legalMoves.filter((c) => c.suit === state.trumpSuit);
        const nonTrumpMoves = legalMoves.filter((c) => c.suit !== state.trumpSuit);

        // If the AI cannot beat the partner anyway, use the cheapest safe discard.
        if (!canWin) {
            return findLowestNonTrump(nonTrumpMoves, state.trumpSuit)
                ?? findLowestCard(legalMoves, state.trumpSuit);
        }

        // AI can overtake partner. Normally let partner keep the trick.
        // Hard mode can later replace this branch with probability/simulation.
        if (nonTrumpMoves.length) {
            return findLowestNonTrump(nonTrumpMoves, state.trumpSuit);
        }

        // If only trump cards are legal, preserve the lowest one possible.
        return sortLowToHigh(trumpMoves, state.trumpSuit)[0];
    }

    // Opponent is winning. If we can beat them, take the trick with the
    // cheapest card that wins rather than automatically spending a high trump.
    if (canWin) {
        return findCheapestWinningCard(legalMoves, state);
    }

    // Opponent is winning and we cannot beat them. Do not waste trump.
    return findLowestNonTrump(legalMoves, state.trumpSuit)
        ?? findLowestCard(legalMoves, state.trumpSuit);
}

export { AI_DIFFICULTY };
