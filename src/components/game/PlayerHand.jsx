import { useState } from "react";
import PlayingCard from "./PlayingCard";
import ConfirmPlay from "./ConfirmPlay";
import handLeft from "../../assets/images/hand-left.png";
import handRight from "../../assets/images/hand-right.png";
import "./PlayerHand.css";

// Total angular spread of the fan, in degrees. Capped so a big hand
// doesn't spin cards out to a full circle.
const MAX_SPREAD_DEG = 70;

export default function PlayerHand({ cards, onConfirmPlay }) {
    const [selectedCardId, setSelectedCardId] = useState(null);

    const selectedCard = cards.find((c) => c.id === selectedCardId) || null;
    const fanCards = cards.filter((c) => c.id !== selectedCardId);

    const spread =
        fanCards.length > 1 ? Math.min(MAX_SPREAD_DEG, 10 * (fanCards.length - 1)) : 0;
    const angleStep = fanCards.length > 1 ? spread / (fanCards.length - 1) : 0;

    const selectCard = (cardId) => setSelectedCardId(cardId);

    // Right-click on desktop, tap/click everywhere else - both call the
    // same selectCard handler, so no device detection is needed.
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
                        const angle = fanCards.length > 1 ? -spread / 2 + i * angleStep : 0;
                        return (
                            <PlayingCard
                                key={card.id}
                                rank={card.rank}
                                suit={card.suit}
                                className="player-hand__card"
                                style={{ "--angle": `${angle}deg`, zIndex: i }}
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