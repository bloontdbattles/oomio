import { useNavigate, Link } from "react-router-dom";
import SEO from "../components/common/SEO";
import "./Terms.css";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="terms-page">
      <SEO
        title="Terms of Service - Oomio"
        description="Terms of Service and conditions of use for Oomio free online card game."
      />
      <div className="terms-page__texture" aria-hidden="true" />
      <div className="terms-page__vignette" aria-hidden="true" />

      <div className="terms-page__topbar">
        <button type="button" className="terms-page__back-btn" onClick={() => navigate("/")}>
          ← Back
        </button>
      </div>

      <div className="terms-page__content">
        <h1 className="terms-page__title">Terms of Service</h1>
        <p className="terms-page__subtitle">Last updated: October 4, 2026</p>

        <section className="terms-page__card">
          <h2 className="terms-page__section-title">1. Acceptance of Terms</h2>
          <p className="terms-page__text">
            By accessing or playing Oomio ("the Website"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Website.
          </p>
        </section>

        <section className="terms-page__card">
          <h2 className="terms-page__section-title">2. Free Entertainment Service</h2>
          <p className="terms-page__text">
            Oomio is a free-to-play card game provided strictly for entertainment purposes. No real money, gambling, or monetary wagers are involved or permitted within the game.
          </p>
        </section>

        <section className="terms-page__card">
          <h2 className="terms-page__section-title">3. User Conduct</h2>
          <p className="terms-page__text">
            When participating in online multiplayer lobbies, users agree to choose respectful player names and refrain from abusive, offensive, or disruptive behavior.
          </p>
        </section>

        <section className="terms-page__card">
          <h2 className="terms-page__section-title">4. Intellectual Property</h2>
          <p className="terms-page__text">
            All custom artwork, code, animations, and game design elements of Oomio belong to Kavinda Hasaranga. You may not copy, re-distribute, or commercialize assets without permission.
          </p>
        </section>

        <section className="terms-page__card">
          <h2 className="terms-page__section-title">5. Contact Information</h2>
          <p className="terms-page__text">
            For questions regarding these Terms, contact:<br />
            <strong>Kavinda Hasaranga</strong><br />
            Email: <a href="mailto:kavindahasaranga2003@gmail.com" style={{ color: "var(--oomio-gold)" }}>kavindahasaranga2003@gmail.com</a>
          </p>
        </section>

        <footer className="terms-page__footer">
          <Link to="/" className="terms-page__link">Home</Link>
          <Link to="/about" className="terms-page__link">About</Link>
          <Link to="/rules" className="terms-page__link">Rules</Link>
          <Link to="/privacy" className="terms-page__link">Privacy Policy</Link>
        </footer>
      </div>
    </div>
  );
}
