import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { getPlayer } from "../utils/localStorage";
import { createLobby, lobbyExists } from "../firebase/lobbyService";
import Avatar from "../components/common/Avatar";
import SettingsModal from "../components/common/SettingsModal";
import LobbySettingsModal from "../components/lobby/LobbySettingsModal";
import JoinLobbyModal from "../components/lobby/JoinLobbyModal";
import "./GameMode.css";

export default function GameMode() {
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [showFriendsOptions, setShowFriendsOptions] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showGeneralSettings, setShowGeneralSettings] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    const stored = getPlayer();
    if (!stored) {
      navigate("/", { replace: true });
      return;
    }
    setPlayer(stored);
  }, [navigate]);

  if (!player) return null;

  const handleCreateLobby = async (settings) => {
    setIsCreating(true);
    try {
      const code = await createLobby({
        hostId: player.playerId,
        hostName: player.name,
        ...settings,
      });
      setShowSettingsModal(false);
      navigate("/lobby", { state: { mode: "create", code } });
    } catch (err) {
      console.error("Failed to create lobby:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinLobby = async (code) => {
    setIsJoining(true);
    setJoinError("");
    try {
      const exists = await lobbyExists(code);
      if (!exists) {
        setJoinError(t("lobbyNotFound"));
        return;
      }
      setShowJoinModal(false);
      navigate("/lobby", { state: { mode: "join", code } });
    } catch (err) {
      console.error("Failed to join lobby:", err);
      setJoinError(t("lobbyNotFound"));
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="game-mode">
      <div className="game-mode__texture" aria-hidden="true" />
      <div className="game-mode__vignette" aria-hidden="true" />

      <header className="game-mode__top">
        <div className="game-mode__profile">
          <Avatar name={player.name} size={44} />
          <span className="game-mode__name">{player.name}</span>
        </div>

        <button
          type="button"
          className="game-mode__settings"
          onClick={() => setShowGeneralSettings(true)}
          aria-label={t("settings")}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06.06A1.7 1.7 0 0 0 4.63 15a1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.63a1.7 1.7 0 0 0 1.04-1.56V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.37 9a1.7 1.7 0 0 0 1.56 1.04H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15z" />
          </svg>
        </button>
      </header>

      <main className="game-mode__hero">
        <h1 className="game-mode__title">{t("chooseMode")}</h1>

        {!showFriendsOptions ? (
          <div className="game-mode__options">
            <button
              type="button"
              className="mode-card"
              onClick={() => navigate("/game")}
            >
              <span className="mode-card__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="4" y="8" width="16" height="11" rx="3" />
                  <path d="M8 8V6a4 4 0 0 1 8 0v2" />
                  <circle cx="9" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
                  <circle cx="15" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
                </svg>
              </span>
              <span className="mode-card__label">{t("playWithAI")}</span>
            </button>

            <button
              type="button"
              className="mode-card"
              onClick={() => setShowFriendsOptions(true)}
            >
              <span className="mode-card__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="9" cy="8" r="3" />
                  <circle cx="17" cy="9" r="2.4" />
                  <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                  <path d="M14.5 14.2c2.6.3 4.5 2.6 4.5 5.3" />
                </svg>
              </span>
              <span className="mode-card__label">{t("playWithFriends")}</span>
            </button>
          </div>
        ) : (
          <div className="game-mode__sub-options">
            <button
              type="button"
              className="game-mode__back"
              onClick={() => setShowFriendsOptions(false)}
            >
              ← {t("back")}
            </button>

            <div className="game-mode__sub-buttons">
              <button
                type="button"
                className="mode-card mode-card--sub"
                onClick={() => setShowSettingsModal(true)}
              >
                <span className="mode-card__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v8M8 12h8" />
                  </svg>
                </span>
                <span className="mode-card__label">{t("createLobby")}</span>
              </button>

              <button
                type="button"
                className="mode-card mode-card--sub"
                onClick={() => setShowJoinModal(true)}
              >
                <span className="mode-card__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <path d="M10 17l5-5-5-5" />
                    <path d="M15 12H3" />
                  </svg>
                </span>
                <span className="mode-card__label">{t("joinGame")}</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <SettingsModal
        isOpen={showGeneralSettings}
        onClose={() => setShowGeneralSettings(false)}
        onPlayerNameChange={(newName) => {
          setPlayer((prev) => (prev ? { ...prev, name: newName } : prev));
        }}
      />

      <LobbySettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onConfirm={handleCreateLobby}
        isSubmitting={isCreating}
      />

      <JoinLobbyModal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setJoinError("");
        }}
        onJoin={handleJoinLobby}
        isSubmitting={isJoining}
        error={joinError}
      />
    </div>
  );
}