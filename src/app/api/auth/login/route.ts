import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/shared/utils/validators';
import { callUpstreamAuth } from '@/shared/lib/auth/upstream';
import { writeSessionCookies } from '@/shared/lib/auth/set-session';
import { clientIdentifier, rateLimit, rateLimitHeaders } from '@/shared/lib/rate-limit';

export const dynamic = 'force-dynamic';

/** 10 attempts per IP per 5 minutes — slows credential stuffing without hurting typos. */
const LIMIT = { name: 'auth:login', limit: 10, windowMs: 5 * 60_000 };

export async function POST(request: NextRequest) {
  const limit = rateLimit(clientIdentifier(request), LIMIT);
  if (!limit.ok) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'TOO_MANY_REQUESTS', message: 'Too many attempts. Try again shortly.' },
      },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid login payload' } },
      { status: 422 },
    );
  }

  const result = await callUpstreamAuth('/auth/login', parsed.data);
  if (!result.ok) {
    return NextResponse.json(result.body, {
      status: result.status,
      headers: rateLimitHeaders(limit),
    });
  }

  await writeSessionCookies(result.data.token, result.data.user);
  return NextResponse.json({ success: true, data: { user: result.data.user } });
}
