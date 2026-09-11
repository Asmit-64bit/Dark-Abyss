import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

let supabaseClient = null;

export function getSupabaseAdmin(env = process.env) {
  if (supabaseClient) return supabaseClient;

  const currentEnv = env || (typeof process !== 'undefined' ? process.env : {});
  const url =
    currentEnv?.PUBLIC_SUPABASE_URL ||
    currentEnv?.VITE_PUBLIC_SUPABASE_URL ||
    currentEnv?.SUPABASE_URL ||
    currentEnv?.VITE_SUPABASE_URL;

  const serviceKey = currentEnv?.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey =
    currentEnv?.PUBLIC_SUPABASE_ANON_KEY ||
    currentEnv?.VITE_PUBLIC_SUPABASE_ANON_KEY ||
    currentEnv?.SUPABASE_ANON_KEY ||
    currentEnv?.VITE_SUPABASE_ANON_KEY;

  const keyToUse = serviceKey || anonKey;

  if (!url || !keyToUse || !url.startsWith('https://')) {
    return null;
  }

  try {
    supabaseClient = createClient(url, keyToUse, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err?.message);
    return null;
  }

  return supabaseClient;
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

/**
 * Validate Bearer JWT token from request header
 */
export async function authenticateUser(req, env) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'No authorization token provided' };
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const supabase = getSupabaseAdmin(env);
  if (!supabase) {
    return { user: null, error: 'Supabase is not configured on server' };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return { user: null, error: error?.message || 'Invalid or expired token' };
    }
    return { user, token, error: null };
  } catch (err) {
    return { user: null, error: err?.message || 'Token verification failed' };
  }
}

/**
 * Register a new user and create their profile row with email and password
 */
export async function handleSignUp(firstArg, secondArg, thirdArg, fourthArg) {
  let email, password, operatorName, env;
  if (typeof firstArg === 'object' && firstArg !== null) {
    email = firstArg.email;
    password = firstArg.password;
    operatorName = firstArg.operatorName;
    env = secondArg;
  } else {
    email = firstArg;
    password = secondArg;
    operatorName = thirdArg;
    env = fourthArg;
  }

  const supabase = getSupabaseAdmin(env);
  if (!supabase) {
    return { error: 'Database backend not configured on server', status: 503 };
  }

  if (!email || !password) {
    return { error: 'Email and password are required', status: 400 };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanOperatorName = (operatorName || 'OPERATOR_09').trim().toUpperCase();
  const pwdHash = hashPassword(password);

  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          operator_name: cleanOperatorName,
        },
      },
    });

    if (error) {
      return { error: error.message, status: 400 };
    }

    const user = data.user;
    const session = data.session;

    let profile = null;
    if (user) {
      // Upsert profile row with email & password hash
      const profileRow = {
        id: user.id,
        email: cleanEmail,
        password_hash: pwdHash,
        operator_name: cleanOperatorName,
        unlocked_level: 1,
        completed_levels: [],
        best_times: {},
        achievements: [],
        sanity: 100,
        min_sanity_recorded: 100,
        updated_at: new Date().toISOString(),
      };

      const { data: profileData, error: upsertErr } = await supabase
        .from('profiles')
        .upsert(profileRow)
        .select()
        .maybeSingle();

      if (upsertErr) {
        // If email or password_hash columns do not exist yet in table, fall back to base columns
        console.warn('Notice: profiles table schema might need migration:', upsertErr.message);
        const { data: fallbackData } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            operator_name: cleanOperatorName,
            unlocked_level: 1,
            completed_levels: [],
            best_times: {},
            achievements: [],
            sanity: 100,
            min_sanity_recorded: 100,
            updated_at: new Date().toISOString(),
          })
          .select()
          .maybeSingle();
        profile = fallbackData;
      } else {
        profile = profileData;
      }
    }

    return {
      user,
      session,
      profile,
      message: session ? undefined : 'Registration successful! Verification email sent.',
      status: 200,
    };
  } catch (err) {
    return { error: err?.message || 'Failed to register operator', status: 500 };
  }
}

