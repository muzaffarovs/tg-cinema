/**
 * Fixed-window in-memory rate limiter. On serverless platforms each instance
 * keeps its own window — adequate for a single-user app to absorb bursts and
 * scripted abuse without adding external infrastructure.
 */

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();
const MAX_KEYS = 5_000;

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, rule: RateLimitRule, now = Date.now()): RateLimitResult {
  if (windows.size > MAX_KEYS) prune(now);

  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + rule.windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  current.count += 1;
  if (current.count > rule.limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSeconds: 0 };
}

function prune(now: number): void {
  for (const [key, w] of windows) {
    if (w.resetAt <= now) windows.delete(key);
  }
  // Still too many live keys: drop the oldest insertions.
  if (windows.size > MAX_KEYS) {
    let excess = windows.size - MAX_KEYS;
    for (const key of windows.keys()) {
      if (excess-- <= 0) break;
      windows.delete(key);
    }
  }
}

export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || headers.get("x-real-ip") || "unknown";
}
