import 'server-only';
import { env } from '@/env';
import { UpstreamTimeoutError, upstreamFetch } from '@/shared/lib/upstream-fetch';
import { isRole } from '@/features/auth/lib/permissions';
import type { AuthUser } from '@/features/auth/types';

export interface UpstreamAuthResult {
  token: string;
  /** Optional: present only if your backend issues refresh tokens. */
  refreshToken?: string;
  user: AuthUser;
}

type ProxyResult =
  { ok: true; data: UpstreamAuthResult } | { ok: false; status: number; body: unknown };

interface UpstreamBody {
  data?: {
    token?: string;
    refreshToken?: string;
    user?: AuthUser & { roles?: unknown };
  };
}

/**
 * The upstream may omit `roles`, or send roles this app doesn't know. Normalise
 * to a known-good shape so authorization never crashes on bad input — an
 * unrecognised role simply grants nothing.
 */
function normalizeUser(user: AuthUser & { roles?: unknown }): AuthUser {
  const roles = Array.isArray(user.roles) ? user.roles.filter(isRole) : [];
  return { id: user.id, email: user.email, name: user.name, roles };
}

async function postUpstream(endpoint: string, payload: unknown): Promise<ProxyResult> {
  let res: Response;
  try {
    res = await upstreamFetch(`${env.API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const timedOut = error instanceof UpstreamTimeoutError;
    return {
      ok: false,
      status: timedOut ? 504 : 502,
      body: {
        success: false,
        error: timedOut
          ? { code: 'GATEWAY_TIMEOUT', message: 'Upstream API timed out' }
          : { code: 'BAD_GATEWAY', message: 'Upstream API unreachable' },
      },
    };
  }

  const body = (await res.json().catch(() => null)) as UpstreamBody | null;

  if (!res.ok || !body?.data?.token || !body.data.user) {
    return {
      ok: false,
      status: res.status || 401,
      body: body ?? {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication failed' },
      },
    };
  }

  return {
    ok: true,
    data: {
      token: body.data.token,
      refreshToken: body.data.refreshToken,
      user: normalizeUser(body.data.user),
    },
  };
}

/** Calls an upstream auth endpoint and normalises the `{ token, user }` result. */
export function callUpstreamAuth(
  endpoint: '/auth/login' | '/auth/register',
  payload: unknown,
): Promise<ProxyResult> {
  return postUpstream(endpoint, payload);
}

/**
 * Exchanges a refresh token for a fresh access token.
 *
 * Backend contract: `POST ${API_URL}/auth/refresh` with `{ refreshToken }`,
 * responding `{ data: { token, refreshToken?, user } }`. A backend that rotates
 * refresh tokens should return the new one; it replaces the stored cookie.
 */
export function refreshUpstreamSession(refreshToken: string): Promise<ProxyResult> {
  return postUpstream('/auth/refresh', { refreshToken });
}
