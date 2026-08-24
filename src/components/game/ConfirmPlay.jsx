import { useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import "./ConfirmPlay.css";

export default function ConfirmPlay({ onConfirm, onCancel }) {
    const { t } = useContext(LanguageContext);

    return (
        <div className="confirm-play">
            <button
                type="button"
                className="confirm-play__btn confirm-play__btn--cancel"
                onClick={onCancel}
                aria-label={t("cancelSelection")}
            >
                ✕
            </button>
            <button
                type="button"
                className="confirm-play__btn confirm-play__btn--confirm"
                onClick={onConfirm}
            >
                {t("confirmPlay")}
            </button>
        </div>
    );
}