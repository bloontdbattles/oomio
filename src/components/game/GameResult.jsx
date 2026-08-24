import Button from "../common/Button";
import "./GameResult.css";

export default function GameResult({ playerWon, team1Score, team2Score, onPlayAgain }) {
    return (
        <div className="game-result">
            <div className="game-result__panel">
                <h2 className="game-result__title">
                    {playerWon ? "Victory!" : "Defeat"}
                </h2>
                <p className="game-result__subtitle">
                    {playerWon
                        ? "Congratulations! Your team won the round."
                        : "Better luck next time! The opponents won the round."}
                </p>

                <div className="game-result__scores">
                    <div className="game-result__score-row">
                        <span className="game-result__team">Your Team</span>
                        <span className="game-result__score-val">{team1Score}</span>
                    </div>
                    <div className="game-result__score-row">
                        <span className="game-result__team">Opponents</span>
                        <span className="game-result__score-val">{team2Score}</span>
                    </div>
                </div>

                <Button className="game-result__cta" onClick={onPlayAgain}>
                    Play Again
                </Button>
            </div>
        </div>
    );
}
