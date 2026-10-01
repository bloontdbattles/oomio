import "./ScoreBoard.css";

export default function ScoreBoard({
    team1Tricks = 0,
    team2Tricks = 0,
    team1Score = 0,
    team2Score = 0,
    targetPoints = 11,
    players,
}) {
    const t1Points = players ? (players.find((p) => p.seat === "bottom")?.score ?? 0) : team1Score;
    const t2Points = players ? (players.find((p) => p.seat === "left")?.score ?? 0) : team2Score;

    const maxPoints = targetPoints;

    return (
        <div className="scoreboard">
            <div className="scoreboard__header">Scoreboard</div>
            <div className="scoreboard__teams">

                {/* US team */}
                <div className="scoreboard__team scoreboard__team--us">
                    <span className="scoreboard__team-name">Us</span>
                    <div className="scoreboard__stats">
                        <div className="scoreboard__stat">
                            <span className="scoreboard__stat-label">Tricks</span>
                            <span className="scoreboard__stat-val">{team1Tricks}</span>
                        </div>
                        <div className="scoreboard__stat">
                            <span className="scoreboard__stat-label">Points</span>
                            <span className="scoreboard__stat-val scoreboard__stat-val--points">
                                {t1Points}
                                <span className="scoreboard__target">/{maxPoints}</span>
                            </span>
                        </div>
                    </div>
                    {/* Match point progress bar */}
                    <div className="scoreboard__progress-bar">
                        <div
                            className="scoreboard__progress-fill scoreboard__progress-fill--us"
                            style={{ width: `${Math.min((t1Points / maxPoints) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                <div className="scoreboard__divider" />

                {/* THEM team */}
                <div className="scoreboard__team scoreboard__team--them">
                    <span className="scoreboard__team-name">Them</span>
                    <div className="scoreboard__stats">
                        <div className="scoreboard__stat">
                            <span className="scoreboard__stat-label">Tricks</span>
                            <span className="scoreboard__stat-val">{team2Tricks}</span>
                        </div>
                        <div className="scoreboard__stat">
                            <span className="scoreboard__stat-label">Points</span>
                            <span className="scoreboard__stat-val scoreboard__stat-val--points">
                                {t2Points}
                                <span className="scoreboard__target">/{maxPoints}</span>
                            </span>
                        </div>
                    </div>
                    {/* Match point progress bar */}
                    <div className="scoreboard__progress-bar">
                        <div
                            className="scoreboard__progress-fill scoreboard__progress-fill--them"
                            style={{ width: `${Math.min((t2Points / maxPoints) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
