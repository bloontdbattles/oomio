import jackImg from "../../assets/images/card_jack.png";
import queenImg from "../../assets/images/card_queen.png";
import kingImg from "../../assets/images/card_king.png";
import clubIcon from "../../assets/images/card_club.png";
import diamondIcon from "../../assets/images/card_diamond.png";
import heartIcon from "../../assets/images/card_heart.png";
import spadeIcon from "../../assets/images/card_spade.png";
import "./PlayingCard.css";

const RED_SUITS = ["hearts", "diamonds"];

// Map rank → face card image (null = number card, use suit icon instead)
const FACE_CARD_IMAGES = {
    J: jackImg,
    Q: queenImg,
    K: kingImg,
};

// Map suit → PNG icon image
const SUIT_ICONS = {
    clubs: clubIcon,
    diamonds: diamondIcon,
    hearts: heartIcon,
    spades: spadeIcon,
};

function SuitIcon({ suit, className = "" }) {
    const iconSrc = SUIT_ICONS[suit];
    if (!iconSrc) return null;
    return (
        <img
            src={iconSrc}
            alt={suit}
            className={`playing-card__suit-icon ${className}`.trim()}
            draggable="false"
        />
    );
}

function renderPips(rank, suit) {
    if (rank === "7") {
        return (
            <div className="playing-card__pips playing-card__pips--7">
                <SuitIcon suit={suit} className="pip l r1" />
                <SuitIcon suit={suit} className="pip l r3" />
                <SuitIcon suit={suit} className="pip l r5 rot" />
                <SuitIcon suit={suit} className="pip m r2" />
                <SuitIcon suit={suit} className="pip r r1" />
                <SuitIcon suit={suit} className="pip r r3" />
                <SuitIcon suit={suit} className="pip r r5 rot" />
            </div>
        );
    }
    if (rank === "8") {
        return (
            <div className="playing-card__pips playing-card__pips--8">
                <SuitIcon suit={suit} className="pip l r1" />
                <SuitIcon suit={suit} className="pip l r3" />
                <SuitIcon suit={suit} className="pip l r5 rot" />
                <SuitIcon suit={suit} className="pip m r2" />
                <SuitIcon suit={suit} className="pip m r4 rot" />
                <SuitIcon suit={suit} className="pip r r1" />
                <SuitIcon suit={suit} className="pip r r3" />
                <SuitIcon suit={suit} className="pip r r5 rot" />
            </div>
        );
    }
    if (rank === "9") {
        return (
            <div className="playing-card__pips playing-card__pips--9">
                <SuitIcon suit={suit} className="pip l r1" />
                <SuitIcon suit={suit} className="pip l r3" />
                <SuitIcon suit={suit} className="pip l r5 rot" />
                <SuitIcon suit={suit} className="pip l r7 rot" />
                <SuitIcon suit={suit} className="pip m r4" />
                <SuitIcon suit={suit} className="pip r r1" />
                <SuitIcon suit={suit} className="pip r r3" />
                <SuitIcon suit={suit} className="pip r r5 rot" />
                <SuitIcon suit={suit} className="pip r r7 rot" />
            </div>
        );
    }
    if (rank === "10") {
        return (
            <div className="playing-card__pips playing-card__pips--10">
                <SuitIcon suit={suit} className="pip l r1" />
                <SuitIcon suit={suit} className="pip l r3" />
                <SuitIcon suit={suit} className="pip l r5 rot" />
                <SuitIcon suit={suit} className="pip l r7 rot" />
                <SuitIcon suit={suit} className="pip m r2" />
                <SuitIcon suit={suit} className="pip m r6 rot" />
                <SuitIcon suit={suit} className="pip r r1" />
                <SuitIcon suit={suit} className="pip r r3" />
                <SuitIcon suit={suit} className="pip r r5 rot" />
                <SuitIcon suit={suit} className="pip r r7 rot" />
            </div>
        );
    }
    // Default (e.g. "A"): single center icon
    return <SuitIcon suit={suit} className="playing-card__center" />;
}

export default function PlayingCard({
    rank,
    suit,
    className = "",
    style,
    ...props
}) {
    const isRed = RED_SUITS.includes(suit);
    const faceImg = FACE_CARD_IMAGES[rank] || null;

    return (
        <div
            className={`playing-card ${isRed ? "is-red" : "is-black"} ${className}`.trim()}
            style={style}
            {...props}
        >
            {/* Top-left corner: rank + suit */}
            <div className="playing-card__corner playing-card__corner--top">
                <span className="playing-card__rank">{rank}</span>
                <SuitIcon suit={suit} />
            </div>

            {/* Center: face card image OR plain suit icon / pips */}
            {faceImg ? (
                <img
                    src={faceImg}
                    alt={`${rank} of ${suit}`}
                    className="playing-card__face-art"
                    draggable="false"
                />
            ) : (
                renderPips(rank, suit)
            )}

            {/* Bottom-right corner: rank + suit (rotated) */}
            <div className="playing-card__corner playing-card__corner--bottom">
                <span className="playing-card__rank">{rank}</span>
                <SuitIcon suit={suit} />
            </div>
        </div>
    );
}
