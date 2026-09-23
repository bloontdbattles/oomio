import { get, set, update, remove, onValue, runTransaction } from "firebase/database";
import { lobbyRef, lobbyPathRef } from "./database";
import { generateRoomCode } from "../utils/generateRoomCode";

const MAX_CODE_ATTEMPTS = 5;

async function findUnusedCode() {
    for (let i = 0; i < MAX_CODE_ATTEMPTS; i++) {
        const code = generateRoomCode();
        const snap = await get(lobbyRef(code));
        if (!snap.exists()) return code;
    }
    throw new Error("Could not generate a free lobby code - try again.");
}

/**
 * Creates a new lobby, seats the host in red/slot 0, and returns the
 * generated room code.
 */
export async function createLobby({ hostId, hostName, timerEnabled, timerSeconds }) {
    const code = await findUnusedCode();

    await set(lobbyRef(code), {
        createdAt: Date.now(),
        hostId,
        status: "waiting",
        settings: {
            timerEnabled,
            timerSeconds: timerEnabled ? timerSeconds : null,
        },
        teams: {
            red: { 0: { id: hostId, name: hostName, isHost: true } },
            blue: {},
        },
    });

    return code;
}

export async function lobbyExists(code) {
    const snap = await get(lobbyRef(code));
    return snap.exists();
}

/**
 * Subscribes to live updates for a lobby. Calls `callback` with the full
 * lobby object every time anything changes (a player joins, a bot gets
 * added, etc), or `null` if the lobby doesn't exist / was deleted.
 * Returns an unsubscribe function - call it on unmount.
 */
export function subscribeToLobby(code, callback) {
    return onValue(lobbyRef(code), (snap) => {
        callback(snap.exists() ? snap.val() : null);
    });
}

/**
 * Seats a player in a specific empty slot. Uses a transaction so two
 * people tapping the same empty seat at the same time can't both win it.
 * Returns true if the seat was actually claimed.
 */
export async function seatPlayer(code, team, slotIndex, player) {
    const result = await runTransaction(
        lobbyPathRef(code, `teams/${team}/${slotIndex}`),
        (current) => {
            if (current) return; // already taken - abort without overwriting
            return player;
        }
    );
    return result.committed;
}

export async function addBot(code, team, slotIndex, botName) {
    let nameStr = "Oomi Bot";
    if (typeof botName === "string" && botName.trim()) {
        nameStr = botName;
    }
    return seatPlayer(code, team, slotIndex, {
        id: `bot-${Math.random().toString(36).slice(2, 8)}`,
        name: nameStr,
        isBot: true,
    });
}

export async function removePlayer(code, team, slotIndex) {
    await remove(lobbyPathRef(code, `teams/${team}/${slotIndex}`));
}

export async function movePlayerToTeam(code, fromTeam, fromIndex, toTeam, toIndex, player) {
    await update(lobbyRef(code), {
        [`teams/${fromTeam}/${fromIndex}`]: null,
        [`teams/${toTeam}/${toIndex}`]: player,
    });
}

export async function startGame(code) {
    await update(lobbyRef(code), { status: "playing" });
}