import "./TurnIndicator.css";

export default function TurnIndicator({ show }) {
    if (!show) return null;
    return (
        <div className="turn-indicator" aria-hidden="true">
            <div className="turn-indicator__ring" />
        </div>
    );
}
