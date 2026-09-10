/**
 * Minimal, dependency-free JWT helpers for the web tier.
 *
 * The web app does NOT verify token signatures — the upstream API is the
 * authority and rejects forged/expired tokens on the first data call (the proxy
 * forwards that 401 and the client redirects to /login). These helpers only read
 * the unverified `exp` claim so we can proactively treat an obviously-expired
 * session as logged-out.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** True only when the token is a JWT with an `exp` claim in the past. */
export function isJwtExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (typeof exp !== 'number') return false;
  return exp * 1000 <= Date.now();
}
