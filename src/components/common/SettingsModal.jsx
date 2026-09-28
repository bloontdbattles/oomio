import { useContext, useState, useEffect } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import { getPlayer, savePlayer } from "../../utils/localStorage";
import Modal from "./Modal";
import Toggle from "./Toggle";
import Button from "./Button";
import LanguageSwitcher from "./LanguageSwitcher";
import "./SettingsModal.css";

export default function SettingsModal({ isOpen, onClose, onPlayerNameChange }) {
  const { t } = useContext(LanguageContext);
  const [name, setName] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem("oomio_sound") !== "false";
  });
  const [musicEnabled, setMusicEnabled] = useState(() => {
    return localStorage.getItem("oomio_music") === "true";
  });
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getPlayer();
      if (stored?.name) {
        setName(stored.name);
      }
      setSavedMessage(false);
    }
  }, [isOpen]);

  const handleSoundToggle = (val) => {
    setSoundEnabled(val);
    localStorage.setItem("oomio_sound", val ? "true" : "false");
  };

  const handleMusicToggle = (val) => {
    setMusicEnabled(val);
    localStorage.setItem("oomio_music", val ? "true" : "false");
  };

  const handleSaveName = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const stored = getPlayer() || {};
    const updated = { ...stored, name: trimmed };
    savePlayer(updated);
    if (onPlayerNameChange) {
      onPlayerNameChange(trimmed);
    }
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="settings-modal">
        <div className="settings-modal__header">
          <h2 className="settings-modal__title">{t("settings")}</h2>
          <button
            type="button"
            className="settings-modal__close-btn"
            onClick={onClose}
            aria-label={t("close")}
          >
            ✕
          </button>
        </div>

        <div className="settings-modal__body">
          {/* Player Name Setting */}
          <div className="settings-modal__section">
            <label className="settings-modal__label" htmlFor="settings-player-name">
              {t("playerName")}
            </label>
            <div className="settings-modal__input-group">
              <input
                id="settings-player-name"
                type="text"
                className="settings-modal__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={24}
                placeholder={t("enterYourName")}
              />
              <Button
                className="settings-modal__save-btn"
                onClick={handleSaveName}
                disabled={!name.trim()}
              >
                {t("save")}
              </Button>
            </div>
            {savedMessage && (
              <p className="settings-modal__feedback">✓ Updated!</p>
            )}
          </div>

          {/* Language Setting */}
          <div className="settings-modal__section settings-modal__section--row">
            <span className="settings-modal__label">{t("language")}</span>
            <LanguageSwitcher />
          </div>

          {/* Audio Toggles */}
          <div className="settings-modal__section">
            <Toggle
              checked={soundEnabled}
              onChange={handleSoundToggle}
              label={t("soundEffects")}
            />
          </div>

          <div className="settings-modal__section">
            <Toggle
              checked={musicEnabled}
              onChange={handleMusicToggle}
              label={t("music")}
            />
          </div>
        </div>

        <div className="settings-modal__footer">
          <Button className="settings-modal__done-btn" onClick={onClose}>
            {t("close")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
