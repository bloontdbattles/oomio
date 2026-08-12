import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";

export default function Rules() {
  const { t } = useContext(LanguageContext);

  return (
    <div style={{ padding: "40px", textAlign: "center", color: "var(--oomio-cream)" }}>
      <h1>{t("rules") || "Rules"}</h1>
      <p>Rules page placeholder.</p>
    </div>
  );
}
