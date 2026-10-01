import Button from "../common/Button";
import "./GameResult.css";

export default function GameResult({
    isGameOver = false,
    playerWon,
    roundResult,  // "WIN" | "DRAW"
    team1Tricks = 0,
    team2Tricks = 0,
    team1Points = 0,
    team2Points = 0,
    targetPoints = 11,
    onPlayAgain,
}) {
    const isDraw = roundResult === "DRAW";

    // ── Labels ────────────────────────────────────────────────────────────────
    let title, subtitle, ctaLabel;

    if (isGameOver) {
        title = playerWon ? "🏆 Match Won!" : "💀 Match Lost";
        subtitle = playerWon
            ? `Your team reached ${targetPoints} points first — you are the champions!`
            : `Opponents reached ${targetPoints} points first — better luck next time!`;
        ctaLabel = "Play New Match";
    } else if (isDraw) {
        title = "🤝 Round Draw!";
        subtitle = `Both teams won ${team1Tricks} tricks — each team earns 1 point.`;
        ctaLabel = "Next Round";
    } else {
        title = playerWon ? "✅ Round Won!" : "❌ Round Lost";
        subtitle = playerWon
            ? `Your team took ${team1Tricks} tricks and earns 1 point.`
            : `Opponents took ${team2Tricks} tricks and earn 1 point.`;
        ctaLabel = "Next Round";
    }

    return (
        <div className="game-result">
            <div className={`game-result__panel ${isGameOver ? "game-result__panel--final" : ""}`}>
                <h2 className="game-result__title">{title}</h2>
                <p className="game-result__subtitle">{subtitle}</p>

                {/* This round's trick counts */}
                <div className="game-result__section-label">This Round</div>
                <div className="game-result__scores">
                    <div className="game-result__score-row">
                        <span className="game-result__team">Your Team</span>
                        <span className="game-result__score-val">{team1Tricks} tricks</span>
                    </div>
                    <div className="game-result__score-row">
                        <span className="game-result__team">Opponents</span>
                        <span className="game-result__score-val">{team2Tricks} tricks</span>
                    </div>
                </div>

                {/* Cumulative match points */}
                <div className="game-result__section-label">Match Points</div>
                <div className="game-result__scores">
                    <div className="game-result__score-row">
                        <span className="game-result__team">Your Team</span>
                        <span className={`game-result__score-val ${team1Points >= targetPoints ? "game-result__score-val--winner" : ""}`}>
                            {team1Points} / {targetPoints}
                        </span>
                    </div>
                    <div className="game-result__score-row">
                        <span className="game-result__team">Opponents</span>
                        <span className={`game-result__score-val ${team2Points >= targetPoints ? "game-result__score-val--winner" : ""}`}>
                            {team2Points} / {targetPoints}
                        </span>
                    </div>
                </div>

                {/* Progress bars */}
                <div className="game-result__progress-wrap">
                    <div className="game-result__progress-row">
                        <span className="game-result__progress-label">Us</span>
                        <div className="game-result__progress-bar">
                            <div
                                className="game-result__progress-fill game-result__progress-fill--us"
                                style={{ width: `${Math.min((team1Points / targetPoints) * 100, 100)}%` }}
                            />
                        </div>
                        <span className="game-result__progress-val">{team1Points}</span>
                    </div>
                    <div className="game-result__progress-row">
                        <span className="game-result__progress-label">Them</span>
                        <div className="game-result__progress-bar">
                            <div
                                className="game-result__progress-fill game-result__progress-fill--them"
                                style={{ width: `${Math.min((team2Points / targetPoints) * 100, 100)}%` }}
                            />
                        </div>
                        <span className="game-result__progress-val">{team2Points}</span>
                    </div>
                </div>

                <Button className="game-result__cta" onClick={onPlayAgain}>
                    {ctaLabel}
                </Button>
            </div>
        </div>
    );
}
