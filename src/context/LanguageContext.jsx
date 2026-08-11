import { createContext, useState, useMemo, useEffect } from "react";
import en from "../locales/en";
import si from "../locales/si";

const dictionaries = { en, si };

export const LanguageContext = createContext({
  lang: "en",
  t: (key) => key,
  setLang: () => {},
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem("oomio_lang") || "en",
  );

  useEffect(() => {
    localStorage.setItem("oomio_lang", lang);
  }, [lang]);

  const setLang = (next) => {
    if (dictionaries[next]) setLangState(next);
  };

  const t = useMemo(() => {
    const dict = dictionaries[lang] || dictionaries.en;
    return (key) => dict[key] ?? dictionaries.en[key] ?? key;
  }, [lang]);

  const value = useMemo(() => ({ lang, t, setLang }), [lang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
