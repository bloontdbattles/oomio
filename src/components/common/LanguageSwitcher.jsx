import { useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import "./LanguageSwitcher.css";

export default function LanguageSwitcher() {
  const { lang, setLang } = useContext(LanguageContext);

  return (
    <div className="lang-switch" role="group" aria-label="Language">
      <button
        type="button"
        className={`lang-switch__option ${lang === "en" ? "is-active" : ""}`}
        onClick={() => setLang("en")}
      >
        EN
      </button>
      <span className="lang-switch__divider">/</span>
      <button
        type="button"
        className={`lang-switch__option ${lang === "si" ? "is-active" : ""}`}
        onClick={() => setLang("si")}
      >
        සිං
      </button>
    </div>
  );
}
