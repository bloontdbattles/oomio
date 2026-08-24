import PlayingCard from "./PlayingCard";
import "./PlayedCards.css";

export default function PlayedCards({ cards = {} }) {
    // cards: { bottom?: card, top?: card, left?: card, right?: card }
    return (
        <div className="played-cards">
            {Object.entries(cards).map(([position, card]) => {
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
