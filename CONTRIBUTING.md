# Contributing

Thanks for helping improve the template. Because projects are generated from
this repo, a change here propagates to every downstream app — so the bar is
"would I want this in every future project?".

## Ground rules

- **`master` is protected by a repository ruleset.** Nobody can push to it
  directly — not collaborators, not repository admins. Every change goes through
  a pull request that passes all five required checks (`verify`, `e2e`,
  `gitleaks`, `env-example-has-no-values`, `Analyze`).
- **Review:** one approving review from a code owner is required, and approvals
  are dismissed when new commits are pushed. Repository admins hold a
  `pull request only` bypass, so a lone maintainer can still merge — but that
  bypass does **not** extend to direct pushes, force pushes or branch deletion.
- **Force pushes and branch deletion on `master` are blocked outright.**
- **Conventional Commits.** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`,
  `chore:`, `build:`, `ci:`. Enforced by commitlint on `commit-msg`.
- **Read [CLAUDE.md](./CLAUDE.md) first.** It is the enforceable rulebook —
  layering, the auth model, the localisation policy, secrets, cancellation.
  [ARCHITECTURE.md](./ARCHITECTURE.md) explains the reasoning behind it.

## Setup

```bash
nvm use                 # Node 20
npm install             # also installs Husky hooks
cp .env.example .env
npm run dev
```

## Before you open a PR

All five must pass — CI runs the same commands:

```bash
npm run type-check
npm run lint
npm run format:check
npm run test:coverage
npm run build
npm run test:e2e
```

If you touched `src/app/`, **check the route table in the `next build` output**.
Route groups (parentheses) silently change URLs; this has bitten the template
before.

## What gets rejected

The list in [CLAUDE.md §12](./CLAUDE.md) is the full version. The common ones:

- A literal user-facing string in JSX (add a key to **every** file in
  `messages/`).
- A hardcoded secret, or a real value in `.env.example`.
- `process.env` outside `src/env.ts`.
- Literal Tailwind shades (`bg-white`, `text-gray-500`) instead of semantic
  tokens — these look broken in dark mode.
- A `queryFn` that ignores its `signal`, or bare `fetch` to the upstream API.
- Business logic inside a component.

## Scope

This is a **base template**, not an app. Product-specific features belong in the
project that needs them. A change belongs here if it is generic, reusable, and
something most projects would want on day one.

If you built something in a downstream project that belongs here, say so
explicitly in the PR under the **⬆️ Candidate for the base template** heading in
the PR template.

## Security

Do not open a public issue for a vulnerability — see [SECURITY.md](./SECURITY.md).
