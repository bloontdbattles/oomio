import { createContext, useState, useMemo, useEffect } from "react";
import en from "../locales/en";
import si from "../locales/si";

const dictionaries = { en, si };

function parseTaggedText(text, options = {}) {
  if (typeof text !== "string" || !text.includes("<")) return text;

  if (options.plain) {
    return text.replace(/<([^>]+)>/g, "$1");
  }

  const parts = text.split(/(<[^>]+>)/g);
  if (parts.length === 1) return text;

  return parts.map((part, index) => {
    if (part.startsWith("<") && part.endsWith(">")) {
      const content = part.slice(1, -1);
      return (
        <span key={index} className="no-font2" data-no-font2="true">
          {content}
        </span>
      );
    }
    return part;
  });
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
    return (key, options) => {
      const raw = dict[key] ?? dictionaries.en[key] ?? key;
      return parseTaggedText(raw, options);
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, t, setLang }), [lang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
