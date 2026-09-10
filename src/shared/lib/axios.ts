import axios, { AxiosError } from 'axios';

/**
 * Client for the same-origin BFF (`/api/*`). Requests are proxied to the upstream
 * API by `src/app/api/[...path]/route.ts`, which attaches the Bearer token from
 * the httpOnly cookie server-side. There is deliberately NO request interceptor
 * here — the browser never sees the token.
 *
 * Use only from client components / hooks. Server code should call the upstream
 * API directly (see `src/shared/lib/auth/*`).
 */
export const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      // A 401 from an auth endpoint means "bad credentials" — the form shows it.
      // A 401 anywhere else means the session expired, so bounce to login.
      const isAuthEndpoint = (error.config?.url ?? '').startsWith('/auth/');
      const { pathname } = window.location;
      const onAuthPage = ['/login', '/register'].some((p) => pathname.startsWith(p));

      if (!isAuthEndpoint && !onAuthPage) {
        // A hard navigation is deliberate: the session is gone, so the whole
        // client tree and every cache should be torn down, not soft-routed.
        // This runs inside an axios interceptor, outside React — `useRouter()`
        // and `redirect()` are both unavailable here.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = `/login?next=${encodeURIComponent(pathname)}`;
      }
    }
    return Promise.reject(error);
  },
);
