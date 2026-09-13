import { useReducer, useEffect, useRef, useState, useCallback } from "react";
import { getPlayer as getStoredPlayer } from "../../utils/localStorage";
import PlayerSeat from "./PlayerSeat";
import PlayedCards from "./PlayedCards";
import PlayerHand from "./PlayerHand";
import TrumpDisplay from "./TrumpDisplay";
import ScoreBoard from "./ScoreBoard";
import BidPanel from "./BidPanel";
import GameResult from "./GameResult";
import player1Img from "../../assets/images/player1.png";
import player2Img from "../../assets/images/player2.png";
import player3Img from "../../assets/images/player3.png";
import "./GameTable.css";

// ── Engine ────────────────────────────────────────────────────────────────────
import {
    gameReducer,
    dealAction,
    selectTrumpAction,
    playCardAction,
    startNextRoundAction,
    createInitialState,
} from "../../game/engine/gameReducer";
import { PHASES } from "../../game/engine/gameState";
import { isLegalMove } from "../../game/rules/cardRules";
import { getAICard, getAITrump } from "../../game/ai/aiPlayer";
import { AI_DIFFICULTY } from "../../game/ai/aiDifficulty";

// ── Bridge (UI ↔ Engine adapters) ─────────────────────────────────────────────
import {
    SEAT_INDEX_TO_NAME,
    SUIT_FULL_TO_CODE,
    SUIT_CODE_TO_FULL,
    addIdsToHands,
    trickToPlayedCards,
    handToDisplayCards,
} from "../../game/bridge";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION: ADJUST TABLE AND OPPONENT SIZES / POSITIONS HERE
// ─────────────────────────────────────────────────────────────────────────────
const TABLE_CONFIG = {
    width: "80%",
    maxWidth: 1100,
    height: 400,
    marginTop: 100,
    marginBottom: 220,
    topCornerWidth: 35,
    woodBorderThickness: 10,
    woodBorderSideGap: 30,
};

const OPPONENT_CONFIG = {
    baseWidth: 140,
    baseHeight: 160,
    left: {
        scale: 200,
        tableOverlap: 45,
        horizontalPos: 18,
        offsetX: 0,
        offsetY: 150,
    },
    top: {
        scale: 130,
        tableOverlap: 45,
        horizontalPos: 50,
        offsetX: 0,
        offsetY: -20,
    },
    right: {
        scale: 200,
        tableOverlap: 45,
        horizontalPos: 82,
        offsetX: 0,
        offsetY: 150,
    },
};

const MOBILE_TABLE_CONFIG = {
    width: "95%",
    maxWidth: 600,
    height: 400,
    marginTop: 200,
    marginBottom: 280,
    topCornerWidth: 35,
    woodBorderThickness: 6,
    woodBorderSideGap: 16,
};

const MOBILE_OPPONENT_CONFIG = {
    baseWidth: 140,
    baseHeight: 160,
    left: {
        scale: 180,
        tableOverlap: 20,
        horizontalPos: 18,
        offsetX: -40,
        offsetY: 140,
    },
    top: {
        scale: 130,
        tableOverlap: 20,
        horizontalPos: 50,
        offsetX: 0,
        offsetY: 0,
    },
    right: {
        scale: 180,
        tableOverlap: 20,
        horizontalPos: 82,
        offsetX: 40,
        offsetY: 140,
    },
};
// ─────────────────────────────────────────────────────────────────────────────

// AI difficulty applied to all bot seats. Can be made per-seat later.
const AI_DIFFICULTY_LEVEL = AI_DIFFICULTY.MEDIUM;

// Timing Delays (in ms)
const AI_PLAY_DELAY_MS = 3000;       // Cooldown delay before AI selects & plays a card (3s)
const AI_TRUMP_DELAY_MS = 2000;      // Delay before AI selects trump (2s)
const TRICK_CLEAR_DELAY_MS = 5000;    // Pause keeping completed 4-card trick on table for 5s before clearing

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Hide other players' hands before passing state to AI.
 * AI must only see its own hand + public information (trump, currentTrick, completedTricks).
 */
function buildAIViewState(state, mySeat) {
    return {
        ...state,
        players: state.players.map((p) =>
            p.seat === mySeat ? p : { ...p, hand: [] }
        ),
    };
}

