# Next.js Base Template

Opinionated, enterprise-grade starting point for Next.js 16 (App Router) apps.

- **Feature-sliced** architecture — vertical `features/*` slices over a
  domain-agnostic `shared/` layer.
- **httpOnly-cookie auth** via a Backend-for-Frontend proxy — the access token
  never touches client JavaScript.
- **React 19 + Tailwind CSS 4** (CSS-first `@theme` tokens, light/dark).
- **TanStack Query** for server state, **Zustand** for UI state, **Zod 4** for
  forms and environment validation.
- Wired: ESLint + Prettier + Husky + commitlint, Jest + Testing Library + MSW,
  Playwright (no backend needed), GitHub Actions CI, standalone Dockerfile,
  security headers.

## Quick start

```bash
nvm use                 # Node 20
npm install
cp .env.example .env    # set API_URL to your backend
npm run dev
```

## Scripts

| Script                                      | Purpose                      |
| ------------------------------------------- | ---------------------------- |
| `npm run dev` / `build` / `start`           | Next.js                      |
| `npm run type-check`                        | `tsc --noEmit`               |
| `npm run lint` / `format`                   | ESLint / Prettier            |
| `npm test` / `test:coverage` / `test:watch` | Jest (MSW-backed)            |
| `npm run test:e2e` / `test:e2e:ui`          | Playwright (stubs `/api/**`) |

## Contributing

`master` is protected: every change goes through a pull request that passes CI
and has an approving review. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Read next

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — the full blueprint and rationale.
- **[CLAUDE.md](./CLAUDE.md)** — enforceable rules for humans and coding tools
  working in the repo. Keep this file in every project generated from the
  template.

## Using this as your base template

1. Create the new project from this repo (GitHub "Use this template", or copy).
2. Keep `ARCHITECTURE.md` and `CLAUDE.md` — coding tools read them to stay on
   the rails.
3. Set `NEXT_PUBLIC_APP_NAME` and `API_URL`; replace the `tasks` / `projects`
   example features with your own.
4. When you build something reusable in a child project, flag it under
   **“⬆️ Candidate for the base template”** (see `CLAUDE.md §9`) so it can be
   folded back in here.
