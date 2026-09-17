import { useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import "./TrumpDisplay.css";

const SUIT_GLYPHS = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠"
};

export default function TrumpDisplay({ suit, isRevealed = true }) {
    const { t } = useContext(LanguageContext);

    if (!suit) return null;

    const isRed = ["hearts", "diamonds"].includes(suit);

    return (
        <div className={`trump-display ${isRed ? "is-red" : "is-black"}`}>
            <span className="trump-display__label">{t("trump")}</span>
            <div className="trump-display__value">
                {isRevealed ? (
                    <span className="trump-display__icon">{SUIT_GLYPHS[suit] || suit}</span>
                ) : (
                    <span className="trump-display__hidden">?</span>
                )}
            </div>
        </div>
    );
}
