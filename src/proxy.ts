import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/shared/lib/auth/cookie-config';

/**
 * Fast first-line auth guard at the edge.
 *
 * Next 16 renamed the `middleware` file convention to `proxy`; the exported
 * function must be named `proxy`. Same runtime and semantics as before.
 * It only checks for the presence of the
 * httpOnly access-token cookie — it does NOT verify the token. Real validation
 * happens in the dashboard server layout (`getServerSession`) and, ultimately,
 * on every upstream API call.
 */
const PROTECTED_PREFIXES = ['/dashboard'];
const AUTH_PATHS = ['/login', '/register'];
const DEFAULT_AUTHED_PATH = '/dashboard/tasks';

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !hasToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && hasToken) {
    const url = request.nextUrl.clone();
    url.pathname = DEFAULT_AUTHED_PATH;
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
