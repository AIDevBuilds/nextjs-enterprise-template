import 'server-only';
import { env } from '@/env';

/**
 * Server-side fetch to the upstream API with a mandatory timeout.
 *
 * `fetch` has **no default timeout** — without an abort signal a hung upstream
 * holds the request (and its socket) open indefinitely, which is how a slow
 * dependency turns into an outage. Every server-side call to `API_URL` must go
 * through here.
 *
 * Pass `clientSignal` (a route handler's `request.signal`) to also abort when
 * the browser disconnects, so we stop work nobody is waiting for.
 */
export class UpstreamTimeoutError extends Error {
  readonly name = 'UpstreamTimeoutError';
}

export async function upstreamFetch(
  url: string,
  init: RequestInit = {},
  clientSignal?: AbortSignal,
): Promise<Response> {
  const timeout = AbortSignal.timeout(env.API_TIMEOUT_MS);
  const signal = clientSignal ? AbortSignal.any([clientSignal, timeout]) : timeout;

  try {
    return await fetch(url, { ...init, signal, cache: 'no-store' });
  } catch (error) {
    // `AbortSignal.timeout` rejects with a TimeoutError; distinguish it from a
    // client disconnect so callers can return 504 vs. simply stop.
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new UpstreamTimeoutError(`Upstream did not respond within ${env.API_TIMEOUT_MS}ms`);
    }
    throw error;
  }
}

/** True when the failure was the browser going away, not an upstream problem. */
export function isClientAbort(error: unknown, clientSignal?: AbortSignal): boolean {
  return Boolean(clientSignal?.aborted) && error instanceof Error && error.name === 'AbortError';
}
