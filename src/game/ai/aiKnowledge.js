import { cardId, createDeck, TEAM_BY_SEAT } from "../rules/cardRules.js";

export function getPublicPlayedCards(state) {
    return state.completedTricks
        .flat()
        .concat(state.currentTrick)
        .map((play) => ({ ...play.card, playedBy: play.seat }));
}

export function getRemainingUnseenCards(state, mySeat) {
    const myHand = state.players.find((p) => p.seat === mySeat)?.hand ?? [];
    const played = new Set(getPublicPlayedCards(state).map((p) => cardId(p)));
    const mine = new Set(myHand.map(cardId));

    return createDeck().filter((card) => !played.has(cardId(card)) && !mine.has(cardId(card)));
}

export function buildKnowledge(state, mySeat) {
    const publicPlays = getPublicPlayedCards(state);
    const playedCardIds = new Set(publicPlays.map((p) => cardId(p)));

    const voidIn = {
        0: new Set(),
        1: new Set(),
        2: new Set(),
        3: new Set(),
    };

    // If a player followed neither the led suit nor a trump card, they were
    // void in the led suit. More generally, any non-led card means they had
    // no led-suit card because following suit is mandatory.
    for (const trick of state.completedTricks) {
        if (!trick.length) continue;
        const ledSuit = trick[0].card.suit;
        for (const play of trick.slice(1)) {
            if (play.card.suit !== ledSuit) {
                voidIn[play.seat].add(ledSuit);
            }
        }
    }

    return {
        mySeat,
        myTeam: TEAM_BY_SEAT[mySeat],
        publicPlays,
        playedCardIds,
        voidIn: Object.fromEntries(
            Object.entries(voidIn).map(([seat, suits]) => [seat, [...suits]])
        ),
        remainingUnknownCards: getRemainingUnseenCards(state, mySeat),
    };
}
