# Architecture Blueprint (Next.js base template)

This is the **reusable architecture specification** for the template. It explains
how the code is organised and _why_, in enough detail that a developer — or a
coding tool reading this file — can extend the project or regenerate its shape
without breaking it.

The operational, rule-form version is [CLAUDE.md](./CLAUDE.md). Read that too.

Example domain (`auth` / `tasks` / `projects`) is illustrative — replace it with
your product's features; keep the structure.

---

## 1. Stack

| Concern              | Choice                                                                 | Notes                                                                     |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Framework            | Next.js 15 App Router, `output: 'standalone'`                          | RSC-capable; feature UI is mostly client components                       |
| Language             | TypeScript `strict`                                                    | `@/*`→`src/*`, `@tests/*`→`tests/*`                                       |
| UI runtime           | React 18                                                               |                                                                           |
| Server state         | TanStack Query v5                                                      | all remote data; never in Zustand                                         |
| Client/UI state      | Zustand v4                                                             | filters, selection, session user (not persisted)                          |
| Transport            | axios instance, `baseURL: '/api'`                                      | talks to the same-origin BFF only                                         |
| Auth                 | httpOnly Secure cookie + BFF proxy                                     | token never reaches JS — see §4                                           |
| Env                  | `src/env.ts`, Zod-validated                                            | single source; `process.env` banned elsewhere                             |
| Forms                | react-hook-form + Zod resolver                                         | schema = source of truth for types                                        |
| Styling              | Tailwind v3 + `cn()` (clsx + tailwind-merge)                           |                                                                           |
| Notifications        | react-hot-toast                                                        | mounted once in `providers.tsx`                                           |
| Unit/component tests | Jest + Testing Library + MSW (node)                                    | `tests/unit/**`                                                           |
| E2E                  | Playwright                                                             | `tests/e2e/**`, stubs `/api/**` — no backend needed                       |
| Tooling              | ESLint (`next` + `prettier`), Prettier, Husky, lint-staged, commitlint |                                                                           |
| CI                   | GitHub Actions                                                         | type-check · lint · test · build · e2e                                    |
| Container            | multi-stage `Dockerfile` (standalone)                                  |                                                                           |
| Typed routes         | **off**                                                                | experimental; forces `as Route` casts on nav arrays and dynamic redirects |

---

## 2. Directory layout

