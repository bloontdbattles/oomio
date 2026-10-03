import cardBlueImg from "../../assets/images/cardblue.png";
import cardRedImg from "../../assets/images/cardred.png";
import "./ScoreBoard.css";

export default function ScoreBoard({
    team1Tricks = 0,
    team2Tricks = 0,
    team1Score = 0,
    team2Score = 0,
}) {
    return (
        <div className="scoreboard">
            <div className="scoreboard__header">Score</div>
            <div className="scoreboard__teams">

                {/* US team — blue card */}
                <div className="scoreboard__team scoreboard__team--us">
                    <span className="scoreboard__team-name">Us</span>

                    {/* Points row */}
                    <div className="scoreboard__points-row">
                        <img
                            src={cardBlueImg}
                            alt="blue card"
                            className="scoreboard__card-icon"
                        />
                        <span className="scoreboard__points-val">{team1Score}</span>
                    </div>

                    {/* Tricks row */}
                    <div className="scoreboard__tricks-row">
                        <span className="scoreboard__tricks-badge">{team1Tricks}</span>
                    </div>
                </div>

                <div className="scoreboard__divider" />

                {/* THEM team — red card */}
                <div className="scoreboard__team scoreboard__team--them">
                    <span className="scoreboard__team-name">Them</span>

                    {/* Points row */}
                    <div className="scoreboard__points-row">
                        <img
                            src={cardRedImg}
                            alt="red card"
                            className="scoreboard__card-icon"
                        />
                        <span className="scoreboard__points-val">{team2Score}</span>
                    </div>

                    {/* Tricks row */}
                    <div className="scoreboard__tricks-row">
                        <span className="scoreboard__tricks-badge">{team2Tricks}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
