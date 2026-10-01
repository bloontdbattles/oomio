import { createContext, useState, useMemo, useEffect } from "react";
import en from "../locales/en";
import si from "../locales/si";

const dictionaries = { en, si };

function parseTaggedText(text, isSinhala, options = {}) {
  if (typeof text !== "string") return text;

  if (options.plain) {
    return text.replace(/<([^>]+)>/g, "$1");
  }

  const parts = text.split(/(<[^>]+>)/g);

  const renderedParts = parts.map((part, index) => {
    if (part.startsWith("<") && part.endsWith(">")) {
      const content = part.slice(1, -1);
      return (
        <span key={index} className="en-text">
          {content}
        </span>
      );
    }
    return part;
  });

  if (isSinhala) {
    return <span className="si-text">{renderedParts}</span>;
  }

  return <span className="en-text">{renderedParts}</span>;
}

export const LanguageContext = createContext({
  lang: "en",
  t: (key) => key,
  setLang: () => { },
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem("oomio_lang") || "en",
  );

  useEffect(() => {
    localStorage.setItem("oomio_lang", lang);
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const setLang = (next) => {
    if (dictionaries[next]) setLangState(next);
  };

  const t = useMemo(() => {
    const dict = dictionaries[lang] || dictionaries.en;
    const isSinhala = lang === "si";
    return (key, options) => {
      const raw = dict[key] ?? dictionaries.en[key] ?? key;
      return parseTaggedText(raw, isSinhala, options);
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, t, setLang }), [lang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
