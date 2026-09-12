/**
 * bridge.js
 * Adapters between the new engine's numeric/code format and the existing UI format.
 *
 * Engine uses:  suit = "H"|"D"|"C"|"S",  seat = 0|1|2|3
 * UI uses:      suit = "hearts"|...,      seat = "bottom"|"left"|"top"|"right"
 */

// ── Seat maps ─────────────────────────────────────────────────────────────────
export const SEAT_NAME_TO_INDEX = {
    bottom: 0,
    left:   1,
    top:    2,
    right:  3,
};

export const SEAT_INDEX_TO_NAME = {
    0: "bottom",
    1: "left",
    2: "top",
    3: "right",
};

// ── Suit maps ─────────────────────────────────────────────────────────────────
export const SUIT_FULL_TO_CODE = {
    hearts:   "H",
    diamonds: "D",
    clubs:    "C",
    spades:   "S",
};

export const SUIT_CODE_TO_FULL = {
    H: "hearts",
    D: "diamonds",
    C: "clubs",
    S: "spades",
};

// ── Card ID injection ─────────────────────────────────────────────────────────
// The engine tracks cards by rank+suit (sameCard). The UI's PlayerHand tracks
// selected cards by card.id. We stamp stable IDs onto each card once at deal
// time; the engine ignores extra fields so they flow through unchanged.
let _idCounter = 1;

export function addIdsToHands(players) {
    return players.map((player) => ({
        ...player,
        hand: player.hand.map((card) =>
            card.id !== undefined
                ? card
                : { ...card, id: _idCounter++ }
        ),
    }));
}

// ── Conversion helpers ────────────────────────────────────────────────────────

/**
 * Convert an engine-format hand (single-letter suits) to a display hand
 * (full suit names) for the UI components.
 * IDs are preserved so the UI can track selected cards.
 */
export function handToDisplayCards(hand) {
    return hand.map((card) => ({
        ...card,
        suit: SUIT_CODE_TO_FULL[card.suit] ?? card.suit,
    }));
}

/**
 * Convert the engine's currentTrick array to the PlayedCards component format.
 *
 * Engine:  [{ seat: 0, team: 0, card: { rank, suit: "H" } }, ...]
 * UI:      { bottom: { rank, suit: "hearts" }, top: {...}, ... }
 */
export function trickToPlayedCards(currentTrick) {
    if (!currentTrick || !currentTrick.length) return {};
    const result = {};
    for (const play of currentTrick) {
        const seatName = SEAT_INDEX_TO_NAME[play.seat];
        if (!seatName) continue;
        result[seatName] = {
            ...play.card,
            suit: SUIT_CODE_TO_FULL[play.card.suit] ?? play.card.suit,
        };
    }
    return result;
}