/**
 * Sign in existing user, update email / password in profile, and fetch profile
 */
export async function handleSignIn(firstArg, secondArg, thirdArg) {
  let email, password, env;
  if (typeof firstArg === 'object' && firstArg !== null) {
    email = firstArg.email;
    password = firstArg.password;
    env = secondArg;
  } else {
    email = firstArg;
    password = secondArg;
    env = thirdArg;
  }

  const supabase = getSupabaseAdmin(env);
  if (!supabase) {
    return { error: 'Database backend not configured on server', status: 503 };
  }

  if (!email || !password) {
    return { error: 'Email and password are required', status: 400 };
  }

  const cleanEmail = email.trim().toLowerCase();
  const pwdHash = hashPassword(password);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      return { error: error.message, status: 401 };
    }

    const user = data.user;
    const session = data.session;

    // Fetch or update user profile with latest email and password hash
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      try {
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .update({ email: cleanEmail, password_hash: pwdHash, updated_at: new Date().toISOString() })
          .eq('id', user.id)
          .select()
          .maybeSingle();
        if (updatedProfile) {
          profile = updatedProfile;
        }
      } catch (updateErr) {
        console.warn('Profile credential sync notice:', updateErr);
      }
    }

    return {
      user,
      session,
      profile: profile || null,
      status: 200,
    };
  } catch (err) {
    return { error: err?.message || 'Authentication failed', status: 500 };
  }
}

/**
 * Fetch profile for authenticated user
 */
export async function handleGetProfile(user, env) {
  const supabase = getSupabaseAdmin(env);
  if (!supabase) {
    return { error: 'Database backend not configured', status: 503 };
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      return { error: error.message, status: 400 };
    }

    return { profile: profile || null, status: 200 };
  } catch (err) {
    return { error: err?.message || 'Error fetching profile', status: 500 };
  }
}

/**
 * Sync / Upsert progress data for authenticated user (preserves email and credentials)
 */
export async function handleSyncProfile(user, payload, env) {
  const supabase = getSupabaseAdmin(env);
  if (!supabase) {
    return { error: 'Database backend not configured', status: 503 };
  }

  try {
    const sanityVal = typeof payload.sanity === 'number'
      ? Math.max(0, Math.min(100, Math.round(payload.sanity)))
      : 100;

    const minSanityVal = typeof payload.min_sanity_recorded === 'number'
      ? Math.max(0, Math.min(100, Math.round(payload.min_sanity_recorded)))
      : sanityVal;

    const pointsVal = typeof payload.points === 'number'
      ? Math.max(0, Math.round(payload.points))
      : typeof payload.score === 'number'
      ? Math.max(0, Math.round(payload.score))
      : 0;

    const soloSolvesVal = typeof payload.solo_solves_count === 'number'
      ? Math.max(0, Math.round(payload.solo_solves_count))
      : 0;

    const profilePayload = {
      id: user.id,
      email: user.email || payload.email || undefined,
      operator_name: (payload.operator_name || 'OPERATOR_09').trim().toUpperCase(),
      unlocked_level: typeof payload.unlocked_level === 'number' ? Math.max(1, Math.min(5, payload.unlocked_level)) : 1,
      completed_levels: Array.isArray(payload.completed_levels) ? payload.completed_levels : [],
      best_times: typeof payload.best_times === 'object' && payload.best_times !== null ? payload.best_times : {},
      achievements: Array.isArray(payload.achievements) ? payload.achievements : [],
      sanity: sanityVal,
      min_sanity_recorded: minSanityVal,
      score: pointsVal,
      points: pointsVal,
      solo_solves_count: soloSolvesVal,
      updated_at: new Date().toISOString(),
    };

    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert(profilePayload)
      .select()
      .maybeSingle();

    if (error) {
      // Fallback if schema columns are partially migrated
      const fallbackPayload = { ...profilePayload };
      delete fallbackPayload.email;
      delete fallbackPayload.points;
      delete fallbackPayload.score;
      delete fallbackPayload.solo_solves_count;
      const { data: fbData, error: fbErr } = await supabase
        .from('profiles')
        .upsert(fallbackPayload)
        .select()
        .maybeSingle();

      if (fbErr) {
        return { error: fbErr.message, status: 400 };
      }
      return { profile: fbData, success: true, status: 200 };
    }

    return { profile, success: true, status: 200 };
  } catch (err) {
    return { error: err?.message || 'Error syncing profile', status: 500 };
  }
}

