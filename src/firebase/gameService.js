import { get, onValue, runTransaction, update } from "firebase/database";
import { gameRef } from "./database";
import { dealHands } from "../game/cards/deck";

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

function buildSeats(teams) {
    const seatFor = (player, team) => (player ? { ...player, team } : null);
    return {
        0: seatFor(teams.red?.[0], "red"),
        1: seatFor(teams.blue?.[0], "blue"),
        2: seatFor(teams.red?.[1], "red"),
        3: seatFor(teams.blue?.[1], "blue"),
    };
}

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
        lastRoundTricks: { red: 0, blue: 0 },
        roundResultType: null,
        hostId: hostId || null,
        createdAt: Date.now(),
    });
}

export function subscribeToGame(code, callback) {
    return onValue(gameRef(code), (snap) => {
        callback(snap.exists() ? snap.val() : null);
    });
}

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
                // Round over: calculate points earned this round and update match scores
                const redTricks = nextGame.scores.red || 0;
                const blueTricks = nextGame.scores.blue || 0;
                let redPts = 0;
                let bluePts = 0;
                let roundWinner = null;
                let roundResultType = "WIN";

                if (redTricks === blueTricks) {
                    // 4-4 draw: both teams earn 1 point
                    redPts = 1;
                    bluePts = 1;
                    roundWinner = "draw";
                    roundResultType = "DRAW";
                } else if (redTricks > blueTricks) {
                    redPts = 1;
                    roundWinner = "red";
                } else {
                    bluePts = 1;
                    roundWinner = "blue";
                }

                const newMatchScore = {
                    red: (game.matchScore?.red || 0) + redPts,
                    blue: (game.matchScore?.blue || 0) + bluePts,
                };

                const isGameOver = newMatchScore.red >= 11 || newMatchScore.blue >= 11;

                nextGame.status = isGameOver ? "game-over" : "round-over";
                nextGame.roundWinner = roundWinner;
                nextGame.roundResultType = roundResultType;
                nextGame.lastRoundTricks = { red: redTricks, blue: blueTricks };
                nextGame.matchScore = newMatchScore;
            }
        } else {
            nextGame.currentTurnSeat = (seat + 1) % 4;
        }

        return nextGame;
    });

    return result.committed;
}

export async function startNextRound(code) {
    const snap = await get(gameRef(code));
    const game = snap.val();
    if (!game) return;

    const isGameOver = (game.matchScore?.red || 0) >= 11 || (game.matchScore?.blue || 0) >= 11;
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
        roundNumber: isGameOver ? 1 : (game.roundNumber || 1) + 1,
        matchScore: isGameOver ? { red: 0, blue: 0 } : (game.matchScore || { red: 0, blue: 0 }),
        roundWinner: null,
        roundResultType: null,
    });
}

export async function replacePlayerWithBot(code, seat, botName = "Oomi Bot") {
    let nameStr = "Oomi Bot";
    if (typeof botName === "string" && botName.trim()) {
        nameStr = botName;
    }
    await update(gameRef(code), {
        [`seats/${seat}/isBot`]: true,
        [`seats/${seat}/name`]: nameStr,
    });
}

export async function reclaimPlayerSeat(code, seat, playerId, playerName) {
    await update(gameRef(code), {
        [`seats/${seat}/isBot`]: false,
        [`seats/${seat}/id`]: playerId,
        [`seats/${seat}/name`]: playerName,
    });
}

export async function migrateHost(code, newHostId) {
    await update(gameRef(code), { hostId: newHostId });
}