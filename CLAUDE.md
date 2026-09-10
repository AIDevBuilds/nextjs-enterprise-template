# CLAUDE.md — rules for working in this codebase

This project was scaffolded from a shared **Next.js base template**. The
architecture below is deliberate. Follow it. If a change seems to require
breaking a rule, stop and flag it (see _Upstreaming_ at the bottom) instead of
working around it.

Full rationale lives in [ARCHITECTURE.md](./ARCHITECTURE.md). This file is the
short, enforceable version.

---

## 1. Golden rules

1. **Dependency direction is one-way:** `app/` → `features/` → `shared/`.
   - `shared/` must not import from `features/` or `app/`.
   - A feature must not import another feature's internals. Cross-feature use is
     allowed only through a feature's public modules (`api`, `hooks`,
     `components`, `store`, `types`) and should be rare.
2. **UI never contains business logic.** Components render and wire callbacks.
   Anything else lives elsewhere:

   | Concern                                                      | Home                                               |
   | ------------------------------------------------------------ | -------------------------------------------------- |
   | HTTP calls, payload shapes, envelope unwrapping              | `features/<f>/api/<f>Api.ts`                       |
   | Server state, caching, mutations, optimistic updates, toasts | `features/<f>/hooks/use<F>.ts` (TanStack Query)    |
   | Client/UI state (filters, selection, session user)           | `features/<f>/store/<f>Store.ts` (Zustand)         |
   | Validation + form types                                      | `shared/utils/validators.ts` (Zod)                 |
   | Cross-cutting helpers                                        | `shared/utils/*`, `shared/hooks/*`, `shared/lib/*` |

   A component **must not** call `apiClient`, `fetch`, `localStorage`, or read
   `process.env` directly.

3. **Never hardcode a secret. Ever.** No API key, token, password, connection
   string, webhook URL, private key or account id may appear in source, tests,
   fixtures, comments, commit messages, or `messages/*.json` — not even a
   "temporary" or "example-looking" one, and not even commented out.

   Every such value is an environment variable:
   1. add it to the Zod schema in `src/env.ts` (server block unless the browser
      genuinely needs it),
   2. document it in `.env.example` with a **placeholder, never a real value**,
   3. read it as `env.MY_KEY` — never `process.env.MY_KEY`.

   `NEXT_PUBLIC_*` variables are **compiled into the JavaScript bundle and are
   public**. A secret must never carry that prefix. If the browser appears to
   need a secret, the call belongs on the server (a route handler / the BFF
   proxy) instead.

   `.env` and every `.env.*` file are git-ignored by default (only
   `.env.example` is allowed back in). If you believe a secret has been
   committed, treat it as compromised: rotate it first, then clean history.

4. **Env access goes through `src/env.ts` only.** Import `{ env }` from `@/env`.
   Never write `process.env.*` anywhere else. ESLint enforces this
   (`no-process-env`); the only exceptions are `src/env.ts` and
   `src/shared/lib/auth/cookie-config.ts` (must stay Edge-safe, no Zod).
   Add a new variable = add it to the Zod schema in `src/env.ts` **and**
   `.env.example`.
5. **Types come from schemas.** Form value types are `z.infer<typeof schema>`.
   Do not hand-write a parallel interface.
6. **Keep the test tree mirrored.** New code in `src/features/x/` gets tests in
   `tests/unit/features/x/`. New user-facing flow → a Playwright spec. Render
   components with `renderWithProviders` from `@tests/utils/render` (it supplies
   QueryClient + real English messages).
7. **Every user-visible string comes from `messages/*.json`.** No literal text in
   JSX — not a label, not a button, not a `403`. ESLint
   (`react/jsx-no-literals`) fails the build on violations. See §7.
8. **Colours come from semantic tokens**, never literal palette shades. Use
   `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`,
   `text-danger` — not `bg-white`, `text-gray-500`, `bg-blue-600`. Tokens are
   defined once in `globals.css` for light and dark.

---

## 2. Auth model — do not change casually

**The access token is an httpOnly, Secure cookie. It is never in JavaScript,
never in `localStorage`, never in a Zustand store, never in a response body the
client can read.**

Flow:

