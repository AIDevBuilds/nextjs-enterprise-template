import { NextResponse } from 'next/server';
import { refreshSession } from '@/shared/lib/auth/refresh';
import { getServerSession } from '@/shared/lib/auth/session';

export const dynamic = 'force-dynamic';

/**
 * Explicit session renewal. The BFF proxy refreshes automatically on a 401, so
 * this exists for clients that want to renew proactively (e.g. before a long
 * upload) or to verify the refresh token is still good.
 */
export async function POST() {
  const token = await refreshSession();
  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Session expired' } },
      { status: 401 },
    );
  }

  const user = await getServerSession();
  return NextResponse.json({ success: true, data: { user } });
}
