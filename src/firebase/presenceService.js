import { ref, onValue, onDisconnect, set } from "firebase/database";
import { db } from "./config";

/**
 * Marks a player as "present" in a lobby, and automatically removes that
 * marker if their connection drops (closed tab, lost signal, app killed)
 * without them explicitly leaving. Uses Firebase's built-in ".info/connected"
 * signal, which is the standard way to detect real disconnects.
 *
 * Returns an unsubscribe function - call it when the component unmounts
 * or the player deliberately leaves the lobby.
 */
export function trackPresence(code, playerId) {
    const connectedRef = ref(db, ".info/connected");
    const presenceRef = ref(db, `lobbies/${code}/presence/${playerId}`);

    return onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
            onDisconnect(presenceRef).remove();
            set(presenceRef, true);
        }
    });
}