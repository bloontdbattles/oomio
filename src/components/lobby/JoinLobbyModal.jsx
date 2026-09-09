import { useContext, useState } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import Modal from "../common/Modal";
import Button from "../common/Button";
import "./JoinLobbyModal.css";

export default function JoinLobbyModal({ isOpen, onClose, onJoin }) {
    const { t } = useContext(LanguageContext);
    const [code, setCode] = useState("");

    const handleJoin = () => {
        const trimmed = code.trim().toUpperCase();
        if (!trimmed) return;
        onJoin(trimmed);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="join-lobby__title">{t("enterLobbyCode")}</h2>
            <input
                type="text"
                className="join-lobby__input"
                placeholder={t("lobbyCodePlaceholder")}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                maxLength={6}
                autoFocus
            />
            <Button className="join-lobby__confirm" onClick={handleJoin} disabled={!code.trim()}>
                {t("joinGame")}
            </Button>
        </Modal>
    );
}