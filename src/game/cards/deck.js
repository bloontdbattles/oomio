const SUITS = ["hearts", "diamonds", "clubs", "spades"];
const RANKS = ["7", "8", "9", "10", "J", "Q", "K", "A"];

export function buildDeck() {
    const deck = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({ rank, suit });
        }
    }
    return deck;
}

export function shuffle(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Deals the full 32-card deck evenly across 4 seats (8 cards each).
 * Returns { 0: [...8 cards], 1: [...], 2: [...], 3: [...] }.
 */
export function dealHands() {
    const shuffled = shuffle(buildDeck());
    const hands = { 0: [], 1: [], 2: [], 3: [] };
    shuffled.forEach((card, i) => {
        hands[i % 4].push(card);
    });
    return hands;
}