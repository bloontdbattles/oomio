import { useState } from "react";
import PlayingCard from "./PlayingCard";
import ConfirmPlay from "./ConfirmPlay";
import handLeft from "../../assets/images/hand-left.png";
import handRight from "../../assets/images/hand-right.png";
import "./PlayerHand.css";

// Reference 8-card asymmetric left-hand fan layout (matching the hand illustration)
const REF_TRANSFORMS_8 = [
    { x: 0,  y: 3,  rotate: -18 },
    { x: 8,  y: 0,  rotate: -13 },
    { x: 16, y: -2, rotate: -9 },
    { x: 24, y: -4, rotate: -5 },
    { x: 32, y: -5, rotate: -1 },
    { x: 40, y: -3, rotate: 5 },
    { x: 48, y: 2,  rotate: 12 },
    { x: 56, y: 10, rotate: 25 }
];

// Dynamically interpolates card positioning for any number of cards
function getCardTransform(index, total) {
    if (total <= 1) {
        return { x: 28, y: -4, rotate: -3 };
    }
    const t = index / (total - 1);
    const refIndex = t * (REF_TRANSFORMS_8.length - 1);
    const i0 = Math.floor(refIndex);
    const i1 = Math.min(i0 + 1, REF_TRANSFORMS_8.length - 1);
    const frac = refIndex - i0;

    const x = REF_TRANSFORMS_8[i0].x + frac * (REF_TRANSFORMS_8[i1].x - REF_TRANSFORMS_8[i0].x);
    const y = REF_TRANSFORMS_8[i0].y + frac * (REF_TRANSFORMS_8[i1].y - REF_TRANSFORMS_8[i0].y);
    const rotate = REF_TRANSFORMS_8[i0].rotate + frac * (REF_TRANSFORMS_8[i1].rotate - REF_TRANSFORMS_8[i0].rotate);

    return {
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        rotate: Number(rotate.toFixed(2))
    };
}

export default function PlayerHand({ cards, onConfirmPlay }) {
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
                <div className="player-hand__fan">
                    {fanCards.map((card, i) => {
                        const { x, y, rotate } = getCardTransform(i, fanCards.length);
                        return (
                            <PlayingCard
                                key={card.id}
                                rank={card.rank}
                                suit={card.suit}
                                className="player-hand__card"
                                style={{
                                    "--card-x": `${x}%`,
                                    "--card-y": `${y}%`,
                                    "--card-rotate": `${rotate}deg`,
                                    zIndex: i + 1
                                }}
                                onClick={() => selectCard(card.id)}
                                onContextMenu={(e) => handleContextMenu(e, card.id)}
                            />
                        );
                    })}
                </div>

                {/* Fingers/palm sit above the fan (higher z-index) so cards peek
            out above the grip line, matching a real hand-of-cards photo. */}
                <img
                    src={handLeft}
                    alt=""
                    aria-hidden="true"
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