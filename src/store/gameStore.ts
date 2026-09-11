import { create } from 'zustand';
import type { Puzzle } from '../data/puzzles';
import { puzzles as defaultPuzzles } from '../data/puzzles';
import { domainSpecificPuzzles } from '../data/domainPuzzles';
import { TOTAL_LEVELS } from '../data/levels';
import { ACHIEVEMENTS, type Achievement } from '../data/achievements';
import { playAchievementJingle, playFlashlightToggle } from '../utils/soundEffects';

const PROGRESS_STORAGE_KEY = 'abyss-progress-v1';
const ACHIEVEMENTS_STORAGE_KEY = 'abyss-achievements-v1';
const BEST_TIMES_STORAGE_KEY = 'abyss-best-times-v1';

interface StoredProgress {
  completedLevels: number[];
  unlockedLevel: number;
}

function loadProgress(): StoredProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return { completedLevels: [], unlockedLevel: 1 };
    const parsed = JSON.parse(raw);
    return {
      completedLevels: Array.isArray(parsed.completedLevels) ? parsed.completedLevels : [],
      unlockedLevel: typeof parsed.unlockedLevel === 'number' ? parsed.unlockedLevel : 1,
    };
  } catch {
    return { completedLevels: [], unlockedLevel: 1 };
  }
}

function saveProgress(progress: StoredProgress) {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore in private mode
  }
}

