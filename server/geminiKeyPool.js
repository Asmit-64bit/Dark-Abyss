/**
 * ABYSS - GEMINI MULTI-KEY ROTATOR & FAILOVER POOL
 * Manages up to 6+ Gemini API keys with automatic failover upon credit exhaustion / rate limits.
 */

// In-memory key health state cache
const keyStates = new Map();

/**
 * Extract and sanitize all available Gemini API keys from environment
 * Supports:
 * - GEMINI_API_KEY_1 ... GEMINI_API_KEY_6
 * - GEMINI_API_KEYS (comma or newline separated)
 * - GEMINI_API_KEY / VITE_GEMINI_API_KEY (fallback)
 */
export function extractGeminiKeys(env = process.env) {
  const keys = [];

  // 1. Explicit numbered keys 1 through 6
  for (let i = 1; i <= 6; i++) {
    const key = env[`GEMINI_API_KEY_${i}`] || env[`VITE_GEMINI_API_KEY_${i}`];
    if (key && typeof key === 'string' && key.trim().length > 10) {
      keys.push(key.trim());
    }
  }

  // 2. Comma or newline-separated key list
  const multiKeyString = env.GEMINI_API_KEYS || env.VITE_GEMINI_API_KEYS;
  if (multiKeyString && typeof multiKeyString === 'string') {
    const splitKeys = multiKeyString
      .split(/[\n,;]+/)
      .map((k) => k.trim())
      .filter((k) => k.length > 10);
    keys.push(...splitKeys);
  }

  // 3. Single key fallback
  const singleKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;
  if (singleKey && typeof singleKey === 'string' && singleKey.trim().length > 10) {
    keys.push(singleKey.trim());
  }

  // Return unique keys only
  return Array.from(new Set(keys));
}

/**
 * Get or initialize tracking state for a specific key
 */
function getKeyState(key, index) {
  if (!keyStates.has(key)) {
    keyStates.set(key, {
      id: index + 1,
      key,
      isExhausted: false,
      exhaustedAt: null,
      cooldownMs: 60000 * 5, // 5 min default cooldown
      successCount: 0,
      failCount: 0,
      lastUsedAt: null,
      lastError: null,
    });
  }

  const state = keyStates.get(key);

  // Check if cooldown expired
  if (state.isExhausted && state.exhaustedAt) {
    const elapsed = Date.now() - state.exhaustedAt;
    if (elapsed > state.cooldownMs) {
      state.isExhausted = false;
      state.exhaustedAt = null;
      state.lastError = null;
    }
  }

  return state;
}

/**
 * Mark a key as exhausted/rate-limited
 */
function markKeyExhausted(key, index, errorReason, status = 429) {
  const state = getKeyState(key, index);
  state.isExhausted = true;
  state.exhaustedAt = Date.now();
  state.failCount += 1;
  state.lastError = `[${status}] ${errorReason}`;
  // If credit exhaustion (402/403/billing), keep cooldown longer (15 mins)
  // If it's a 429 rate limit, Gemini free tier usually resets in 30-60 seconds, so use a much shorter cooldown
  if (status === 402 || status === 403) {
    state.cooldownMs = 15 * 60 * 1000;
  } else if (status === 429 || String(errorReason).toLowerCase().includes('quota')) {
    state.cooldownMs = 35 * 1000; // 35 seconds
  } else {
    state.cooldownMs = 60 * 1000; // 1 min default
  }

  console.warn(
    `⚠️ [Gemini Key Rotator] Key #${index + 1} (••••${key.slice(-4)}) marked EXHAUSTED (${status}: ${errorReason}). Switching to next key in pool...`
  );
}

/**
 * Mark a key as healthy
 */
function markKeySuccess(key, index) {
  const state = getKeyState(key, index);
  state.isExhausted = false;
  state.exhaustedAt = null;
  state.successCount += 1;
  state.lastUsedAt = Date.now();
  state.lastError = null;
}

/**
 * Mask key for safe logging & telemetry
 */
