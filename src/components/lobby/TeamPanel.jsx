import PlayerSlot from "./PlayerSlot";
import "./TeamPanel.css";

export default function TeamPanel({
    teamName,
    teamColor,
    slots,
    isHost,
    allowSelfJoin,
    onAddBot,
    onJoinSlot,
    onKick,
    onMoveTeam,
}) {
    return (
        <div className={`team-panel team-panel--${teamColor}`}>
            <h3 className="team-panel__title">{teamName}</h3>
            <div className="team-panel__slots">
                {slots.map((player, i) => (
                    <PlayerSlot
                        key={player ? player.id : `empty-${i}`}
                        player={player}
                        teamColor={teamColor}
                        isHost={isHost}
                        canAddBot={!player}
                        canSelfJoin={!player && allowSelfJoin}
                        onAddBot={() => onAddBot(i)}
                        onJoinSlot={() => onJoinSlot(i)}
                        onKick={() => player && onKick(player.id)}
                        onMoveTeam={() => player && onMoveTeam(player.id)}
                    />
                ))}
            </div>
        </div>
    );
}