import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { CardRainProvider } from "./context/CardRainContext";
import { MusicProvider } from "./context/MusicContext";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Rules from "./pages/Rules";
import GameMode from "./pages/GameMode";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import "./App.css";

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <MusicProvider>
          <CardRainProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/game-mode" element={<GameMode />} />
              <Route path="/player-setup" element={<Lobby />} />
              <Route path="/lobby" element={<Lobby />} />
              <Route path="/game" element={<Game />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CardRainProvider>
        </MusicProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
