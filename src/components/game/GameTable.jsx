import { useState, useEffect, useCallback, useContext } from "react";
import { getPlayer } from "../../utils/localStorage";
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

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION: ADJUST TABLE AND OPPONENT SIZES / POSITIONS HERE
// ─────────────────────────────────────────────────────────────────────────────
const TABLE_CONFIG = {
    // Table Dimensions
    width: "80%",           // Width of the table container (e.g., "90%" or "820px")
    maxWidth: 1200,         // Maximum width in pixels
    height: 450,           // Height of the table in pixels
    marginTop: 60,         // Space above the table for opponent avatars
    marginBottom: 220,      // Space below the table

    // Table Perspective Shape
    // The top edge of the trapezoid starts at topCornerWidth% and ends at (100 - topCornerWidth)%
    // A smaller percentage makes the top edge wider (flatter look), larger makes it narrower (more perspective).
    topCornerWidth: 35,    // percentage (%)

    // Wood Border & Insets
    woodBorderThickness: 10,  // top/bottom wood border thickness in pixels
    woodBorderSideGap: 30,    // left/right wood border gap in pixels
};

const OPPONENT_CONFIG = {
    // Base dimensions for the player images (in pixels)
    baseWidth: 140,
    baseHeight: 160,

    left: {
        scale: 200,            // size percentage (e.g. 100 = 100%, 120 = 120%)
        tableOverlap: 45,      // pixels
        horizontalPos: 18,     // % position along top edge of table
        offsetX: 0,            // fine-tuning X offset in pixels
        offsetY: 250,          // fine-tuning Y offset in pixels
    },
    top: {
        scale: 130,            // size percentage (e.g. 100 = 100%, 120 = 120%)
        tableOverlap: 45,      // pixels
        horizontalPos: 50,     // % position along top edge of table
        offsetX: 0,            // fine-tuning X offset in pixels
        offsetY: 40,           // fine-tuning Y offset in pixels
    },
    right: {
        scale: 200,            // size percentage (e.g. 100 = 100%, 120 = 120%)
        tableOverlap: 45,      // pixels
        horizontalPos: 82,     // % position along top edge of table
        offsetX: 0,            // fine-tuning X offset in pixels
        offsetY: 250,          // fine-tuning Y offset in pixels
    }
};
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE CONFIGURATION: ADJUST TABLE AND OPPONENT SIZES / POSITIONS FOR MOBILE
// (applies at screen width ≤ 768px)
// ─────────────────────────────────────────────────────────────────────────────
const MOBILE_TABLE_CONFIG = {
    width: "95%",           // Width of the table container
    maxWidth: 600,         // Maximum width in pixels
    height: 440,           // Height of the table in pixels
    marginTop: 200,         // Space above the table for opponent avatars
    marginBottom: 180,     // Space below the table

    topCornerWidth: 35,    // percentage (%)

    woodBorderThickness: 6,   // top/bottom wood border thickness in pixels
    woodBorderSideGap: 16,    // left/right wood border gap in pixels
};

const MOBILE_OPPONENT_CONFIG = {
    baseWidth: 140,
    baseHeight: 160,

    left: {
        scale: 180,             // size percentage
        tableOverlap: 20,      // pixels
        horizontalPos: 18,     // % position along top edge of table
        offsetX: -30,            // fine-tuning X offset in pixels
        offsetY: 200,          // fine-tuning Y offset in pixels
    },
    top: {
        scale: 130,             // size percentage
        tableOverlap: 20,      // pixels
        horizontalPos: 50,     // % position along top edge of table
        offsetX: 0,            // fine-tuning X offset in pixels
        offsetY: 60,           // fine-tuning Y offset in pixels
    },
    right: {
        scale: 180,             // size percentage
        tableOverlap: 20,      // pixels
        horizontalPos: 82,     // % position along top edge of table
        offsetX: 30,            // fine-tuning X offset in pixels
        offsetY: 200,          // fine-tuning Y offset in pixels
    }
};
// ─────────────────────────────────────────────────────────────────────────────



const SUITS = ["hearts", "diamonds", "clubs", "spades"];
const RANKS = [
    { rank: "7", value: 7 },
    { rank: "8", value: 8 },
    { rank: "9", value: 9 },
    { rank: "10", value: 10 },
    { rank: "J", value: 11 },
    { rank: "Q", value: 12 },
    { rank: "K", value: 13 },
    { rank: "A", value: 14 }
];

const SEAT_ORDER = ["bottom", "left", "top", "right"];

