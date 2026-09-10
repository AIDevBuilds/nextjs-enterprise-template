import { clientIdentifier, rateLimit, rateLimitHeaders } from '@/shared/lib/rate-limit';

const options = (name: string) => ({ name, limit: 3, windowMs: 1_000 });

describe('rateLimit', () => {
  it('allows requests up to the limit and blocks the next one', () => {
    const opts = options('test:allow');

    expect(rateLimit('ip-1', opts)).toMatchObject({ ok: true, remaining: 2 });
    expect(rateLimit('ip-1', opts)).toMatchObject({ ok: true, remaining: 1 });
    expect(rateLimit('ip-1', opts)).toMatchObject({ ok: true, remaining: 0 });
    expect(rateLimit('ip-1', opts)).toMatchObject({ ok: false, remaining: 0 });
  });

  it('tracks identifiers independently', () => {
    const opts = options('test:identifiers');

    rateLimit('a', opts);
    rateLimit('a', opts);
    rateLimit('a', opts);

    expect(rateLimit('a', opts).ok).toBe(false);
    expect(rateLimit('b', opts).ok).toBe(true);
  });

  it('namespaces buckets so routes do not share a budget', () => {
    rateLimit('shared-ip', options('test:routeA'));
    rateLimit('shared-ip', options('test:routeA'));
    rateLimit('shared-ip', options('test:routeA'));

    expect(rateLimit('shared-ip', options('test:routeA')).ok).toBe(false);
    expect(rateLimit('shared-ip', options('test:routeB')).ok).toBe(true);
  });

  it('starts a fresh window once the old one expires', () => {
    jest.useFakeTimers();
    try {
      const opts = { name: 'test:window', limit: 1, windowMs: 1_000 };
      expect(rateLimit('ip-window', opts).ok).toBe(true);
      expect(rateLimit('ip-window', opts).ok).toBe(false);

      jest.advanceTimersByTime(1_001);
      expect(rateLimit('ip-window', opts).ok).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('clientIdentifier', () => {
  it('uses the first x-forwarded-for entry', () => {
    const request = new Request('https://example.test', {
      headers: { 'x-forwarded-for': '203.0.113.5, 70.41.3.18' },
    });
    expect(clientIdentifier(request)).toBe('203.0.113.5');
  });

  it('falls back to x-real-ip, then to "unknown"', () => {
    expect(
      clientIdentifier(
        new Request('https://example.test', { headers: { 'x-real-ip': '10.0.0.1' } }),
      ),
    ).toBe('10.0.0.1');
    expect(clientIdentifier(new Request('https://example.test'))).toBe('unknown');
  });
});

describe('rateLimitHeaders', () => {
  it('emits standard RateLimit-* headers', () => {
    const headers = rateLimitHeaders({
      ok: false,
      limit: 10,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    });

    expect(headers['RateLimit-Limit']).toBe('10');
    expect(headers['RateLimit-Remaining']).toBe('0');
    expect(Number(headers['RateLimit-Reset'])).toBeGreaterThan(0);
  });
});
