import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import SEO from "../components/common/SEO";

export default function NotFound() {
  const { t } = useContext(LanguageContext);

  return (
    <div style={{ padding: "40px", textAlign: "center", color: "var(--oomio-cream)" }}>
      <SEO 
        title="404 - Page Not Found | Oomio" 
        description="The requested page could not be found on Oomio." 
      />
      <h1>404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
}
