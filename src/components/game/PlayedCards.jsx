import PlayingCard from "./PlayingCard";
import "./PlayedCards.css";

export default function PlayedCards({ cards = {}, plays, winnerPosition, isCollecting }) {
    // cards: { bottom?: card, top?: card, left?: card, right?: card }
    // plays: [{ seat: "bottom"|"left"|"top"|"right", card: { rank, suit } }]
    const activeCards = plays
        ? plays.reduce((acc, p) => ({ ...acc, [p.seat]: p.card }), {})
        : cards;

    const collectingClass = isCollecting && winnerPosition ? `is-collecting is-collecting--to-${winnerPosition}` : "";

    return (
        <div className={`played-cards ${collectingClass}`}>
            {Object.entries(activeCards).map(([position, card]) => {
                if (!card) return null;
                return (
                    <div
                        key={position}
                        className={`played-cards__slot played-cards__slot--${position}`}
                    >
                        <PlayingCard rank={card.rank} suit={card.suit} />
                    </div>
                );
            })}
        </div>
    );
}
