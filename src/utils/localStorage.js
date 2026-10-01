const PLAYER_KEY = "oomio_player";

export function savePlayer(playerData) {
    if (!playerData) return null;
    const existing = getPlayer() || {};
    const updated = {
        playerId: playerData.playerId || existing.playerId,
        name: (typeof playerData === "string" ? playerData : playerData.name || "").trim(),
    };
    localStorage.setItem(PLAYER_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("oomio_player_change", { detail: updated }));
    return updated;
}

export function getPlayer() {
    const raw = localStorage.getItem(PLAYER_KEY);
    return raw ? JSON.parse(raw) : null;
}

export function clearPlayer() {
    localStorage.removeItem(PLAYER_KEY);
}

const SOUND_KEY = "oomio_sound";

export function getSoundEnabled() {
    const raw = localStorage.getItem(SOUND_KEY);
    return raw !== "false";
}

export function setSoundEnabled(enabled) {
    localStorage.setItem(SOUND_KEY, enabled ? "true" : "false");
}

const MUSIC_KEY = "oomio_music";

export function getMusicEnabled() {
    const raw = localStorage.getItem(MUSIC_KEY);
    return raw !== "false";
}

export function setMusicEnabled(enabled) {
    localStorage.setItem(MUSIC_KEY, enabled ? "true" : "false");
    window.dispatchEvent(new CustomEvent("oomio_music_change", { detail: enabled }));
}