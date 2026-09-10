import 'server-only';
import { cookies } from 'next/headers';
import { REFRESH_COOKIE_NAME } from './cookie-config';
import { refreshUpstreamSession } from './upstream';
import { clearSessionCookies, writeSessionCookies } from './set-session';
import { logger } from '@/shared/lib/observability/logger';

/**
 * Exchanges the stored refresh token for a new access token and rewrites the
 * session cookies. Returns the new access token, or null when the session
 * cannot be renewed (in which case the cookies are cleared).
 *
 * Concurrent callers share one in-flight exchange: with rotating refresh
 * tokens, two parallel refreshes would race and the loser would present an
 * already-consumed token.
 */
let inFlight: Promise<string | null> | null = null;

export function refreshSession(): Promise<string | null> {
  inFlight ??= performRefresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function performRefresh(): Promise<string | null> {
  const refreshToken = (await cookies()).get(REFRESH_COOKIE_NAME)?.value;
  if (!refreshToken) return null;

  const result = await refreshUpstreamSession(refreshToken);

  if (!result.ok) {
    logger.info('session refresh failed; clearing cookies', { status: result.status });
    await clearSessionCookies();
    return null;
  }

  await writeSessionCookies(result.data.token, result.data.user, result.data.refreshToken);
  logger.debug('session refreshed');
  return result.data.token;
}
