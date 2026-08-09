import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import Button from "../components/common/Button";
import logo from "../assets/images/logo.png";
import "./Home.css";

export default function Home() {
    const { t } = useContext(LanguageContext);
    const navigate = useNavigate();

    return (
        <div className="home">
            <div className="home__texture" aria-hidden="true" />
            <div className="home__vignette" aria-hidden="true" />

            <header className="home__top">
                <LanguageSwitcher />
            </header>

            <main className="home__hero">
                <div className="home__card-float" aria-hidden="true">
                    <span className="home__card-pip">♦</span>
                </div>

                <img src={logo} alt="Oomio" className="home__logo" />
                <h1 className="home__wordmark">OOMIO</h1>
                <p className="home__tagline">{t("tagline")}</p>

                <Button
                    className="home__cta"
                    onClick={() => navigate("/player-setup")}
                >
                    {t("playNow")}
                </Button>
            </main>

            <footer className="home__foot">
                <p>{t("footerNote")}</p>
            </footer>
        </div>
    );
}