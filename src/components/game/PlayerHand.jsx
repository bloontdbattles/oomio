import { useState } from "react";
import PlayingCard from "./PlayingCard";
import ConfirmPlay from "./ConfirmPlay";
import handLeft from "../../assets/images/hand-left.png";
import handRight from "../../assets/images/hand-right.png";
import "./PlayerHand.css";

const DEFAULT_CARDS = Array.from({ length: 8 }, () => ({}));

// ---- Fixed reference card ---------------------------------------------
// This is the card positioned in Figma to line up correctly with
// hand-left.png. Every card now uses this exact size + position.
const FIXED_CARD = {
    left: 122,   // px, from left of the hand container
    top: 100,    // px, from top of the hand container
    width: 330,  // px
    height: 520, // px
};

// ---- Fan rotation --------------------------------------------------------
// Rotating each card by a different degree fans them out around the bottom-left.
const FAN_DEGREES = [0, 6, 12, 18, 24, 30, 36, 42];

function getDegrees(count) {
    if (count === 1) return [0];
    return Array.from({ length: count }, (_, i) => {
        const t = i / (count - 1);
        const pos = t * (FAN_DEGREES.length - 1);
        const lo = Math.floor(pos);
        const hi = Math.min(FAN_DEGREES.length - 1, lo + 1);
        const f = pos - lo;
        return FAN_DEGREES[lo] + (FAN_DEGREES[hi] - FAN_DEGREES[lo]) * f;
    });
}

export default function PlayerHand({ cards = DEFAULT_CARDS, onConfirmPlay }) {
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

    const degrees = getDegrees(fanCards.length);

    return (
        <div className="player-hand">
            <div className="player-hand__fan-wrap">
                {/* Cards sit below the hand image, all sharing the fixed card's box
                    and pivoting around its bottom-left corner */}
                {fanCards.map((card, i) => (
                    <div
                        key={card.id || i}
                        style={{
                            position: "absolute",
                            left: `${FIXED_CARD.left}px`,
                            top: `${FIXED_CARD.top}px`,
                            width: `${FIXED_CARD.width}px`,
                            height: `${FIXED_CARD.height}px`,
                            zIndex: i + 1,
                            transform: `rotate(${degrees[i]}deg)`,
                            transformOrigin: "0% 100%", // bottom-left corner = shared pivot
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
                ))}

                {/* Hand image on top — transparent areas reveal cards behind */}
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