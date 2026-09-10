import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { env } from '@/env';
import { upstreamFetch } from '@/shared/lib/upstream-fetch';
import { AUTH_COOKIE_NAME } from '@/shared/lib/auth/cookie-config';
import { clearSessionCookies } from '@/shared/lib/auth/set-session';

export const dynamic = 'force-dynamic';

export async function POST() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    await upstreamFetch(`${env.API_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {
      /* best effort — always clear local cookies below */
    });
  }

  await clearSessionCookies();
  return NextResponse.json({ success: true });
}
