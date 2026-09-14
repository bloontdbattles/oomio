import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { getPlayer } from "../utils/localStorage";
import { subscribeToGame, selectTrump, playCard, startNextRound } from "../firebase/gameService";
import { runBotTurn } from "../firebase/botRunner";
import GameTable from "../components/game/GameTable";
import TrumpPicker from "../components/game/TrumpPicker";
import Button from "../components/common/Button";
import player1 from "../assets/images/player1.png";
import player2 from "../assets/images/player2.png";
import player3 from "../assets/images/player3.png";
import "./Game.css";

// Seat 0 is always "me" once rotated - offset 1/2/3 map to left/top/right
// so partners (offset 2, seat+2 mod 4) naturally land opposite me.
const POSITIONS = ["bottom", "left", "top", "right"];
const OPPONENT_AVATARS = [player1, player2, player3];

function seatToPosition(mySeat, seat) {
  return POSITIONS[(seat - mySeat + 4) % 4];
}

export default function Game() {
  const { t } = useContext(LanguageContext);
  const location = useLocation();
  const { code } = location.state || {};
  const currentPlayer = getPlayer();
  const myId = currentPlayer?.playerId || "you";

  const [game, setGame] = useState(null);

  useEffect(() => {
    if (!code) return;
    const unsubscribe = subscribeToGame(code, setGame);
    return unsubscribe;
  }, [code]);

  // ── Bot runner: fire AI moves when a bot seat's turn arrives ──────────
  useEffect(() => {
    if (!code || !game) return;
    const cancel = runBotTurn(code, game);
    return cancel;
  }, [code, game]);

  // No room code = direct "Play with AI" navigation - keep showing the
  // local AI table until real bot logic exists.
  if (!code) {
    return <GameTable />;
  }

  if (!game) return null; // waiting for the first snapshot

  const mySeatEntry = Object.entries(game.seats || {}).find(
    ([, player]) => player?.id === myId
  );
  if (!mySeatEntry) return null; // shouldn't happen once the round is dealt

  const mySeat = Number(mySeatEntry[0]);

  const players = Object.entries(game.seats || {}).map(([seatStr, player]) => {
    const seat = Number(seatStr);
    const position = seatToPosition(mySeat, seat);
    const opponentIndex = ["left", "top", "right"].indexOf(position);
    return {
      id: player?.id || `seat-${seat}`,
      name: player?.name || "",
      isAI: !!player?.isBot,
      seat: position,
      avatar: position === "bottom" ? undefined : OPPONENT_AVATARS[opponentIndex],
      score: game.scores?.[player?.team] || 0,
    };
  });

  const myHand = (game.hands?.[mySeat] || []).map((card) => ({
    id: `${card.rank}-${card.suit}`,
    rank: card.rank,
    suit: card.suit,
  }));

  const plays = (game.trick || []).map((play) => ({
    seat: seatToPosition(mySeat, play.seat),
    card: play.card,
  }));

  const activeSeatPosition =
    game.status === "selecting-trump"
      ? seatToPosition(mySeat, game.trumpPickerSeat)
      : seatToPosition(mySeat, game.currentTurnSeat);

  const handleConfirmPlay = (card) => {
    playCard(code, mySeat, { rank: card.rank, suit: card.suit });
  };

  const handleSelectTrump = (suit) => {
    selectTrump(code, mySeat, suit);
  };

  const handleNextRound = () => {
    startNextRound(code);
  };

  const roundOverMessage =
    game.roundWinner === "draw"
      ? t("roundDraw")
      : game.roundWinner === "red"
      ? t("redWins")
      : t("blueWins");

  return (
    <>
      <GameTable
        players={players}
        hand={myHand}
        plays={plays}
        trumpSuit={game.trumpSuit || "hearts"}
        activeSeat={activeSeatPosition}
        onConfirmPlay={handleConfirmPlay}
        isMultiplayer={true}
      />

      {game.status === "selecting-trump" && (
        <TrumpPicker
          isMyTurn={game.trumpPickerSeat === mySeat}
          onSelect={handleSelectTrump}
        />
      )}

      {game.status === "round-over" && (
        <div className="round-over">
          <div className="round-over__panel">
            <h2 className="round-over__title">{t("roundOver")}</h2>
            <p className="round-over__message">{roundOverMessage}</p>
            <Button onClick={handleNextRound}>{t("nextRound")}</Button>
          </div>
        </div>
      )}
    </>
  );
}
