import { createDeck, TEAM_BY_SEAT } from "../rules/cardRules.js";

export const PHASES = Object.freeze({
    DEALING: "DEALING",
    TRUMP_SELECTION: "TRUMP_SELECTION",
    PLAYING: "PLAYING",
    ROUND_END: "ROUND_END",
    GAME_END: "GAME_END",
});

export function createInitialState({ rng = Math.random, targetCats = 10 } = {}) {
    return {
        phase: PHASES.DEALING,
        roundNumber: 1,
        targetCats,
        players: [0, 1, 2, 3].map((seat) => ({
            seat,
            team: TEAM_BY_SEAT[seat],
            hand: [],
        })),
        trumpSuit: null,
        trumpChooserSeat: 0,
        currentTurn: 0,
        currentTrick: [],
        completedTricks: [],
        trickWinners: [],
        cats: [0, 0],
        lastRoundResult: null,
        rng,
    };
}

export function shuffleDeck(deck, rng = Math.random) {
    const result = [...deck];
    for (let i = result.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rng() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

export function dealCards(deck, rng = Math.random) {
    const shuffled = shuffleDeck(deck, rng);
    const hands = [[], [], [], []];

    // Round-robin dealing gives each seat 8 cards.
    for (let i = 0; i < shuffled.length; i += 1) {
        hands[i % 4].push(shuffled[i]);
    }

    return hands;
}

export function createDealtState(baseState, { rng = Math.random } = {}) {
    const hands = dealCards(createDeck(), rng);
    return {
        ...baseState,
        phase: PHASES.TRUMP_SELECTION,
        players: baseState.players.map((player, seat) => ({
            ...player,
            hand: hands[seat],
        })),
        trumpSuit: null,
        currentTrick: [],
        completedTricks: [],
        trickWinners: [],
        lastRoundResult: null,
        currentTurn: baseState.trumpChooserSeat,
        rng,
    };
}

export function getPlayer(state, seat) {
    return state.players.find((player) => player.seat === seat);
}

export function getTeamSeats(team) {
    return state => state.players.filter((p) => p.team === team).map((p) => p.seat);
}
