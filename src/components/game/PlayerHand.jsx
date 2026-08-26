import { useState } from "react";
import PlayingCard from "./PlayingCard";
import ConfirmPlay from "./ConfirmPlay";
import handLeft from "../../assets/images/hand-left.png";
import handLeft2 from "../../assets/images/hand-left2.png";
import handRight from "../../assets/images/hand-right.png";
import "./PlayerHand.css";

// ─────────────────────────────────────────────────────────────────────────────
// ADJUST THESE to position / size / rotate the single reference card
// All values are in the INTERNAL coordinate space of the fan-wrap container
// (the container is rendered at 0.5 scale, so divide by 2 for screen pixels)
// ─────────────────────────────────────────────────────────────────────────────
const CARD_LEFT = 222;   // px from left of the hand container
const CARD_TOP = -210;   // px from top  of the hand container  (increase = lower)
const CARD_WIDTH = 330;   // px
const CARD_HEIGHT = 520;   // px
const CARD_ANGLE = -17;     // degrees  (positive = clockwise)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// ADJUST THESE to position / size the right hand image (hand-right.png)
// ─────────────────────────────────────────────────────────────────────────────
const RIGHT_HAND_SCALE = 180; // % size (e.g., 100 = 100%, 120 = 120%)
const RIGHT_HAND_X = 40;   // px offset from default right position (positive = right, negative = left)
const RIGHT_HAND_Y = -10;   // px offset from default bottom position (positive = up, negative = down)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// ADJUST THESE to position / angle the selected (right-side) card
// ─────────────────────────────────────────────────────────────────────────────
const RIGHT_CARD_X = -215;   // px — horizontal offset (positive = right, negative = left)
const RIGHT_CARD_Y = -80;   // px — vertical offset   (positive = down, negative = up)
const RIGHT_CARD_ANGLE = 0;   // degrees (positive = clockwise)
// ─────────────────────────────────────────────────────────────────────────────

export default function PlayerHand({ cards = [], onConfirmPlay }) {
    const [selectedCardId, setSelectedCardId] = useState(null);

    const selectedCard = cards.find((c) => c.id === selectedCardId) || null;
    const fanCards = cards.filter((c) => c.id !== selectedCardId);

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

    return (
        <div className="player-hand">
            <div className="player-hand__fan-wrap">
                {/* ── Back hand image (behind cards) ─────────────────── */}
                <img
                    src={handLeft2}
                    alt=""
                    aria-hidden="true"
                    className="player-hand__hand-image player-hand__hand-image--left-back"
                />

                {/* ── Cards behind the hand image ──────────────────────── */}
                {fanCards.map((card, i) => {
                    const left = CARD_LEFT + i * 30;
                    const top = CARD_TOP - i * 10;
                    const angle = CARD_ANGLE + i * 8;
                    const zIndex = i + 2; // Card 0 (ref card) is z-index 2, Card 1 is z-index 3...
                    return (
                        <div
                            key={card.id || i}
                            style={{
                                position: "absolute",
                                left: `${left}px`,
                                top: `${top}px`,
                                width: `${CARD_WIDTH}px`,
                                height: `${CARD_HEIGHT}px`,
                                transform: `rotate(${angle}deg)`,
                                transformOrigin: "0% 100%", // bottom-left pivot
                                zIndex: zIndex,
                                pointerEvents: "auto",
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
                        style={{
                            zIndex: 1,
                            position: "relative",
                            left: `${RIGHT_CARD_X}px`,
                            top: `${RIGHT_CARD_Y}px`,
                            transform: `rotate(${RIGHT_CARD_ANGLE}deg)`,
                        }}
                    />
                    <img
                        src={handRight}
                        alt=""
                        aria-hidden="true"
                        className="player-hand__hand-image player-hand__hand-image--right"
                        style={{
                            width: `${220 * (RIGHT_HAND_SCALE / 100)}px`,
                            right: `${0 - RIGHT_HAND_X}px`,
                            bottom: `${0 + RIGHT_HAND_Y}px`,
                            zIndex: 10,
                        }}
                    />
                    <ConfirmPlay onConfirm={handleConfirm} onCancel={handleReturnToHand} />
                </div>
            )}
        </div>
    );
}
