import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { getPlayer } from "../utils/localStorage";
import { playSound1 } from "../utils/soundEffects";
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
import GameResult from "../components/game/GameResult";
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
  const navigate = useNavigate();
  const { code } = location.state || {};

  // Keep currentPlayer reactive so name/id changes mid-session are picked up
  const [currentPlayer, setCurrentPlayer] = useState(() => getPlayer());
  useEffect(() => {
    const handler = (e) => { if (e.detail) setCurrentPlayer(e.detail); };
    window.addEventListener("oomio_player_change", handler);
    return () => window.removeEventListener("oomio_player_change", handler);
  }, []);

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
    const isHostOnline = activeHostId && presence[activeHostId] === true;

    if (!isHostOnline) {
      const connectedHumanSeats = Object.entries(game.seats || {})
        .map(([seatStr, p]) => ({ seat: Number(seatStr), ...p }))
        .filter((p) => !p.isBot && p.id && presence[p.id] === true);

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

  const sweepTimerRef = useRef(null);
  const clearTimerRef = useRef(null);
  const isHoldingRef = useRef(false);

  // ── Mirror live trick / hold completed trick for 5s ───────────────────
  // At 3s (TRICK_SWEEP_START_MS), triggers 1s animation collecting cards to trick winner.
  useEffect(() => {
    if (!game) return;

    if (game.status === "selecting-trump") {
      completedLenRef.current = 0;
      isHoldingRef.current = false;
      if (sweepTimerRef.current) clearTimeout(sweepTimerRef.current);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      setShownPlays([]);
      setIsCollecting(false);
      setWinnerPosition(null);
      return;
    }

    const newLen = (game.trickHistory || []).length;
    const currentTrickPlays = game.trick || [];

    // Case 1: A trick just completed (newLen increased) — start 5s hold and 3s sweep animation
    if (newLen > completedLenRef.current) {
      completedLenRef.current = newLen;
      isHoldingRef.current = true;

      const lastTrick = game.trickHistory[newLen - 1];
      const frozenPlays = (lastTrick?.plays || []).map((play) => ({
        seat: seatToPosition(mySeatRef.current, play.seat),
        card: play.card,
      }));
      const winPos = seatToPosition(mySeatRef.current, lastTrick?.winnerSeat);

      setShownPlays(frozenPlays);
      setIsCollecting(false);
      setWinnerPosition(null);

      if (sweepTimerRef.current) clearTimeout(sweepTimerRef.current);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);

      sweepTimerRef.current = setTimeout(() => {
        setWinnerPosition(winPos);
        setIsCollecting(true);
        playSound1();
      }, TRICK_SWEEP_START_MS);

      clearTimerRef.current = setTimeout(() => {
        isHoldingRef.current = false;
        setIsCollecting(false);
        setWinnerPosition(null);
        setShownPlays((game.trick || []).map((play) => ({
          seat: seatToPosition(mySeatRef.current, play.seat),
          card: play.card,
        })));
      }, TRICK_HOLD_MS);
      return;
    }

    // Case 2: We are holding a completed trick animation, but someone played a card for the new trick
    if (isHoldingRef.current && currentTrickPlays.length > 0) {
      // End the completed trick hold early so the new card is immediately shown!
      isHoldingRef.current = false;
      if (sweepTimerRef.current) clearTimeout(sweepTimerRef.current);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      setIsCollecting(false);
      setWinnerPosition(null);

      const livePlays = currentTrickPlays.map((play) => ({
        seat: seatToPosition(mySeatRef.current, play.seat),
        card: play.card,
      }));
      setShownPlays(livePlays);
      return;
    }

    // Case 3: Normal live trick update during active play (not holding completed trick)
    if (!isHoldingRef.current) {
      const livePlays = currentTrickPlays.map((play) => ({
        seat: seatToPosition(mySeatRef.current, play.seat),
        card: play.card,
      }));
      setShownPlays(livePlays);
    }
  }, [game?.trickHistory?.length, game?.trick, game?.status]);

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
      ([, p]) => !p?.isBot && p?.id && presence[p.id] !== true
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

  // Reclaim seat if YOU rejoined your own seat that was temporarily converted to bot or if name updated
  if (mySeatEntry[1]?.id === myId && (mySeatEntry[1]?.isBot || (currentPlayer?.name && mySeatEntry[1]?.name !== currentPlayer.name))) {
    reclaimPlayerSeat(code, mySeat, myId, currentPlayer?.name || "Player");
  }

  const currentHostId = game.hostId || Object.values(game.seats || {})[0]?.id;
  const isHost = currentHostId === myId;

  // Detect disconnected real players
  const disconnectedEntry = Object.entries(game.seats || {}).find(
    ([, p]) => !p?.isBot && p?.id && presence !== null && presence[p.id] !== true
  );
  const disconnectedSeat = disconnectedEntry ? Number(disconnectedEntry[0]) : null;
  const disconnectedPlayer = disconnectedEntry ? disconnectedEntry[1] : null;

  const myTeam = game.seats?.[mySeat]?.team || "red";
  const oppTeam = myTeam === "red" ? "blue" : "red";

  const myTricks = game.scores?.[myTeam] || 0;
  const oppTricks = game.scores?.[oppTeam] || 0;

  const myMatchPoints = game.matchScore?.[myTeam] || 0;
  const oppMatchPoints = game.matchScore?.[oppTeam] || 0;

  const players = Object.entries(game.seats || {}).map(([seatStr, player]) => {
    const seat = Number(seatStr);
    const position = seatToPosition(mySeat, seat);
    const opponentIndex = ["left", "top", "right"].indexOf(position);

    const isBot = !!player?.isBot;
    const isDisconnected = !isBot && player?.id && presence !== null && presence[player.id] !== true;

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

  const rawHand = game.hands?.[mySeat] || [];
  const handToDisplay = game.status === "selecting-trump" ? rawHand.slice(0, 4) : rawHand;
  const myHand = handToDisplay.map((card) => ({
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

  const isGameOverStatus = game.status === "game-over" || myMatchPoints >= 11 || oppMatchPoints >= 11;
  const isRoundOverStatus = game.status === "round-over" || isGameOverStatus;

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
        team1Tricks={myTricks}
        team2Tricks={oppTricks}
        team1Score={myMatchPoints}
        team2Score={oppMatchPoints}
      />

      {game.status === "selecting-trump" && (
        <TrumpPicker
          isMyTurn={game.trumpPickerSeat === mySeat}
          onSelect={handleSelectTrump}
        />
      )}

      {isRoundOverStatus && (
        <GameResult
          isGameOver={isGameOverStatus}
          playerWon={
            isGameOverStatus
              ? myMatchPoints >= 11
              : (game.roundWinner === "draw" ? false : game.roundWinner === myTeam)
          }
          roundResult={game.roundResultType || (game.roundWinner === "draw" ? "DRAW" : "WIN")}
          team1Tricks={game.lastRoundTricks?.[myTeam] ?? myTricks}
          team2Tricks={game.lastRoundTricks?.[oppTeam] ?? oppTricks}
          team1Points={myMatchPoints}
          team2Points={oppMatchPoints}
          targetPoints={11}
          onPlayAgain={handleNextRound}
        />
      )}

      {isHost && disconnectedPlayer && (
        <DisconnectModal
          isOpen={!dismissedDcModal}
          playerName={disconnectedPlayer.name}
          roomCode={code}
          onWait={() => setDismissedDcModal(true)}
          onReplaceWithBot={() => replacePlayerWithBot(code, disconnectedSeat, t("oomiBot", { plain: true }))}
        />
      )}
    </>
  );
}
