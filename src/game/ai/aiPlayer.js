import { chooseCard } from "./aiStrategy.js";
import { chooseTrump } from "./aiBidding.js";

export function getAICard({ state, seat, difficulty }) {
    return chooseCard({ state, mySeat: seat, difficulty });
}

export function getAITrump({ state, seat }) {
    const player = state.players.find((p) => p.seat === seat);
    if (!player) throw new Error(`Unknown AI seat ${seat}`);
    return chooseTrump(player.hand);
}