const PLAYER_KEY = "oomio_player";

export function savePlayer(player) {
    localStorage.setItem(PLAYER_KEY, JSON.stringify(player));
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