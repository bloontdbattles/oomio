import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { useCardRain } from "../context/CardRainContext";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import { generateId } from "../utils/generateId";
import { savePlayer } from "../utils/localStorage";
import logo from "../assets/images/logo.png";
import "./Home.css";

const TRANSITION_MS = 1100;

export default function Home() {
    const { t } = useContext(LanguageContext);
    const navigate = useNavigate();
    const playCardRain = useCardRain();

    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [name, setName] = useState("");

    const handlePlayNow = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setModalOpen(true);
            // intentionally keep isTransitioning=true so the stage
            // stays zoomed and the logo stays fallen while modal is open
        }, TRANSITION_MS);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setIsTransitioning(false); // un-zoom stage when user dismisses
    };

    const handleContinue = () => {
        const trimmed = name.trim();
        if (!trimmed) return;

        savePlayer({ playerId: generateId("p"), name: trimmed });
        setModalOpen(false);

        playCardRain(() => navigate("/game-mode"));
    };

    return (
        <div className={`home${isTransitioning ? " home--transitioning" : ""}`}>
            <div className="home__stage">
                <div className="home__texture" aria-hidden="true" />
                <div className="home__vignette" aria-hidden="true" />

                <div className="home__content">
                    <header className="home__top">
                        <button
                            type="button"
                            className="home__about-btn"
                            onClick={() => navigate("/about")}
                        >
                            {t("about")}
                        </button>
                        <LanguageSwitcher />
                    </header>

                    <main className="home__hero">
                        <div className="home__logo-wrap">
                            <img src={logo} alt="Oomio" className="home__logo" />
                        </div>
                        <p className="home__tagline">{t("tagline")}</p>

                        <Button
                            className="home__cta"
                            onClick={handlePlayNow}
                            disabled={isTransitioning}
                        >
                            {t("playNow")}
                        </Button>
                    </main>

                    <footer className="home__foot">
                        <p>{t("footerNote")}</p>
                    </footer>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleModalClose}>
                <div className="home__modal-body">
                    <h2 className="home__modal-title">{t("enterYourName")}</h2>
                    <input
                        id="player-name-input"
                        className="home__modal-input"
                        type="text"
                        placeholder={t("enterYourName")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                        autoFocus
                        maxLength={24}
                    />
                    <Button
                        className="home__modal-cta"
                        onClick={handleContinue}
                        disabled={!name.trim()}
                    >
                        {t("continue")}
                    </Button>
                </div>
            </Modal>
        </div>
    );
}