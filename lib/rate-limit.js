// Rate limiting for the API routes.
//
// Primary backend: Upstash Redis (shared across all serverless instances), so
// a per-IP limit is a true global ceiling. Configure it with two env vars:
//   UPSTASH_REDIS_REST_URL
//   UPSTASH_REDIS_REST_TOKEN
//
// If those aren't present (local dev, a preview deploy without creds), or if
// Upstash is unreachable at request time, we FAIL OPEN onto a per-instance
// in-memory limiter — users are never blocked by an Upstash outage, and the
// in-memory counter still blunts accidental hammering on that instance.

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ── In-memory fallback ───────────────────────────────────────────────
const buckets = new Map();
let lastSweep = Date.now();

function sweep(now) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, v] of buckets) {
    if (now >= v.resetAt) buckets.delete(k);
  }
}

function memoryLimit(key, limit, windowMs) {
  const now = Date.now();
  sweep(now);

  const entry = buckets.get(key);
  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, retryAfter: 0 };
}

// ── Upstash backend ──────────────────────────────────────────────────
const upstashEnabled =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = upstashEnabled ? Redis.fromEnv() : null;

// One Ratelimit instance per distinct limit/window, cached so we don't rebuild
// it on every request.
const limiters = new Map();

function getUpstashLimiter(limit, windowMs) {
  const id = `${limit}:${windowMs}`;
  let rl = limiters.get(id);
  if (!rl) {
    rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${Math.round(windowMs / 1000)} s`),
      prefix: 'pf-rl', // namespace so a shared DB never collides with other apps
      analytics: false,
    });
    limiters.set(id, rl);
  }
  return rl;
}

/**
 * Check (and consume) one unit against the limit for `key`.
 * @param {string} key   Unique caller key (e.g. `format:1.2.3.4`).
 * @param {{limit:number, windowMs:number}} opts
 * @returns {Promise<{allowed:boolean, remaining:number, retryAfter:number}>}
 */
export async function rateLimit(key, { limit, windowMs }) {
  if (!upstashEnabled) return memoryLimit(key, limit, windowMs);

  try {
    const res = await getUpstashLimiter(limit, windowMs).limit(key);
    return {
      allowed: res.success,
      remaining: res.remaining,
      retryAfter: res.success ? 0 : Math.max(1, Math.ceil((res.reset - Date.now()) / 1000)),
    };
  } catch (err) {
    // Fail open: never let an Upstash hiccup take down Format/Hooks. Fall back
    // to the in-memory counter so there's still some protection.
    console.warn('[rate-limit] Upstash unavailable, using in-memory fallback:', err?.message || err);
    return memoryLimit(key, limit, windowMs);
  }
}

// Best-effort client identity from proxy headers. Vercel/most hosts set
// x-forwarded-for; the first entry is the original client.
export function clientKey(request) {
  const xff = request.headers.get('x-forwarded-for');
  const ip = (xff ? xff.split(',')[0].trim() : '') || request.headers.get('x-real-ip') || 'unknown';
  return ip;
}

// Standard 429 response with a Retry-After hint.
export function tooManyRequests(retryAfter) {
  return Response.json(
    { error: `You're going a bit fast. Try again in ${retryAfter}s.` },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}

// LinkedIn posts cap at 3,000 characters; allow generous headroom but reject
// anything clearly oversized before it reaches a paid model.
export const MAX_POST_CHARS = 6000;
