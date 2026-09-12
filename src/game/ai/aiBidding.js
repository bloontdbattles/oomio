import { SUITS, RANK_VALUE } from "../rules/cardRules.js";

export function chooseTrump(hand) {
    const scores = SUITS.map((suit) => {
        const cards = hand.filter((card) => card.suit === suit);
        const strength = cards.reduce((sum, card) => sum + RANK_VALUE[card.rank], 0);
        const highCards = cards.filter((card) => RANK_VALUE[card.rank] >= RANK_VALUE["J"]).length;

        return {
            suit,
            score: strength + highCards * 3 + cards.length * 2,
        };
    });

    scores.sort((a, b) => b.score - a.score);
    return scores[0].suit;
}