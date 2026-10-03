import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import Button from "../components/common/Button";
import "./About.css";

/* ── SVG icons (inline, no external deps) ────────────── */
const icons = {
  robot: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="4" y="8" width="16" height="11" rx="3" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      <circle cx="9" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  friends: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M14.5 14.2c2.6.3 4.5 2.6 4.5 5.3" />
    </svg>
  ),
  live: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 4 5.8 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.8-4-9s1.5-6.5 4-9Z" />
    </svg>
  ),
};

const FEATURES = [
  { key: "featurePlayAI", icon: icons.robot },
  { key: "featurePlayFriends", icon: icons.friends },
  { key: "featureLiveLobbies", icon: icons.live },
  { key: "featureLanguages", icon: icons.globe },
];

const STEPS = [
  { key: "step1" },
  { key: "step2" },
  { key: "step3" },
  { key: "step4" },
  { key: "step5" },
];

export default function About() {
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();

  return (
    <div className="about">
      <div className="about__texture" aria-hidden="true" />
      <div className="about__vignette" aria-hidden="true" />

      {/* ── Top bar ─────────────────────────────────── */}
      <div className="about__topbar">
        <button
          type="button"
          className="about__back-btn"
          onClick={() => navigate("/")}
        >
          <span className="about__back-arrow">←</span>
          {t("back")}
        </button>
      </div>

      {/* ── Main content ────────────────────────────── */}
      <div className="about__content">

        {/* Header */}
        <div className="about__header">
          <p className="about__wordmark">OOMIO</p>
          <h1 className="about__title">{t("aboutTitle")}</h1>
          <p className="about__body">{t("aboutBody1")}</p>
          <p className="about__body">{t("aboutBody2")}</p>
        </div>

        <hr className="about__divider" />

        {/* How to Play */}
        <h2 className="about__section-title">{t("aboutHowToPlay")}</h2>
        <ol className="about__steps">
          {STEPS.map((s, i) => (
            <li key={s.key} className="about__step">
              <span className="about__step-number">{i + 1}</span>
              <span
                className="about__step-text"
                dangerouslySetInnerHTML={{ __html: t(`aboutStep${i + 1}`) }}
              />
            </li>
          ))}
        </ol>

        <hr className="about__divider" />

        {/* Features */}
        <h2 className="about__section-title">{t("aboutFeaturesTitle")}</h2>
        <div className="about__features">
          {FEATURES.map((f) => (
            <div key={f.key} className="about__feature">
              <span className="about__feature-icon">{f.icon}</span>
              <span className="about__feature-label">{t(f.key)}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="about__footer">
          <p className="about__footer-text">{t("aboutFooter")}</p>
          <Button
            className="about__play-btn"
            onClick={() => navigate("/")}
          >
            {t("playNow")}
          </Button>
        </div>
      </div>
    </div>
  );
}