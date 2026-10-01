import cardBlueImg from "../../assets/images/cardblue.png";
import cardRedImg from "../../assets/images/cardred.png";
import "./ScoreBoard.css";

export default function ScoreBoard({
    team1Score = 0,
    team2Score = 0,
    players,
}) {
    const t1Points = players ? (players.find((p) => p.seat === "bottom")?.score ?? 0) : team1Score;
    const t2Points = players ? (players.find((p) => p.seat === "left")?.score ?? 0) : team2Score;

    return (
        <div className="scoreboard">
            <div className="scoreboard__header">Score</div>
            <div className="scoreboard__teams">

                {/* US team — blue card */}
                <div className="scoreboard__team scoreboard__team--us">
                    <span className="scoreboard__team-name">Us</span>
                    <div className="scoreboard__points-row">
                        <img
                            src={cardBlueImg}
                            alt="blue card"
                            className="scoreboard__card-icon"
                        />
                        <span className="scoreboard__points-val">{t1Points}</span>
                    </div>
                </div>

                <div className="scoreboard__divider" />

                {/* THEM team — red card */}
                <div className="scoreboard__team scoreboard__team--them">
                    <span className="scoreboard__team-name">Them</span>
                    <div className="scoreboard__points-row">
                        <img
                            src={cardRedImg}
                            alt="red card"
                            className="scoreboard__card-icon"
                        />
                        <span className="scoreboard__points-val">{t2Points}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
