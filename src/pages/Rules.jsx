import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import SEO from "../components/common/SEO";

export default function Rules() {
  const { t } = useContext(LanguageContext);

  return (
    <div style={{ padding: "40px", textAlign: "center", color: "var(--oomio-cream)" }}>
      <SEO 
        title="Game Rules - Oomio" 
        description="Official game rules and instructions for playing Oomio trick-taking card game." 
      />
      <h1>{t("rules") || "Rules"}</h1>
      <p>Rules page placeholder.</p>
    </div>
  );
}
