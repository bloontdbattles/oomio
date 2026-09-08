import { useContext, useState } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import Modal from "../common/Modal";
import Toggle from "../common/Toggle";
import Button from "../common/Button";
import "./LobbySettingsModal.css";

const TIMER_OPTIONS = [10, 15, 20, 30];

export default function LobbySettingsModal({ isOpen, onClose, onConfirm }) {
    const { t } = useContext(LanguageContext);
    const [timerEnabled, setTimerEnabled] = useState(true);
    const [timerSeconds, setTimerSeconds] = useState(15);

    const handleConfirm = () => {
        onConfirm({
            timerEnabled,
            timerSeconds: timerEnabled ? timerSeconds : null,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="lobby-settings__title">{t("lobbySettings")}</h2>

            <Toggle checked={timerEnabled} onChange={setTimerEnabled} label={t("turnTimer")} />
            <p className="lobby-settings__hint">{t("turnTimerHint")}</p>

            {timerEnabled && (
                <div className="lobby-settings__options">
                    {TIMER_OPTIONS.map((seconds) => (
                        <button
                            key={seconds}
                            type="button"
                            className={`lobby-settings__option ${timerSeconds === seconds ? "is-selected" : ""
                                }`}
                            onClick={() => setTimerSeconds(seconds)}
                        >
                            {seconds}s
                        </button>
                    ))}
                </div>
            )}

            <Button className="lobby-settings__confirm" onClick={handleConfirm}>
                {t("createLobby")}
            </Button>
        </Modal>
    );
}