import { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { getPlayer } from "../utils/localStorage";
import {
  subscribeToGame,
  selectTrump,
  playCard,
  startNextRound,
  replacePlayerWithBot,
  reclaimPlayerSeat,
  migrateHost,
} from "../firebase/gameService";
import { runBotTurn } from "../firebase/botRunner";
import { trackPresence, subscribeToPresence } from "../firebase/presenceService";
import GameTable from "../components/game/GameTable";
import TrumpPicker from "../components/game/TrumpPicker";
import DisconnectModal from "../components/game/DisconnectModal";
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
  const [dismissedDcModal, setDismissedDcModal] = useState(false);

  // ── Trick display: hold last completed trick visible for 5s ───────────
  const TRICK_HOLD_MS = 5000;
  const TRICK_SWEEP_START_MS = 3000;
  const completedLenRef = useRef(0);
  const [shownPlays, setShownPlays] = useState([]);
  const [winnerPosition, setWinnerPosition] = useState(null);
  const [isCollecting, setIsCollecting] = useState(false);
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

  // ── Host Migration: Transfer host role if host disconnects ────────────
  useEffect(() => {
    if (!code || !game || !presence) return;

    const activeHostId = game.hostId || Object.values(game.seats || {})[0]?.id;
    const isHostOnline = activeHostId && presence[activeHostId];

    if (!isHostOnline) {
      const connectedHumanSeats = Object.entries(game.seats || {})
        .map(([seatStr, p]) => ({ seat: Number(seatStr), ...p }))
        .filter((p) => !p.isBot && p.id && presence[p.id]);

      if (connectedHumanSeats.length > 0) {
        connectedHumanSeats.sort((a, b) => a.seat - b.seat);
        const nextHostId = connectedHumanSeats[0].id;

        if (myId === nextHostId && game.hostId !== myId) {
          migrateHost(code, myId);
        }
      }
    }
  }, [code, game, presence, myId]);

  // ── Bot runner: fire AI moves when a bot seat's turn arrives ──────────
  useEffect(() => {
    if (!code || !game) return;
    const cancel = runBotTurn(code, game, presence);
    return cancel;
  }, [code, game, presence]);

  // ── Mirror live trick / hold completed trick for 5s ───────────────────
  // At 3s (TRICK_SWEEP_START_MS), triggers 1s animation collecting cards to trick winner.
  useEffect(() => {
    if (!game) return;

    const newLen = (game.trickHistory || []).length;

    if (game.status === "selecting-trump") {
      completedLenRef.current = 0;
      setShownPlays([]);
      setIsCollecting(false);
      setWinnerPosition(null);
      return;
    }

    if (newLen > completedLenRef.current) {
      const lastTrick = game.trickHistory[newLen - 1];
      const frozenPlays = (lastTrick?.plays || []).map((play) => ({
        seat: seatToPosition(mySeatRef.current, play.seat),
        card: play.card,
      }));
      const winPos = seatToPosition(mySeatRef.current, lastTrick?.winnerSeat);

      setShownPlays(frozenPlays);
      setWinnerPosition(winPos);
      setIsCollecting(false);

      const sweepTimer = setTimeout(() => {
        setIsCollecting(true);
      }, TRICK_SWEEP_START_MS);

      const clearTimer = setTimeout(() => {
        completedLenRef.current = newLen;
        setShownPlays([]);
        setIsCollecting(false);
        setWinnerPosition(null);
      }, TRICK_HOLD_MS);

      return () => {
        clearTimeout(sweepTimer);
        clearTimeout(clearTimer);
      };
    }

    if (completedLenRef.current === newLen) {
      const livePlays = (game.trick || []).map((play) => ({
        seat: seatToPosition(mySeatRef.current, play.seat),
        card: play.card,
      }));
      setShownPlays(livePlays);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.trickHistory, game?.trick, game?.status]);

  if (!code) {
    return <GameTable />;
  }

  if (!game) {
    return (
      <div className="game-loading">
        <div className="game-loading__spinner" />
        <p className="game-loading__text">{t("joining")}...</p>
      </div>
    );
  }

  // 1. Try matching by exact playerId
  let mySeatEntry = Object.entries(game.seats || {}).find(
    ([, player]) => player?.id === myId
  );

  // 2. If not matched by ID, try matching by player name (for players rejoining after app restart or name re-entry)
  if (!mySeatEntry && currentPlayer?.name) {
    const normName = currentPlayer.name.trim().toLowerCase();
    mySeatEntry = Object.entries(game.seats || {}).find(
      ([, player]) => player?.name && player.name.trim().toLowerCase() === normName
    );
    if (mySeatEntry) {
      const seatNum = Number(mySeatEntry[0]);
      reclaimPlayerSeat(code, seatNum, myId, currentPlayer.name);
    }
  }

  // 3. If still not matched, check if there is a disconnected real player seat to reclaim
  if (!mySeatEntry && presence !== null) {
    const disconnectedSeatEntry = Object.entries(game.seats || {}).find(
      ([, p]) => !p?.isBot && p?.id && !presence[p.id]
    );
    if (disconnectedSeatEntry) {
      mySeatEntry = disconnectedSeatEntry;
      const seatNum = Number(mySeatEntry[0]);
      reclaimPlayerSeat(code, seatNum, myId, currentPlayer?.name || "Player");
    }
  }

  if (!mySeatEntry) {
    return (
      <div className="game-loading">
        <p className="game-loading__text">{t("lobbyNotFound")}</p>
        <Button onClick={() => navigate("/game-mode")}>{t("back")}</Button>
      </div>
    );
  }

  const mySeat = Number(mySeatEntry[0]);
  mySeatRef.current = mySeat;

  // Automatically reclaim seat if player rejoined and seat was converted to bot
  if (mySeatEntry[1]?.isBot) {
    reclaimPlayerSeat(code, mySeat, myId, currentPlayer?.name || "Player");
  }

  const currentHostId = game.hostId || Object.values(game.seats || {})[0]?.id;
  const isHost = currentHostId === myId;

  // Detect disconnected real players
  const disconnectedEntry = Object.entries(game.seats || {}).find(
    ([, p]) => !p?.isBot && p?.id && presence !== null && !presence[p.id]
  );
  const disconnectedSeat = disconnectedEntry ? Number(disconnectedEntry[0]) : null;
  const disconnectedPlayer = disconnectedEntry ? disconnectedEntry[1] : null;

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
      {disconnectedPlayer && (
        <div className="game-dc-bar">
          <span>⚠️ <strong>{disconnectedPlayer.name}</strong> disconnected</span>
          <span className="game-dc-bar__code">Code: {code}</span>
          {isHost && (
            <button
              type="button"
              className="game-dc-bar__btn"
              onClick={() => setDismissedDcModal(false)}
            >
              Host Options
            </button>
          )}
        </div>
      )}

      <GameTable
        players={players}
        hand={myHand}
        plays={shownPlays}
        trumpSuit={game.trumpSuit || "hearts"}
        activeSeat={activeSeatPosition}
        onConfirmPlay={handleConfirmPlay}
        isMultiplayer={true}
        winnerPosition={winnerPosition}
        isCollecting={isCollecting}
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

      {isHost && disconnectedPlayer && (
        <DisconnectModal
          isOpen={!dismissedDcModal}
          playerName={disconnectedPlayer.name}
          roomCode={code}
          onWait={() => setDismissedDcModal(true)}
          onReplaceWithBot={() => replacePlayerWithBot(code, disconnectedSeat, t("oomiBot"))}
        />
      )}
    </>
  );
}

