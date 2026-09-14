/**
 * botRunner.js
 *
 * Bridges Firebase game state (games/$code) with the existing AI strategy
 * and bidding modules so that bot seats in live lobbies play intelligently,
 * identical to singleplayer bots.
 *
 * Exported helpers:
 *   isBotSeat(game, seat)        — returns true if the seat is a bot
 *   runBotTurn(code, game)       — detects whose turn it is, fires AI move
 *                                   when that seat is a bot
 */

import { chooseCard } from "../game/ai/aiStrategy.js";
import { chooseTrump } from "../game/ai/aiBidding.js";
import { AI_DIFFICULTY } from "../game/ai/aiDifficulty.js";
import { playCard, selectTrump } from "./gameService.js";

// Default difficulty for live lobby bots.
const BOT_DIFFICULTY = AI_DIFFICULTY.MEDIUM;

// Delays (ms) — match the singleplayer feel in GameTable.jsx
const BOT_TRUMP_DELAY_MS = 2000;
const BOT_PLAY_DELAY_MS = 3000;
const TRICK_HOLD_MS = 5000;

// Prevent the same turn from firing twice (race guard).
let lastFiredTurnKey = null;

// Suit translation: Firebase uses full names, aiStrategy uses single-letter codes
const FULL_TO_CODE = { hearts: "H", diamonds: "D", clubs: "C", spades: "S" };
const CODE_TO_FULL = { H: "hearts", D: "diamonds", C: "clubs", S: "spades" };

function toCode(suit) { return FULL_TO_CODE[suit] ?? suit; }
function toFull(suit) { return CODE_TO_FULL[suit] ?? suit; }
function convertCard(card) { return { rank: card.rank, suit: toCode(card.suit) }; }

/**
 * Returns true when the occupant of `seat` is a bot.
 */
export function isBotSeat(game, seat) {
    return !!game?.seats?.[seat]?.isBot;
}

/**
 * Convert Firebase game state into the shape expected by aiStrategy / aiKnowledge.
 *
 * Firebase shape:
 *   game.seats[seat]      { id, name, team, isBot }
 *   game.hands[seat]      [{ rank, suit }, ...]
 *   game.trick            [{ seat, card }, ...]
 *   game.trickHistory     [{ winnerSeat, plays: [{ seat, card }] }, ...]
 *   game.trumpSuit        string | null
 *
 * Engine shape (what aiStrategy / aiKnowledge expect):
 *   state.players         [{ seat, team, hand: [{ rank, suit }] }]
 *   state.currentTrick    [{ seat, card: { rank, suit } }]
 *   state.completedTricks [[{ seat, card }], ...]  (array of play arrays)
 *   state.trumpSuit       string | null
 */
function buildAIState(game, mySeat) {
    const players = Object.entries(game.seats || {}).map(([seatStr, player]) => {
        const seat = Number(seatStr);
        // Only give the bot its own hand; hide others (AI must not cheat)
        const rawHand = seat === mySeat ? (game.hands?.[seat] || []) : [];
        const hand = rawHand.map(convertCard); // convert to single-letter suits
        return {
            seat,
            team: player?.team || "red",
            hand,
        };
    });

    // trickHistory stores { winnerSeat, plays }; convert plays to the flat
    // array-of-plays format aiKnowledge iterates over.
    const completedTricks = (game.trickHistory || []).map((t) =>
        (t.plays || []).map((p) => ({ seat: p.seat, card: convertCard(p.card) }))
    );

    const currentTrick = (game.trick || []).map((p) => ({
        seat: p.seat,
        card: convertCard(p.card),
    }));

    return {
        players,
        currentTrick,
        completedTricks,
        trumpSuit: toCode(game.trumpSuit) || null,
    };
}

/**
 * Checks the current Firebase game state and fires the appropriate bot action
 * (trump selection or card play) when the active seat belongs to a bot.
 *
 * Returns a cancel function so the caller can clear a pending timer on
 * the next state update.
 */
export function runBotTurn(code, game) {
    if (!game) return () => {};

    // ── Trump selection phase ─────────────────────────────────────────────
    if (game.status === "selecting-trump") {
        const pickerSeat = game.trumpPickerSeat;
        if (!isBotSeat(game, pickerSeat)) return () => {};

        const turnKey = `trump-${code}-${game.roundNumber}-${pickerSeat}`;
        if (lastFiredTurnKey === turnKey) return () => {};
        lastFiredTurnKey = turnKey;

        const hand = game.hands?.[pickerSeat] || [];
        const timer = setTimeout(async () => {
            try {
                const suit = chooseTrump(hand.map(convertCard)); // convert to single-letter codes
                await selectTrump(code, pickerSeat, toFull(suit)); // convert back to full name
            } catch (e) {
                console.error("[BotRunner] Trump selection error:", e);
            }
        }, BOT_TRUMP_DELAY_MS);

        return () => {
            clearTimeout(timer);
            if (lastFiredTurnKey === turnKey) {
                lastFiredTurnKey = null;
            }
        };
    }

    // ── Playing phase ─────────────────────────────────────────────────────
    if (game.status === "playing") {
        const currentSeat = game.currentTurnSeat;
        if (!isBotSeat(game, currentSeat)) return () => {};

        // Build a unique key for this exact turn to prevent double-firing.
        const trickLen = (game.trick || []).length;
        const turnKey = `play-${code}-${game.roundNumber}-${currentSeat}-${trickLen}`;
        if (lastFiredTurnKey === turnKey) return () => {};
        lastFiredTurnKey = turnKey;

        // If a trick just completed, wait for the 5-second trick-hold to finish
        // before starting the bot's normal think delay.
        const isFirstCardOfNewTrick = trickLen === 0 && (game.trickHistory || []).length > 0;
        const delay = isFirstCardOfNewTrick
            ? TRICK_HOLD_MS + BOT_PLAY_DELAY_MS
            : BOT_PLAY_DELAY_MS;

        const timer = setTimeout(async () => {
            try {
                const aiState = buildAIState(game, currentSeat);
                const card = chooseCard({
                    state: aiState,
                    mySeat: currentSeat,
                    difficulty: BOT_DIFFICULTY,
                });
                // card.suit is a single-letter code — convert back to full name for Firebase
                await playCard(code, currentSeat, { rank: card.rank, suit: toFull(card.suit) });
            } catch (e) {
                console.error("[BotRunner] Card play error:", e);
            }
        }, delay);

        return () => {
            clearTimeout(timer);
            if (lastFiredTurnKey === turnKey) {
                lastFiredTurnKey = null;
            }
        };
    }

    return () => {};
}
