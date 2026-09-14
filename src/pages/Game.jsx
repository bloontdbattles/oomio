import { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { getPlayer } from "../utils/localStorage";
import { subscribeToGame, selectTrump, playCard, startNextRound } from "../firebase/gameService";
import { runBotTurn } from "../firebase/botRunner";
import { trackPresence, subscribeToPresence } from "../firebase/presenceService";
import GameTable from "../components/game/GameTable";
import TrumpPicker from "../components/game/TrumpPicker";
import Button from "../components/common/Button";
import player1 from "../assets/images/player1.png";
import player2 from "../assets/images/player2.png";
import player3 from "../assets/images/player3.png";
import dc1 from "../assets/images/dc1.png";
import dc2 from "../assets/images/dc2.png";
import dc3 from "../assets/images/dc3.png";
import "./Game.css";

// Seat 0 is always "me" once rotated - offset 1/2/3 map to left/top/right
// so partners (offset 2, seat+2 mod 4) naturally land opposite me.
const POSITIONS = ["bottom", "left", "top", "right"];
const OPPONENT_AVATARS = [player1, player2, player3];
const DISCONNECTED_AVATARS = [dc1, dc2, dc3];

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
  const [presence, setPresence] = useState(null);

  // ── Trick display: hold last completed trick visible for 5s ───────────
  // When Firebase clears trick[] after the 4th card, we freeze the display
  // so all 4 players can see the last card before the table clears.
  const TRICK_HOLD_MS = 5000;
  const completedLenRef = useRef(0);
  const [shownPlays, setShownPlays] = useState([]);
  // mySeat ref: kept up-to-date each render so the trick-hold effect never
  // has a stale seat value without needing to be a dependency.
  const mySeatRef = useRef(-1);

  useEffect(() => {
    if (!code) return;
    const unsubscribe = subscribeToGame(code, setGame);
    return unsubscribe;
  }, [code]);

  // ── Track own presence & subscribe to room presence map ──────────────
  useEffect(() => {
    if (!code || !myId) return;
    const unsubTrack = trackPresence(code, myId);
    const unsubSub = subscribeToPresence(code, setPresence);
    return () => {
      unsubTrack();
      unsubSub();
    };
  }, [code, myId]);

  // ── Bot runner: fire AI moves when a bot or disconnected seat's turn arrives ──────────
  useEffect(() => {
    if (!code || !game) return;
    const cancel = runBotTurn(code, game, presence);
    return cancel;
  }, [code, game, presence]);

  // ── Mirror live trick / hold completed trick for 5s ───────────────────
  useEffect(() => {
    if (!game) return;

    const newLen = (game.trickHistory || []).length;

    // New round started or trump-selection reset — clear state
    if (game.status === "selecting-trump") {
      completedLenRef.current = 0;
      setShownPlays([]);
      return;
    }

    // A trick just completed (trickHistory grew) — freeze those 4 cards
    if (newLen > completedLenRef.current) {
      const lastTrick = game.trickHistory[newLen - 1];
      const frozenPlays = (lastTrick?.plays || []).map((play) => ({
        seat: seatToPosition(mySeatRef.current, play.seat),
        card: play.card,
      }));
      setShownPlays(frozenPlays);

      const timer = setTimeout(() => {
        completedLenRef.current = newLen;
        setShownPlays([]);
      }, TRICK_HOLD_MS);
      return () => clearTimeout(timer);
    }

    // No new completed trick — mirror the live in-progress trick
    if (completedLenRef.current === newLen) {
      const livePlays = (game.trick || []).map((play) => ({
        seat: seatToPosition(mySeatRef.current, play.seat),
        card: play.card,
      }));
      setShownPlays(livePlays);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.trickHistory, game?.trick, game?.status]);

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
  // Update the ref every render so trick-hold effect always has the latest seat.
  mySeatRef.current = mySeat;

  const players = Object.entries(game.seats || {}).map(([seatStr, player]) => {
    const seat = Number(seatStr);
    const position = seatToPosition(mySeat, seat);
    const opponentIndex = ["left", "top", "right"].indexOf(position);

    const isBot = !!player?.isBot;
    const isDisconnected = !isBot && player?.id && presence !== null && !presence[player.id];

    const normalAvatar = opponentIndex !== -1 ? OPPONENT_AVATARS[opponentIndex] : undefined;
    const dcAvatar = opponentIndex !== -1 ? DISCONNECTED_AVATARS[opponentIndex] : undefined;
    const avatar = position === "bottom" ? undefined : (isDisconnected ? dcAvatar : normalAvatar);

    return {
      id: player?.id || `seat-${seat}`,
      name: player?.name || "",
      isAI: isBot || isDisconnected,
      seat: position,
      avatar,
      isDisconnected,
      score: game.scores?.[player?.team] || 0,
    };
  });

  const myHand = (game.hands?.[mySeat] || []).map((card) => ({
    id: `${card.rank}-${card.suit}`,
    rank: card.rank,
    suit: card.suit,
  }));

  // shownPlays is managed by the trick-hold useEffect above;
  // no need to recompute plays inline here.

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
        plays={shownPlays}
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