/**
 * Wrapped reducer that:
 *  - Injects stable card IDs after dealing (for UI selection tracking)
 *  - Handles a synthetic RESET action for game-over restarts
 */
function gameReducerWithIds(state, action) {
    if (action.type === "RESET") {
        const fresh = createInitialState();
        const dealt = gameReducer(fresh, dealAction());
        return { ...dealt, players: addIdsToHands(dealt.players) };
    }
    const next = gameReducer(state, action);
    if (action.type === "DEAL" || action.type === "START_NEXT_ROUND") {
        return { ...next, players: addIdsToHands(next.players) };
    }
    return next;
}

/** Initialize the reducer already in TRUMP_SELECTION (skip DEALING phase). */
function initEngineState() {
    const base = createInitialState();
    const dealt = gameReducer(base, dealAction());
    return { ...dealt, players: addIdsToHands(dealt.players) };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function GameTable() {
    const [engineState, dispatch] = useReducer(
        gameReducerWithIds,
        undefined,
        initEngineState
    );

    const [playerName, setPlayerName] = useState("Player");
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Trick display: hold the last completed trick visible for 1500ms before clearing
    const [shownTrick, setShownTrick] = useState({});
    const [paused, setPaused] = useState(false);
    const completedLenRef = useRef(0);

    const tCfg = isMobile ? MOBILE_TABLE_CONFIG : TABLE_CONFIG;
    const oCfg = isMobile ? MOBILE_OPPONENT_CONFIG : OPPONENT_CONFIG;

    // ── Load player name ──────────────────────────────────────────────────────
    useEffect(() => {
        const stored = getStoredPlayer();
        if (stored?.name) setPlayerName(stored.name);
    }, []);

    // ── Responsive ────────────────────────────────────────────────────────────
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // ── Effect A & B: Unified Trick Display & Completion Pause ────────────────
    // Manages live trick cards and holds all 4 completed cards on table for 5 seconds.
    useEffect(() => {
        const newLen = engineState.completedTricks.length;

        // Reset display state on new round or fresh game
        if (
            engineState.phase === PHASES.TRUMP_SELECTION ||
            engineState.phase === PHASES.DEALING
        ) {
            completedLenRef.current = 0;
            setPaused(false);
            setShownTrick({});
            return;
        }

        // A trick just completed (newLen increased) — show all 4 cards for 5 seconds
        if (newLen > completedLenRef.current) {
            const lastTrick = engineState.completedTricks[newLen - 1];
            setShownTrick(trickToPlayedCards(lastTrick));
            setPaused(true);

            const timer = setTimeout(() => {
                completedLenRef.current = newLen;
                setPaused(false);
                setShownTrick({});
            }, TRICK_CLEAR_DELAY_MS);
            return () => clearTimeout(timer);
        }

        // Mirror live trick while trick is in progress (if not in completion pause)
        if (completedLenRef.current === newLen) {
            setShownTrick(trickToPlayedCards(engineState.currentTrick));
        }
    }, [engineState.completedTricks, engineState.currentTrick, engineState.phase]);

    // ── Effect C: AI trump selection ──────────────────────────────────────────
    useEffect(() => {
        if (engineState.phase !== PHASES.TRUMP_SELECTION) return;
        if (engineState.trumpChooserSeat === 0) return; // Seat 0 = human

        const mySeat = engineState.trumpChooserSeat;
        const timer = setTimeout(() => {
            try {
                const aiView = buildAIViewState(engineState, mySeat);
                const suit = getAITrump({ state: aiView, seat: mySeat });
                dispatch(selectTrumpAction(mySeat, suit));
            } catch (e) {
                console.error("AI trump selection error:", e);
            }
        }, AI_TRUMP_DELAY_MS);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [engineState.phase, engineState.trumpChooserSeat]);

    // ── Effect D: AI card play ────────────────────────────────────────────────
    // Fires when it is an AI seat's turn. Waits for post-trick pause to clear.
    useEffect(() => {
        if (paused) return;
        if (engineState.phase !== PHASES.PLAYING) return;
        if (engineState.currentTurn === 0) return; // Seat 0 = human

        const mySeat = engineState.currentTurn;
        const timer = setTimeout(() => {
            // Re-check pause after delay (could have changed)
            if (engineState.phase !== PHASES.PLAYING) return;

            try {
                const aiView = buildAIViewState(engineState, mySeat);
                const card = getAICard({
                    state: aiView,
                    seat: mySeat,
                    difficulty: AI_DIFFICULTY_LEVEL,
                });

                const player = engineState.players.find((p) => p.seat === mySeat);
                if (
                    player &&
                    isLegalMove(
                        player.hand,
                        card,
                        engineState.currentTrick,
                        engineState.trumpSuit
                    )
                ) {
                    dispatch(playCardAction(mySeat, card));
                } else {
                    console.error("AI attempted illegal move:", card);
                }
            } catch (e) {
                console.error("AI card play error:", e);
            }
        }, AI_PLAY_DELAY_MS);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [engineState.currentTurn, engineState.phase, paused]);

    // ── Human: select trump ───────────────────────────────────────────────────
    const handleSelectTrump = useCallback(
        (suitFullName) => {
            const suitCode = SUIT_FULL_TO_CODE[suitFullName];
            if (!suitCode) return;
            // Human is always seat 0 and is always the first trumpChooser
            dispatch(selectTrumpAction(0, suitCode));
        },
        []
    );

    // ── Human: play a card ────────────────────────────────────────────────────
    const handlePlayCard = useCallback(
        (displayCard) => {
            if (engineState.phase !== PHASES.PLAYING) return;
            if (engineState.currentTurn !== 0) return;

            // displayCard has { id, rank, suit: "hearts" }
            // Find the matching engine card by ID (engine card has suit: "H")
            const player0 = engineState.players.find((p) => p.seat === 0);
            if (!player0) return;
            const engineCard = player0.hand.find((c) => c.id === displayCard.id);
            if (!engineCard) return;

            if (
                !isLegalMove(
                    player0.hand,
                    engineCard,
                    engineState.currentTrick,
                    engineState.trumpSuit
                )
            ) {
                alert("You must follow suit!");
                return;
            }
            dispatch(playCardAction(0, engineCard));
        },
        [engineState]
    );

    // ── Play again / next round ───────────────────────────────────────────────
    const handlePlayAgain = useCallback(() => {
        if (engineState.phase === PHASES.GAME_END) {
            dispatch({ type: "RESET" }); // Full restart, cats reset to [0,0]
        } else {
            dispatch(startNextRoundAction()); // Next round, cats preserved
        }
    }, [engineState.phase]);

    // ── Derived UI values ─────────────────────────────────────────────────────
    const trumpSuitDisplay = SUIT_CODE_TO_FULL[engineState.trumpSuit] ?? null;

    // Human player's hand, converted to full suit names for PlayingCard component
    const playerHand = handToDisplayCards(
        engineState.players.find((p) => p.seat === 0)?.hand ?? []
    );

    const activeSeat = SEAT_INDEX_TO_NAME[engineState.currentTurn] ?? "bottom";

    // Current round trick counts
    const team0Tricks = engineState.trickWinners.filter((t) => t === 0).length;
    const team1Tricks = engineState.trickWinners.filter((t) => t === 1).length;

    // Last round result trick counts (for GameResult display)
    const lastTrickCounts = engineState.lastRoundResult?.trickCounts ?? [0, 0];

    // What to show in which overlay
    const showBidPanel =
        engineState.phase === PHASES.TRUMP_SELECTION &&
        engineState.trumpChooserSeat === 0;
    const showPlayerHand = engineState.phase === PHASES.PLAYING;
    const showResult =
        engineState.phase === PHASES.ROUND_END ||
        engineState.phase === PHASES.GAME_END;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="game-table">
            {/* Header widgets */}
            <div className="game-table__header-widgets">
                <TrumpDisplay suit={trumpSuitDisplay} />
                <ScoreBoard
                    team1Tricks={team0Tricks}
                    team2Tricks={team1Tricks}
                    team1Score={engineState.cats[0]}
                    team2Score={engineState.cats[1]}
                />
            </div>

            {/* Table layout containing seats and center cards */}
            <div
                className="game-table__arena"
                style={{
                    "--table-width": tCfg.width,
                    "--table-max-width": `${tCfg.maxWidth}px`,
                    "--table-height": `${tCfg.height}px`,
                    "--table-margin-top": `${tCfg.marginTop}px`,
                    "--table-margin-bottom": `${tCfg.marginBottom}px`,
                    "--table-top-corner": `${tCfg.topCornerWidth}%`,
                    "--table-top-corner-right": `${100 - tCfg.topCornerWidth}%`,
                    "--table-wood-border": `${tCfg.woodBorderThickness}px`,
                    "--table-wood-side-gap": `${tCfg.woodBorderSideGap}px`,
                }}
            >
                <div className="game-table__3d-table">
                    <div className="game-table__3d-table-wood" />
                    <div className="game-table__3d-table-felt" />

                    {/* Left AI (engine seat 1) */}
                    <div
                        className="game-table__seat-container game-table__seat-container--left"
                        style={{
                            left: `${oCfg.left.horizontalPos}%`,
                            bottom: `calc(100% - ${oCfg.left.tableOverlap}px)`,
                            "--opp-width": `${oCfg.baseWidth * (oCfg.left.scale / 100)}px`,
                            "--opp-height": `${oCfg.baseHeight * (oCfg.left.scale / 100)}px`,
                            transform: `translateX(-50%) translate(${oCfg.left.offsetX}px, ${oCfg.left.offsetY}px)`,
                        }}
                    >
                        <PlayerSeat
                            name="AI Left"
                            isAI={true}
                            isActive={activeSeat === "left"}
                            position="left"
                            avatarImg={player1Img}
                        />
                    </div>

                    {/* Top AI (engine seat 2 — partner) */}
                    <div
                        className="game-table__seat-container game-table__seat-container--top"
                        style={{
                            left: `${oCfg.top.horizontalPos}%`,
                            bottom: `calc(100% - ${oCfg.top.tableOverlap}px)`,
                            "--opp-width": `${oCfg.baseWidth * (oCfg.top.scale / 100)}px`,
                            "--opp-height": `${oCfg.baseHeight * (oCfg.top.scale / 100)}px`,
                            transform: `translateX(-50%) translate(${oCfg.top.offsetX}px, ${oCfg.top.offsetY}px)`,
                        }}
                    >
                        <PlayerSeat
                            name="AI Top (Partner)"
                            isAI={true}
                            isActive={activeSeat === "top"}
                            position="top"
                            avatarImg={player2Img}
                        />
                    </div>

                    {/* Right AI (engine seat 3) */}
                    <div
                        className="game-table__seat-container game-table__seat-container--right"
                        style={{
                            left: `${oCfg.right.horizontalPos}%`,
                            bottom: `calc(100% - ${oCfg.right.tableOverlap}px)`,
                            "--opp-width": `${oCfg.baseWidth * (oCfg.right.scale / 100)}px`,
                            "--opp-height": `${oCfg.baseHeight * (oCfg.right.scale / 100)}px`,
                            transform: `translateX(-50%) translate(${oCfg.right.offsetX}px, ${oCfg.right.offsetY}px)`,
                        }}
                    >
                        <PlayerSeat
                            name="AI Right"
                            isAI={true}
                            isActive={activeSeat === "right"}
                            position="right"
                            avatarImg={player3Img}
                        />
                    </div>

                    {/* Played cards on the felt */}
                    <div className="game-table__center">
                        <PlayedCards cards={shownTrick} />
                    </div>
                </div>

                {/* Human seat (engine seat 0) */}
                <div className="game-table__bottom-seat-wrap">
                    <PlayerSeat
                        name={playerName}
                        isAI={false}
                        isActive={activeSeat === "bottom"}
                        position="bottom"
                    />
                </div>
            </div>

            {/* Player hand */}
            <div className="game-table__footer">
                {showPlayerHand && (
                    <PlayerHand
                        cards={playerHand}
                        onConfirmPlay={handlePlayCard}
                    />
                )}
            </div>

            {/* Bidding overlay — only when human is the trump chooser */}
            {showBidPanel && (
                <div className="game-table__overlay">
                    <BidPanel onSelectTrump={handleSelectTrump} />
                </div>
            )}

            {/* Round/game result overlay */}
            {showResult && (
                <GameResult
                    playerWon={engineState.lastRoundResult?.winnerTeam === 0}
                    team1Score={lastTrickCounts[0]}
                    team2Score={lastTrickCounts[1]}
                    onPlayAgain={handlePlayAgain}
                />
            )}
        </div>
    );
}
