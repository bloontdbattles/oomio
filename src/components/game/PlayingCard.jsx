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

            {/* Center: face card image OR plain suit icon */}
            {faceImg ? (
                <img
                    src={faceImg}
                    alt={`${rank} of ${suit}`}
                    className="playing-card__face-art"
                    draggable="false"
                />
            ) : (
                <SuitIcon suit={suit} className="playing-card__center" />
            )}

            {/* Bottom-right corner: rank + suit (rotated) */}
            <div className="playing-card__corner playing-card__corner--bottom">
                <span className="playing-card__rank">{rank}</span>
                <SuitIcon suit={suit} />
            </div>
        </div>
    );
}