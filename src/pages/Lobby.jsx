import { useContext, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { getPlayer } from "../utils/localStorage";
import { generateId } from "../utils/generateId";
import { generateRoomCode } from "../utils/generateRoomCode";
import TeamPanel from "../components/lobby/TeamPanel";
import Button from "../components/common/Button";
import "./Lobby.css";

export default function Lobby() {
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const isCreator = state.mode === "create";

  const currentPlayer = useMemo(() => getPlayer(), []);
  const currentPlayerId = currentPlayer?.playerId || "you";
  const roomCode = useMemo(
    () => state.code || generateRoomCode(),
    [state.code],
  );

  // Placeholder lobby state. Real version will sync through Firebase once
  // multiplayer (Phase 5) is wired in - for now everything lives in this
  // component so the host controls / seat picking can be tried locally.
  const [teams, setTeams] = useState(() => {
    if (isCreator) {
      return {
        red: [
          {
            id: currentPlayerId,
            name: currentPlayer?.name || "You",
            isHost: true,
          },
          null,
        ],
        blue: [null, null],
      };
    }
    return {
      red: [{ id: "demo-host", name: "Host Player", isHost: true }, null],
      blue: [null, null],
    };
  });

  const isSeated = useMemo(() => {
    if (isCreator) return true;
    return [...teams.red, ...teams.blue].some(
      (p) => p && p.id === currentPlayerId,
    );
  }, [teams, isCreator, currentPlayerId]);

  const filledCount = [...teams.red, ...teams.blue].filter(Boolean).length;
  const canStart = isCreator && filledCount === 4;

  const updateTeam = (color, updater) => {
    setTeams((prev) => ({ ...prev, [color]: updater(prev[color]) }));
  };

  const handleJoinSlot = (color, index) => {
    if (isCreator || isSeated) return;
    updateTeam(color, (slots) => {
      const next = [...slots];
      next[index] = { id: currentPlayerId, name: currentPlayer?.name || "You" };
      return next;
    });
  };

  const handleAddBot = (color, index) => {
    if (!isCreator) return;
    updateTeam(color, (slots) => {
      const next = [...slots];
      next[index] = { id: generateId("bot"), name: t("oomiBot"), isBot: true };
      return next;
    });
  };

  const handleKick = (playerId) => {
    setTeams((prev) => ({
      red: prev.red.map((p) => (p && p.id === playerId ? null : p)),
      blue: prev.blue.map((p) => (p && p.id === playerId ? null : p)),
    }));
  };

  const handleMoveTeam = (playerId) => {
    setTeams((prev) => {
      const fromColor = prev.red.some((p) => p && p.id === playerId)
        ? "red"
        : "blue";
      const toColor = fromColor === "red" ? "blue" : "red";
      const toEmptyIndex = prev[toColor].findIndex((p) => !p);
      if (toEmptyIndex === -1) return prev; // other team is full, nothing to do

      const player = prev[fromColor].find((p) => p && p.id === playerId);
      const nextFrom = prev[fromColor].map((p) =>
        p && p.id === playerId ? null : p,
      );
      const nextTo = [...prev[toColor]];
      nextTo[toEmptyIndex] = player;

      return { ...prev, [fromColor]: nextFrom, [toColor]: nextTo };
    });
  };

  const handleStartGame = () => {
    navigate("/game");
  };

  return (
    <div className="lobby">
      <div className="lobby__texture" aria-hidden="true" />
      <div className="lobby__vignette" aria-hidden="true" />

      <div className="lobby__content">
        <header className="lobby__header">
          <div>
            <p className="lobby__label">{t("roomCode")}</p>
            <p className="lobby__code">{roomCode}</p>
          </div>
          <p className="lobby__count">{filledCount} / 4</p>
        </header>

        {!isCreator && !isSeated && (
          <p className="lobby__prompt">{t("pickYourTeam")}</p>
        )}

        <div className="lobby__teams">
          <TeamPanel
            teamName={t("redTeam")}
            teamColor="red"
            slots={teams.red}
            isHost={isCreator}
            allowSelfJoin={!isCreator && !isSeated}
            onAddBot={(i) => handleAddBot("red", i)}
            onJoinSlot={(i) => handleJoinSlot("red", i)}
            onKick={handleKick}
            onMoveTeam={handleMoveTeam}
          />
          <TeamPanel
            teamName={t("blueTeam")}
            teamColor="blue"
            slots={teams.blue}
            isHost={isCreator}
            allowSelfJoin={!isCreator && !isSeated}
            onAddBot={(i) => handleAddBot("blue", i)}
            onJoinSlot={(i) => handleJoinSlot("blue", i)}
            onKick={handleKick}
            onMoveTeam={handleMoveTeam}
          />
        </div>

        {isCreator && (
          <Button
            className="lobby__start"
            onClick={handleStartGame}
            disabled={!canStart}
          >
            {t("startGame")}
          </Button>
        )}
      </div>
    </div>
  );
}
