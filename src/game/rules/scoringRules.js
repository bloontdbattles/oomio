// Real Oomi scoring system.
//
// There are 20 "point cards" (2,3,4,5,6 of each of the 4 suits) that form a
// point pool. Each round, the team that wins more tricks earns 1 point from
// the pool. A 4-4 draw gives 1 point to EACH team from the pool.
//
// The first team to accumulate 11 or more points wins the MATCH.
// The pool is shared — both teams drawing continuously will eventually push
// one of them to 11 (10 draws = 20 points, each team 10, then next round
// breaks the tie).

export const DEFAULT_TARGET_POINTS = 11;

export function countTricksByTeam(trickWinners) {
    return trickWinners.reduce(
        (counts, team) => {
            if (team === 0 || team === 1) counts[team] += 1;
            return counts;
        },
        [0, 0]
    );
}

/**
 * Score a completed round.
 *
 * Returns:
 *   trickCounts    — [team0Tricks, team1Tricks]
 *   winnerTeam     — 0 | 1 | null (draw)
 *   pointsAwarded  — [team0Points, team1Points]  (each 0 or 1)
 *   result         — "WIN" | "DRAW"
 */
export function scoreRound({ trickWinners }) {
    const [team0, team1] = countTricksByTeam(trickWinners);

    // 4-4 draw: each team earns 1 point
    if (team0 === team1) {
        return {
            trickCounts: [team0, team1],
            winnerTeam: null,
            pointsAwarded: [1, 1],
            result: "DRAW",
        };
    }

    // One team won more tricks: that team earns 1 point
    const winnerTeam = team0 > team1 ? 0 : 1;
    return {
        trickCounts: [team0, team1],
        winnerTeam,
        pointsAwarded: winnerTeam === 0 ? [1, 0] : [0, 1],
        result: "WIN",
    };
}

/**
 * Check if a team has reached the 11-point target (match is over).
 */
export function isMatchOver(points, targetPoints = DEFAULT_TARGET_POINTS) {
    return points[0] >= targetPoints || points[1] >= targetPoints;
}