export function maskApiKey(key) {
  if (!key) return '••••';
  if (key.length <= 8) return '••••••••';
  return `••••••••••••${key.slice(-4)}`;
}

/**
 * Check if an error indicates quota/credit exhaustion
 */
function isCreditOrRateLimitError(status, errorBody = '') {
  if (status === 429 || status === 402 || status === 403) return true;
  const str = String(errorBody).toLowerCase();
  return (
    str.includes('resource_exhausted') ||
    str.includes('quota') ||
    str.includes('rate limit') ||
    str.includes('credit') ||
    str.includes('billing') ||
    str.includes('api_key_invalid') ||
    str.includes('permission_denied')
  );
}

/**
 * Execute Gemini API request with automatic key rotation and model fallback.
 * If Key 1 runs out of credits or hits rate limit, it automatically switches to Key 2, Key 3, ... Key 6.
 */
export async function executeGeminiWithRotation(requestGenerator, customApiKey, env = process.env) {
  // 1. If client provided a direct custom key, prioritize it
  if (customApiKey && typeof customApiKey === 'string' && customApiKey.trim().length > 10) {
    try {
      return await requestGenerator(customApiKey.trim(), 0);
    } catch (err) {
      if (!isCreditOrRateLimitError(err.status, err.message)) {
        throw err;
      }
      // If client key is exhausted, fallback to backend pool below
    }
  }

  // 2. Extract key pool from environment
  const pool = extractGeminiKeys(env);

  if (pool.length === 0) {
    throw new Error('No Gemini API keys configured in pool. Add GEMINI_API_KEY_1 through GEMINI_API_KEY_6.');
  }

  // 3. Sort pool: active keys first, then by least recently used
  const poolWithState = pool.map((key, index) => ({
    key,
    index,
    state: getKeyState(key, index),
  }));

  // Prioritize active (non-exhausted) keys
  const sortedPool = [...poolWithState].sort((a, b) => {
    if (!a.state.isExhausted && b.state.isExhausted) return -1;
    if (a.state.isExhausted && !b.state.isExhausted) return 1;
    return (a.state.lastUsedAt || 0) - (b.state.lastUsedAt || 0);
  });

  const attemptedErrors = [];

  for (const { key, index } of sortedPool) {
    try {
      const result = await requestGenerator(key, index);
      markKeySuccess(key, index);
      return result;
    } catch (err) {
      const status = err.status || 500;
      const errorMsg = err.message || String(err);
      attemptedErrors.push(`Key #${index + 1} (••••${key.slice(-4)}): [${status}] ${errorMsg}`);

      if (isCreditOrRateLimitError(status, errorMsg)) {
        markKeyExhausted(key, index, errorMsg, status);
        // Continue loop to try next key
        continue;
      }

      // If it's a structural error (not quota/credit), still try next key once or rethrow
      markKeyExhausted(key, index, errorMsg, status);
    }
  }

  // All keys exhausted
  const summary = attemptedErrors.join(' | ');
  throw new Error(`All ${pool.length} Gemini API keys in pool exhausted or failed: ${summary}`);
}

/**
 * Get sanitized pool telemetry status for /api/health and operator dashboard
 */
export function getGeminiPoolStatus(env = process.env) {
  const pool = extractGeminiKeys(env);
  const details = pool.map((key, index) => {
    const state = getKeyState(key, index);
    return {
      slot: index + 1,
      maskedKey: maskApiKey(key),
      isExhausted: state.isExhausted,
      cooldownRemainingSec: state.isExhausted && state.exhaustedAt
        ? Math.max(0, Math.round((state.cooldownMs - (Date.now() - state.exhaustedAt)) / 1000))
        : 0,
      successCount: state.successCount,
      failCount: state.failCount,
      lastError: state.lastError,
    };
  });

  const activeCount = details.filter((d) => !d.isExhausted).length;

  return {
    totalKeys: pool.length,
    activeKeys: activeCount,
    exhaustedKeys: pool.length - activeCount,
    isHealthy: activeCount > 0,
    keys: details,
  };
}
