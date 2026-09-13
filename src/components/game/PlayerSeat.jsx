import Avatar from "../common/Avatar";
import TurnIndicator from "./TurnIndicator";
import "./PlayerSeat.css";

export default function PlayerSeat({ name, isAI, isActive, position, avatarImg }) {
    return (
        <div
            className={`player-seat player-seat--${position} ${isActive ? "is-active" : ""} ${isAI ? "player-seat--ai" : ""}`}
        >
            <div className="player-seat__avatar-wrap">
                {avatarImg ? (
                    <>
                        <img src={avatarImg} alt={name} className="player-seat__character-image" />
                        <TurnIndicator show={isActive} />
                    </>
                ) : (
                    <>
                        <Avatar name={name} size={52} />
                        <TurnIndicator show={isActive} />
                    </>
                )}
            </div>
            <div className="player-seat__info">
                <span className="player-seat__name">{name}</span>
                {isAI && <span className="player-seat__badge">AI</span>}
            </div>
        </div>
    );
}