```
src/
  app/                          # Routing + composition ONLY. No data logic.
    layout.tsx                  # fonts, <Providers>, root metadata (env-driven)
    providers.tsx               # 'use client' — QueryClientProvider, Toaster, devtools
    globals.css
    error.tsx / global-error.tsx / not-found.tsx / loading.tsx
    page.tsx                    # redirect to default route
    (auth)/                     # route GROUP — not in the URL (/login, /register)
      layout.tsx                # centred card shell + wordmark
      {login,register}/page.tsx
    dashboard/                  # REAL segment — /dashboard/* (see §3)
      layout.tsx                # SERVER: getServerSession() → redirect or <AuthProvider>
      error.tsx / loading.tsx
      <resource>/page.tsx
    api/                        # Backend-for-Frontend (server only)
      auth/{login,register,logout,session}/route.ts
      [...path]/route.ts        # catch-all authenticated proxy to ${API_URL}

  features/<feature>/           # vertical slices
    api/<feature>Api.ts         # axios calls; unwraps envelope; returns domain data
    components/*.tsx            # feature UI (forms, tables, cards, filter bars)
    hooks/use<Feature>.ts      # TanStack Query hooks + query-key factory
    store/<feature>Store.ts    # Zustand — UI state only (optional)
    types/index.ts             # feature types; re-exports shared domain types

  shared/                       # cross-feature, domain-agnostic
    components/ui/             # Button, Input, Select, Textarea, Modal, Badge, Spinner
    components/layouts/        # AppShell (responsive), Sidebar, PageWrapper
    hooks/                    # generic (useErrorHandler, …)
    lib/
      axios.ts                # configured client (baseURL '/api', 401 handling)
      queryClient.ts          # QueryClient defaults
      auth/
        cookie-config.ts      # cookie names/options — Edge-safe, no imports
        jwt.ts                # unverified exp decode helpers
        session.ts            # getServerSession() — server-only, cached
        set-session.ts        # write/clear session cookies — server-only
        upstream.ts           # call upstream auth endpoints — server-only
        refresh.ts            # single-flight refresh-token rotation
        require-permission.ts # canServer / requirePermission
      rate-limit.ts           # fixed-window limiter for BFF routes
      upstream-fetch.ts       # server fetch WITH a mandatory timeout + abort
      observability/
        logger.ts             # structured logger + captureException
        types.ts              # LogRecord / LogTransport contracts
        WebVitalsReporter.tsx # Core Web Vitals → logger
      theme/
        ThemeProvider.tsx     # light/dark/system + no-FOUC init script
    types/index.ts            # domain entities + ApiResponse/PaginatedResponse/ApiError
    utils/                    # validators.ts (Zod), formatters.ts, cn.ts, api-error.ts

  i18n/
    config.ts                   # locales, cookie name, Accept-Language negotiation
    request.ts                  # next-intl getRequestConfig (server locale resolution)

  env.ts                        # validated env — the ONLY place process.env is read
  middleware.ts                 # Edge: cookie-presence guard for /dashboard + auth pages

messages/
  en.json  hi.json              # every user-facing string, by namespace

tests/
  unit/features/<feature>/*     # mirrors src/features
  e2e/{fixtures.ts,*.spec.ts}   # fixtures.ts stubs the whole /api surface
  mocks/{handlers,server}.ts    # MSW
  fixtures/index.ts             # shared mock entities
  setup.ts
```

### Dependency rule

```
app ──▶ features ──▶ shared        (never the reverse)
```

`shared/` imports only `shared/` + third-party. Features don't import each
other's internals. ESLint + review enforce it.

---

## 3. Layer responsibilities

### `app/` — routing & composition

**Layouts are the "master pages".** There are three levels:

| File                                    | Role                                                                |
| --------------------------------------- | ------------------------------------------------------------------- |
| `app/layout.tsx`                        | Root master page — `<html>`, fonts, `<Providers>`, global metadata  |
| `app/(auth)/layout.tsx`                 | Unauthenticated shell — centred card + wordmark                     |
| `app/dashboard/layout.tsx`              | Authenticated shell — auth gate + `<AppShell>` (responsive sidebar) |
| `shared/components/layouts/PageWrapper` | Per-page content shell — title, description, action slot            |

- `(auth)` **is** a route group: the parentheses keep it out of the URL, so pages
  are `/login` and `/register`.
- `dashboard` is a **real path segment**, not a group. That is deliberate — it
  gives the middleware one matcher (`/dashboard/:path*`) that covers every
  protected page. **Do not rename it to `(dashboard)`**: parentheses would strip
  the prefix, silently producing `/tasks` and `/projects` while every link,
  redirect and matcher still points at `/dashboard/*`.
- Exactly one `<main>` per page — `PageWrapper` owns it. `AppShell` deliberately
  uses plain `<div>`s so the landmarks stay valid.
- A `page.tsx` wires feature hooks to feature components and owns only page-local
  view state (which modal is open, which row is editing).
- Server Components by default. `'use client'` only where hooks/interactivity
  need it — as low in the tree as possible.
- `error.tsx` / `loading.tsx` / `not-found.tsx` exist at the root and dashboard
  levels. `global-error.tsx` wraps the root.

### `app/api/` — Backend-for-Frontend

- `auth/*` route handlers own the login/register/logout/session dance and set /
  clear the httpOnly cookies.
- `[...path]/route.ts` proxies every other `/api/*` call to `${API_URL}/*`,
  attaching the Bearer token server-side. Explicit routes win over the
  catch-all.
