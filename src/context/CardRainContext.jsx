import { createContext, useContext, useState, useCallback } from "react";
import CardRainTransition from "../components/common/CardRainTransition";

const CardRainContext = createContext(() => { });
const RAIN_MS = 1300;

export function CardRainProvider({ children }) {
    const [isRaining, setIsRaining] = useState(false);

    const playCardRain = useCallback((onComplete) => {
        setIsRaining(true);
        window.setTimeout(() => {
            onComplete?.();
            window.setTimeout(() => setIsRaining(false), 250);
        }, RAIN_MS);
    }, []);

    return (
        <CardRainContext.Provider value={playCardRain}>
            {children}
            {isRaining && <CardRainTransition />}
        </CardRainContext.Provider>
    );
}

export function useCardRain() {
    return useContext(CardRainContext);
}