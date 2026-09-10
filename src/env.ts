/**
 * Typed, validated environment access. Import `env` everywhere instead of
 * touching `process.env` directly.
 *
 * - Server-only variables are validated only on the server.
 * - Accessing a server-only variable from client code throws a clear error.
 * - A missing/invalid variable fails the build, not a request.
 */
import { z } from 'zod';

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  /** Base URL of the upstream API the BFF proxy forwards to. Server-only. */
  API_URL: z.string().url(),
  /** Name of the httpOnly cookie that stores the access token. */
  AUTH_COOKIE_NAME: z.string().min(1).default('access_token'),
  /** Name of the httpOnly cookie that stores the cached session user (JSON). */
  AUTH_SESSION_USER_COOKIE: z.string().min(1).default('session_user'),
  /** Cookie lifetime in seconds. Default 7 days. */
  AUTH_SESSION_MAX_AGE: z.coerce
    .number()
    .int()
    .positive()
    .default(60 * 60 * 24 * 7),
  /** Name of the httpOnly cookie holding the refresh token. */
  AUTH_REFRESH_COOKIE_NAME: z.string().min(1).default('refresh_token'),
  /** Refresh-token cookie lifetime in seconds. Default 30 days. */
  AUTH_REFRESH_MAX_AGE: z.coerce
    .number()
    .int()
    .positive()
    .default(60 * 60 * 24 * 30),
  /** Abort an upstream API call after this many ms. Prevents hung requests. */
  API_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
  /** Build identifier surfaced by /api/health. Set to the git SHA in CI. */
  APP_VERSION: z.string().min(1).default('dev'),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default('App'),
  /** Minimum level the structured logger emits. Defaults by NODE_ENV. */
  NEXT_PUBLIC_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
});

const isServer = typeof window === 'undefined';

const clientEnv = {
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
};

/**
 * A variable present but blank in `.env` (`FOO=`) arrives as `''`, which would
 * fail `.min(1)` / `.enum()` instead of falling back to the schema default.
 * Treat blank as "not set".
 */
function omitBlank(source: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(source).filter(([, value]) => value !== ''));
}

const parsed = isServer
  ? serverSchema.merge(clientSchema).safeParse(omitBlank({ ...process.env, ...clientEnv }))
  : clientSchema.safeParse(omitBlank(clientEnv));

if (!parsed.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
  );
  throw new Error('Invalid environment variables. See .env.example.');
}

type Env = z.infer<typeof serverSchema> & z.infer<typeof clientSchema>;

export const env = new Proxy(parsed.data as Env, {
  get(target, key: string) {
    if (!isServer && !key.startsWith('NEXT_PUBLIC_')) {
      throw new Error(`❌ Attempted to access server-only env var "${key}" on the client.`);
    }
    return Reflect.get(target, key);
  },
});
