import 'server-only';
import { logger } from '@/shared/lib/observability/logger';

/**
 * Fixed-window rate limiter for BFF route handlers.
 *
 * SCOPE: this protects *your* Next.js tier from credential stuffing and abusive
 * bursts. It is **not** a substitute for rate limiting on the upstream API — an
 * attacker can call that directly without going through this app. Enforce in
 * both places.
 *
 * STORAGE: in-memory, so counters are per-process. That is fine for a single
 * instance and for slowing down naive attacks. On multiple instances or
 * serverless, swap `MemoryStore` for Redis/Upstash — the `RateLimitStore`
 * interface is the only thing you need to reimplement.
 */

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  /** Unix ms when the current window ends. */
  resetAt: number;
}

interface RateLimitStore {
  hit(key: string, windowMs: number): { count: number; resetAt: number };
}

class MemoryStore implements RateLimitStore {
  private buckets = new Map<string, { count: number; resetAt: number }>();
  private lastSweep = Date.now();

  hit(key: string, windowMs: number) {
    const now = Date.now();
    this.sweep(now);

    const existing = this.buckets.get(key);
    if (!existing || existing.resetAt <= now) {
      const fresh = { count: 1, resetAt: now + windowMs };
      this.buckets.set(key, fresh);
      return fresh;
    }

    existing.count += 1;
    return existing;
  }

  /** Drop expired buckets occasionally so the map can't grow without bound. */
  private sweep(now: number) {
    if (now - this.lastSweep < 60_000) return;
    this.lastSweep = now;
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }
}

const store: RateLimitStore = new MemoryStore();

export interface RateLimitOptions {
  /** Requests allowed per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Namespace so different routes don't share a bucket. */
  name: string;
}

export function rateLimit(identifier: string, options: RateLimitOptions): RateLimitResult {
  const { count, resetAt } = store.hit(`${options.name}:${identifier}`, options.windowMs);
  const ok = count <= options.limit;

  if (!ok) {
    logger.warn('rate limit exceeded', {
      limiter: options.name,
      identifier,
      count,
      limit: options.limit,
    });
  }

  return { ok, limit: options.limit, remaining: Math.max(0, options.limit - count), resetAt };
}

/**
 * Best-effort client identity. `x-forwarded-for` is set by the proxy/CDN in
 * front of the app; it is spoofable if nothing trusted sets it, so treat this as
 * abuse mitigation, not authentication.
 */
export function clientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

/** Standard headers so clients can back off politely. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'RateLimit-Limit': String(result.limit),
    'RateLimit-Remaining': String(result.remaining),
    'RateLimit-Reset': String(Math.max(0, Math.ceil((result.resetAt - Date.now()) / 1000))),
  };
}
