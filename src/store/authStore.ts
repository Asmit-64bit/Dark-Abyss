import { create } from 'zustand';
import { apiClient, type User, type ProfileData } from '../lib/apiClient';
import { useGameStore } from './gameStore';

interface AuthState {
  user: User | null;
  profile: ProfileData | null;
  isLoading: boolean;
  isSyncing: boolean;
  authModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  error: string | null;

  setAuthModalOpen: (open: boolean, mode?: 'signin' | 'signup') => void;
  setError: (err: string | null) => void;
  initializeAuth: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithPassword: (email: string, password: string, operatorName: string) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
  syncProfileToCloud: () => Promise<void>;
  syncProfileFromCloud: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isSyncing: false,
  authModalOpen: false,
  authModalMode: 'signin',
  error: null,

  setAuthModalOpen: (open, mode = 'signin') => {
    set({ authModalOpen: open, authModalMode: mode, error: null });
  },

  setError: (err) => set({ error: err }),

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const { user, profile } = await apiClient.getSession();
      set({ user, profile });

      if (user && profile) {
        // Hydrate GameStore from cloud profile
        const gameStore = useGameStore.getState();
        const cloudCompleted = Array.isArray(profile.completed_levels) ? profile.completed_levels : [];
        const cloudUnlocked = typeof profile.unlocked_level === 'number' ? profile.unlocked_level : 1;
        const cloudAchievements = Array.isArray(profile.achievements) ? profile.achievements : [];
        const cloudBestTimes = typeof profile.best_times === 'object' && profile.best_times !== null ? profile.best_times : {};
        const cloudSanity = typeof profile.sanity === 'number' ? Math.max(0, Math.min(100, profile.sanity)) : 100;
        const cloudMinSanity = typeof profile.min_sanity_recorded === 'number' ? Math.max(0, Math.min(100, profile.min_sanity_recorded)) : 100;

        const mergedCompleted = Array.from(new Set([...gameStore.completedLevels, ...cloudCompleted]));
        const mergedUnlocked = Math.max(gameStore.unlockedLevel, cloudUnlocked);
        const mergedAchievements = Array.from(new Set([...gameStore.achievements, ...cloudAchievements]));
        const mergedBestTimes = { ...gameStore.bestTimes, ...cloudBestTimes };

        gameStore.setOperatorName(profile.operator_name || gameStore.operatorName);
        gameStore.hydrateFromCloud({
          completedLevels: mergedCompleted,
          unlockedLevel: mergedUnlocked,
          achievements: mergedAchievements,
          bestTimes: mergedBestTimes,
          sanity: cloudSanity,
          minSanityRecorded: cloudMinSanity,
          score: profile.score,
          solo_solves_count: profile.solo_solves_count,
        });
      }
    } catch (err) {
      console.warn('Backend session check error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithPassword: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.signIn(email, password);
      if (res.error) {
        set({ error: res.error, isLoading: false });
        return { error: res.error };
      }

      set({ user: res.user || null, profile: res.profile || null, authModalOpen: false, isLoading: false });
      if (res.profile) {
        const gameStore = useGameStore.getState();
        gameStore.setOperatorName(res.profile.operator_name || gameStore.operatorName);
        gameStore.hydrateFromCloud({
          completedLevels: res.profile.completed_levels || [],
          unlockedLevel: res.profile.unlocked_level || 1,
          achievements: res.profile.achievements || [],
          bestTimes: res.profile.best_times || {},
          sanity: res.profile.sanity ?? 100,
          minSanityRecorded: res.profile.min_sanity_recorded ?? 100,
          score: res.profile.score,
          solo_solves_count: res.profile.solo_solves_count,
        });
      }
      return {};
    } catch (err: any) {
      const message = err?.message || 'Authentication error';
      set({ error: message, isLoading: false });
      return { error: message };
    }
  },

  signUpWithPassword: async (email, password, operatorName) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.signUp(email, password, operatorName);
      if (res.error) {
        set({ error: res.error, isLoading: false });
        return { error: res.error };
      }

      if (res.session) {
        set({ user: res.user || null, profile: res.profile || null, authModalOpen: false, isLoading: false });
        // Initial sync of current local progress to backend
        await get().syncProfileToCloud();
        return {};
      }

      set({ isLoading: false });
      return {
        message: res.message || 'Account created! Please check your email for confirmation.',
      };
    } catch (err: any) {
      const message = err?.message || 'Sign up failed';
      set({ error: message, isLoading: false });
      return { error: message };
    }
  },

  signOut: async () => {
    try {
      await apiClient.signOut();
      set({ user: null, profile: null });
    } catch (err) {
      console.warn('Sign out error:', err);
      set({ user: null, profile: null });
    }
  },

  syncProfileFromCloud: async () => {
    const { user } = get();
    if (!user) return;

    set({ isSyncing: true });
    try {
      const { profile } = await apiClient.getProfile();
      if (profile) {
        const gameStore = useGameStore.getState();
        const cloudCompleted = Array.isArray(profile.completed_levels) ? profile.completed_levels : [];
        const cloudUnlocked = typeof profile.unlocked_level === 'number' ? profile.unlocked_level : 1;
        const cloudAchievements = Array.isArray(profile.achievements) ? profile.achievements : [];
        const cloudBestTimes = typeof profile.best_times === 'object' && profile.best_times !== null ? profile.best_times : {};
        const cloudSanity = typeof profile.sanity === 'number' ? Math.max(0, Math.min(100, profile.sanity)) : 100;
        const cloudMinSanity = typeof profile.min_sanity_recorded === 'number' ? Math.max(0, Math.min(100, profile.min_sanity_recorded)) : 100;

        const mergedCompleted = Array.from(new Set([...gameStore.completedLevels, ...cloudCompleted]));
        const mergedUnlocked = Math.max(gameStore.unlockedLevel, cloudUnlocked);
        const mergedAchievements = Array.from(new Set([...gameStore.achievements, ...cloudAchievements]));
        const mergedBestTimes = { ...gameStore.bestTimes, ...cloudBestTimes };

        gameStore.setOperatorName(profile.operator_name || gameStore.operatorName);
        gameStore.hydrateFromCloud({
          completedLevels: mergedCompleted,
          unlockedLevel: mergedUnlocked,
          achievements: mergedAchievements,
          bestTimes: mergedBestTimes,
          sanity: cloudSanity,
          minSanityRecorded: cloudMinSanity,
          score: profile.points ?? profile.score,
          solo_solves_count: profile.solo_solves_count,
        });

        set({ profile, isSyncing: false });
      }
    } catch (err) {
      console.warn('Sync from backend error:', err);
    } finally {
      set({ isSyncing: false });
    }
  },

  syncProfileToCloud: async () => {
    const { user } = get();
    if (!user) return;

    set({ isSyncing: true });
    try {
      const gameStore = useGameStore.getState();
      const payload: Partial<ProfileData> = {
        operator_name: gameStore.operatorName,
        unlocked_level: gameStore.unlockedLevel,
        completed_levels: gameStore.completedLevels,
        best_times: gameStore.bestTimes,
        achievements: gameStore.achievements,
        sanity: Math.max(0, Math.min(100, gameStore.sanity)),
        min_sanity_recorded: Math.max(0, Math.min(100, gameStore.minSanityRecorded)),
        score: gameStore.score,
        points: gameStore.score,
        solo_solves_count: gameStore.soloSolvesCount,
      };

      const { profile } = await apiClient.syncProfile(payload);
      if (profile) {
        set({ profile });
      }
    } catch (err) {
      console.warn('Sync to backend error:', err);
    } finally {
      set({ isSyncing: false });
    }
  },
}));