function loadAchievements(): string[] {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAchievements(list: string[]) {
  try {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

function loadBestTimes(): Record<number, number> {
  try {
    const raw = localStorage.getItem(BEST_TIMES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveBestTimes(times: Record<number, number>) {
  try {
    localStorage.setItem(BEST_TIMES_STORAGE_KEY, JSON.stringify(times));
  } catch {}
}

const initialProgress = loadProgress();

interface GameState {
  hoveredObject: string | null;
  setHoveredObject: (name: string | null) => void;
  inventory: string[];
  addToInventory: (item: string) => void;
  removeFromInventory: (item: string) => void;
  hasItem: (item: string) => boolean;
  message: string | null;
  setMessage: (msg: string | null) => void;
  activePuzzleId: number | null;
  setActivePuzzle: (id: number | null) => void;
  dynamicPuzzles: Record<number, Puzzle>;
  setDynamicPuzzle: (id: number, puzzle: Puzzle) => void;
  puzzleSources: Record<number, 'gemini' | 'curated'>;
  setPuzzleSource: (id: number, source: 'gemini' | 'curated') => void;
  isGeneratingPuzzle: boolean;
  setIsGeneratingPuzzle: (val: boolean) => void;
  escaped: boolean;
  setEscaped: (val: boolean) => void;
  bookModalOpen: boolean;
  setBookModalOpen: (val: boolean) => void;
  appState: 'LANDING' | 'DOMAIN_SELECT' | 'KNOWLEDGE_BASE' | 'LEVEL_SELECT' | 'CHAPTER_PROLOGUE' | 'PLAYING';
  setAppState: (state: 'LANDING' | 'DOMAIN_SELECT' | 'KNOWLEDGE_BASE' | 'LEVEL_SELECT' | 'CHAPTER_PROLOGUE' | 'PLAYING') => void;
  selectedDomain: string | null;
  setSelectedDomain: (domain: string) => void;
  currentDifficulty: string;
  setCurrentDifficulty: (diff: string) => void;
  puzzleStartTime: number | null;
  setPuzzleStartTime: (time: number | null) => void;
  currentLevel: number;
  setCurrentLevel: (level: number) => void;
  resetLevel: () => void;
  getPuzzle: (id: number) => Puzzle | undefined;

  // Adaptive Learning System
  baselineStartTime: number | null;
  setBaselineStartTime: (time: number) => void;
  baselineEndTime: number | null;
  setBaselineEndTime: (time: number) => void;
  adaptiveDifficulty: 'Beginner' | 'Intermediate' | 'Advanced' | null;
  setAdaptiveDifficulty: (diff: 'Beginner' | 'Intermediate' | 'Advanced' | null) => void;
  isReadingDocumentation: boolean;
  setIsReadingDocumentation: (val: boolean) => void;

  // Sanity System State (Variable 0 - 100)
  sanity: number;
  minSanityRecorded: number;
  decreaseSanity: (amount: number) => void;
  restoreSanity: (amount: number) => void;
  resetSanity: () => void;

  // Flashlight State
  flashlightOn: boolean;
  toggleFlashlight: () => void;

  // Speedrun Timer State
  sectorStartTime: number | null;
  bestTimes: Record<number, number>;
  startSectorTimer: () => void;
  recordSectorSolve: (level: number) => { timeMs: number; isNewBest: boolean };

  // Error & Hint telemetry for achievements
  errorsThisSector: number;
  hintsUsedThisSector: number;
  interactedObjects: Set<string>;
  recordError: () => void;
  recordHintUse: () => void;
  recordInteraction: (objName: string) => void;

  // Achievements State
  achievements: string[];
  unlockedAchievementNotification: Achievement | null;
  clearAchievementNotification: () => void;
  unlockAchievement: (id: string) => void;

  // Operator Profile State
  operatorName: string;
  setOperatorName: (name: string) => void;
  profileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  leaderboardModalOpen: boolean;
  setLeaderboardModalOpen: (open: boolean) => void;
  archivesModalOpen: boolean;
  setArchivesModalOpen: (open: boolean) => void;
  activeArchiveTab: 'FACILITY' | 'INCIDENT_04' | 'DOSSIER';
  setActiveArchiveTab: (tab: 'FACILITY' | 'INCIDENT_04' | 'DOSSIER') => void;

  // Score & Solo Solve Telemetry
  score: number;
  soloSolvesCount: number;
  addScore: (points: number, isSolo: boolean) => void;

  // Per-Puzzle Tracking for Pure Solo Solves
  puzzleHintUsedForCurrent: boolean;
  puzzleErrorsForCurrent: number;
  recordCurrentPuzzleHintUsed: () => void;
  recordCurrentPuzzleError: () => void;
  resetCurrentPuzzleTrackers: () => void;

  completedLevels: number[];
  unlockedLevel: number;
  recentlyCompletedLevel: number | null;
  clearRecentlyCompleted: () => void;
  completeLevel: (level: number) => void;
  resetProgress: () => void;
  hydrateFromCloud: (cloudData: {
    completedLevels: number[];
    unlockedLevel: number;
    achievements: string[];
    bestTimes: Record<number, number>;
    sanity: number;
    minSanityRecorded: number;
    score?: number;
    solo_solves_count?: number;
  }) => void;
}

const OPERATOR_STORAGE_KEY = 'abyss-operator-name-v1';
const SANITY_STORAGE_KEY = 'abyss-sanity-v1';
const MIN_SANITY_STORAGE_KEY = 'abyss-min-sanity-v1';
const SCORE_STORAGE_KEY = 'abyss-score-v1';
const SOLO_SOLVES_STORAGE_KEY = 'abyss-solo-solves-v1';

export const useGameStore = create<GameState>((set, get) => ({
  operatorName: (() => {
    try {
      return localStorage.getItem(OPERATOR_STORAGE_KEY) || 'OPERATOR_09';
    } catch {
      return 'OPERATOR_09';
    }
  })(),
  setOperatorName: (name: string) => {
    try {
      localStorage.setItem(OPERATOR_STORAGE_KEY, name);
    } catch {}
    set({ operatorName: name });
  },
  profileModalOpen: false,
  setProfileModalOpen: (open: boolean) => set({ profileModalOpen: open }),
  leaderboardModalOpen: false,
  setLeaderboardModalOpen: (open: boolean) => set({ leaderboardModalOpen: open }),
  archivesModalOpen: false,
  setArchivesModalOpen: (open: boolean) => set({ archivesModalOpen: open }),
  activeArchiveTab: 'FACILITY',
  setActiveArchiveTab: (tab: 'FACILITY' | 'INCIDENT_04' | 'DOSSIER') => set({ activeArchiveTab: tab }),

  score: (() => {
    try {
      const val = localStorage.getItem(SCORE_STORAGE_KEY);
      return val ? Math.max(0, parseInt(val, 10)) : 0;
    } catch {
      return 0;
    }
  })(),

  soloSolvesCount: (() => {
    try {
      const val = localStorage.getItem(SOLO_SOLVES_STORAGE_KEY);
      return val ? Math.max(0, parseInt(val, 10)) : 0;
    } catch {
      return 0;
    }
  })(),

  addScore: (points: number, isSolo: boolean) => {
    set((state) => {
      const newScore = Math.max(0, state.score + points);
      const newSolos = isSolo ? state.soloSolvesCount + 1 : state.soloSolvesCount;
      try {
        localStorage.setItem(SCORE_STORAGE_KEY, newScore.toString());
        localStorage.setItem(SOLO_SOLVES_STORAGE_KEY, newSolos.toString());
      } catch {}
      return { score: newScore, soloSolvesCount: newSolos };
    });
  },

  puzzleHintUsedForCurrent: false,
  puzzleErrorsForCurrent: 0,
  recordCurrentPuzzleHintUsed: () => set({ puzzleHintUsedForCurrent: true }),
  recordCurrentPuzzleError: () => set((state) => ({ puzzleErrorsForCurrent: state.puzzleErrorsForCurrent + 1 })),
  resetCurrentPuzzleTrackers: () => set({ puzzleHintUsedForCurrent: false, puzzleErrorsForCurrent: 0 }),

  hoveredObject: null,
  setHoveredObject: (name) => set({ hoveredObject: name }),
  inventory: [],
  addToInventory: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
  removeFromInventory: (item) => set((state) => ({ inventory: state.inventory.filter((i) => i !== item) })),
  hasItem: (item) => get().inventory.includes(item),
  message: null,
  setMessage: (msg) => {
    set({ message: msg });
    if (msg) {
      setTimeout(() => {
        set({ message: null });
      }, 4000);
    }
  },
  activePuzzleId: null,
  setActivePuzzle: (id) => {
    set({ activePuzzleId: id });
    if (id) {
      get().resetCurrentPuzzleTrackers();
      // Check first breach trigger when puzzle is opened
      get().unlockAchievement('first_breach');
    }
  },
  dynamicPuzzles: {},
  setDynamicPuzzle: (id, puzzle) =>
    set((state) => ({ dynamicPuzzles: { ...state.dynamicPuzzles, [id]: puzzle } })),
  puzzleSources: {},
  setPuzzleSource: (id, source) =>
    set((state) => ({ puzzleSources: { ...state.puzzleSources, [id]: source } })),
  isGeneratingPuzzle: false,
  setIsGeneratingPuzzle: (val) => set({ isGeneratingPuzzle: val }),
  escaped: false,
  setEscaped: (val) => set({ escaped: val }),
  bookModalOpen: false,
  setBookModalOpen: (val) => set({ bookModalOpen: val }),
  appState: 'LANDING',
  setAppState: (state) => {
    set({ appState: state });
    if (state === 'PLAYING') {
      get().startSectorTimer();
      get().resetSanity();
    }
  },
  selectedDomain: null,
  setSelectedDomain: (domain) => set({ selectedDomain: domain }),
  currentDifficulty: 'Beginner',
  setCurrentDifficulty: (diff) => set({ currentDifficulty: diff }),
  puzzleStartTime: null,
  setPuzzleStartTime: (time) => set({ puzzleStartTime: time }),
  currentLevel: 1,
  setCurrentLevel: (level) => {
    set({ currentLevel: level });
    get().startSectorTimer();
    get().resetSanity();
  },
  resetLevel: () =>
    set({
      inventory: [],
      escaped: false,
      activePuzzleId: null,
      hoveredObject: null,
      isGeneratingPuzzle: false,
      errorsThisSector: 0,
      hintsUsedThisSector: 0,
      sanity: 100,
    }),
  getPuzzle: (id: number) => {
    const dynamic = get().dynamicPuzzles[id];
    if (dynamic) return dynamic;
    const domain = get().selectedDomain;
    if (domain && domainSpecificPuzzles[domain] && domainSpecificPuzzles[domain][id]) {
      return domainSpecificPuzzles[domain][id];
    }
    return defaultPuzzles.find((p) => p.id === id);
  },

  // Adaptive Learning System
  baselineStartTime: null,
  setBaselineStartTime: (time) => set({ baselineStartTime: time }),
  baselineEndTime: null,
  setBaselineEndTime: (time) => set({ baselineEndTime: time }),
  adaptiveDifficulty: null,
  setAdaptiveDifficulty: (diff) => set({ adaptiveDifficulty: diff }),
  isReadingDocumentation: false,
  setIsReadingDocumentation: (val) => set({ isReadingDocumentation: val }),

  // Sanity Mechanics (Variable 0 - 100)
  sanity: (() => {
    try {
      const val = localStorage.getItem(SANITY_STORAGE_KEY);
      return val !== null ? Math.max(0, Math.min(100, parseInt(val, 10))) : 100;
    } catch {
      return 100;
    }
  })(),
  minSanityRecorded: (() => {
    try {
      const val = localStorage.getItem(MIN_SANITY_STORAGE_KEY);
      return val !== null ? Math.max(0, Math.min(100, parseInt(val, 10))) : 100;
    } catch {
      return 100;
    }
  })(),
  decreaseSanity: (amount: number) => {
    set((state) => {
      const nextSanity = Math.max(0, Math.min(100, state.sanity - amount));
      const nextMin = Math.min(state.minSanityRecorded, nextSanity);
      try {
        localStorage.setItem(SANITY_STORAGE_KEY, nextSanity.toString());
        localStorage.setItem(MIN_SANITY_STORAGE_KEY, nextMin.toString());
      } catch {}
      return {
        sanity: nextSanity,
        minSanityRecorded: nextMin,
      };
    });
  },
  restoreSanity: (amount: number) => {
    set((state) => {
      const nextSanity = Math.max(0, Math.min(100, state.sanity + amount));
      try {
        localStorage.setItem(SANITY_STORAGE_KEY, nextSanity.toString());
      } catch {}
      return {
        sanity: nextSanity,
      };
    });
  },
  resetSanity: () => {
    try {
      localStorage.setItem(SANITY_STORAGE_KEY, '100');
    } catch {}
    set({ sanity: 100 });
  },

  // Flashlight
  flashlightOn: true,
  toggleFlashlight: () => {
    const nextState = !get().flashlightOn;
    playFlashlightToggle(nextState);
    set({ flashlightOn: nextState });
  },

  // Timer & Best Times
  sectorStartTime: Date.now(),
  bestTimes: loadBestTimes(),
  startSectorTimer: () => {
    set({
      sectorStartTime: Date.now(),
      errorsThisSector: 0,
      hintsUsedThisSector: 0,
    });
  },
  recordSectorSolve: (level: number) => {
    const start = get().sectorStartTime || Date.now();
    const timeMs = Math.max(1000, Date.now() - start);
    const existingBest = get().bestTimes[level];
    const isNewBest = !existingBest || timeMs < existingBest;

    const newBestTimes = {
      ...get().bestTimes,
      [level]: isNewBest ? timeMs : existingBest,
    };
    saveBestTimes(newBestTimes);
    set({ bestTimes: newBestTimes });

    // Evaluate Speed Demon (< 90 seconds)
    if (timeMs <= 90000) {
      get().unlockAchievement('speed_demon');
    }

    // Evaluate Zero Leak
    if (get().errorsThisSector === 0 && get().hintsUsedThisSector === 0) {
      get().unlockAchievement('zero_leak');
    }

    return { timeMs, isNewBest };
  },

  // Telemetry
  errorsThisSector: 0,
  hintsUsedThisSector: 0,
  interactedObjects: new Set<string>(),
  recordError: () => set((state) => ({ errorsThisSector: state.errorsThisSector + 1 })),
  recordHintUse: () => set((state) => ({ hintsUsedThisSector: state.hintsUsedThisSector + 1 })),
  recordInteraction: (objName: string) => {
    const setCopy = new Set(get().interactedObjects);
    setCopy.add(objName);
    set({ interactedObjects: setCopy });
    if (setCopy.size >= 6) {
      get().unlockAchievement('paranormal_curator');
    }
  },

  // Achievements
  achievements: loadAchievements(),
  unlockedAchievementNotification: null,
  clearAchievementNotification: () => set({ unlockedAchievementNotification: null }),
  unlockAchievement: (id: string) => {
    const current = get().achievements;
    if (current.includes(id)) return;

    const found = ACHIEVEMENTS.find((a) => a.id === id);
    const updated = [...current, id];
    saveAchievements(updated);
    playAchievementJingle();

    set({
      achievements: updated,
      unlockedAchievementNotification: found || null,
    });

    if (found) {
      setTimeout(() => {
        if (get().unlockedAchievementNotification?.id === id) {
          get().clearAchievementNotification();
        }
      }, 4500);
    }
  },

  completedLevels: initialProgress.completedLevels,
  unlockedLevel: initialProgress.unlockedLevel,
  recentlyCompletedLevel: null,
  clearRecentlyCompleted: () => set({ recentlyCompletedLevel: null }),
  completeLevel: (level) => {
    const state = get();
    get().recordSectorSolve(level);

    const completedLevels = state.completedLevels.includes(level)
      ? state.completedLevels
      : [...state.completedLevels, level];
    const unlockedLevel = Math.min(Math.max(state.unlockedLevel, level + 1), TOTAL_LEVELS);
    saveProgress({ completedLevels, unlockedLevel });
    set({ completedLevels, unlockedLevel, recentlyCompletedLevel: level });

    if (completedLevels.length >= TOTAL_LEVELS) {
      get().unlockAchievement('quantum_sovereign');
    }

    get().resetLevel();
  },
  resetProgress: () => {
    saveProgress({ completedLevels: [], unlockedLevel: 1 });
    saveBestTimes({});
    saveAchievements([]);
    try {
      localStorage.setItem(SANITY_STORAGE_KEY, '100');
      localStorage.setItem(MIN_SANITY_STORAGE_KEY, '100');
      localStorage.setItem(SCORE_STORAGE_KEY, '0');
      localStorage.setItem(SOLO_SOLVES_STORAGE_KEY, '0');
    } catch {}
    set({
      completedLevels: [],
      unlockedLevel: 1,
      currentLevel: 1,
      recentlyCompletedLevel: null,
      dynamicPuzzles: {},
      puzzleSources: {},
      bestTimes: {},
      achievements: [],
      sanity: 100,
      minSanityRecorded: 100,
      score: 0,
      soloSolvesCount: 0,
    });
    get().resetLevel();
  },

  hydrateFromCloud: (cloudData) => {
    saveProgress({
      completedLevels: cloudData.completedLevels,
      unlockedLevel: cloudData.unlockedLevel,
    });
    saveAchievements(cloudData.achievements);
    saveBestTimes(cloudData.bestTimes);
    const scoreVal = typeof cloudData.score === 'number' ? cloudData.score : get().score;
    const soloVal = typeof cloudData.solo_solves_count === 'number' ? cloudData.solo_solves_count : get().soloSolvesCount;
    try {
      localStorage.setItem(SANITY_STORAGE_KEY, cloudData.sanity.toString());
      localStorage.setItem(MIN_SANITY_STORAGE_KEY, cloudData.minSanityRecorded.toString());
      localStorage.setItem(SCORE_STORAGE_KEY, scoreVal.toString());
      localStorage.setItem(SOLO_SOLVES_STORAGE_KEY, soloVal.toString());
    } catch {}

    set({
      completedLevels: cloudData.completedLevels,
      unlockedLevel: cloudData.unlockedLevel,
      achievements: cloudData.achievements,
      bestTimes: cloudData.bestTimes,
      sanity: cloudData.sanity,
      minSanityRecorded: cloudData.minSanityRecorded,
      score: scoreVal,
      soloSolvesCount: soloVal,
    });
  },
}));
