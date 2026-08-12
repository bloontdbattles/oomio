import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";

export default function Lobby() {
  const { t } = useContext(LanguageContext);

  return (
    <div style={{ padding: "40px", textAlign: "center", color: "var(--oomio-cream)" }}>
      <h1>{t("lobby") || "Lobby / Player Setup"}</h1>
      <p>Lobby screen placeholder.</p>
    </div>
  );
}
