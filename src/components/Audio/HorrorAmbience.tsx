import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';

const HORROR_AMBIENCE_TRACKS = [
  '/dragon-studio-dark-horror-ambient-01-425461.mp3',
  '/dragon-studio-dark-horror-ambient-03-425466.mp3',
  '/dragon-studio-dark-horror-ambient-04-425467.mp3',
  '/dragon-studio-dark-horror-ambient-05-425468.mp3',
];

// Min/Max random intervals between ambient cues (in milliseconds)
const MIN_INTERVAL_MS = 20000; // 20 seconds
const MAX_INTERVAL_MS = 45000; // 45 seconds
const INITIAL_DELAY_MS = 8000;  // 8 seconds after entering game

export const HorrorAmbience: React.FC = () => {
  const { appState, activePuzzleId } = useGameStore();
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastIndexRef = useRef<number>(-1);
  const isPlayingRef = useRef<boolean>(false);

  useEffect(() => {
    const getStoredVolume = (): number => {
      if (typeof window === 'undefined') return 0.4;
      const vol = window.localStorage.getItem('schrodinger-abyss-bgm-vol');
      return vol !== null ? Math.max(0, Math.min(1, parseFloat(vol))) : 0.4;
    };

    const getIsMuted = (): boolean => {
      if (typeof window === 'undefined') return false;
      return window.localStorage.getItem('schrodinger-abyss-bgm-muted') === 'true';
    };

    const scheduleNext = (customDelayMs?: number) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (useGameStore.getState().appState !== 'PLAYING') return;

      const delay =
        customDelayMs !== undefined
          ? customDelayMs
          : MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);

      timerRef.current = setTimeout(() => {
        playRandomAmbience();
      }, delay);
    };

    const playRandomAmbience = () => {
      if (useGameStore.getState().appState !== 'PLAYING' || isPlayingRef.current) return;
      if (getIsMuted()) {
        scheduleNext();
        return;
      }

      // Pick a random track avoiding the last played track
      let nextIndex: number;
      do {
        nextIndex = Math.floor(Math.random() * HORROR_AMBIENCE_TRACKS.length);
      } while (HORROR_AMBIENCE_TRACKS.length > 1 && nextIndex === lastIndexRef.current);

      lastIndexRef.current = nextIndex;
      const trackSrc = HORROR_AMBIENCE_TRACKS[nextIndex];

      try {
        const audio = new Audio(trackSrc);
        const volume = getStoredVolume();
        audio.volume = volume;
        currentAudioRef.current = audio;
        isPlayingRef.current = true;

        audio.onended = () => {
          isPlayingRef.current = false;
          currentAudioRef.current = null;
          scheduleNext();
        };

        audio.onerror = (err) => {
          console.warn('Ambience audio failed to load or play:', err);
          isPlayingRef.current = false;
          currentAudioRef.current = null;
          scheduleNext();
        };

        audio.play().catch((err) => {
          console.warn('Autoplay blocked ambience sound:', err);
          isPlayingRef.current = false;
          currentAudioRef.current = null;
          scheduleNext();
        });
      } catch (err) {
        console.warn('Error creating audio element:', err);
        scheduleNext();
      }
    };

    if (appState === 'PLAYING') {
      scheduleNext(INITIAL_DELAY_MS);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = '';
        currentAudioRef.current = null;
      }
      isPlayingRef.current = false;
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = '';
        currentAudioRef.current = null;
      }
      isPlayingRef.current = false;
    };
  }, [appState]);

  // Contextual trigger: when entering a puzzle, trigger spooky ambience if idle
  useEffect(() => {
    if (activePuzzleId && appState === 'PLAYING' && !isPlayingRef.current) {
      if (Math.random() > 0.4 && currentAudioRef.current === null) {
        const audio = new Audio(HORROR_AMBIENCE_TRACKS[0]);
        audio.volume = 0.3;
        currentAudioRef.current = audio;
        isPlayingRef.current = true;
        audio.onended = () => {
          isPlayingRef.current = false;
          currentAudioRef.current = null;
        };
        audio.play().catch(() => {
          isPlayingRef.current = false;
          currentAudioRef.current = null;
        });
      }
    }
  }, [activePuzzleId, appState]);

  // Pure audio manager - renders no UI
  return null;
};
