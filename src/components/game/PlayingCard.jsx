import "./PlayingCard.css";

const RED_SUITS = ["hearts", "diamonds"];

// Simple geometric approximations of the four suit glyphs, drawn as SVG
// paths so they render identically across every browser/OS (unlike the
// Unicode ♠♥♦♣ characters, which vary a lot by system font).
const SUIT_PATHS = {
    hearts:
        "M12 21s-7.5-4.35-10-9.5C.5 7 3 3 7 3c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4 5 8.5-2.5 5.15-10 9.5-10 9.5z",
    diamonds: "M12 2 22 12 12 22 2 12Z",
    clubs:
        "M12 2a3.5 3.5 0 0 0-3.2 4.9A3.5 3.5 0 1 0 9.8 13H10l-1.6 6h7.2L14 13h.2a3.5 3.5 0 1 0 1-6.1A3.5 3.5 0 0 0 12 2Z",
    spades:
        "M12 2s7.5 5.6 9.6 10C23 15.7 21 19 17.8 19c-1.5 0-2.7-.7-3.5-1.6.2 1.6 1 3 2.7 3.6H9c1.7-.6 2.5-2 2.7-3.6-.8.9-2 1.6-3.5 1.6C5 19 3 15.7 2.4 12 4.5 7.6 12 2 12 2Z",
};

function SuitGlyph({ suit, className = "" }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={`playing-card__suit-icon ${className}`.trim()}
            aria-hidden="true"
        >
            <path d={SUIT_PATHS[suit]} fill="currentColor" />
        </svg>
    );
}

export default function PlayingCard({
    rank,
    suit,
    className = "",
    style,
    ...props
}) {
    const isRed = RED_SUITS.includes(suit);

    return (
        <div
            className={`playing-card ${isRed ? "is-red" : "is-black"} ${className}`.trim()}
            style={style}
            {...props}
        >
            <div className="playing-card__corner playing-card__corner--top">
                <span className="playing-card__rank">{rank}</span>
                <SuitGlyph suit={suit} />
            </div>

            <SuitGlyph suit={suit} className="playing-card__center" />

            <div className="playing-card__corner playing-card__corner--bottom">
                <span className="playing-card__rank">{rank}</span>
                <SuitGlyph suit={suit} />
            </div>
        </div>
    );
}