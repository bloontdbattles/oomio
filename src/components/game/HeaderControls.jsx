import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSoundEnabled,
  setSoundEnabled,
  getSoundVolume,
  setSoundVolume,
  getMusicEnabled,
  setMusicEnabled,
  getMusicVolume,
  setMusicVolume,
} from "../../utils/localStorage";
import soundIcon from "../../assets/images/3.png";
import musicIcon from "../../assets/images/2.png";
import "./HeaderControls.css";

export default function HeaderControls() {
  const navigate = useNavigate();

  const [soundOn, setSoundOn] = useState(() => getSoundEnabled());
  const [soundVol, setSoundVolState] = useState(() => getSoundVolume());
  const [showSoundSlider, setShowSoundSlider] = useState(false);

  const [musicOn, setMusicOn] = useState(() => getMusicEnabled());
  const [musicVol, setMusicVolState] = useState(() => getMusicVolume());
  const [showMusicSlider, setShowMusicSlider] = useState(false);

  const soundTimerRef = useRef(null);
  const musicTimerRef = useRef(null);

  // Sync state with custom events
  useEffect(() => {
    const handleSoundChange = () => setSoundOn(getSoundEnabled());
    const handleMusicChange = () => setMusicOn(getMusicEnabled());
    const handleSoundVolChange = (e) => setSoundVolState(e.detail);
    const handleMusicVolChange = (e) => setMusicVolState(e.detail);

    window.addEventListener("oomio_sound_change", handleSoundChange);
    window.addEventListener("oomio_music_change", handleMusicChange);
    window.addEventListener("oomio_sound_volume_change", handleSoundVolChange);
    window.addEventListener("oomio_music_volume_change", handleMusicVolChange);

    return () => {
      window.removeEventListener("oomio_sound_change", handleSoundChange);
      window.removeEventListener("oomio_music_change", handleMusicChange);
      window.removeEventListener("oomio_sound_volume_change", handleSoundVolChange);
      window.removeEventListener("oomio_music_volume_change", handleMusicVolChange);
    };
  }, []);

  const resetSoundTimer = () => {
    if (soundTimerRef.current) clearTimeout(soundTimerRef.current);
    soundTimerRef.current = setTimeout(() => {
      setShowSoundSlider(false);
    }, 3000);
  };

  const resetMusicTimer = () => {
    if (musicTimerRef.current) clearTimeout(musicTimerRef.current);
    musicTimerRef.current = setTimeout(() => {
      setShowMusicSlider(false);
    }, 3000);
  };

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setShowSoundSlider(true);
    setShowMusicSlider(false);
    resetSoundTimer();
  };

  const handleToggleMusic = () => {
    const next = !musicOn;
    setMusicEnabled(next);
    setShowMusicSlider(true);
    setShowSoundSlider(false);
    resetMusicTimer();
  };

  const handleSoundVolChange = (e) => {
    const val = parseFloat(e.target.value);
    setSoundVolume(val);
    if (!soundOn && val > 0) setSoundEnabled(true);
    resetSoundTimer();
  };

  const handleMusicVolChange = (e) => {
    const val = parseFloat(e.target.value);
    setMusicVolume(val);
    if (!musicOn && val > 0) setMusicEnabled(true);
    resetMusicTimer();
  };

  return (
    <div className="header-controls">
      {/* Top Row: 3 Action Buttons */}
      <div className="header-controls__bar">
        {/* Button 1: Back Button */}
        <button
          type="button"
          className="header-controls__btn header-controls__btn--back"
          onClick={() => navigate("/game-mode")}
          title="Back to Game Mode"
          aria-label="Back"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* Button 2: Sound Effects */}
        <div className="header-controls__popover-wrap">
          <button
            type="button"
            className={`header-controls__btn ${!soundOn ? "is-off" : ""}`}
            onClick={handleToggleSound}
            title="Sound Effects"
            aria-label="Sound Effects"
          >
            <img src={soundIcon} alt="Sound" className="header-controls__icon" />
            {!soundOn && <span className="header-controls__slash" />}
          </button>

          {showSoundSlider && (
            <div
              className="header-controls__popover"
              onMouseEnter={resetSoundTimer}
              onTouchStart={resetSoundTimer}
            >
              <span className="header-controls__vol-val">{Math.round((soundOn ? soundVol : 0) * 100)}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundOn ? soundVol : 0}
                onChange={handleSoundVolChange}
                className="header-controls__slider"
              />
            </div>
          )}
        </div>

        {/* Button 3: Background Music */}
        <div className="header-controls__popover-wrap">
          <button
            type="button"
            className={`header-controls__btn ${!musicOn ? "is-off" : ""}`}
            onClick={handleToggleMusic}
            title="Background Music"
            aria-label="Background Music"
          >
            <img src={musicIcon} alt="Music" className="header-controls__icon" />
            {!musicOn && <span className="header-controls__slash" />}
          </button>

          {showMusicSlider && (
            <div
              className="header-controls__popover"
              onMouseEnter={resetMusicTimer}
              onTouchStart={resetMusicTimer}
            >
              <span className="header-controls__vol-val">{Math.round((musicOn ? musicVol : 0) * 100)}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicOn ? musicVol : 0}
                onChange={handleMusicVolChange}
                className="header-controls__slider"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
