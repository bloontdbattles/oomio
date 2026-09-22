import { useState, useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import Button from "../common/Button";
import "./DisconnectModal.css";

export default function DisconnectModal({
    isOpen,
    playerName,
    roomCode,
    onWait,
    onReplaceWithBot,
}) {
    const { t } = useContext(LanguageContext);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopyCode = () => {
        if (!roomCode) return;
        navigator.clipboard?.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className="dc-modal-overlay">
            <div className="dc-modal">
                <div className="dc-modal__header">
                    <div className="dc-modal__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18.36 5.64a9 9 0 0 1 0 12.72" />
                            <path d="M5.64 18.36a9 9 0 0 1 0-12.72" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                    </div>
                    <h3 className="dc-modal__title">{t("playerDisconnected")}</h3>
                </div>

                <p className="dc-modal__text">
                    <strong>{playerName || "A player"}</strong> {t("lostConnection")}
                </p>

                <div className="dc-modal__code-box">
                    <span className="dc-modal__code-label">{t("roomCode")}:</span>
                    <strong className="dc-modal__code-value">{roomCode}</strong>
                    <button
                        type="button"
                        className="dc-modal__copy-btn"
                        onClick={handleCopyCode}
                    >
                        {copied ? t("copied") : t("copyCode")}
                    </button>
                </div>

                <div className="dc-modal__actions">
                    <Button
                        variant="secondary"
                        className="dc-modal__btn dc-modal__btn--wait"
                        onClick={onWait}
                    >
                        {t("waitForReconnect")}
                    </Button>
                    <Button
                        variant="primary"
                        className="dc-modal__btn dc-modal__btn--bot"
                        onClick={onReplaceWithBot}
                    >
                        {t("replaceWithBot")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