/**
 * Reset profile data for authenticated user
 */
export async function handleResetProfile(user, env) {
  const supabase = getSupabaseAdmin(env);
  if (!supabase) {
    return { error: 'Database backend not configured', status: 503 };
  }

  try {
    const resetPayload = {
      id: user.id,
      email: user.email || undefined,
      unlocked_level: 1,
      completed_levels: [],
      best_times: {},
      achievements: [],
      sanity: 100,
      min_sanity_recorded: 100,
      updated_at: new Date().toISOString(),
    };

    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert(resetPayload)
      .select()
      .maybeSingle();

    if (error) {
      delete resetPayload.email;
      const { data: fbData, error: fbErr } = await supabase
        .from('profiles')
        .upsert(resetPayload)
        .select()
        .maybeSingle();

      if (fbErr) return { error: fbErr.message, status: 400 };
      return { profile: fbData, success: true, status: 200 };
    }

    return { profile, success: true, status: 200 };
  } catch (err) {
    return { error: err?.message || 'Error resetting profile', status: 500 };
  }
}

export function normalizeDifficulty(diff) {
  if (!diff) return 'Easy';
  const lower = String(diff).trim().toLowerCase();
  if (lower === 'beginner' || lower === 'easy') return 'Easy';
  if (lower === 'intermediate' || lower === 'medium') return 'Intermediate';
  if (lower === 'advanced' || lower === 'hard') return 'Advanced';
  if (lower === 'expert' || lower === 'master' || lower === 'insane') return 'Expert';
  return 'Easy';
}

const IN_MEMORY_QUESTIONS = [];

/**
 * Save a generated escape room question to the database
 */
