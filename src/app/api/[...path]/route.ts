import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { env } from '@/env';
import { AUTH_COOKIE_NAME } from '@/shared/lib/auth/cookie-config';
import { refreshSession } from '@/shared/lib/auth/refresh';
import { UpstreamTimeoutError, isClientAbort, upstreamFetch } from '@/shared/lib/upstream-fetch';
import { logger } from '@/shared/lib/observability/logger';

/**
 * Backend-for-Frontend proxy.
 *
 * All authenticated data requests from the browser go to `/api/*` (same origin)
 * and are forwarded here to `${API_URL}/*` with the Bearer token read from the
 * httpOnly cookie. The token therefore never reaches client JavaScript.
 *
 * If the upstream rejects the token with a 401, we transparently refresh once
 * and replay the request — so an expired access token is invisible to the user.
 *
 * Explicit routes under `/api/auth/*` take precedence over this catch-all.
 */
export const dynamic = 'force-dynamic';

const errorResponse = (status: number, code: string, message: string) =>
  NextResponse.json({ success: false, error: { code, message } }, { status });

async function proxy(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  let token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return errorResponse(401, 'UNAUTHORIZED', 'Not authenticated');

  const target = `${env.API_URL}/${path.join('/')}${request.nextUrl.search}`;
  const contentType = request.headers.get('content-type');
  // Read the body once — a Request body cannot be consumed twice on replay.
  const body =
    request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text();

  const send = (bearer: string) => {
    const headers: Record<string, string> = { Authorization: `Bearer ${bearer}` };
    if (contentType) headers['Content-Type'] = contentType;
    // `request.signal` aborts the upstream call if the browser disconnects.
    return upstreamFetch(target, { method: request.method, headers, body }, request.signal);
  };

  let upstream: Response;
  try {
    upstream = await send(token);

    if (upstream.status === 401) {
      const refreshed = await refreshSession();
      if (!refreshed) return errorResponse(401, 'UNAUTHORIZED', 'Not authenticated');
      token = refreshed;
      upstream = await send(token);
    }
  } catch (error) {
    if (isClientAbort(error, request.signal)) {
      // Nobody is waiting for this response; don't log it as a failure.
      return errorResponse(499, 'CLIENT_CLOSED_REQUEST', 'Request aborted');
    }
    if (error instanceof UpstreamTimeoutError) {
      logger.warn('upstream timeout', { target, method: request.method });
      return errorResponse(504, 'GATEWAY_TIMEOUT', 'Upstream API timed out');
    }
    logger.error('upstream request failed', error, { target, method: request.method });
    return errorResponse(502, 'BAD_GATEWAY', 'Upstream API unreachable');
  }

  const payload = await upstream.text();
  const response = new NextResponse(payload || null, { status: upstream.status });
  const upstreamContentType = upstream.headers.get('content-type');
  if (upstreamContentType) response.headers.set('content-type', upstreamContentType);
  return response;
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
