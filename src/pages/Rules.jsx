import { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import SEO from "../components/common/SEO";
import Button from "../components/common/Button";
import "./Rules.css";

export default function Rules() {
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();

  return (
    <div className="rules-page">
      <SEO
        title="Official Game Rules & How to Play - Oomio"
        description="Master Oomio trick-taking card game! Learn the bidding phase, trump suit selection, card values, partnership scoring, and winning strategies."
      />
      <div className="rules-page__texture" aria-hidden="true" />
      <div className="rules-page__vignette" aria-hidden="true" />

      {/* Top Bar */}
      <div className="rules-page__topbar">
        <button
          type="button"
          className="rules-page__back-btn"
          onClick={() => navigate("/")}
        >
          ← {t("back") || "Back"}
        </button>
      </div>

      {/* Main Content */}
      <div className="rules-page__content">
        <header className="rules-page__header">
          <h1 className="rules-page__title">Official Oomio Rules & Guide</h1>
          <p className="rules-page__subtitle">
            Everything you need to know about bidding, trick-taking, scoring, and winning in Oomio.
          </p>
        </header>

        {/* Section 1: Overview */}
        <section className="rules-page__card">
          <h2 className="rules-page__section-title">♠️ 1. Overview & Objective</h2>
          <p className="rules-page__text">
            Oomio is a traditional 4-player trick-taking card game played in two fixed partnerships (Red Team vs. Blue Team). Players sitting opposite each other are teammates.
          </p>
          <p className="rules-page__text">
            The main goal of each round is for your partnership to reach your bid target by winning tricks containing valuable cards, or to defend against the opponent team's bid.
          </p>
        </section>

        {/* Section 2: Deck & Card Values */}
        <section className="rules-page__card">
          <h2 className="rules-page__section-title">🃏 2. The Deck & Card Values</h2>
          <p className="rules-page__text">
            Oomio uses a reduced deck of 32 cards (4 suits: Spades, Hearts, Diamonds, Clubs). In each suit, cards carry specific point values:
          </p>
          <div className="rules-page__grid">
            <div className="rules-page__mini-card">
              <div className="rules-page__mini-title">Ace (A)</div>
              <div>Highest rank, worth 1 Point</div>
            </div>
            <div className="rules-page__mini-card">
              <div className="rules-page__mini-title">King (K)</div>
              <div>2nd highest, worth 1 Point</div>
            </div>
            <div className="rules-page__mini-card">
              <div className="rules-page__mini-title">Queen (Q)</div>
              <div>3rd highest, worth 1 Point</div>
            </div>
            <div className="rules-page__mini-card">
              <div className="rules-page__mini-title">Jack (J)</div>
              <div>4th highest, worth 1 Point</div>
            </div>
            <div className="rules-page__mini-card">
              <div className="rules-page__mini-title">10, 9, 8, 7</div>
              <div>Lower ranks, worth 0 Points</div>
            </div>
          </div>
        </section>

        {/* Section 3: Bidding & Trump Selection */}
        <section className="rules-page__card">
          <h2 className="rules-page__section-title">👑 3. Bidding Phase & Trump Selection</h2>
          <ul className="rules-page__list">
            <li><strong>Bidding:</strong> Each player evaluates their hand and places a bid representing the minimum number of tricks their team promises to win.</li>
            <li><strong>Winning Bidder:</strong> The player with the highest bid becomes the <em>Trump Picker</em>.</li>
            <li><strong>Trump Selection:</strong> The Trump Picker chooses the Trump Suit (Spades ♠, Hearts ♥, Diamonds ♦, or Clubs ♣). Trump cards beat any non-trump card regardless of rank.</li>
          </ul>
        </section>

        {/* Section 4: Trick Play */}
        <section className="rules-page__card">
          <h2 className="rules-page__section-title">🎯 4. Gameplay & Trick Rules</h2>
          <ul className="rules-page__list">
            <li><strong>Leading:</strong> The Trump Picker leads the first trick by playing any card.</li>
            <li><strong>Following Suit:</strong> Other players must follow the led suit if they have cards of that suit.</li>
            <li><strong>Trump Advantage:</strong> If a player cannot follow suit, they may play a Trump card to cut and win the trick, or discard a non-trump card.</li>
            <li><strong>Trick Winner:</strong> The highest Trump played wins the trick. If no Trump is played, the highest card of the led suit wins. The trick winner leads the next trick.</li>
          </ul>
        </section>

        {/* Section 5: Scoring & Winning */}
        <section className="rules-page__card">
          <h2 className="rules-page__section-title">🏆 5. Scoring & Winning the Match</h2>
          <p className="rules-page__text">
            At the end of each round (8 tricks), tricks are counted:
          </p>
          <ul className="rules-page__list">
            <li><strong>Bid Achieved:</strong> If the bidding team wins tricks equal to or exceeding their bid, they score points matching their bid.</li>
            <li><strong>Bid Failed (Under-bid):</strong> If the bidding team fails to meet their bid, the penalty points are awarded to the defending team.</li>
            <li><strong>Match Winner:</strong> The first team to reach the target match score (e.g., 100 points) wins the match!</li>
          </ul>
        </section>

        {/* Section 6: Game Modes */}
        <section className="rules-page__card">
          <h2 className="rules-page__section-title">🎮 6. Singleplayer AI & Online Multiplayer</h2>
          <p className="rules-page__text">
            Oomio offers two game modes:
          </p>
          <ul className="rules-page__list">
            <li><strong>Singleplayer AI Mode:</strong> Practice offline against intelligent AI bots with realistic bidding and card play logic.</li>
            <li><strong>Online Multiplayer Mode:</strong> Create private room lobbies with custom codes, invite friends, configure bot seats, and play real-time matches over Firebase.</li>
          </ul>
        </section>

        <footer className="rules-page__footer">
          <div className="rules-page__links">
            <Link to="/" className="rules-page__link">Home</Link>
            <Link to="/about" className="rules-page__link">About</Link>
            <Link to="/privacy" className="rules-page__link">Privacy Policy</Link>
            <Link to="/terms" className="rules-page__link">Terms of Service</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

