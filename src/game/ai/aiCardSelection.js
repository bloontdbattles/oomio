import { RANK_VALUE, cardId, TEAM_BY_SEAT } from "../rules/cardRules.js";
import { getTrickWinnerPlay, getLedSuit } from "../rules/trickRules.js";

export function cardStrength(card, trumpSuit) {
    const base = RANK_VALUE[card.rank];
    return card.suit === trumpSuit ? 100 + base : base;
}

export function sortLowToHigh(cards, trumpSuit) {
    return [...cards].sort((a, b) => cardStrength(a, trumpSuit) - cardStrength(b, trumpSuit));
}

export function sortHighToLow(cards, trumpSuit) {
    return [...cards].sort((a, b) => cardStrength(b, trumpSuit) - cardStrength(a, trumpSuit));
}

export function currentWinner(trick, trumpSuit) {
    return getTrickWinnerPlay(trick, trumpSuit);
}

export function isPartnerWinning(state, mySeat) {
    if (!state.currentTrick.length) return false;
    const winner = currentWinner(state.currentTrick, state.trumpSuit);
    return winner ? TEAM_BY_SEAT[winner.seat] === TEAM_BY_SEAT[mySeat] : false;
}

export function canCardBeatCurrentWinner(card, state) {
    const trick = state.currentTrick;
    if (!trick.length) return true;
    const winner = currentWinner(trick, state.trumpSuit);
    const ledSuit = getLedSuit(trick);

    if (card.suit === state.trumpSuit && winner.card.suit !== state.trumpSuit) return true;
    if (winner.card.suit === state.trumpSuit && card.suit !== state.trumpSuit) return false;
    if (card.suit !== ledSuit) return false;
    if (winner.card.suit !== ledSuit) return true;

    return RANK_VALUE[card.rank] > RANK_VALUE[winner.card.rank];
}

export function findCheapestWinningCard(legalMoves, state) {
    const winners = legalMoves.filter((card) => canCardBeatCurrentWinner(card, state));
    return sortLowToHigh(winners, state.trumpSuit)[0] ?? null;
}

export function findLowestNonTrump(legalMoves, trumpSuit) {
    const nonTrump = legalMoves.filter((card) => card.suit !== trumpSuit);
    return sortLowToHigh(nonTrump, trumpSuit)[0] ?? null;
}

export function findLowestCard(legalMoves, trumpSuit) {
    return sortLowToHigh(legalMoves, trumpSuit)[0] ?? null;
}

export function cardIsLikelySafeDiscard(card, state, knowledge) {
    if (card.suit === state.trumpSuit) return false;

    const knownPlayed = knowledge.playedCardIds;
    // Conservative heuristic: low non-trump cards are preferred discards.
    const lowerCardsStillPossible = state.players.some((p) =>
        p.seat !== knowledge.mySeat &&
        p.hand.length > 0 &&
        p.team !== knowledge.myTeam
    );
    return lowerCardsStillPossible && RANK_VALUE[card.rank] <= 3;
}