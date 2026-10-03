import { useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import Avatar from "../common/Avatar";
import "./PlayerSlot.css";

export default function PlayerSlot({
    player,
    isHost,
    canAddBot,
    canSelfJoin,
    onAddBot,
    onJoinSlot,
    onKick,
    onMoveTeam,
}) {
    const { t } = useContext(LanguageContext);

    if (!player) {
        return (
            <div className="player-slot player-slot--empty">
                <span className="player-slot__placeholder">{t("emptySlot")}</span>
                {isHost && canAddBot && (
                    <button type="button" className="player-slot__add-bot" onClick={onAddBot}>
                        + {t("addBots")}
                    </button>
                )}
                {canSelfJoin && (
                    <button type="button" className="player-slot__join" onClick={onJoinSlot}>
                        {t("joinHere")}
                    </button>
                )}
            </div>
        );
    }

    return (
        <div
            className={`player-slot ${player.isBot ? "player-slot--bot" : ""} ${player.isHost ? "player-slot--host" : ""
                }`}
        >
            <Avatar name={player.name} size={40} />
            <div className="player-slot__info">
                <span className="player-slot__name">{player.name}</span>
                {player.isHost && <span className="player-slot__tag">{t("host")}</span>}
                {player.isBot && <span className="player-slot__tag">{t("bot")}</span>}
            </div>

            {isHost && !player.isHost && (
                <div className="player-slot__actions">
                    <button
                        type="button"
                        className="player-slot__action"
                        onClick={onMoveTeam}
                        aria-label={t("moveTeam")}
                        title={t("moveTeam")}
                    >
                        ⇄
                    </button>
                    <button
                        type="button"
                        className="player-slot__action player-slot__action--danger"
                        onClick={onKick}
                        aria-label={t("kick")}
                        title={t("kick")}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}