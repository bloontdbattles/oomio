import "./ScoreBoard.css";

export default function ScoreBoard({
    team1Tricks = 0,
    team2Tricks = 0,
    team1Score = 0,
    team2Score = 0,
    players,
}) {
    const t1Score = players ? (players.find((p) => p.seat === "bottom")?.score ?? 0) : team1Score;
    const t2Score = players ? (players.find((p) => p.seat === "left")?.score ?? 0) : team2Score;

    return (
        <div className="scoreboard">
            <div className="scoreboard__header">Scoreboard</div>
            <div className="scoreboard__teams">
                <div className="scoreboard__team scoreboard__team--us">
                    <span className="scoreboard__team-name">Us</span>
                    <div className="scoreboard__stats">
                        <div className="scoreboard__stat">
                            <span className="scoreboard__stat-label">Tricks</span>
                            <span className="scoreboard__stat-val">{team1Tricks}</span>
                        </div>
                        <div className="scoreboard__stat">
                            <span className="scoreboard__stat-label">Points</span>
                            <span className="scoreboard__stat-val">{t1Score}</span>
                        </div>
                    </div>
                </div>

                <div className="scoreboard__divider" />

                <div className="scoreboard__team scoreboard__team--them">
                    <span className="scoreboard__team-name">Them</span>
                    <div className="scoreboard__stats">
                        <div className="scoreboard__stat">
                            <span className="scoreboard__stat-label">Tricks</span>
                            <span className="scoreboard__stat-val">{team2Tricks}</span>
                        </div>
                        <div className="scoreboard__stat">
                            <span className="scoreboard__stat-label">Points</span>
                            <span className="scoreboard__stat-val">{t2Score}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
