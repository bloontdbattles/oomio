import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { CardRainProvider } from "./context/CardRainContext";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Rules from "./pages/Rules";
import NotFound from "./pages/NotFound";
import "./App.css";

function App() {
  return (
    <LanguageProvider>
      <CardRainProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/player-setup" element={<Lobby />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/game" element={<Game />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CardRainProvider>
    </LanguageProvider>
  );
}

export default App;