```
Browser ──/api/auth/login──▶ Next Route Handler ──▶ upstream ${API_URL}/auth/login
                                   │ sets httpOnly cookies: access_token, session_user
                                   ▼
Browser gets { user } only ──▶ authStore.setUser(user)

Browser ──/api/<anything>──▶ src/app/api/[...path]/route.ts (BFF proxy)
                                   │ reads access_token cookie, adds Authorization: Bearer
                                   ▼
                             upstream ${API_URL}/<anything>
```

- `src/proxy.ts` — fast Edge guard, **presence** check of the cookie only.
  (Next 16 renamed the `middleware` convention to `proxy`; the exported function
  must be named `proxy`.)
- `src/shared/lib/auth/session.ts` `getServerSession()` — the real gate used by
  the dashboard server layout; reads cookies, checks JWT `exp`, returns the user.
- `apiClient` (`src/shared/lib/axios.ts`) has **no request interceptor** and
  `baseURL: '/api'`. Do not add token handling here.
- Client reads the session via `useAuthStore` (hydrated once by
  `<AuthProvider>`), or `useSession()` to refetch.
- **Refresh tokens rotate.** The refresh token lives in its own httpOnly cookie
  scoped to `/api/auth`. When the upstream returns 401 the proxy silently
  refreshes once and replays the request; concurrent refreshes are de-duplicated
  in `shared/lib/auth/refresh.ts`. Backend contract:
  `POST ${API_URL}/auth/refresh` with `{ refreshToken }` →
  `{ data: { token, refreshToken?, user } }`.
- **Rate limiting** on `/api/auth/login` and `/api/auth/register` is in-memory and
  per-process (`shared/lib/rate-limit.ts`). It slows abuse against this tier
  only — the upstream API must limit independently. Swap `MemoryStore` for Redis
  when you run more than one instance.

### Authorization

Roles carry permissions; **code checks permissions**:

```tsx
const { can } = usePermission();
{
  can('task:delete') && <Button variant="danger">…</Button>;
}
// or: <Can permission="task:delete">…</Can>
// server: if (!(await canServer('user:manage'))) return <Forbidden />;
```

Grant capabilities in `ROLE_PERMISSIONS` (`features/auth/lib/permissions.ts`) —
one line — not by editing call sites.

**Never**: reintroduce a `token` field in `authStore`; call the upstream API
directly from the browser; add `Authorization` headers in client code; persist
auth to `localStorage`.

---

## 3. axios vs TanStack Query — they are not alternatives

- **TanStack Query** manages _server state_ (cache, dedupe, refetch,
  invalidation, loading/error). It does not perform requests.
- **axios** performs the request, inside the feature `api/` module, which is
  called from a Query `queryFn` / `mutationFn`.

Do not "replace axios with TanStack" or "replace TanStack with axios". Swapping
axios for `fetch` is acceptable but pointless churn unless there's a reason —
axios centralises the 401→`/login` redirect and error shape.

---

## 4. State: when to use what

| Need                                                         | Tool                                              |
| ------------------------------------------------------------ | ------------------------------------------------- |
| Data from the API                                            | TanStack Query (`features/<f>/hooks`)             |
| UI state shared across components (filters, selected id)     | Zustand store                                     |
| UI state local to one component (modal open, hovered row)    | `useState` in that component                      |
| Stable app-wide dependency injection (query client, toaster) | React Context provider in `src/app/providers.tsx` |

**Why not React Context for app state?** Context re-renders every consumer on
every change and has no selector support — fine for a rarely-changing dependency,
bad for interactive state. Zustand gives selector subscriptions and works outside
React (interceptors, route handlers-side helpers). Use Context only for
injecting things that essentially never change during a session.

---

## 5. Adding a feature (`src/features/<feature>/`)

1. `types/index.ts` — re-export the shared domain type; add `<Feature>Filters` if
   there's a list view.
2. `shared/utils/validators.ts` — `create<Feature>Schema`,
   `update<Feature>Schema = create.partial()`, export inferred types.
3. `api/<feature>Api.ts` — CRUD against `apiClient`; **return domain data**, not
   the `{ success, data }` envelope. Paginated lists return
   `PaginatedResponse<T>`.
4. `hooks/use<Feature>.ts` — a `<feature>Keys` query-key factory + query/mutation
   hooks. Mutations: invalidate keys `onSuccess`, `toast` feedback, use
   `extractApiError(error, fallback)`. See `useDeleteTask` for the optimistic
   pattern.
