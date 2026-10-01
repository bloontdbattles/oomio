import { useReducer, useEffect, useRef, useState, useCallback } from "react";
import { getPlayer as getStoredPlayer } from "../../utils/localStorage";
import PlayerSeat from "./PlayerSeat";
import PlayedCards from "./PlayedCards";
import PlayerHand from "./PlayerHand";
import TrumpDisplay from "./TrumpDisplay";
import ScoreBoard from "./ScoreBoard";
import TrumpPicker from "./TrumpPicker";
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
import { getTrickWinnerIndex } from "../../game/rules/trickRules";
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
export default function GameTable({
    players: externalPlayers,
    hand: externalHand,
    plays: externalPlays,
    trumpSuit: externalTrumpSuit,
    activeSeat: externalActiveSeat,
    onConfirmPlay: externalOnConfirmPlay,
    isMultiplayer = false,
    winnerPosition: externalWinnerPosition,
    isCollecting: externalIsCollecting,
}) {
    const [engineState, dispatch] = useReducer(
        gameReducerWithIds,
        undefined,
        initEngineState
    );

    const [playerName, setPlayerName] = useState("Player");
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Trick display: hold the last completed trick visible for 5s before clearing
    const [shownTrick, setShownTrick] = useState({});
    const [paused, setPaused] = useState(false);
    const [winnerPosition, setWinnerPosition] = useState(null);
    const [isCollecting, setIsCollecting] = useState(false);
    const completedLenRef = useRef(0);

    const tCfg = isMobile ? MOBILE_TABLE_CONFIG : TABLE_CONFIG;
    const oCfg = isMobile ? MOBILE_OPPONENT_CONFIG : OPPONENT_CONFIG;

    // ── Load player name ──────────────────────────────────────────────────────
    useEffect(() => {
        const stored = getStoredPlayer();
        if (stored?.name) setPlayerName(stored.name);

        const handlePlayerChange = (e) => {
            if (e.detail?.name) setPlayerName(e.detail.name);
        };
        window.addEventListener("oomio_player_change", handlePlayerChange);
        return () => window.removeEventListener("oomio_player_change", handlePlayerChange);
    }, []);

    // ── Responsive ────────────────────────────────────────────────────────────
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const sweepTimerRef = useRef(null);
    const clearTimerRef = useRef(null);

    // ── Effect A & B: Unified Trick Display & Completion Pause ────────────────
    // Manages live trick cards and holds all 4 completed cards on table for 5 seconds.
    // At 3s, triggers a 1s animation collecting cards to the trick winner's seat.
    useEffect(() => {
        if (isMultiplayer) return;

        // Reset display state on new round or fresh game
        if (
            engineState.phase === PHASES.TRUMP_SELECTION ||
            engineState.phase === PHASES.DEALING
        ) {
            completedLenRef.current = 0;
            if (sweepTimerRef.current) clearTimeout(sweepTimerRef.current);
            if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
            setPaused(false);
            setShownTrick({});
            setIsCollecting(false);
            setWinnerPosition(null);
            return;
        }

        const newLen = engineState.completedTricks.length;

        // A trick just completed (newLen increased) — show all 4 cards for 5 seconds
        if (newLen > completedLenRef.current) {
            completedLenRef.current = newLen;
            const lastCompleted = engineState.completedTricks[newLen - 1];
            const lastTrickArr = Array.isArray(lastCompleted) ? lastCompleted : (lastCompleted?.trick ?? []);

            setShownTrick(trickToPlayedCards(lastTrickArr));
            setPaused(true);

            // Calculate winner position for animation
            const winnerSeat = engineState.trickWinnerSeats?.[newLen - 1] ?? getTrickWinnerIndex(lastTrickArr, engineState.trumpSuit);
            const winnerPos = SEAT_INDEX_TO_NAME[winnerSeat] ?? "bottom";
            setWinnerPosition(null);
            setIsCollecting(false);

            if (sweepTimerRef.current) clearTimeout(sweepTimerRef.current);
            if (clearTimerRef.current) clearTimeout(clearTimerRef.current);

            // Trigger collection animation at t=3s (holds 3s, moves 1s, clears at 5s)
            sweepTimerRef.current = setTimeout(() => {
                setWinnerPosition(winnerPos);
                setIsCollecting(true);
            }, 3000);

            clearTimerRef.current = setTimeout(() => {
                setPaused(false);
                setShownTrick({});
                setIsCollecting(false);
                setWinnerPosition(null);
            }, 5000);
            return;
        }

        // Live trick during play (if not paused)
        if (!paused && engineState.phase === PHASES.PLAYING) {
            setShownTrick(trickToPlayedCards(engineState.currentTrick ?? []));
        }
    }, [
        isMultiplayer,
        engineState.completedTricks.length,
        engineState.currentTrick,
        engineState.phase,
    ]);

    // ── Effect C: AI trump selection ──────────────────────────────────────────
    useEffect(() => {
        if (isMultiplayer) return;
        if (engineState.phase !== PHASES.TRUMP_SELECTION) return;
        if (engineState.trumpChooserSeat === 0) return; // Seat 0 = human

        const mySeat = engineState.trumpChooserSeat;
        const timer = setTimeout(() => {
            try {
                const aiView = buildAIViewState(engineState, mySeat);
                const biddingView = {
                    ...aiView,
                    players: aiView.players.map((p) =>
                        p.seat === mySeat ? { ...p, hand: p.hand.slice(0, 4) } : p
                    ),
                };
                const suit = getAITrump({ state: biddingView, seat: mySeat });
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
        if (isMultiplayer) return;
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
    const trumpSuitDisplay = isMultiplayer
        ? externalTrumpSuit
        : (SUIT_CODE_TO_FULL[engineState.trumpSuit] ?? null);

    // Human player's hand, converted to full suit names for PlayingCard component
    // Shows only the first 4 cards during TRUMP_SELECTION, and full hand during PLAYING
    const currentHand = isMultiplayer
        ? (externalHand || [])
        : handToDisplayCards(
            engineState.phase === PHASES.TRUMP_SELECTION
                ? (engineState.players.find((p) => p.seat === 0)?.hand ?? []).slice(0, 4)
                : (engineState.players.find((p) => p.seat === 0)?.hand ?? [])
        );

    const currentActiveSeat = isMultiplayer
        ? externalActiveSeat
        : (SEAT_INDEX_TO_NAME[engineState.currentTurn] ?? "bottom");

    const currentConfirmPlay = isMultiplayer ? externalOnConfirmPlay : handlePlayCard;

    // Player seat information
    const leftPlayer = isMultiplayer
        ? externalPlayers?.find((p) => p.seat === "left")
        : null;
    const topPlayer = isMultiplayer
        ? externalPlayers?.find((p) => p.seat === "top")
        : null;
    const rightPlayer = isMultiplayer
        ? externalPlayers?.find((p) => p.seat === "right")
        : null;
    const bottomPlayer = isMultiplayer
        ? externalPlayers?.find((p) => p.seat === "bottom")
        : null;

    // Current round trick counts (singleplayer)
    const team0Tricks = engineState.trickWinners.filter((t) => t === 0).length;
    const team1Tricks = engineState.trickWinners.filter((t) => t === 1).length;

    // Last round result trick counts (for GameResult display)
    const lastTrickCounts = engineState.lastRoundResult?.trickCounts ?? [0, 0];

    // What to show in which overlay
    const showBidPanel =
        !isMultiplayer &&
        engineState.phase === PHASES.TRUMP_SELECTION &&
        engineState.trumpChooserSeat === 0;
    const showWaitingTrump =
        !isMultiplayer &&
        engineState.phase === PHASES.TRUMP_SELECTION &&
        engineState.trumpChooserSeat !== 0;
    const showPlayerHand = isMultiplayer
        ? true
        : (engineState.phase === PHASES.PLAYING || engineState.phase === PHASES.TRUMP_SELECTION);
    const showResult =
        !isMultiplayer &&
        (engineState.phase === PHASES.ROUND_END ||
            engineState.phase === PHASES.GAME_END);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="game-table">
            {/* Header widgets */}
            <div className="game-table__header-widgets">
                <TrumpDisplay suit={trumpSuitDisplay} />
                <ScoreBoard
                    team1Tricks={team0Tricks}
                    team2Tricks={team1Tricks}
                    team1Score={engineState.points[0]}
                    team2Score={engineState.points[1]}
                    players={isMultiplayer ? externalPlayers : undefined}
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

                    {/* Left Seat (engine seat 1 / multiplayer left) */}
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
                            name={leftPlayer?.name || "AI Left"}
                            isAI={leftPlayer ? leftPlayer.isAI : true}
                            isDisconnected={leftPlayer?.isDisconnected}
                            isActive={currentActiveSeat === "left"}
                            position="left"
                            avatarImg={leftPlayer?.avatar || player1Img}
                        />
                    </div>

                    {/* Top Seat (engine seat 2 / partner / multiplayer top) */}
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
                            name={topPlayer?.name || "AI Top (Partner)"}
                            isAI={topPlayer ? topPlayer.isAI : true}
                            isDisconnected={topPlayer?.isDisconnected}
                            isActive={currentActiveSeat === "top"}
                            position="top"
                            avatarImg={topPlayer?.avatar || player2Img}
                        />
                    </div>

                    {/* Right Seat (engine seat 3 / multiplayer right) */}
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
                            name={rightPlayer?.name || "AI Right"}
                            isAI={rightPlayer ? rightPlayer.isAI : true}
                            isDisconnected={rightPlayer?.isDisconnected}
                            isActive={currentActiveSeat === "right"}
                            position="right"
                            avatarImg={rightPlayer?.avatar || player3Img}
                        />
                    </div>

                    {/* Played cards on the felt */}
                    <div className="game-table__center">
                        <PlayedCards
                            cards={isMultiplayer ? undefined : shownTrick}
                            plays={isMultiplayer ? externalPlays : undefined}
                            winnerPosition={isMultiplayer ? externalWinnerPosition : winnerPosition}
                            isCollecting={isMultiplayer ? externalIsCollecting : isCollecting}
                        />
                    </div>
                </div>

                {/* Bottom Seat (engine seat 0 / human / multiplayer bottom) */}
                <div className="game-table__bottom-seat-wrap">
                    <PlayerSeat
                        name={bottomPlayer?.name || playerName}
                        isAI={bottomPlayer ? bottomPlayer.isAI : false}
                        isDisconnected={bottomPlayer?.isDisconnected}
                        isActive={currentActiveSeat === "bottom"}
                        position="bottom"
                    />
                </div>
            </div>

            {/* Player hand */}
            <div className="game-table__footer">
                {showPlayerHand && (
                    <PlayerHand
                        cards={currentHand}
                        onConfirmPlay={currentConfirmPlay}
                    />
                )}
            </div>

            {/* Bidding overlay — singleplayer only */}
            {showBidPanel && (
                <TrumpPicker isMyTurn={true} onSelect={handleSelectTrump} />
            )}
            {showWaitingTrump && (
                <TrumpPicker isMyTurn={false} />
            )}

            {/* Round/game result overlay — singleplayer only */}
            {showResult && (
                <GameResult
                    isGameOver={engineState.phase === PHASES.GAME_END}
                    playerWon={engineState.lastRoundResult?.winnerTeam === 0}
                    roundResult={engineState.lastRoundResult?.result}
                    team1Tricks={lastTrickCounts[0]}
                    team2Tricks={lastTrickCounts[1]}
                    team1Points={engineState.points[0]}
                    team2Points={engineState.points[1]}
                    targetPoints={engineState.targetPoints}
                    onPlayAgain={handlePlayAgain}
                />
            )}
        </div>
    );
}
