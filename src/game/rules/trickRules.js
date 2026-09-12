import { cardBeats, TEAM_BY_SEAT } from "./cardRules.js";

export function getLedSuit(trick) {
    return trick?.length ? trick[0].card.suit : null;
}

export function getTrickWinnerIndex(trick, trumpSuit) {
    if (!trick || trick.length === 0) return null;

    const ledSuit = getLedSuit(trick);
    let winner = trick[0];

    for (let i = 1; i < trick.length; i += 1) {
        const play = trick[i];
        if (cardBeats(play.card, winner.card, ledSuit, trumpSuit)) {
            winner = play;
        }
    }

    return winner.seat;
}

export function getTrickWinnerPlay(trick, trumpSuit) {
    const seat = getTrickWinnerIndex(trick, trumpSuit);
    return trick.find((play) => play.seat === seat) ?? null;
}

export function getTrickWinnerTeam(trick, trumpSuit) {
    const seat = getTrickWinnerIndex(trick, trumpSuit);
    return seat == null ? null : TEAM_BY_SEAT[seat];
}

export function isTrickComplete(trick) {
    return Array.isArray(trick) && trick.length === 4;
}