5. `store/<feature>Store.ts` — only if it needs persistent UI state.
6. `components/` — table/list, form (react-hook-form + `zodResolver`, uses
   `shared/components/ui/*`), filter bar.
7. `app/dashboard/<feature>/page.tsx` — compose hooks + components, own modal
   state, add a `Sidebar` nav entry.
8. Tests under `tests/unit/features/<feature>/` + MSW handlers in
   `tests/mocks/handlers.ts` + a Playwright spec.

---

## 6. Layouts ("master pages") and UI primitives

Shared page furniture lives in layouts, never copy-pasted into pages:

| Layer      | File                                    | Owns                                           |
| ---------- | --------------------------------------- | ---------------------------------------------- |
| Root       | `app/layout.tsx`                        | `<html>`, fonts, providers, metadata template  |
| Auth shell | `app/(auth)/layout.tsx`                 | centred card, wordmark                         |
| App shell  | `app/dashboard/layout.tsx` → `AppShell` | auth gate, responsive sidebar + mobile drawer  |
| Page shell | `shared/components/layouts/PageWrapper` | page title, description, action slot, `<main>` |

A new authenticated page should be **only** `<PageWrapper>` + feature
components. If you find yourself repeating chrome across pages, it belongs in a
layout.

Use `shared/components/ui/*` (`Button`, `Input`, `Select`, `Textarea`, `Modal`,
`Badge`, `Spinner`). They are `forwardRef`, label-associated, theme-consistent.
Compose classes with `cn()` from `@/shared/utils/cn` (never raw `clsx` — `cn`
also merges conflicting Tailwind classes). Do not hand-roll `<input>`,
`<select>`, `<textarea>` in feature code; extend a primitive instead.

---

## 7. Localisation — strict

**Rule: no user-facing literal string may appear in code.** Every label, button,
placeholder, `aria-label`, `title`, toast, confirm dialog and error message is a
key in `messages/en.json`, resolved with `useTranslations()` (client) or
`getTranslations()` (server).

- Adding UI = adding keys to **every** file in `messages/`. A missing key renders
  the key path, which is loud on purpose.
- Locale is resolved from a cookie, **not** a URL prefix — URLs stay
  `/dashboard/tasks`. See `src/i18n/config.ts`.
- **Zod messages are keys, not text** (`'validation.titleRequired'`). Resolve at
  render: `error={errors.title?.message && t(errors.title.message)}`.
- Enum → label mapping is a translation, not a formatter:
  `t(\`tasks.status.${task.status}\`)`. Never add a `formatStatus()`-style helper
  that returns English.
- Interpolate, don't concatenate: `t('tasks.due', { date })`, and use ICU plurals
  (`{count, plural, =1 {# task} other {# tasks}}`) rather than `count !== 1 ? 's' : ''`.
- `react/jsx-no-literals` enforces this. If it fires, the fix is a message key —
  not an eslint-disable.

---

## 8. Theming

Tailwind 4 is **CSS-first**: there is no `tailwind.config.ts`. Tokens live in
`@theme` in `src/app/globals.css`, and light/dark values in `:root` / `.dark`
below it.

That two-layer indirection is load-bearing. `.dark` is set on `<html>`, which is
the same element (`:root`) the `@theme` vars are declared on — so overriding
`--background` there recomputes `--color-background`. Declare the two on
_different_ elements and runtime theming silently stops working.

Theme state is an external store read through `useSyncExternalStore`
(`shared/lib/theme/theme.ts`), not React state seeded from an effect — React
19's compiler rules reject the latter. There is no `ThemeProvider`; import
`useTheme` directly. A blocking inline script in the root layout applies the
class before first paint so there is no flash.

Write `bg-card text-card-foreground`, not `bg-white text-gray-900`. A component
using literal shades will look broken in dark mode — that is the tell.

---

## 9. Observability

- `logger` (`@/shared/lib/observability/logger`) emits **structured records**, not
  strings: `logger.info('msg', { context })`, `logger.error('msg', error, { ctx })`.
- `captureException(error, context)` for anything a render boundary can't catch.
- `useErrorHandler()` in components for event handlers and async callbacks —
  it reports _and_ toasts.
