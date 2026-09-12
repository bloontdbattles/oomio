// Pure Oomi card/rule helpers.
// Cards are plain objects: { rank: "A"|"K"|"Q"|"J"|"10"|"9"|"8"|"7", suit: "H"|"D"|"C"|"S" }

export const SUITS = ["H", "D", "C", "S"];
export const RANKS = ["A", "K", "Q", "J", "10", "9", "8", "7"];

export const RANK_VALUE = Object.freeze({
    "7": 1, "8": 2, "9": 3, "10": 4,
    "J": 5, "Q": 6, "K": 7, "A": 8,
});

export const TEAM_BY_SEAT = Object.freeze({
    0: 0, 1: 1, 2: 0, 3: 1, // seats 1&3 vs 2&4
});

export function createDeck() {
    return SUITS.flatMap((suit) =>
        RANKS.map((rank) => ({ rank, suit }))
    );
}

export function cardId(card) {
    return `${card.suit}${card.rank}`;
}

export function sameCard(a, b) {
    return !!a && !!b && a.suit === b.suit && a.rank === b.rank;
}

export function getSuitCards(hand, suit) {
    return hand.filter((card) => card.suit === suit);
}

export function hasSuit(hand, suit) {
    return hand.some((card) => card.suit === suit);
}

export function getLegalMoves(hand, currentTrick, trumpSuit) {
    if (!currentTrick || currentTrick.length === 0) return [...hand];

    const ledSuit = currentTrick[0].card.suit;
    const suited = getSuitCards(hand, ledSuit);

    // Oomi follow-suit rule: if you have the led suit, you must play it.
    return suited.length > 0 ? suited : [...hand];
}

export function isLegalMove(hand, card, currentTrick, trumpSuit) {
    if (!hand.some((c) => sameCard(c, card))) return false;
    return getLegalMoves(hand, currentTrick, trumpSuit).some((c) => sameCard(c, card));
}

export function removeCard(hand, card) {
    const index = hand.findIndex((c) => sameCard(c, card));
    if (index === -1) throw new Error(`Card ${cardId(card)} is not in hand.`);
    return [...hand.slice(0, index), ...hand.slice(index + 1)];
}

export function cardBeats(candidate, currentWinner, ledSuit, trumpSuit) {
    if (!currentWinner) return true;

    const candidateIsTrump = candidate.suit === trumpSuit;
    const winnerIsTrump = currentWinner.suit === trumpSuit;

    if (candidateIsTrump && !winnerIsTrump) return true;
    if (!candidateIsTrump && winnerIsTrump) return false;

    // If both are trump, compare trump rank.
    if (candidateIsTrump && winnerIsTrump) {
        return RANK_VALUE[candidate.rank] > RANK_VALUE[currentWinner.rank];
    }

    // Neither is trump. Only the led suit can win.
    if (candidate.suit !== ledSuit) return false;
    if (currentWinner.suit !== ledSuit) return true;

    return RANK_VALUE[candidate.rank] > RANK_VALUE[currentWinner.rank];
}
