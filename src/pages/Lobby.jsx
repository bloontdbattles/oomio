import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { getPlayer } from "../utils/localStorage";
import {
  subscribeToLobby,
  seatPlayer,
  addBot,
  removePlayer,
  movePlayerToTeam,
  startGame,
} from "../firebase/lobbyService";
import { initializeGame } from "../firebase/gameService";
import { trackPresence } from "../firebase/presenceService";
import TeamPanel from "../components/lobby/TeamPanel";
import Button from "../components/common/Button";
import "./Lobby.css";

const EMPTY_TEAM = [null, null];

export default function Lobby() {
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { code } = location.state || {};

  const currentPlayer = useMemo(() => getPlayer(), []);
  const currentPlayerId = currentPlayer?.playerId || "you";

  const [lobby, setLobby] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // No room code in the URL/nav state at all - shouldn't normally happen
  // since GameMode always creates/verifies a code before navigating here.
  useEffect(() => {
    if (!code) {
      navigate("/game-mode", { replace: true });
    }
  }, [code, navigate]);

  // Subscribe to live lobby updates, and track this player's presence so
  // the lobby can clean up after them if they close the tab.
  useEffect(() => {
    if (!code) return;

    const unsubscribeLobby = subscribeToLobby(code, (data) => {
      if (!data) {
        setNotFound(true);
        return;
      }
      setLobby(data);
    });

    const unsubscribePresence = trackPresence(code, currentPlayerId);

    return () => {
      unsubscribeLobby();
      unsubscribePresence();
    };
  }, [code, currentPlayerId]);

  // When host starts game (lobby.status becomes "playing"), automatically navigate
  // all connected players in the lobby to /game.
  useEffect(() => {
    if (lobby?.status === "playing" && code) {
      navigate("/game", { state: { code } });
    }
  }, [lobby?.status, code, navigate]);

  // Firebase drops empty objects/arrays entirely, so a team with no
  // players at all won't even have a `red`/`blue` key yet - normalize
  // that into a fixed-length [seat0, seat1] array for rendering.
  const teams = useMemo(() => {
    const toSlots = (teamObj) => {
      if (!teamObj) return [...EMPTY_TEAM];
      return [teamObj[0] || null, teamObj[1] || null];
    };
    return {
      red: toSlots(lobby?.teams?.red),
      blue: toSlots(lobby?.teams?.blue),
    };
  }, [lobby]);

  const isHost = lobby?.hostId === currentPlayerId;

  const isSeated = useMemo(() => {
    return [...teams.red, ...teams.blue].some((p) => p && p.id === currentPlayerId);
  }, [teams, currentPlayerId]);

  const filledCount = [...teams.red, ...teams.blue].filter(Boolean).length;
  const canStart = isHost && filledCount === 4;

  const handleJoinSlot = (team, index) => {
    if (isSeated) return;
    seatPlayer(code, team, index, {
      id: currentPlayerId,
      name: currentPlayer?.name || "You",
    });
  };

  const handleAddBot = (team, index) => {
    if (!isHost) return;
    addBot(code, team, index, t("oomiBot"));
  };

  const handleKick = (playerId) => {
    if (!isHost) return;
    const team = teams.red.some((p) => p && p.id === playerId) ? "red" : "blue";
    const index = teams[team].findIndex((p) => p && p.id === playerId);
    if (index !== -1) removePlayer(code, team, index);
  };

  const handleMoveTeam = (playerId) => {
    if (!isHost) return;
    const fromTeam = teams.red.some((p) => p && p.id === playerId) ? "red" : "blue";
    const toTeam = fromTeam === "red" ? "blue" : "red";
    const fromIndex = teams[fromTeam].findIndex((p) => p && p.id === playerId);
    const toIndex = teams[toTeam].findIndex((p) => !p);
    if (fromIndex === -1 || toIndex === -1) return; // other team full, nothing to do

    const player = teams[fromTeam][fromIndex];
    movePlayerToTeam(code, fromTeam, fromIndex, toTeam, toIndex, player);
  };

  const handleStartGame = async () => {
    await initializeGame(code, teams, lobby?.hostId || currentPlayerId);
    await startGame(code);
    navigate("/game", { state: { code } });
  };

  if (notFound) {
    return (
      <div className="lobby">
        <div className="lobby__content">
          <p className="lobby__prompt">{t("lobbyNotFound")}</p>
          <Button onClick={() => navigate("/game-mode")}>{t("back")}</Button>
        </div>
      </div>
    );
  }

  if (!lobby) return null; // brief loading flash while the first snapshot arrives

  return (
    <div className="lobby">
      <div className="lobby__texture" aria-hidden="true" />
      <div className="lobby__vignette" aria-hidden="true" />

      <div className="lobby__content">
        <header className="lobby__header">
          <div>
            <p className="lobby__label">{t("roomCode")}</p>
            <p className="lobby__code">{code}</p>
          </div>
          <p className="lobby__count">{filledCount} / 4</p>
        </header>

        {!isSeated && <p className="lobby__prompt">{t("pickYourTeam")}</p>}

        <div className="lobby__teams">
          <TeamPanel
            teamName={t("redTeam")}
            teamColor="red"
            slots={teams.red}
            isHost={isHost}
            allowSelfJoin={!isSeated}
            onAddBot={(i) => handleAddBot("red", i)}
            onJoinSlot={(i) => handleJoinSlot("red", i)}
            onKick={handleKick}
            onMoveTeam={handleMoveTeam}
          />
          <TeamPanel
            teamName={t("blueTeam")}
            teamColor="blue"
            slots={teams.blue}
            isHost={isHost}
            allowSelfJoin={!isSeated}
            onAddBot={(i) => handleAddBot("blue", i)}
            onJoinSlot={(i) => handleJoinSlot("blue", i)}
            onKick={handleKick}
            onMoveTeam={handleMoveTeam}
          />
        </div>

        {isHost && (
          <Button className="lobby__start" onClick={handleStartGame} disabled={!canStart}>
            {t("startGame")}
          </Button>
        )}
      </div>
    </div>
  );
}