export async function handleSaveQuestion(questionData, env) {
  const payload = {
    id: questionData.id || `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    question: questionData.question,
    domain: questionData.domain || 'Programming Fundamentals',
    tags: Array.isArray(questionData.tags) ? questionData.tags : [],
    difficulty: normalizeDifficulty(questionData.difficulty),
    title: questionData.title || null,
    scenario: questionData.scenario || null,
    code_snippet: questionData.code_snippet || questionData.codeSnippet || null,
    answer: Array.isArray(questionData.answer) ? questionData.answer : [String(questionData.answer || '')],
    hint: questionData.hint || null,
    explanation: questionData.explanation || null,
    sector_level: typeof questionData.sector_level === 'number' ? questionData.sector_level : (questionData.level || 1),
    created_by: questionData.created_by || null,
    created_at: new Date().toISOString(),
  };

  const supabase = getSupabaseAdmin(env);
  if (!supabase) {
    IN_MEMORY_QUESTIONS.unshift(payload);
    return { question: payload, success: true, status: 201 };
  }

  try {
    const { data: savedQuestion, error } = await supabase
      .from('generated_questions')
      .insert(payload)
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Notice: generated_questions table error, caching in memory:', error.message);
      IN_MEMORY_QUESTIONS.unshift(payload);
      return { question: payload, success: true, status: 201 };
    }

    return { question: savedQuestion, success: true, status: 201 };
  } catch (err) {
    console.warn('Error saving generated question to database, caching in memory:', err?.message);
    IN_MEMORY_QUESTIONS.unshift(payload);
    return { question: payload, success: true, status: 201 };
  }
}

/**
 * Fetch archived generated questions by domain, difficulty, tag, or sector
 */
export async function handleGetQuestions(filters = {}, env) {
  const supabase = getSupabaseAdmin(env);

  const filterInMemory = () => {
    let list = [...IN_MEMORY_QUESTIONS];
    if (filters.domain) {
      list = list.filter((q) => q.domain === filters.domain);
    }
    if (filters.difficulty) {
      const diff = normalizeDifficulty(filters.difficulty);
      list = list.filter((q) => q.difficulty === diff);
    }
    if (filters.sector_level) {
      list = list.filter((q) => q.sector_level === Number(filters.sector_level));
    }
    const limit = Number(filters.limit) || 50;
    return list.slice(0, limit);
  };

  if (!supabase) {
    return { questions: filterInMemory(), status: 200 };
  }

  try {
    let query = supabase.from('generated_questions').select('*').order('created_at', { ascending: false });

    if (filters.domain) {
      query = query.eq('domain', filters.domain);
    }
    if (filters.difficulty) {
      query = query.eq('difficulty', normalizeDifficulty(filters.difficulty));
    }
    if (filters.sector_level) {
      query = query.eq('sector_level', Number(filters.sector_level));
    }
    if (filters.limit) {
      query = query.limit(Number(filters.limit));
    } else {
      query = query.limit(50);
    }

    const { data: questions, error } = await query;
    if (error) {
      console.warn('Notice: generated_questions query error, using in-memory store:', error.message);
      return { questions: filterInMemory(), status: 200 };
    }

    return { questions: questions || [], status: 200 };
  } catch (err) {
    console.warn('Notice: generated_questions query error, using in-memory store:', err?.message || err);
    return { questions: filterInMemory(), status: 200 };
  }
}

export const BASELINE_OPERATORS = [
  {
    operator_name: 'DR_ARIS_THORNE',
    points: 14850,
    score: 14850,
    solo_solves_count: 14,
    unlocked_level: 5,
    completed_levels: [1, 2, 3, 4, 5],
    achievements_count: 8,
    min_sanity_recorded: 92,
    updated_at: '2026-09-08T10:14:00Z',
  },
  {
    operator_name: 'CIPHER_NEXUS',
    points: 12400,
    score: 12400,
    solo_solves_count: 12,
    unlocked_level: 5,
    completed_levels: [1, 2, 3, 4, 5],
    achievements_count: 7,
    min_sanity_recorded: 85,
    updated_at: '2026-09-09T14:22:00Z',
  },
  {
    operator_name: 'OPERATOR_VANCE',
    points: 9850,
    score: 9850,
    solo_solves_count: 9,
    unlocked_level: 4,
    completed_levels: [1, 2, 3, 4],
    achievements_count: 6,
    min_sanity_recorded: 78,
    updated_at: '2026-09-10T08:45:00Z',
  },
  {
    operator_name: 'NULL_POINTER_07',
    points: 8200,
    score: 8200,
    solo_solves_count: 8,
    unlocked_level: 4,
    completed_levels: [1, 2, 3, 4],
    achievements_count: 5,
    min_sanity_recorded: 96,
    updated_at: '2026-09-09T19:10:00Z',
  },
  {
    operator_name: 'SECTOR_ARCHIVIST',
    points: 6450,
    score: 6450,
    solo_solves_count: 6,
    unlocked_level: 3,
    completed_levels: [1, 2, 3],
    achievements_count: 4,
    min_sanity_recorded: 88,
    updated_at: '2026-09-10T12:05:00Z',
  },
  {
    operator_name: 'SYNTAX_SHADOW',
    points: 5100,
    score: 5100,
    solo_solves_count: 5,
    unlocked_level: 3,
    completed_levels: [1, 2, 3],
    achievements_count: 4,
    min_sanity_recorded: 71,
    updated_at: '2026-09-08T22:30:00Z',
  },
  {
    operator_name: 'GHOST_PROTOCOL',
    points: 3900,
    score: 3900,
    solo_solves_count: 4,
    unlocked_level: 2,
    completed_levels: [1, 2],
    achievements_count: 3,
    min_sanity_recorded: 82,
    updated_at: '2026-09-11T04:15:00Z',
  },
  {
    operator_name: 'ECHO_RUNNER_99',
    points: 2750,
    score: 2750,
    solo_solves_count: 3,
    unlocked_level: 2,
    completed_levels: [1, 2],
    achievements_count: 2,
    min_sanity_recorded: 90,
    updated_at: '2026-09-10T17:50:00Z',
  },
  {
    operator_name: 'RECON_SENTRY',
    points: 1600,
    score: 1600,
    solo_solves_count: 2,
    unlocked_level: 1,
    completed_levels: [1],
    achievements_count: 1,
    min_sanity_recorded: 65,
    updated_at: '2026-09-11T09:00:00Z',
  },
  {
    operator_name: 'INIT_RUNNER_01',
    points: 850,
    score: 850,
    solo_solves_count: 1,
    unlocked_level: 1,
    completed_levels: [1],
    achievements_count: 1,
    min_sanity_recorded: 100,
    updated_at: '2026-09-11T11:20:00Z',
  },
];

function formatLeaderboardList(entries, limit = 50) {
  const sorted = [...entries].sort((a, b) => (b.score || b.points || 0) - (a.score || a.points || 0));
  const limited = sorted.slice(0, Number(limit) || 50);
  return limited.map((entry, idx) => ({
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
}

/**
 * Fetch Top Operators Leaderboard ranked by points gained from independent solves.
 * Supports cloud Supabase database with seamless fallback to facility operative baseline.
 */
export async function handleGetLeaderboard(limit = 50, env = process.env) {
  const maxLimit = Number(limit) || 50;
  const supabase = getSupabaseAdmin(env);

  if (!supabase) {
    const defaultList = formatLeaderboardList(BASELINE_OPERATORS, maxLimit);
    return { leaderboard: defaultList, totalOperators: defaultList.length, status: 200 };
  }

  try {
    const { data: dbRows, error } = await supabase
      .from('profiles')
      .select('id, operator_name, points, score, solo_solves_count, unlocked_level, completed_levels, achievements, min_sanity_recorded, updated_at')
      .order('points', { ascending: false })
      .limit(maxLimit);

    let fetchedRows = dbRows;

    if (error) {
      // Fallback if 'points' column is pending migration, query by 'score'
      const { data: fallbackRows, error: fbErr } = await supabase
        .from('profiles')
        .select('id, operator_name, score, solo_solves_count, unlocked_level, completed_levels, achievements, min_sanity_recorded, updated_at')
        .order('score', { ascending: false })
        .limit(maxLimit);

      if (!fbErr && fallbackRows && fallbackRows.length > 0) {
        fetchedRows = fallbackRows;
      } else {
        console.warn('Notice: leaderboard profiles query error, using baseline roster:', fbErr?.message || error?.message);
        fetchedRows = null;
      }
    }

    if (!fetchedRows || fetchedRows.length === 0) {
      const defaultList = formatLeaderboardList(BASELINE_OPERATORS, maxLimit);
      return { leaderboard: defaultList, totalOperators: defaultList.length, status: 200 };
    }

    // Merge database rows with baseline operatives, avoiding duplicate names
    const existingNames = new Set(fetchedRows.map((r) => (r.operator_name || '').toUpperCase()));
    const nonDuplicatedBaselines = BASELINE_OPERATORS.filter(
      (b) => !existingNames.has(b.operator_name.toUpperCase())
    );

    const merged = [...fetchedRows, ...nonDuplicatedBaselines];
    const formatted = formatLeaderboardList(merged, maxLimit);

    return {
      leaderboard: formatted,
      totalOperators: formatted.length,
      status: 200,
    };
  } catch (err) {
    console.warn('Leaderboard fetch error, utilizing baseline roster:', err?.message);
    const defaultList = formatLeaderboardList(BASELINE_OPERATORS, maxLimit);
    return { leaderboard: defaultList, totalOperators: defaultList.length, status: 200 };
  }
}