- This is the **only** code that talks to the upstream API from a request path
  (plus `shared/lib/auth/*` for server session reads).

### `features/<feature>/api`

- One exported object (`tasksApi`, …) of async functions against `apiClient`.
- Declares its own `Create*/Update*Payload` types.
- **Unwraps the response envelope** — callers get `T` / `T[]`, or
  `PaginatedResponse<T>` for paginated lists. Never leak `{ success, data }`.

### `features/<feature>/hooks`

- `use<Feature>s()`, `use<Feature>(id)`, `useCreate*`, `useUpdate*`, `useDelete*`.
- A query-key factory object at the top (`taskKeys.all / lists() / list(f) /
detail(id)`).
- Mutations invalidate key ranges `onSuccess`, toast via
  `extractApiError(error, fallback)`.
- Optimistic updates: `onMutate` snapshot → `onError` rollback → `onSettled`
  invalidate. `useDeleteTask` is the reference implementation.

### `features/<feature>/store`

- Zustand, one per feature, **UI state only** (filters, pagination, selection).
- Not persisted. The `auth` store holds the user profile only — no token.

### `features/<feature>/components`

- Presentational + lightly connected. Forms own their react-hook-form +
  `zodResolver` wiring and use `shared/components/ui/*`. `create` vs `edit` is
  `!!entity`; the parent owns the modal and passes `onSuccess`.

### `shared/`

- `lib/axios.ts` — `baseURL: '/api'`, `withCredentials`, `timeout`, response
  interceptor redirects to `/login` on 401 — except for `/auth/*`, where a 401
  means bad credentials, not an expired session. No request interceptor by
  design (the token lives server-side).
- `lib/upstream-fetch.ts` — the only sanctioned way for server code to call
  `API_URL`. See §5.
- `lib/queryClient.ts` — `staleTime`, `gcTime`, no retry on 401/403/404,
  `refetchOnWindowFocus: false`.
- `components/ui` — `forwardRef`, variant/size maps keyed by union types, `cn()`,
  label association + `aria-*`.
- `utils/validators.ts` — every Zod schema; each exports its inferred type;
  `update* = create*.partial()`.
- `utils/cn.ts`, `utils/api-error.ts` — the two helpers everything shares.

### Cancellation and timeouts

Three layers, all `AbortSignal`-based:

1. **Client → BFF.** TanStack Query hands `queryFn` a signal; hooks forward it to
   axios (`queryFn: ({ signal }) => tasksApi.getMany(filters, signal)`).
   Navigating away or changing a filter cancels the in-flight request instead of
   letting a stale response land.
2. **BFF → upstream, client disconnect.** The proxy passes `request.signal` into
   `upstreamFetch`, so when the browser goes away the upstream call is aborted
   rather than run to completion for nobody (returns `499`, not logged as an
   error).
3. **BFF → upstream, timeout.** `fetch` has **no default timeout** — a hung
   dependency would hold the request and its socket open forever, which is how
   one slow service becomes an outage. `upstreamFetch` applies
   `AbortSignal.timeout(API_TIMEOUT_MS)` and returns `504` (timeout) distinctly
   from `502` (unreachable).

Server code must never call bare `fetch` against `API_URL`.

### `env.ts`

- Zod schema split into server + client vars. Validates on import. A `Proxy`
  throws if client code touches a server-only var. Missing var → build fails.

### `middleware.ts`

- Edge. Cookie **presence** check only (no verification, no network). Redirects
  `/dashboard/*` → `/login?next=` when absent, and `/login|/register` →
  `/dashboard/tasks` when present.

---

## 4. Auth architecture (httpOnly cookie + BFF)

**Invariant: the access token exists only as an httpOnly, Secure,
SameSite=Lax cookie on the app's own origin. Client JS cannot read it.**

### Login

1. `LoginForm` → `authApi.login()` → `POST /api/auth/login` (same origin).
2. The route handler validates the body (Zod), calls
   `${API_URL}/auth/login`, and on success sets two httpOnly cookies:
   `access_token` (the JWT) and `session_user` (JSON of `{id,name,email}` —
   non-sensitive, saves a round trip for the server shell).
