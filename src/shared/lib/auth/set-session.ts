import 'server-only';
import { cookies } from 'next/headers';
import {
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  SESSION_USER_COOKIE,
  authCookieOptions,
  refreshCookieOptions,
} from './cookie-config';
import { env } from '@/env';
import type { AuthUser } from '@/features/auth/types';

/** Writes the access-token, refresh-token and cached-user cookies. */
export async function writeSessionCookies(
  token: string,
  user: AuthUser,
  refreshToken?: string,
): Promise<void> {
  const store = await cookies();
  const options = authCookieOptions(env.AUTH_SESSION_MAX_AGE);

  store.set(AUTH_COOKIE_NAME, token, options);
  store.set(SESSION_USER_COOKIE, JSON.stringify(user), options);
  if (refreshToken) {
    store.set(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions(env.AUTH_REFRESH_MAX_AGE));
  }
}

/** Clears every session cookie on logout or a failed refresh. */
export async function clearSessionCookies(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_COOKIE_NAME);
  store.delete(SESSION_USER_COOKIE);
  store.delete({ name: REFRESH_COOKIE_NAME, path: '/api/auth' });
}
