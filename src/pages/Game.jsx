import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";

export default function Game() {
  const { t } = useContext(LanguageContext);

  return (
    <div style={{ padding: "40px", textAlign: "center", color: "var(--oomio-cream)" }}>
      <h1>{t("game") || "Game Table"}</h1>
      <p>Game page placeholder.</p>
    </div>
  );
}
