import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";

export default function NotFound() {
  const { t } = useContext(LanguageContext);

  return (
    <div style={{ padding: "40px", textAlign: "center", color: "var(--oomio-cream)" }}>
      <h1>404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
}
