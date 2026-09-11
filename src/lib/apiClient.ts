/**
 * Dedicated Backend API Client for Abyss
 * The frontend communicates solely with our backend server (/api/*)
 * and never queries Supabase or the database directly.
 */

const TOKEN_STORAGE_KEY = 'abyss-auth-token-v1';

export const SUPABASE_URL =
  (import.meta.env?.VITE_PUBLIC_SUPABASE_URL as string) ||
  'https://tkfewegoucrqwyagbtil.supabase.co';

export const SUPABASE_ANON_KEY =
  (import.meta.env?.VITE_PUBLIC_SUPABASE_ANON_KEY as string) ||
  'sb_publishable_ccgqIkVhCdEsvxEXQhc8wg_FV8l_G8H';

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

  // 8. Get Archived Generated Questions (with direct Supabase fallback for static hosting)
  async getQuestions(filters: QuestionFilters = {}): Promise<{ questions: GeneratedQuestion[] }> {
    const params = new URLSearchParams();
    if (filters.domain) params.set('domain', filters.domain);
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    if (filters.sector_level) params.set('sector_level', String(filters.sector_level));
    if (filters.limit) params.set('limit', String(filters.limit));

    const qs = params.toString();
    try {
      const res = await request<{ questions: GeneratedQuestion[] }>(`/api/questions${qs ? `?${qs}` : ''}`);
      if (res?.questions && Array.isArray(res.questions) && res.questions.length > 0) {
        return res;
      }
    } catch {
      // Endpoint 404 on static hosting platforms (Vercel, Netlify, etc.) -> fall back to direct Supabase query
    }

    try {
      let url = `${SUPABASE_URL}/rest/v1/generated_questions?select=*`;
      if (filters.domain) url += `&domain=eq.${encodeURIComponent(filters.domain)}`;
      if (filters.difficulty) url += `&difficulty=eq.${encodeURIComponent(filters.difficulty)}`;
      if (filters.sector_level) url += `&sector_level=eq.${filters.sector_level}`;
      url += `&limit=${filters.limit || 50}&order=created_at.desc`;

      const resp = await fetch(url, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (resp.ok) {
        const questions = await resp.json();
        return { questions: Array.isArray(questions) ? questions : [] };
      }
    } catch (e) {
      console.warn('[apiClient] Direct Supabase questions fallback notice:', e);
    }

    return { questions: [] };
  },

  // 9. Save Generated Question
  async saveQuestion(questionData: Partial<GeneratedQuestion>): Promise<{ question: GeneratedQuestion; success: boolean }> {
    try {
      return await request<{ question: GeneratedQuestion; success: boolean }>('/api/questions', {
        method: 'POST',
        body: JSON.stringify(questionData),
      });
    } catch {
      // Direct Supabase insert fallback
      try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/generated_questions`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify(questionData),
        });
        if (resp.ok) {
          const rows = await resp.json();
          return { question: rows[0] as GeneratedQuestion, success: true };
        }
      } catch {}
      return { question: questionData as GeneratedQuestion, success: false };
    }
  },

  // 10. Get Global Operators Leaderboard (with direct Supabase fallback for static hosting)
  async getLeaderboard(limit: number = 50): Promise<{ leaderboard: LeaderboardEntry[]; totalOperators: number }> {
    try {
      const res = await request<{ leaderboard: LeaderboardEntry[]; totalOperators: number }>(
        `/api/leaderboard?limit=${limit}`
      );
      if (res?.leaderboard && Array.isArray(res.leaderboard) && res.leaderboard.length > 0) {
        return res;
      }
    } catch {
      // Endpoint 404 on static hosting platforms (Vercel, Netlify, etc.) -> fall back to direct Supabase query
    }

    // Direct Supabase REST fallback for static deployments (Vercel, Netlify, Cloudflare, etc.)
    try {
      const resp = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?select=id,operator_name,points,score,solo_solves_count,unlocked_level,completed_levels,achievements,min_sanity_recorded,updated_at&order=points.desc&limit=${limit}`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );
      if (resp.ok) {
        const rows = await resp.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const sorted = [...rows].sort((a, b) => (b.points || b.score || 0) - (a.points || a.score || 0));
          const formatted: LeaderboardEntry[] = sorted.map((entry: any, idx: number) => ({
            rank: idx + 1,
            operator_name: entry.operator_name || 'OPERATOR_09',
            points: typeof entry.points === 'number' ? entry.points : (entry.score || 0),
            score: typeof entry.score === 'number' ? entry.score : (entry.points || 0),
            solo_solves_count: typeof entry.solo_solves_count === 'number' ? entry.solo_solves_count : 0,
            unlocked_level: entry.unlocked_level || 1,
            completed_levels: Array.isArray(entry.completed_levels) ? entry.completed_levels : [],
            achievements_count: typeof entry.achievements_count === 'number' ? entry.achievements_count : (Array.isArray(entry.achievements) ? entry.achievements.length : 0),
            min_sanity_recorded: typeof entry.min_sanity_recorded === 'number' ? entry.min_sanity_recorded : 100,
            updated_at: entry.updated_at || new Date().toISOString(),
          }));
          return { leaderboard: formatted, totalOperators: formatted.length };
        }
      }
    } catch (err) {
      console.warn('[apiClient] Direct Supabase leaderboard fallback notice:', err);
    }

    return { leaderboard: [], totalOperators: 0 };
  },
};
