import { useNavigate, Link } from "react-router-dom";
import SEO from "../components/common/SEO";
import "./Privacy.css";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="privacy-page">
      <SEO
        title="Privacy Policy - Oomio"
        description="Privacy Policy for Oomio web application. Learn how we handle player data, cookies, Google Analytics, and AdSense."
      />
      <div className="privacy-page__texture" aria-hidden="true" />
      <div className="privacy-page__vignette" aria-hidden="true" />

      <div className="privacy-page__topbar">
        <button type="button" className="privacy-page__back-btn" onClick={() => navigate("/")}>
          ← Back
        </button>
      </div>

      <div className="privacy-page__content">
        <h1 className="privacy-page__title">Privacy Policy</h1>
        <p className="privacy-page__subtitle">Last updated: October 4, 2026</p>

        <section className="privacy-page__card">
          <h2 className="privacy-page__section-title">1. Information We Collect</h2>
          <p className="privacy-page__text">
            Oomio ("we", "our", or "us") respects your privacy. We collect minimal information to provide you with a smooth multiplayer and singleplayer gaming experience:
          </p>
          <ul className="privacy-page__list">
            <li><strong>Player Name:</strong> The display name you enter is stored locally in your browser's LocalStorage and sent to Firebase Realtime Database during online multiplayer matches so opponents can see your seat.</li>
            <li><strong>Game Progress & Preferences:</strong> Sound settings, music settings, and temporary game room states.</li>
          </ul>
        </section>

        <section className="privacy-page__card">
          <h2 className="privacy-page__section-title">2. Google Analytics & Cookies</h2>
          <p className="privacy-page__text">
            We use Google Analytics (gtag.js) to understand website usage and traffic patterns. Google Analytics uses cookies to collect anonymous standard internet log information and visitor behavior data.
          </p>
        </section>

        <section className="privacy-page__card">
          <h2 className="privacy-page__section-title">3. Google AdSense & Third-Party Advertising</h2>
          <p className="privacy-page__text">
            We use Google AdSense to serve advertisements on our website. Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to Oomio and/or other sites on the Internet.
          </p>
          <p className="privacy-page__text">
            Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" style={{ color: "var(--oomio-gold)" }}>Google Ads Settings</a>.
          </p>
        </section>

        <section className="privacy-page__card">
          <h2 className="privacy-page__section-title">4. Real-time Multiplayer Data</h2>
          <p className="privacy-page__text">
            Multiplayer match rooms are hosted on Firebase Realtime Database. Active game room data (card plays, bids, player scores) is ephemeral and automatically deleted when room lobbies end.
          </p>
        </section>

        <section className="privacy-page__card">
          <h2 className="privacy-page__section-title">5. Contact Us</h2>
          <p className="privacy-page__text">
            If you have questions about this Privacy Policy, please contact the developer:
          </p>
          <p className="privacy-page__text">
            <strong>Kavinda Hasaranga</strong><br />
            Email: <a href="mailto:kavindahasaranga2003@gmail.com" style={{ color: "var(--oomio-gold)" }}>kavindahasaranga2003@gmail.com</a>
          </p>
        </section>

        <footer className="privacy-page__footer">
          <Link to="/" className="privacy-page__link">Home</Link>
          <Link to="/about" className="privacy-page__link">About</Link>
          <Link to="/rules" className="privacy-page__link">Rules</Link>
          <Link to="/terms" className="privacy-page__link">Terms of Service</Link>
        </footer>
      </div>
    </div>
  );
}
