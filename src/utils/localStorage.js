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
const SOUND_VOL_KEY = "oomio_sound_volume";

export function getSoundEnabled() {
    const raw = localStorage.getItem(SOUND_KEY);
    return raw !== "false";
}

export function setSoundEnabled(enabled) {
    localStorage.setItem(SOUND_KEY, enabled ? "true" : "false");
    window.dispatchEvent(new CustomEvent("oomio_sound_change", { detail: enabled }));
}

export function getSoundVolume() {
    const raw = localStorage.getItem(SOUND_VOL_KEY);
    return raw !== null ? parseFloat(raw) : 0.8;
}

export function setSoundVolume(vol) {
    const clamped = Math.max(0, Math.min(1, vol));
    localStorage.setItem(SOUND_VOL_KEY, clamped.toString());
    window.dispatchEvent(new CustomEvent("oomio_sound_volume_change", { detail: clamped }));
}

const MUSIC_KEY = "oomio_music";
const MUSIC_VOL_KEY = "oomio_music_volume";

export function getMusicEnabled() {
    const raw = localStorage.getItem(MUSIC_KEY);
    return raw !== "false";
}

export function setMusicEnabled(enabled) {
    localStorage.setItem(MUSIC_KEY, enabled ? "true" : "false");
    window.dispatchEvent(new CustomEvent("oomio_music_change", { detail: enabled }));
}

export function getMusicVolume() {
    const raw = localStorage.getItem(MUSIC_VOL_KEY);
    return raw !== null ? parseFloat(raw) : 0.5;
}

export function setMusicVolume(vol) {
    const clamped = Math.max(0, Math.min(1, vol));
    localStorage.setItem(MUSIC_VOL_KEY, clamped.toString());
    window.dispatchEvent(new CustomEvent("oomio_music_volume_change", { detail: clamped }));
}