- `<ErrorBoundary>` isolates a widget; `error.tsx` covers a route segment.
- To ship errors to Sentry/Crashlytics/Datadog, register a transport **once**
  with `addLogTransport(...)`. Do not scatter vendor SDK calls through features.
- Never use bare `console.log` in `src/` — the lint config permits it only inside
  the logger's own transport.

---

## 10. Cancellation and timeouts

- Query hooks **must** forward the signal:
  `queryFn: ({ signal }) => xApi.getMany(filters, signal)`. Feature `api`
  functions take an optional trailing `signal?: AbortSignal`.
- Server code **must not** call bare `fetch` against `API_URL` — use
  `upstreamFetch` from `@/shared/lib/upstream-fetch`, which enforces
  `API_TIMEOUT_MS` and accepts the route handler's `request.signal`.
- A hung upstream without a timeout is how one slow dependency becomes an
  outage. This is not optional.

---

## 11. Commands

```bash
npm run dev            # local dev (needs .env — copy .env.example)
npm run type-check     # tsc --noEmit
npm run lint           # eslint . (flat config; enforces the rules below)
npm run format         # prettier --write .
npm test               # jest unit/component (MSW-backed)
npm run test:coverage  # + thresholds (see jest.config.ts)
npm run test:e2e       # Playwright — stubs /api/**, no backend needed
npm run build          # next build
```

Every change must pass `type-check`, `lint`, `test`, `build` **and** `test:e2e`
before it's done (CI runs all five — `.github/workflows/ci.yml`). The template
ships green on all of them; if one is red, you broke it.

Commits follow Conventional Commits (commitlint + Husky). `feat:`, `fix:`,
`chore:`, `refactor:`, `test:`, `docs:` …

---

## 12. Anti-patterns — reject these in review

- `process.env.X` outside `src/env.ts` / `cookie-config.ts`.
- `localStorage` for auth or server data.
- `fetch`/`axios` call inside a component or page.
- Server state duplicated into a Zustand store.
- A feature importing `@/features/<other>/api/...` deep paths.
- New `<select>`/`<input>` markup instead of a `ui/` primitive.
- Business rules (money math, status transitions, permission checks) written
  inside JSX.
- A literal user-facing string anywhere in JSX, or an `eslint-disable` for
  `react/jsx-no-literals`.
- Literal Tailwind palette shades (`bg-white`, `text-gray-500`, `bg-blue-600`)
  instead of semantic tokens.
- `console.log` / `console.error` instead of `logger` / `captureException`.
- Bare `fetch` to the upstream API from server code (no timeout), or a
  `queryFn` that ignores the `signal` it is given.
- A literal key/token/password anywhere, a real value in `.env.example`, or a
  secret behind a `NEXT_PUBLIC_` prefix.
- Logging a secret: never put a token, password or full auth header into
  `logger` context — it lands in your log aggregator in plain text.
- `user.roles.includes('admin')` in a component — check a **permission**
  (`can('task:delete')`), and grant it in `ROLE_PERMISSIONS`.
- Treating a UI permission check as security. The API enforces; the UI only
  hides.
- **Renaming `app/dashboard/` to `app/(dashboard)/`.** Parentheses make it a
  route group and strip it from the URL — pages silently become `/tasks` instead
  of `/dashboard/tasks` while every link, redirect and the proxy matcher
  still point at `/dashboard/*`. Verify route paths in `next build` output after
  touching `app/`.
- Re-enabling `experimental.typedRoutes` without also fixing every nav-config
  array and dynamic redirect it breaks.
- Editing `.next/`, committing `.env`, or hardcoding the product name (use
  `env.NEXT_PUBLIC_APP_NAME`).

---

## 13. Upstreaming improvements to the base template

This repo is a **child of a shared base template**. When you build something here
that is generic and not domain-specific — a new `ui/` primitive, a better auth
helper, a testing utility, a config fix, a new architectural rule — **call it
out explicitly** so it can be promoted back upstream.

When you notice such a change, end your summary with a section:

```
### ⬆️ Candidate for the base template
- <file(s)> — <what it is and why it's reusable>
```

Do not assume it will be copied automatically — the human maintains the base
template by hand. Just make the candidates easy to spot.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
