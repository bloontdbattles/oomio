import { PHASES, createInitialState, createDealtState } from "./gameState.js";
import { isLegalMove, removeCard, SUITS } from "../rules/cardRules.js";
import { getTrickWinnerIndex, getTrickWinnerTeam, isTrickComplete } from "../rules/trickRules.js";
import { scoreRound, isMatchOver } from "../rules/scoringRules.js";

export const ACTIONS = Object.freeze({
    DEAL: "DEAL",
    SELECT_TRUMP: "SELECT_TRUMP",
    PLAY_CARD: "PLAY_CARD",
    START_NEXT_ROUND: "START_NEXT_ROUND",
});

function assertSeatTurn(state, seat) {
    if (state.currentTurn !== seat) {
        throw new Error(`It is not player ${seat}'s turn.`);
    }
}

export function gameReducer(state, action) {
    switch (action.type) {
        case ACTIONS.DEAL: {
            if (state.phase !== PHASES.DEALING) {
                throw new Error("Cards can only be dealt from the DEALING phase.");
            }
            return createDealtState(state, { rng: state.rng });
        }

        case ACTIONS.SELECT_TRUMP: {
            if (state.phase !== PHASES.TRUMP_SELECTION) {
                throw new Error("Trump can only be selected during trump selection.");
            }
            assertSeatTurn(state, action.seat);

            if (!SUITS.includes(action.suit)) {
                throw new Error(`Invalid trump suit: ${action.suit}`);
            }

            return {
                ...state,
                phase: PHASES.PLAYING,
                trumpSuit: action.suit,
                currentTurn: action.seat,
                trumpChooserSeat: action.seat,
            };
        }

        case ACTIONS.PLAY_CARD: {
            if (state.phase !== PHASES.PLAYING) {
                throw new Error("Cards can only be played during PLAYING phase.");
            }

            assertSeatTurn(state, action.seat);

            const player = state.players[action.seat];
            if (!isLegalMove(player.hand, action.card, state.currentTrick, state.trumpSuit)) {
                throw new Error("Illegal Oomi move.");
            }

            const updatedHand = removeCard(player.hand, action.card);
            const updatedPlayers = state.players.map((p) =>
                p.seat === action.seat ? { ...p, hand: updatedHand } : p
            );

            const updatedTrick = [
                ...state.currentTrick,
                { seat: action.seat, team: player.team, card: action.card },
            ];

            if (!isTrickComplete(updatedTrick)) {
                return {
                    ...state,
                    players: updatedPlayers,
                    currentTrick: updatedTrick,
                    currentTurn: (action.seat + 1) % 4,
                };
            }

            const winnerSeat = getTrickWinnerIndex(updatedTrick, state.trumpSuit);
            const winnerTeam = getTrickWinnerTeam(updatedTrick, state.trumpSuit);
            const completedTricks = [...state.completedTricks, updatedTrick];
            const trickWinners = [...state.trickWinners, winnerTeam];

            const cardsRemaining = updatedPlayers.some((p) => p.hand.length > 0);

            if (cardsRemaining) {
                return {
                    ...state,
                    players: updatedPlayers,
                    currentTrick: [],
                    completedTricks,
                    trickWinners,
                    currentTurn: winnerSeat,
                };
            }

            const roundResult = scoreRound({
                trickWinners,
                trumpChooserTeam: state.players[state.trumpChooserSeat].team,
            });

            const newCats = [
                state.cats[0] + roundResult.catsAwarded[0],
                state.cats[1] + roundResult.catsAwarded[1],
            ];

            const gameOver = isMatchOver(newCats, state.targetCats);

            return {
                ...state,
                players: updatedPlayers,
                currentTrick: [],
                completedTricks,
                trickWinners,
                cats: newCats,
                lastRoundResult: roundResult,
                phase: gameOver ? PHASES.GAME_END : PHASES.ROUND_END,
                currentTurn: winnerSeat,
            };
        }

        case ACTIONS.START_NEXT_ROUND: {
            if (state.phase !== PHASES.ROUND_END) {
                throw new Error("Next round can only start after a completed round.");
            }

            // Trump selection rotates to the next seat after the previous chooser.
            const nextChooser = (state.trumpChooserSeat + 1) % 4;

            const base = {
                ...state,
                phase: PHASES.DEALING,
                roundNumber: state.roundNumber + 1,
                players: state.players.map((p) => ({ ...p, hand: [] })),
                trumpSuit: null,
                trumpChooserSeat: nextChooser,
                currentTurn: nextChooser,
                currentTrick: [],
                completedTricks: [],
                trickWinners: [],
                lastRoundResult: null,
            };

            return createDealtState(base, { rng: state.rng });
        }

        default:
            throw new Error(`Unknown action: ${action.type}`);
    }
}

export function dealAction() {
    return { type: ACTIONS.DEAL };
}

export function selectTrumpAction(seat, suit) {
    return { type: ACTIONS.SELECT_TRUMP, seat, suit };
}

export function playCardAction(seat, card) {
    return { type: ACTIONS.PLAY_CARD, seat, card };
}

export function startNextRoundAction() {
    return { type: ACTIONS.START_NEXT_ROUND };
}

export { createInitialState };