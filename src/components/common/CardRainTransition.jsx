import { useMemo } from "react";
import PlayingCard from "../game/PlayingCard";
import "./CardRainTransition.css";

const CARD_COUNT = 18;
const RANKS = ["7", "8", "9", "10", "J", "Q", "K", "A"];
const SUITS = ["clubs", "diamonds", "hearts", "spades"];

export default function CardRainTransition() {
  const cards = useMemo(
    () =>
      Array.from({ length: CARD_COUNT }, (_, i) => ({
        id: i,
        rank: RANKS[Math.floor(Math.random() * RANKS.length)],
        suit: SUITS[Math.floor(Math.random() * SUITS.length)],
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 0.9 + Math.random() * 0.4,
        rotate: (Math.random() - 0.5) * 70,
        scale: 0.55 + Math.random() * 0.3,
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
        >
          <PlayingCard rank={c.rank} suit={c.suit} />
        </div>
      ))}
    </div>
  );
}