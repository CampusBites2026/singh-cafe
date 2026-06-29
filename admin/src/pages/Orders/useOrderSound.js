import { useEffect, useRef, useCallback } from "react";

const useOrderSound = (soundUrl = "/sounds/order-alert.mp3") => {
  const audioRef = useRef(null);
  const loopRef = useRef(null);
  const isPlayingRef = useRef(false);

  const stopSound = useCallback(() => {
    if (loopRef.current) {
      clearInterval(loopRef.current);
      loopRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    isPlayingRef.current = false;
  }, []);

  const playOnce = useCallback(() => {
    const audio = new Audio(soundUrl);
    audioRef.current = audio;
    audio.play().catch((err) => {
      // Browser blocks autoplay until user interaction — silent fail
      console.warn("🔇 Sound blocked by browser:", err.message);
    });
  }, [soundUrl]);

  const startSound = useCallback(() => {
    // Don't stack multiple loops
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;

    playOnce();
    // Repeat every 5 seconds until stopped
    loopRef.current = setInterval(playOnce, 5000);
  }, [playOnce]);

  // Clean up on unmount
  useEffect(() => {
    return () => stopSound();
  }, [stopSound]);

  return { startSound, stopSound };
};

export default useOrderSound;
