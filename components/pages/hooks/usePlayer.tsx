import { useEffect, useRef, useState } from 'react';

interface PlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  isStopped: boolean;
  currentUrl: string | null;
}

interface UsePlayer {
  playerState: PlayerState;
  play: (url: string) => void;
  pause: () => void;
  stop: () => void;
  resume: () => void;
}

const usePlayer = (): UsePlayer => {
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    isPaused: false,
    isStopped: true,
    currentUrl: null,
  });

  const audioRef = useRef<HTMLAudioElement>(new Audio());

  useEffect(() => {
    const handleEnded = () => {
      setPlayerState((prevState) => ({
        ...prevState,
        isPlaying: false,
        isPaused: false,
        isStopped: true,
      }));
    };

    const audio = audioRef.current;
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const play = (url: string) => {
    if (audioRef.current.src !== url) {
      audioRef.current.src = url;
    }
    audioRef.current.play();
    setPlayerState({
      isPlaying: true,
      isPaused: false,
      isStopped: false,
      currentUrl: url,
    });
  };

  const pause = () => {
    if (audioRef.current && playerState.isPlaying) {
      audioRef.current.pause();
      setPlayerState((prevState) => ({
        ...prevState,
        isPlaying: false,
        isPaused: true,
      }));
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayerState((prevState) => ({
        ...prevState,
        isPlaying: false,
        isPaused: false,
        isStopped: true,
        currentUrl: null,
      }));
    }
  };

  const resume = () => {
    if (audioRef.current && playerState.isPaused) {
      audioRef.current.play();
      setPlayerState((prevState) => ({
        ...prevState,
        isPlaying: true,
        isPaused: false,
      }));
    }
  };

  return {
    playerState,
    play,
    pause,
    stop,
    resume,
  };
};

export default usePlayer;