3. It returns `{ user }` only. `useLogin` puts the user in `authStore` and
   `router.replace(next)`.

### Authenticated requests

- Client calls `/api/<resource>` via `apiClient` (`baseURL: '/api'`).
- `src/app/api/[...path]/route.ts` reads `access_token`, forwards to
  `${API_URL}/<resource>` with `Authorization: Bearer …`, streams the response
  back. Same-origin ⇒ no CORS, no token in the browser.

### Session on the server

- `dashboard/layout.tsx` (Server Component) calls `getServerSession()` →
  reads cookies, checks JWT `exp` (unverified — the API is the authority),
  returns `AuthUser | null`. `null` ⇒ `redirect('/login')`.
- `<AuthProvider initialUser>` seeds the client `authStore` synchronously (no
  logged-out flash).

### Logout

- `POST /api/auth/logout` → best-effort upstream logout → clears both cookies.
- `useLogout` clears the store, `queryClient.clear()`, `router.replace('/login')`.

### Trust boundary

- The web tier does **not** verify token signatures. A forged/expired token
  passes middleware but the upstream API returns 401 on the first data call; the
  proxy forwards it and `apiClient` redirects to `/login`. Tightening to
  signature verification (shared secret / JWKS) in `getServerSession` +
  `[...path]` is a documented hardening step.

### Local dev / deployment notes

- `API_URL` is **server-only** (no `NEXT_PUBLIC_`). Set it in `.env`.
- Cookies are `Secure` only when `NODE_ENV=production`, so plain-HTTP localhost
  works.
- Because auth is same-origin via the BFF, the upstream API can live on any
  domain without cross-site-cookie configuration.

---

## 5. What is enforced automatically

These are not style suggestions — CI fails on them. This is why a project built
from this template stays on the rails even when many hands (and tools) touch it.

| Rule                                                 | Enforced by                                    |
| ---------------------------------------------------- | ---------------------------------------------- |
| No literal user-facing string in JSX                 | ESLint `react/jsx-no-literals`                 |
| Every locale defines the same keys                   | `tests/unit/i18n/config.test.ts`               |
| No `process.env` outside `src/env.ts`                | ESLint `no-process-env`                        |
| Missing/invalid env var fails the build              | Zod schema in `src/env.ts`                     |
| No hardcoded secret, no real value in `.env.example` | `.github/workflows/secret-scan.yml` (gitleaks) |
| No unused vars / bad hooks / a11y basics             | `next/core-web-vitals` + `next/typescript`     |
| Types match schemas, no `any` creep                  | `tsc --noEmit` (strict)                        |
| Coverage cannot regress                              | `coverageThreshold` in `jest.config.ts`        |
| Formatting is uniform                                | Prettier `--check` + pre-commit hook           |
| Commit messages are conventional                     | commitlint `commit-msg` hook                   |
| Auth flow actually works end-to-end                  | Playwright specs (stubbed `/api/**`)           |
| Dependencies stay patched                            | Dependabot + CodeQL                            |

Anything not in this table is enforced by review — see [CLAUDE.md](./CLAUDE.md).

---

## 6. Conventions

- **Naming:** `PascalCase` components; `camelCase` hooks/utils/api objects;
  `use*` hooks; `*Api` transport; `*Store`/`use*Store` Zustand; `*Schema` Zod.
- **Types from schemas** — never a hand-written parallel interface.
- **Envelope unwrapping** happens once, in `api/`.
- **Errors** — `extractApiError(error, fallback)` everywhere; toast for
  mutations, inline `role="alert"` for form-level server errors.
- **Barrels** only at `types/index.ts`.
- **`cn()`** for all class composition.
- **No `process.env`** outside `src/env.ts` and `cookie-config.ts`.
- **Accessibility baseline** — every interactive primitive has a label / `aria`,
  focus ring, role; `Modal` traps focus and restores it.

