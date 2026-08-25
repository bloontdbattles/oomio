import { useState } from "react";
import PlayingCard from "./PlayingCard";
import ConfirmPlay from "./ConfirmPlay";
import handLeft from "../../assets/images/hand-left.png";
import handRight from "../../assets/images/hand-right.png";
import "./PlayerHand.css";

// ─────────────────────────────────────────────────────────────────────────────
// REFERENCE CARD — this is the rightmost / front card. It never moves.
// Adjust these values to position it correctly over the hand image.
// All units are INTERNAL px (container is scaled 0.5 → divide by 2 for screen px)
// ─────────────────────────────────────────────────────────────────────────────
const CARD_LEFT   = 222;   // bottom-left x of the reference card
const CARD_TOP    = -210;  // top edge of the reference card  (increase = move down)
const CARD_WIDTH  = 330;   // card width  in internal px
const CARD_HEIGHT = 520;   // card height in internal px
const CARD_ANGLE  = -17;   // rotation in degrees (positive = clockwise)

// ─────────────────────────────────────────────────────────────────────────────
// FAN STEP — how each successive card shifts relative to the one to its right
// ─────────────────────────────────────────────────────────────────────────────
const STEP_LEFT_PX  = 10;   // each card's bottom-left moves this many px to the left
const STEP_ANGLE_DEG = 2;   // each card's angle decreases by this many degrees

// ─────────────────────────────────────────────────────────────────────────────
// Build the per-card layout.
// The reference card is always at index (N-1). Cards to its left are computed
// recursively: each card's bottom-left = previous bottom-left - STEP_LEFT_PX,
// and angle = previous angle - STEP_ANGLE_DEG.
// Because all cards share the same height, top stays constant.
// ─────────────────────────────────────────────────────────────────────────────
function buildFan(count) {
    return Array.from({ length: count }, (_, i) => {
        const stepsFromRef = (count - 1) - i;   // 0 for reference card
        return {
            left:  CARD_LEFT  - stepsFromRef * STEP_LEFT_PX,
            top:   CARD_TOP,                    // constant (same height for all)
            angle: CARD_ANGLE - stepsFromRef * STEP_ANGLE_DEG,
            zIndex: i + 1,                      // reference card has highest z
        };
    });
}

export default function PlayerHand({ cards = [], onConfirmPlay }) {
    const [selectedCardId, setSelectedCardId] = useState(null);

    const selectedCard = cards.find((c) => c.id === selectedCardId) || null;
    const fanCards     = cards.filter((c) => c.id !== selectedCardId);

    const selectCard = (cardId) => setSelectedCardId(cardId);

    const handleContextMenu = (e, cardId) => {
        e.preventDefault();
        selectCard(cardId);
    };

    const handleReturnToHand = () => setSelectedCardId(null);

    const handleConfirm = () => {
        if (!selectedCard) return;
        onConfirmPlay(selectedCard);
        setSelectedCardId(null);
    };

    const fanLayout = buildFan(fanCards.length);

    return (
        <div className="player-hand">
            <div className="player-hand__fan-wrap">

                {/* ── Cards behind the hand image ──────────────────────── */}
                {fanCards.map((card, i) => {
                    const { left, top, angle, zIndex } = fanLayout[i];
                    return (
                        <div
                            key={card.id || i}
                            style={{
                                position:        "absolute",
                                left:            `${left}px`,
                                top:             `${top}px`,
                                width:           `${CARD_WIDTH}px`,
                                height:          `${CARD_HEIGHT}px`,
                                transform:       `rotate(${angle}deg)`,
                                transformOrigin: "0% 100%",   // bottom-left pivot
                                zIndex,
                                pointerEvents:   "auto",
                            }}
                        >
                            <PlayingCard
                                rank={card.rank}
                                suit={card.suit}
                                className="player-hand__card"
                                onClick={() => selectCard(card.id)}
                                onContextMenu={(e) => handleContextMenu(e, card.id)}
                            />
                        </div>
                    );
                })}

                {/* ── Hand image on top ─────────────────────────────────── */}
                <img
                    src={handLeft}
                    alt="Left hand holding cards"
                    className="player-hand__hand-image player-hand__hand-image--left"
                />
            </div>

            {selectedCard && (
                <div className="player-hand__selected-wrap">
                    <PlayingCard
                        rank={selectedCard.rank}
                        suit={selectedCard.suit}
                        className="player-hand__selected-card"
                        onClick={handleReturnToHand}
                    />
                    <img
                        src={handRight}
                        alt=""
                        aria-hidden="true"
                        className="player-hand__hand-image player-hand__hand-image--right"
                    />
                    <ConfirmPlay onConfirm={handleConfirm} onCancel={handleReturnToHand} />
                </div>
            )}
        </div>
    );
}
