/**
 * ABYSS - GROQ MULTI-KEY ROTATOR & FAILOVER POOL
 * Manages up to 6+ Groq API keys with automatic failover upon rate limits (429 TPM/RPM) or credit exhaustion.
 */

// In-memory key health state cache
const keyStates = new Map();

/**
 * Extract and sanitize all available Groq API keys from environment
 * Supports:
 * - GROQ_API_KEY_1 ... GROQ_API_KEY_6
 * - GROQ_API_KEYS (comma or newline separated)
 * - GROQ_API_KEY / VITE_GROQ_API_KEY (fallback)
 */
export function extractGroqKeys(env = process.env) {
  const keys = [];

  // 1. Explicit numbered keys 1 through 6
  for (let i = 1; i <= 6; i++) {
    const key = env[`GROQ_API_KEY_${i}`] || env[`VITE_GROQ_API_KEY_${i}`];
    if (key && typeof key === 'string' && key.trim().length > 10) {
      keys.push(key.trim());
    }
  }

  // 2. Comma or newline-separated key list
  const multiKeyString = env.GROQ_API_KEYS || env.VITE_GROQ_API_KEYS;
  if (multiKeyString && typeof multiKeyString === 'string') {
    const splitKeys = multiKeyString
      .split(/[\n,;]+/)
      .map((k) => k.trim())
      .filter((k) => k.length > 10);
    keys.push(...splitKeys);
  }

  // 3. Single key fallback
  const singleKey = env.GROQ_API_KEY || env.VITE_GROQ_API_KEY;
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
      cooldownMs: 60000, // 1 min default cooldown for Groq rate limits
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
  // Groq TPM/RPM free tier resets in ~60 seconds. Auth/Quota errors use 10 minutes.
  state.cooldownMs = (status === 401 || status === 403 || status === 402) ? 600000 : 60000;

  console.warn(
    `[GROQ ROTATOR] Key #${index + 1} (${maskKey(key)}) marked exhausted for ${state.cooldownMs / 1000}s. Reason: ${state.lastError}`
  );
}

/**
 * Record a successful key usage
 */
function markKeySuccess(key, index) {
  const state = getKeyState(key, index);
  state.isExhausted = false;
  state.exhaustedAt = null;
  state.lastUsedAt = Date.now();
  state.successCount += 1;
  state.lastError = null;
}

/**
 * Helper to mask an API key for safe logging
 */
export function maskKey(key) {
  if (!key || key.length <= 8) return '********';
  return `${key.slice(0, 5)}...${key.slice(-4)}`;
}

/**
 * Core Rotator Execution Engine
 * Evaluates candidate keys in round-robin / healthy-first order.
 * If client provides an override key, it tries that first.
 */
export async function executeGroqWithRotation(
  operation,
  clientOverrideKey = null,
  env = process.env
) {
  // 1. If the client explicitly provided their own custom key in headers, attempt it first
  if (clientOverrideKey && typeof clientOverrideKey === 'string' && clientOverrideKey.trim().length > 10) {
    try {
      return await operation(clientOverrideKey.trim(), -1);
    } catch (err) {
      console.warn(`[GROQ ROTATOR] Client override key failed: ${err.message}. Falling back to pool.`);
    }
  }

  // 2. Extract keys from environment
  const pool = extractGroqKeys(env);

  if (pool.length === 0) {
    throw new Error('NO_GROQ_KEYS_AVAILABLE: Please configure GROQ_API_KEY in .env or provide a client key.');
  }

  // 3. Find candidate keys sorted by: healthy first, then least recently used / lowest fail count
  const keyCandidates = pool.map((key, index) => ({
    key,
    index,
    state: getKeyState(key, index),
  }));

  // Separate healthy from exhausted
  const healthyKeys = keyCandidates.filter((c) => !c.state.isExhausted);
  const exhaustedKeys = keyCandidates.filter((c) => c.state.isExhausted);

  // Try healthy keys first, sorted by successCount ascending for load distribution
  healthyKeys.sort((a, b) => a.state.successCount - b.state.successCount);

  // If all keys exhausted, attempt the oldest exhausted key whose cooldown is closest
  exhaustedKeys.sort((a, b) => (a.state.exhaustedAt || 0) - (b.state.exhaustedAt || 0));

  const sequenceToTry = [...healthyKeys, ...exhaustedKeys];

  let lastError = null;

  for (const candidate of sequenceToTry) {
    try {
      const result = await operation(candidate.key, candidate.index);
      markKeySuccess(candidate.key, candidate.index);
      return result;
    } catch (err) {
      lastError = err;
      const status = err.status || (err.message && err.message.includes('429') ? 429 : 500);

      // Recognize rate limiting, auth failures, or quota limits
      const isQuotaOrRateLimit =
        status === 429 ||
        status === 402 ||
        status === 401 ||
        status === 403 ||
        (err.message && (
          err.message.includes('rate_limit_exceeded') ||
          err.message.includes('insufficient_quota') ||
          err.message.includes('Rate limit reached') ||
          err.message.includes('tokens per minute')
        ));

      if (isQuotaOrRateLimit) {
        markKeyExhausted(candidate.key, candidate.index, err.message, status);
        // Continue loop to try next key in pool
        continue;
      } else {
        // Non-quota error (e.g. malformed prompt or network failure); still attempt failover
        console.warn(`[GROQ ROTATOR] Key #${candidate.index + 1} experienced error: ${err.message}`);
        continue;
      }
    }
  }

  throw lastError || new Error('All Groq API keys in failover pool exhausted or unresponsive.');
}

/**
 * Diagnostics and Telemetry for current Key Pool
 */
export function getGroqPoolStatus(env = process.env) {
  const pool = extractGroqKeys(env);

  const keyDetails = pool.map((key, index) => {
    const state = getKeyState(key, index);
    const cooldownRemaining =
      state.isExhausted && state.exhaustedAt
        ? Math.max(0, state.cooldownMs - (Date.now() - state.exhaustedAt))
        : 0;

    return {
      index: index + 1,
      maskedKey: maskKey(key),
      status: state.isExhausted ? 'EXHAUSTED' : 'HEALTHY',
      cooldownSecondsRemaining: Math.ceil(cooldownRemaining / 1000),
      successCount: state.successCount,
      failCount: state.failCount,
      lastUsed: state.lastUsedAt ? new Date(state.lastUsedAt).toISOString() : null,
      lastError: state.lastError,
    };
  });

  const activeCount = keyDetails.filter((k) => k.status === 'HEALTHY').length;

  return {
    provider: 'Groq',
    defaultModel: env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    totalKeys: pool.length,
    activeKeys: activeCount,
    exhaustedKeys: pool.length - activeCount,
    poolStatus: pool.length === 0 ? 'NOT_CONFIGURED' : activeCount > 0 ? 'OPERATIONAL' : 'ALL_KEYS_EXHAUSTED',
    keys: keyDetails,
  };
}