---

## 7. Testing strategy

- **Unit/component** (jsdom): render with a fresh `QueryClient` (retry off). MSW
  node server intercepts HTTP; handlers use wildcard origins and cover the happy
  path + representative error codes (401/403/404/409/422). Per-test overrides via
  `server.use()`. Entities from `tests/fixtures`. Mirror `src/features/...`.
- **E2E** (Playwright): `tests/e2e/fixtures.ts` extends `test` to intercept the
  entire `/api/**` surface with a stateful in-memory stub and seed session
  cookies on login. `npm run test:e2e` is green with nothing else running. Swap
  in a real disposable API by deleting the mock installer and pointing `API_URL`
  at it.
- **Gates:** `type-check`, `lint`, `test:coverage` (thresholds in
  `jest.config.ts`), `build`, `test:e2e` — all in CI.

---

## 8. Adding a feature

See [CLAUDE.md §5](./CLAUDE.md). Short version: `types` → Zod schemas →
`api` (returns domain data) → `hooks` (key factory + Query hooks + toasts) →
`store` (only if needed) → `components` → `app/dashboard/<feature>/page.tsx` +
Sidebar entry → tests (unit mirror + MSW handlers + e2e spec).

---

## 9. Configuration

- `tsconfig.json` — `strict`, `noEmit`, `moduleResolution: bundler`, path
  aliases.
- `next.config.ts` — `reactStrictMode`, `poweredByHeader: false`,
  `output: 'standalone'`, `typedRoutes`, `images.remotePatterns`, and a
  `headers()` block: CSP (permissive enough for Next without a nonce pipeline —
  tighten with a middleware nonce for strict CSP), HSTS, `X-Content-Type-Options`,
  `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`.
- `src/env.ts` + `.env.example` — every variable documented and validated.
- Jest via `next/jest`; `testMatch` limited to `tests/unit/**`;
  `coverageThreshold` set.
- ESLint `next/core-web-vitals` + `next/typescript` + `prettier`;
  `no-process-env` on. Prettier + `prettier-plugin-tailwindcss`. Husky
  `pre-commit` (lint-staged) + `commit-msg` (commitlint). `.nvmrc` = Node 20.

---

## 10. Remaining hardening (not yet in the template)

Deliberately left for the product to decide/own:

1. **JWT signature verification** in `getServerSession` and the proxy (shared
   secret or JWKS) — the web tier currently trusts presence + `exp`, and relies
   on the upstream API to reject forged tokens.
2. **Distributed rate limiting** — the limiter is in-memory and per-process.
   Replace `MemoryStore` in `shared/lib/rate-limit.ts` with Redis/Upstash for
   multi-instance or serverless deployments.
3. **An error-tracking transport** — the plumbing is done; register one with
   `addLogTransport(...)` (e.g. Sentry) and add source-map upload to CI.
4. **Strict CSP** — nonce-based `script-src` via middleware, replacing the
   `'unsafe-inline'` default.
5. **Automated accessibility tests** — add `jest-axe` / `@axe-core/playwright`.
6. **Sitemap/robots, Storybook, feature flags** — add if the product needs them.
7. **Translation review** — `messages/hi.json` is a sample locale to prove the
   plumbing; have a native speaker review before shipping it.
8. **Fill in the placeholders** — `LICENSE` copyright holder and
   `.github/CODEOWNERS` GitHub handle.

---

## 11. One-line summary

> Feature-sliced Next.js App Router template: thin routing layer, a
> Backend-for-Frontend that keeps the auth token in an httpOnly cookie, vertical
> feature slices (`api`/`hooks`/`components`/`store`/`types`), a domain-agnostic
> `shared` layer, TanStack Query for server state, Zustand for UI state, Zod as
> the source of truth for forms and env, and a mirrored unit + stubbed-E2E test
> tree — with lint/format/hooks/CI/Docker wired in.
