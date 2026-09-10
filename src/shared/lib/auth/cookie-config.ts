/**
 * Auth cookie names + options. Kept dependency-free (only `process.env` and
 * plain objects) so it is safe to import from Edge middleware.
 *
 * Three cookies, all httpOnly:
 *  - access token   — short-lived bearer credential, sent to the upstream API
 *  - refresh token  — long-lived, only ever read by /api/auth/* handlers
 *  - session user   — non-sensitive profile cache (id/name/email/roles)
 */
export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'access_token';
export const REFRESH_COOKIE_NAME = process.env.AUTH_REFRESH_COOKIE_NAME || 'refresh_token';
export const SESSION_USER_COOKIE = process.env.AUTH_SESSION_USER_COOKIE || 'session_user';

const MAX_AGE = Number(process.env.AUTH_SESSION_MAX_AGE) || 60 * 60 * 24 * 7;
const REFRESH_MAX_AGE = Number(process.env.AUTH_REFRESH_MAX_AGE) || 60 * 60 * 24 * 30;

export interface AuthCookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: string;
  maxAge: number;
}

export function authCookieOptions(maxAge: number = MAX_AGE): AuthCookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
}

/**
 * The refresh token is scoped to `/api/auth` so it is never attached to ordinary
 * proxied API calls — it only travels where it is actually used.
 */
export function refreshCookieOptions(maxAge: number = REFRESH_MAX_AGE): AuthCookieOptions {
  return { ...authCookieOptions(maxAge), path: '/api/auth' };
}
