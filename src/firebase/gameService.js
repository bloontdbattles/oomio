import { get, onValue, runTransaction, update } from "firebase/database";
import { gameRef } from "./database";
import { dealHands } from "../game/cards/deck";

// ---------------------------------------------------------------------
// Rules logic (follow-suit legality + trick-winner resolution)
//
// This mirrors what you built in src/game/rules/cardRules.js and
// trickRules.js, kept self-contained here so this file doesn't depend on
// their exact function names. If you'd rather have one source of truth,
// swap these two helpers for imports from your own rules files - the
// logic they need to implement is identical.
// ---------------------------------------------------------------------

// Assumed rank order: 7 (lowest) up to Ace (highest). Adjust this array
// if Oomi actually ranks cards differently.
const RANK_ORDER = ["7", "8", "9", "10", "J", "Q", "K", "A"];
const rankValue = (rank) => RANK_ORDER.indexOf(rank);

function getLeadSuit(trick) {
    return trick.length > 0 ? trick[0].card.suit : null;
}

function getLegalMoves(hand, trick) {
    const leadSuit = getLeadSuit(trick);
    if (!leadSuit) return hand; // leading the trick - anything goes

    const followSuit = hand.filter((c) => c.suit === leadSuit);
    return followSuit.length > 0 ? followSuit : hand;
}

function getTrickWinner(trick, trumpSuit) {
    const leadSuit = getLeadSuit(trick);
    const trumpsPlayed = trick.filter((p) => p.card.suit === trumpSuit);

    const contesting = trumpsPlayed.length > 0
        ? trumpsPlayed
        : trick.filter((p) => p.card.suit === leadSuit);

    return contesting.reduce((best, current) =>
        rankValue(current.card.rank) > rankValue(best.card.rank) ? current : best
    ).seat;
}

// ---------------------------------------------------------------------
// Seat mapping
//
// Lobby teams are red/blue x 2 slots. For the table, seats alternate
// red/blue/red/blue around the table so partners (same team) end up
// sitting opposite each other - seats 0 & 2 are partners, 1 & 3 are
// partners, matching what you described.
// ---------------------------------------------------------------------

function buildSeats(teams) {
    const seatFor = (player, team) => (player ? { ...player, team } : null);
    return {
        0: seatFor(teams.red?.[0], "red"),
        1: seatFor(teams.blue?.[0], "blue"),
        2: seatFor(teams.red?.[1], "red"),
        3: seatFor(teams.blue?.[1], "blue"),
    };
}

// ---------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------

/**
 * Deals a fresh 32-card game and starts it in "selecting-trump" status,
 * with seat 0 as the first trump picker. Call this once, when the host
 * presses Start Game in the lobby.
 */
export async function initializeGame(code, teams, hostId = null) {
    await update(gameRef(code), {
        status: "selecting-trump",
        seats: buildSeats(teams),
        hands: dealHands(),
        trumpSuit: null,
        trumpPickerSeat: 0,
        currentTurnSeat: 0,
        trick: [],
        trickHistory: [],
        scores: { red: 0, blue: 0 },
        matchScore: { red: 0, blue: 0 },
        roundNumber: 1,
        roundWinner: null,
        hostId: hostId || null,
        createdAt: Date.now(),
    });
}

export function subscribeToGame(code, callback) {
    return onValue(gameRef(code), (snap) => {
        callback(snap.exists() ? snap.val() : null);
    });
}

/**
 * The current trump-picker chooses a suit. They also lead the first
 * card of the round, so currentTurnSeat stays on them.
 */
export async function selectTrump(code, seat, suit) {
    const snap = await get(gameRef(code));
    const game = snap.val();
    if (!game || game.status !== "selecting-trump" || game.trumpPickerSeat !== seat) {
        return false;
    }

    await update(gameRef(code), {
        trumpSuit: suit,
        status: "playing",
        currentTurnSeat: seat,
    });
    return true;
}

