import { NextResponse } from 'next/server';
import { env } from '@/env';

export const dynamic = 'force-dynamic';

/**
 * Liveness/readiness probe for containers, load balancers and uptime checks.
 *
 * Deliberately does NOT call the upstream API: this reports whether *this*
 * process can serve traffic. Coupling it to a dependency means a brief upstream
 * blip gets your healthy pods killed. Add a separate `/api/ready` if you need a
 * dependency-aware check for traffic gating.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      version: env.APP_VERSION,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
