import { createContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import bg1 from "../assets/music/background/background (1).mp3";
import bg2 from "../assets/music/background/background (2).mp3";
import bg3 from "../assets/music/background/background (3).mp3";
import bg4 from "../assets/music/background/background (4).mp3";
import bg5 from "../assets/music/background/background(5).mp3";
import { getMusicEnabled, getMusicVolume } from "../utils/localStorage";

const TRACKS = [bg1, bg2, bg3, bg4, bg5];

// Module-level singleton Audio object to guarantee ONLY 1 track can ever play at once
const globalAudio = new Audio();
globalAudio.volume = getMusicVolume();

export const MusicContext = createContext({
  isPlaying: false,
  trackIndex: 0,
  nextTrack: () => {},
});

export function MusicProvider({ children }) {
  const location = useLocation();
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const isGameRoute = location.pathname === "/game";

  // Track ended handler -> advance to next song
  useEffect(() => {
    const handleEnded = () => {
      setTrackIndex((prev) => (prev + 1) % TRACKS.length);
    };

    globalAudio.addEventListener("ended", handleEnded);
    return () => {
      globalAudio.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Main playback manager
  useEffect(() => {
    const enabled = getMusicEnabled();

    // ONLY play background music when user is actively playing the game (/game route)
    if (!isGameRoute || !enabled) {
      if (!globalAudio.paused) {
        globalAudio.pause();
        globalAudio.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }

    // Update track source if index changed
    const targetSrc = TRACKS[trackIndex];
    const currentSrc = globalAudio.src ? new URL(globalAudio.src, window.location.href).pathname : "";
    const targetPath = new URL(targetSrc, window.location.href).pathname;

    if (currentSrc !== targetPath) {
      globalAudio.pause();
      globalAudio.currentTime = 0;
      globalAudio.src = targetSrc;
    }

    let isCancelled = false;
    globalAudio
      .play()
      .then(() => {
        if (!isCancelled) setIsPlaying(true);
      })
      .catch(() => {
        if (!isCancelled) setIsPlaying(false);
        // Autoplay blocked by browser policy: play on first user interaction on /game
        const handleUserInteraction = () => {
          if (window.location.pathname === "/game" && getMusicEnabled() && globalAudio.paused) {
            globalAudio.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        };
        window.addEventListener("click", handleUserInteraction, { once: true });
        window.addEventListener("touchstart", handleUserInteraction, { once: true });
      });

    return () => {
      isCancelled = true;
    };
  }, [trackIndex, isGameRoute]);

  // Listen for settings toggles in SettingsModal
  useEffect(() => {
    const handleMusicChange = () => {
      const enabled = getMusicEnabled();
      if (location.pathname === "/game" && enabled) {
        if (globalAudio.paused) {
          globalAudio.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      } else {
        if (!globalAudio.paused) {
          globalAudio.pause();
          globalAudio.currentTime = 0;
        }
        setIsPlaying(false);
      }
    };

    const handleVolumeChange = () => {
      globalAudio.volume = getMusicVolume();
    };

    window.addEventListener("oomio_music_change", handleMusicChange);
    window.addEventListener("oomio_music_volume_change", handleVolumeChange);
    window.addEventListener("storage", handleMusicChange);
    return () => {
      window.removeEventListener("oomio_music_change", handleMusicChange);
      window.removeEventListener("oomio_music_volume_change", handleVolumeChange);
      window.removeEventListener("storage", handleMusicChange);
    };
  }, [location.pathname]);

  const nextTrack = () => {
    setTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  return (
    <MusicContext.Provider value={{ isPlaying, trackIndex, nextTrack }}>
      {children}
    </MusicContext.Provider>
  );
}
