import { useMemo } from "react";
import "./CardRainTransition.css";

const CARD_COUNT = 16;

export default function CardRainTransition() {
  const cards = useMemo(
    () =>
      Array.from({ length: CARD_COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.35,
        duration: 0.85 + Math.random() * 0.3,
        rotate: (Math.random() - 0.5) * 60,
        scale: 0.7 + Math.random() * 0.35,
      })),
    []
  );

  return (
    <div className="card-rain" aria-hidden="true">
      {cards.map((c) => (
        <div
          key={c.id}
          className="card-rain__card"
          style={{
            left: `${c.left}%`,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
            "--rotate": `${c.rotate}deg`,
            "--scale": c.scale,
          }}
        />
      ))}
    </div>
  );
}