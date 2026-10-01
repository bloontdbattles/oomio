import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../../context/LanguageContext";
import { savePlayer, getSoundEnabled, setSoundEnabled, getMusicEnabled, setMusicEnabled } from "../../utils/localStorage";
import Modal from "./Modal";
import Toggle from "./Toggle";
import LanguageSwitcher from "./LanguageSwitcher";
import Button from "./Button";
import "./SettingsModal.css";

export default function SettingsModal({ isOpen, onClose, player, onNameChange, onPlayerNameChange }) {
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const activePlayer = player || getPlayer();
  const [name, setName] = useState(activePlayer?.name || "");
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const current = player || getPlayer();
      setName(current?.name || "");
      setSoundOn(getSoundEnabled());
      setMusicOn(getMusicEnabled());
    }
  }, [isOpen, player]);

  const handleSaveName = () => {
    const trimmed = name.trim();
    const current = player || getPlayer();
    if (!trimmed || trimmed === current?.name) return;
    const updated = savePlayer({ ...current, name: trimmed });
    onNameChange?.(updated);
    onPlayerNameChange?.(trimmed);
  };

  const handleToggleSound = (value) => {
    setSoundOn(value);
    setSoundEnabled(value);
  };

  const handleToggleMusic = (value) => {
    setMusicOn(value);
    setMusicEnabled(value);
  };

  const handleAbout = () => {
    onClose();
    navigate("/about");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="settings-modal__title">{t("settings")}</h2>

      <div className="settings-modal__section">
        <label className="settings-modal__label">{t("playerName")}</label>
        <input
          type="text"
          className="settings-modal__input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSaveName}
          onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
          maxLength={20}
        />
      </div>

      <div className="settings-modal__section">
        <label className="settings-modal__label">{t("language")}</label>
        <div className="settings-modal__lang-row">
          <LanguageSwitcher />
        </div>
      </div>

      <div className="settings-modal__section">
        <Toggle checked={soundOn} onChange={handleToggleSound} label={t("soundEffects")} />
      </div>

      <div className="settings-modal__section">
        <Toggle checked={musicOn} onChange={handleToggleMusic} label={t("music")} />
      </div>

      <button type="button" className="settings-modal__about" onClick={handleAbout}>
        {t("about")}
      </button>

      <Button className="settings-modal__close" onClick={onClose}>
        {t("close")}
      </Button>
    </Modal>
  );
}
