import "./BidPanel.css";

const SUITS = [
    { id: "hearts", label: "Hearts", icon: "♥", isRed: true },
    { id: "diamonds", label: "Diamonds", icon: "♦", isRed: true },
    { id: "clubs", label: "Clubs", icon: "♣", isRed: false },
    { id: "spades", label: "Spades", icon: "♠", isRed: false }
];

export default function BidPanel({ onSelectTrump }) {
    return (
        <div className="bid-panel">
            <h3 className="bid-panel__title">Select Trump Suit</h3>
            <div className="bid-panel__options">
                {SUITS.map((suit) => (
                    <button
                        key={suit.id}
                        type="button"
                        className={`bid-panel__option ${suit.isRed ? "is-red" : "is-black"}`}
                        onClick={() => onSelectTrump(suit.id)}
                    >
                        <span className="bid-panel__icon">{suit.icon}</span>
                        <span className="bid-panel__label">{suit.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