/**
 * Attempts to play a card for the given seat. Runs as a transaction so
 * it's safe even if triggered unexpectedly at the same time as another
 * write. Returns true if the move was accepted, false if it was rejected
 * (not your turn, illegal move, etc).
 *
 * NOTE: this is client-side validation only - a modified client could in
 * theory skip these checks. Real cheat-proofing would need this logic to
 * run in a trusted place (e.g. Firebase Cloud Functions) instead of here.
 * Fine for now, worth revisiting before a public launch.
 */
export async function playCard(code, seat, card) {
    const result = await runTransaction(gameRef(code), (game) => {
        if (!game) return game;
        if (game.status !== "playing" || game.currentTurnSeat !== seat) return; // not your turn

        const hand = game.hands?.[seat] || [];
        const cardIndex = hand.findIndex((c) => c.rank === card.rank && c.suit === card.suit);
        if (cardIndex === -1) return; // you don't have that card

        const trick = game.trick || [];
        const legalMoves = getLegalMoves(hand, trick);
        const isLegal = legalMoves.some((c) => c.rank === card.rank && c.suit === card.suit);
        if (!isLegal) return; // must follow suit if able

        const nextHand = [...hand.slice(0, cardIndex), ...hand.slice(cardIndex + 1)];
        const nextTrick = [...trick, { seat, card }];

        const nextGame = {
            ...game,
            hands: { ...game.hands, [seat]: nextHand },
            trick: nextTrick,
        };

        if (nextTrick.length === 4) {
            const winnerSeat = getTrickWinner(nextTrick, game.trumpSuit);
            const winnerTeam = game.seats[winnerSeat]?.team;

            nextGame.trickHistory = [...(game.trickHistory || []), { winnerSeat, plays: nextTrick }];
            nextGame.trick = [];
            nextGame.currentTurnSeat = winnerSeat;
            nextGame.scores = {
                ...game.scores,
                [winnerTeam]: (game.scores?.[winnerTeam] || 0) + 1,
            };

            const cardsLeft = Object.values(nextGame.hands).some((h) => (h || []).length > 0);
            if (!cardsLeft) {
                // Round over. Default rule (not yet confirmed): most tricks wins.
                nextGame.status = "round-over";
                nextGame.roundWinner =
                    nextGame.scores.red === nextGame.scores.blue
                        ? "draw"
                        : nextGame.scores.red > nextGame.scores.blue
                            ? "red"
                            : "blue";
            }
        } else {
            nextGame.currentTurnSeat = (seat + 1) % 4;
        }

        return nextGame;
    });

    return result.committed;
}

/**
 * Deals a new round. Trump-picker rotates to the next seat, per "go one
 * by one". Match score accumulates the previous round's result.
 */
export async function startNextRound(code) {
    const snap = await get(gameRef(code));
    const game = snap.val();
    if (!game) return;

    const nextPickerSeat = (game.trumpPickerSeat + 1) % 4;

    await update(gameRef(code), {
        status: "selecting-trump",
        hands: dealHands(),
        trumpSuit: null,
        trumpPickerSeat: nextPickerSeat,
        currentTurnSeat: nextPickerSeat,
        trick: [],
        trickHistory: [],
        scores: { red: 0, blue: 0 },
        roundNumber: (game.roundNumber || 1) + 1,
        matchScore: {
            red: (game.matchScore?.red || 0) + (game.roundWinner === "red" ? 1 : 0),
            blue: (game.matchScore?.blue || 0) + (game.roundWinner === "blue" ? 1 : 0),
        },
        roundWinner: null,
    });
}

/**
 * Converts a disconnected human player's seat to a bot permanently so the AI takes over.
 */
export async function replacePlayerWithBot(code, seat, botName = "Oomi Bot") {
    await update(gameRef(code), {
        [`seats/${seat}/isBot`]: true,
        [`seats/${seat}/name`]: botName,
    });
}

/**
 * Restores a player to their seat when they rejoin using the room code.
 */
export async function reclaimPlayerSeat(code, seat, playerId, playerName) {
    await update(gameRef(code), {
        [`seats/${seat}/isBot`]: false,
        [`seats/${seat}/id`]: playerId,
        [`seats/${seat}/name`]: playerName,
    });
}

/**
 * Migrates host status to a new player ID if the previous host disconnects.
 */
export async function migrateHost(code, newHostId) {
    await update(gameRef(code), { hostId: newHostId });
}