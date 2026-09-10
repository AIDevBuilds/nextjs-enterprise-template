import 'server-only';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { AUTH_COOKIE_NAME, SESSION_USER_COOKIE } from './cookie-config';
import { isJwtExpired } from './jwt';
import type { AuthUser } from '@/features/auth/types';

/**
 * Reads the current session on the server from httpOnly cookies. No network call:
 * presence + `exp` of the access token gate access, and the user profile comes
 * from the cached `session_user` cookie set at login. Memoised per request.
 *
 * Use in Server Components / Route Handlers. The upstream API remains the source
 * of truth for authorization on every data request.
 */
export const getServerSession = cache(async (): Promise<AuthUser | null> => {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE_NAME)?.value;
  const rawUser = store.get(SESSION_USER_COOKIE)?.value;

  if (!token || !rawUser || isJwtExpired(token)) return null;

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
});
