import Avatar from "../common/Avatar";
import TurnIndicator from "./TurnIndicator";
import "./PlayerSeat.css";

export default function PlayerSeat({ name, isAI, isActive, position }) {
    return (
        <div
            className={`player-seat player-seat--${position} ${isActive ? "is-active" : ""
                }`}
        >
            <div className="player-seat__avatar-wrap">
                <Avatar name={name} size={52} />
                <TurnIndicator show={isActive} />
            </div>
            <span className="player-seat__name">{name}</span>
            {isAI && <span className="player-seat__badge">AI</span>}
        </div>
    );
}