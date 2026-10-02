import { getSoundEnabled } from "./localStorage";
import sound1Url from "../assets/music/sounds/sound1.mp3";
import sound2Url from "../assets/music/sounds/sound2.mp3";
import sound3Url from "../assets/music/sounds/sound3.mp3";

const audio1 = typeof window !== "undefined" ? new Audio(sound1Url) : null;
const audio2 = typeof window !== "undefined" ? new Audio(sound2Url) : null;
const audio3 = typeof window !== "undefined" ? new Audio(sound3Url) : null;

function playAudio(audioObj) {
  if (!getSoundEnabled() || !audioObj) return;
  try {
    audioObj.currentTime = 0;
    audioObj.play().catch((err) => {
      console.debug("Audio play blocked or failed:", err);
    });
  } catch (e) {
    // Ignore audio play errors
  }
}

export function playSound1() {
  playAudio(audio1);
}

export function playSound2() {
  playAudio(audio2);
}

export function playSound3() {
  playAudio(audio3);
}