export default function GameTable() {
    const [player, setPlayer] = useState({ name: "Player" });
    const [gameState, setGameState] = useState("bidding"); // bidding | playing | result
    const [trumpSuit, setTrumpSuit] = useState(null);
    const [playerHand, setPlayerHand] = useState([]);
    const [aiHands, setAiHands] = useState({ left: [], top: [], right: [] });

    // Detect mobile screen width (≤ 768px) to switch config
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Pick the correct config based on screen size
    const tCfg = isMobile ? MOBILE_TABLE_CONFIG : TABLE_CONFIG;
    const oCfg = isMobile ? MOBILE_OPPONENT_CONFIG : OPPONENT_CONFIG;
    const [playedCards, setPlayedCards] = useState({});
    const [activeSeat, setActiveSeat] = useState("bottom");
    const [leadSuit, setLeadSuit] = useState(null);

    const [team1Tricks, setTeam1Tricks] = useState(0); // bottom + top (Us)
    const [team2Tricks, setTeam2Tricks] = useState(0); // left + right (Them)
    const [team1Score, setTeam1Score] = useState(0);
    const [team2Score, setTeam2Score] = useState(0);

    // Initialise player name from local storage
    useEffect(() => {
        const stored = getPlayer();
        if (stored) {
            setPlayer(stored);
        }
    }, []);

    // Generate and deal cards
    const startNewRound = useCallback(() => {
        // Create 32-card deck for Omi
        const deck = [];
        let idCounter = 1;
        SUITS.forEach((suit) => {
            RANKS.forEach(({ rank, value }) => {
                deck.push({ id: idCounter++, rank, suit, value });
            });
        });

        // Shuffle deck
        const shuffled = [...deck].sort(() => Math.random() - 0.5);

        // Deal 8 cards to each player
        setPlayerHand(shuffled.slice(0, 8).sort((a, b) => a.value - b.value));
        setAiHands({
            left: shuffled.slice(8, 16),
            top: shuffled.slice(16, 24),
            right: shuffled.slice(24, 32)
        });

        setPlayedCards({});
        setLeadSuit(null);
        setTeam1Tricks(0);
        setTeam2Tricks(0);
        setTrumpSuit(null);
        setGameState("bidding");
        setActiveSeat("bottom");
    }, []);

    useEffect(() => {
        startNewRound();
    }, [startNewRound]);

    // Handle Bidding
    const handleSelectTrump = (suit) => {
        setTrumpSuit(suit);
        setGameState("playing");
    };

    // Evaluate who won the trick
    const evaluateTrick = useCallback((currentPlayed) => {
        let winningSeat = null;
        let highestCard = null;

        Object.entries(currentPlayed).forEach(([seat, card]) => {
            if (!highestCard) {
                highestCard = card;
                winningSeat = seat;
                return;
            }

            // Check if trump card played
            const isCardTrump = card.suit === trumpSuit;
            const isHighestTrump = highestCard.suit === trumpSuit;

            if (isCardTrump && !isHighestTrump) {
                highestCard = card;
                winningSeat = seat;
            } else if (isCardTrump && isHighestTrump) {
                if (card.value > highestCard.value) {
                    highestCard = card;
                    winningSeat = seat;
                }
            } else if (!isCardTrump && !isHighestTrump) {
                // If neither is trump, card must match lead suit to compete
                if (card.suit === leadSuit && highestCard.suit === leadSuit) {
                    if (card.value > highestCard.value) {
                        highestCard = card;
                        winningSeat = seat;
                    }
                } else if (card.suit === leadSuit && highestCard.suit !== leadSuit) {
                    highestCard = card;
                    winningSeat = seat;
                }
            }
        });

        // Award trick points
        const isTeam1 = ["bottom", "top"].includes(winningSeat);
        setTimeout(() => {
            if (isTeam1) {
                setTeam1Tricks((t) => t + 1);
            } else {
                setTeam2Tricks((t) => t + 1);
            }

            // Clear table
            setPlayedCards({});
            setLeadSuit(null);

            // Winner of trick starts next trick
            setActiveSeat(winningSeat);
        }, 1500);
    }, [trumpSuit, leadSuit]);

    // Play a card from any seat
    const playCard = useCallback((seat, card) => {
        setPlayedCards((prev) => {
            const updated = { ...prev, [seat]: card };

            // Set lead suit if this is the first card in the trick
            if (Object.keys(prev).length === 0) {
                setLeadSuit(card.suit);
            }

            // Check if trick is complete (4 cards played)
            if (Object.keys(updated).length === 4) {
                evaluateTrick(updated);
            } else {
                // Clockwise turn selection
                const currentIndex = SEAT_ORDER.indexOf(seat);
                const nextIndex = (currentIndex + 1) % SEAT_ORDER.length;
                setActiveSeat(SEAT_ORDER[nextIndex]);
            }

            return updated;
        });
    }, [evaluateTrick]);

    // Simple AI card playing logic
    useEffect(() => {
        if (gameState !== "playing") return;
        if (activeSeat === "bottom") return; // Wait for player

        const timer = setTimeout(() => {
            const hand = aiHands[activeSeat];
            if (!hand || hand.length === 0) return;

            // AI Card selection rule:
            // 1. Must follow lead suit if possible
            // 2. Otherwise play anything
            let playableCards = hand.filter((c) => c.suit === leadSuit);
            if (playableCards.length === 0) {
                playableCards = hand; // Can't follow suit, play any card
            }

            // Choose a random valid card
            const selectedCard = playableCards[Math.floor(Math.random() * playableCards.length)];

            // Remove card from AI hand
            setAiHands((prev) => ({
                ...prev,
                [activeSeat]: prev[activeSeat].filter((c) => c.id !== selectedCard.id)
            }));

            // Play the card
            playCard(activeSeat, selectedCard);
        }, 1000);

        return () => clearTimeout(timer);
    }, [activeSeat, aiHands, gameState, leadSuit, playCard]);

    // Check for round completion
    useEffect(() => {
        const totalTricks = team1Tricks + team2Tricks;
        if (totalTricks === 8) {
            // Round over
            setTimeout(() => {
                const playerWon = team1Tricks > team2Tricks;
                if (playerWon) {
                    setTeam1Score((s) => s + 1);
                } else {
                    setTeam2Score((s) => s + 1);
                }
                setGameState("result");
            }, 1000);
        }
    }, [team1Tricks, team2Tricks]);

    // Handle user playing a card
    const handlePlayCard = (card) => {
        // Only allow playing during user's turn
        if (activeSeat !== "bottom") return;

        // Follow suit rule
        const hasLeadSuit = playerHand.some((c) => c.suit === leadSuit);
        if (leadSuit && hasLeadSuit && card.suit !== leadSuit) {
            alert("You must follow suit!");
            return;
        }

        // Remove card from hand
        setPlayerHand((prev) => prev.filter((c) => c.id !== card.id));

        // Play card
        playCard("bottom", card);
    };

    return (
        <div className="game-table">
            {/* Header widgets */}
            <div className="game-table__header-widgets">
                <TrumpDisplay suit={trumpSuit} />
                <ScoreBoard
                    team1Tricks={team1Tricks}
                    team2Tricks={team2Tricks}
                    team1Score={team1Score}
                    team2Score={team2Score}
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

                    <div
                        className="game-table__seat-container game-table__seat-container--left"
                        style={{
                            left: `${oCfg.left.horizontalPos}%`,
                            bottom: `calc(100% - ${oCfg.left.tableOverlap}px)`,
                            "--opp-width": `${oCfg.baseWidth * (oCfg.left.scale / 100)}px`,
                            "--opp-height": `${oCfg.baseHeight * (oCfg.left.scale / 100)}px`,
                            transform: `translateX(-50%) translate(${oCfg.left.offsetX}px, ${oCfg.left.offsetY}px)`
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

                    <div
                        className="game-table__seat-container game-table__seat-container--top"
                        style={{
                            left: `${oCfg.top.horizontalPos}%`,
                            bottom: `calc(100% - ${oCfg.top.tableOverlap}px)`,
                            "--opp-width": `${oCfg.baseWidth * (oCfg.top.scale / 100)}px`,
                            "--opp-height": `${oCfg.baseHeight * (oCfg.top.scale / 100)}px`,
                            transform: `translateX(-50%) translate(${oCfg.top.offsetX}px, ${oCfg.top.offsetY}px)`
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

                    <div
                        className="game-table__seat-container game-table__seat-container--right"
                        style={{
                            left: `${oCfg.right.horizontalPos}%`,
                            bottom: `calc(100% - ${oCfg.right.tableOverlap}px)`,
                            "--opp-width": `${oCfg.baseWidth * (oCfg.right.scale / 100)}px`,
                            "--opp-height": `${oCfg.baseHeight * (oCfg.right.scale / 100)}px`,
                            transform: `translateX(-50%) translate(${oCfg.right.offsetX}px, ${oCfg.right.offsetY}px)`
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

                    <div className="game-table__center">
                        <PlayedCards cards={playedCards} />
                    </div>
                </div>

                <div className="game-table__bottom-seat-wrap">
                    <PlayerSeat
                        name={player.name}
                        isAI={false}
                        isActive={activeSeat === "bottom"}
                        position="bottom"
                    />
                </div>
            </div>

            {/* Player controls */}
            <div className="game-table__footer">
                {gameState === "playing" && (
                    <PlayerHand cards={playerHand} onConfirmPlay={handlePlayCard} />
                )}
            </div>

            {/* Bidding Overlay */}
            {gameState === "bidding" && (
                <div className="game-table__overlay">
                    <BidPanel onSelectTrump={handleSelectTrump} />
                </div>
            )}

            {/* Round result Overlay */}
            {gameState === "result" && (
                <GameResult
                    playerWon={team1Tricks > team2Tricks}
                    team1Score={team1Tricks}
                    team2Score={team2Tricks}
                    onPlayAgain={startNewRound}
                />
            )}
        </div>
    );
}
