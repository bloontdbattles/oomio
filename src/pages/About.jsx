import { useNavigate } from "react";
import Button from "../components/common/Button";

export default function About() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", color: "var(--oomio-cream)", textAlign: "center", minHeight: "100vh", background: "var(--oomio-green-950)" }}>
      <h1>About Oomio</h1>
      <p>Content coming soon...</p>
      <Button onClick={() => navigate("/")} style={{ marginTop: "20px" }}>
        Back to Home
      </Button>
    </div>
  );
}
