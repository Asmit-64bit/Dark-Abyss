/**
 * Dedicated Backend API Client for Abyss
 * The frontend communicates solely with our backend server (/api/*)
 * and never queries Supabase or the database directly.
 */

const TOKEN_STORAGE_KEY = 'abyss-auth-token-v1';

export interface User {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
}

export interface ProfileData {
  id: string;
  email?: string;
  operator_name: string;
  unlocked_level: number;
  completed_levels: number[];
  best_times: Record<number, number>;
  achievements: string[];
  sanity: number;
  min_sanity_recorded: number;
  score?: number;
  points?: number;
  solo_solves_count?: number;
  updated_at?: string;
}

export interface LeaderboardEntry {
  rank: number;
  operator_name: string;
  score: number;
  points?: number;
  solo_solves_count: number;
  unlocked_level: number;
  completed_levels: number[];
  achievements_count: number;
  min_sanity_recorded: number;
  is_current_user?: boolean;
}

export interface AuthResponse {
  user?: User | null;
  session?: { access_token: string; refresh_token?: string } | null;
  profile?: ProfileData | null;
  message?: string;
  error?: string;
}

export type QuestionDifficulty = 'Easy' | 'Intermediate' | 'Advanced' | 'Expert';

export interface GeneratedQuestion {
  id: string;
  question: string;
  domain: string;
  tags: string[];
  difficulty: QuestionDifficulty;
  title?: string;
  scenario?: string;
  code_snippet?: string;
  answer?: string[];
  hint?: string;
  explanation?: string;
  sector_level?: number;
  created_by?: string;
  created_at?: string;
}

export interface QuestionFilters {
  domain?: string;
  difficulty?: QuestionDifficulty;
  sector_level?: number;
  limit?: number;
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {}
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

export const apiClient = {
  // 1. Sign Up
  async signUp(email: string, password: string, operatorName?: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, operatorName }),
    });

    if (res.session?.access_token) {
      setStoredToken(res.session.access_token);
    }
    return res;
  },

  // 2. Sign In
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.session?.access_token) {
      setStoredToken(res.session.access_token);
    }
    return res;
  },

  // 3. Sign Out
  async signOut(): Promise<void> {
    setStoredToken(null);
  },

  // 4. Verify Session & Hydrate
  async getSession(): Promise<{ user: User | null; profile: ProfileData | null; error?: string }> {
    const token = getStoredToken();
    if (!token) {
      return { user: null, profile: null };
    }

    try {
      return await request<{ user: User | null; profile: ProfileData | null }>('/api/auth/session');
    } catch {
      setStoredToken(null);
      return { user: null, profile: null };
    }
  },

  // 5. Get Profile
  async getProfile(): Promise<{ profile: ProfileData | null }> {
    return request<{ profile: ProfileData | null }>('/api/profile');
  },

  // 6. Sync Profile
  async syncProfile(payload: Partial<ProfileData>): Promise<{ profile: ProfileData; success: boolean }> {
    return request<{ profile: ProfileData; success: boolean }>('/api/profile/sync', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 7. Reset Profile
  async resetProfile(): Promise<{ profile: ProfileData; success: boolean }> {
    return request<{ profile: ProfileData; success: boolean }>('/api/profile/reset', {
      method: 'POST',
    });
  },

  // 8. Get Archived Generated Questions
  async getQuestions(filters: QuestionFilters = {}): Promise<{ questions: GeneratedQuestion[] }> {
    const params = new URLSearchParams();
    if (filters.domain) params.set('domain', filters.domain);
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    if (filters.sector_level) params.set('sector_level', String(filters.sector_level));
    if (filters.limit) params.set('limit', String(filters.limit));

    const qs = params.toString();
    return request<{ questions: GeneratedQuestion[] }>(`/api/questions${qs ? `?${qs}` : ''}`);
  },

  // 9. Save Generated Question
  async saveQuestion(questionData: Partial<GeneratedQuestion>): Promise<{ question: GeneratedQuestion; success: boolean }> {
    return request<{ question: GeneratedQuestion; success: boolean }>('/api/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  },

  // 10. Get Global Operators Leaderboard
  async getLeaderboard(limit: number = 50): Promise<{ leaderboard: LeaderboardEntry[]; totalOperators: number }> {
    return request<{ leaderboard: LeaderboardEntry[]; totalOperators: number }>(`/api/leaderboard?limit=${limit}`);
  },
};
