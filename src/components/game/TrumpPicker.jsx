import { useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import { SuitGlyph } from "./PlayingCard";
import "./TrumpPicker.css";

const SUITS = ["hearts", "diamonds", "clubs", "spades"];

export default function TrumpPicker({ isMyTurn, onSelect }) {
    const { t } = useContext(LanguageContext);

    return (
        <div className="trump-picker">
            <div className="trump-picker__panel">
                <h2 className="trump-picker__title">
                    {isMyTurn ? t("pickTrump") : t("waitingForTrump")}
                </h2>

                {isMyTurn && (
                    <div className="trump-picker__options">
                        {SUITS.map((suit) => (
                            <button
                                key={suit}
                                type="button"
                                className={`trump-picker__option trump-picker__option--${suit === "hearts" || suit === "diamonds" ? "red" : "black"
                                    }`}
                                onClick={() => onSelect(suit)}
                            >
                                <SuitGlyph suit={suit} className="trump-picker__icon" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}