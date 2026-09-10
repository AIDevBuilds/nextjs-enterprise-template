import { NextResponse } from 'next/server';
import { getServerSession } from '@/shared/lib/auth/session';

export const dynamic = 'force-dynamic';

/** Returns the current session user, or 401. Used by the client to (re)hydrate. */
export async function GET() {
  const user = await getServerSession();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    );
  }
  return NextResponse.json({ success: true, data: { user } });
}
