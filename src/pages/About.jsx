import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import Button from "../components/common/Button";
import "./About.css";

const FEATURES = [
  {
    key: "featurePlayAI",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="4" y="8" width="16" height="11" rx="3" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
        <circle cx="9" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="15" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: "featurePlayFriends",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.4" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <path d="M14.5 14.2c2.6.3 4.5 2.6 4.5 5.3" />
      </svg>
    ),
  },
  {
    key: "featureLiveLobbies",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>
    ),
  },
  {
    key: "featureLanguages",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.5 4 5.8 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.8-4-9s1.5-6.5 4-9Z" />
      </svg>
    ),
  },
];

export default function About() {
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();

  return (
    <div className="about">
      <div className="about__texture" aria-hidden="true" />
      <div className="about__vignette" aria-hidden="true" />

      <div className="about__content">
        <p className="about__wordmark">OOMIO</p>
        <h1 className="about__title">{t("aboutTitle")}</h1>

        <p className="about__body">{t("aboutBody1")}</p>
        <p className="about__body">{t("aboutBody2")}</p>

        <div className="about__features">
          {FEATURES.map((f) => (
            <div key={f.key} className="about__feature">
              <span className="about__feature-icon">{f.icon}</span>
              <span className="about__feature-label">{t(f.key)}</span>
            </div>
          ))}
        </div>

        <Button className="about__back" onClick={() => navigate("/")}>
          {t("backToHome")}
        </Button>
      </div>
    </div>
  );
}