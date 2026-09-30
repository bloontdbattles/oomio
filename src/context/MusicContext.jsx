import { createContext, useEffect, useRef, useState } from "react";
import bg1 from "../assets/music/background/background (1).mp3";
import bg2 from "../assets/music/background/background (2).mp3";
import bg3 from "../assets/music/background/background (3).mp3";
import bg4 from "../assets/music/background/background (4).mp3";
import bg5 from "../assets/music/background/background(5).mp3";
import { getMusicEnabled } from "../utils/localStorage";

const TRACKS = [bg1, bg2, bg3, bg4, bg5];

export const MusicContext = createContext({
  isPlaying: false,
  trackIndex: 0,
  nextTrack: () => {},
});

export function MusicProvider({ children }) {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.35;
    audioRef.current = audio;

    const handleEnded = () => {
      setTrackIndex((prev) => (prev + 1) % TRACKS.length);
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const enabled = getMusicEnabled();
    if (!enabled) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    audio.src = TRACKS[trackIndex];
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
          // Autoplay blocked by browser policy - resume audio on first user touch/click
          const handleFirstInteraction = () => {
            if (getMusicEnabled()) {
              audio.play().then(() => setIsPlaying(true)).catch(() => {});
            }
            window.removeEventListener("pointerdown", handleFirstInteraction);
            window.removeEventListener("keydown", handleFirstInteraction);
          };
          window.addEventListener("pointerdown", handleFirstInteraction);
          window.addEventListener("keydown", handleFirstInteraction);
        });
    }
  }, [trackIndex]);

  // Listen for settings toggles in localStorage or custom event
  useEffect(() => {
    const handleMusicChange = () => {
      const audio = audioRef.current;
      if (!audio) return;
      const enabled = getMusicEnabled();
      if (enabled) {
        if (audio.paused) {
          audio.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    };

    window.addEventListener("oomio_music_change", handleMusicChange);
    window.addEventListener("storage", handleMusicChange);
    return () => {
      window.removeEventListener("oomio_music_change", handleMusicChange);
      window.removeEventListener("storage", handleMusicChange);
    };
  }, []);

  const nextTrack = () => {
    setTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  return (
    <MusicContext.Provider value={{ isPlaying, trackIndex, nextTrack }}>
      {children}
    </MusicContext.Provider>
  );
}
