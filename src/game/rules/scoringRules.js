// Traditional 8-trick round scoring used by this engine.
// A normal 5-7 trick win = 1 cat.
// The team that did NOT choose trump gets 2 cats for a 5-7 win.
// Winning all 8 = 3 cats (Kapothi).
// A 4-4 round is a draw and awards no immediate cat.
//
// The "pending 4-4" mechanic can vary by local Oomi table rules, so it is
// represented explicitly in state and can be enabled/adjusted later.

export const DEFAULT_TARGET_CATS = 10;

export function countTricksByTeam(trickWinners) {
    return trickWinners.reduce(
        (counts, team) => {
            if (team === 0 || team === 1) counts[team] += 1;
            return counts;
        },
        [0, 0]
    );
}

export function scoreRound({ trickWinners, trumpChooserTeam }) {
    const [team0, team1] = countTricksByTeam(trickWinners);

    if (team0 === 4 && team1 === 4) {
        return {
            trickCounts: [team0, team1],
            winnerTeam: null,
            catsAwarded: [0, 0],
            result: "DRAW",
            kapothi: false,
        };
    }

    const winnerTeam = team0 > team1 ? 0 : 1;
    const winningTricks = Math.max(team0, team1);

    if (winningTricks === 8) {
        return {
            trickCounts: [team0, team1],
            winnerTeam,
            catsAwarded: winnerTeam === 0 ? [3, 0] : [0, 3],
            result: "KAPOTHI",
            kapothi: true,
        };
    }

    const winnerIsTrumpChooser = winnerTeam === trumpChooserTeam;
    const cats = winnerIsTrumpChooser ? 1 : 2;

    return {
        trickCounts: [team0, team1],
        winnerTeam,
        catsAwarded: winnerTeam === 0 ? [cats, 0] : [0, cats],
        result: "WIN",
        kapothi: false,
    };
}

export function isMatchOver(cats, targetCats = DEFAULT_TARGET_CATS) {
    return cats[0] >= targetCats || cats[1] >= targetCats;
}