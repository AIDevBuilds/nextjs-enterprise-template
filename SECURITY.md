# Security Policy

## Reporting a vulnerability

**Do not open a public issue for security problems.**

Report privately via GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability)
(Security → Report a vulnerability), or email the maintainer.

Please include: what you found, how to reproduce it, and the impact you think it
has. You'll get an acknowledgement within a few days.

## Scope

This is a **template**. Projects generated from it own their own security
posture. Reports about the template itself are in scope — for example a weakness
in the auth cookie handling, the BFF proxy, the rate limiter, or an insecure
default.

Out of scope: findings in an application you built from this template,
vulnerabilities in upstream dependencies (report those upstream), and issues
that require an already-compromised machine.

## Security model of the template

Understanding these boundaries helps judge whether something is a real issue:

- **The access token is never exposed to client JavaScript.** It lives in an
  httpOnly, `Secure` (in production), `SameSite=Lax` cookie. The browser talks
  only to the same-origin BFF at `/api/*`; `src/app/api/[...path]/route.ts`
  attaches the bearer token server-side.
- **The refresh token is scoped to `/api/auth`**, so it is never attached to
  ordinary proxied requests. Rotation is supported and concurrent refreshes are
  de-duplicated.
- **The web tier does not verify JWT signatures.** It checks presence and the
  `exp` claim only. The upstream API is the authority and must reject forged or
  expired tokens; the proxy forwards its 401. Signature verification (shared
  secret or JWKS) is a documented hardening step, not a shipped guarantee.
- **Authorization checks in the UI are UX, not enforcement.** `usePermission`,
  `<Can>` and `canServer` hide and gate; the API must enforce.
- **Rate limiting in the BFF is in-memory and per-process.** It slows abuse
  against this tier. It is not a distributed limiter and does not protect the
  upstream API, which must limit independently.
- **CSP ships with `'unsafe-inline'` for scripts.** This is a deliberate
  trade-off so the template runs without a nonce pipeline. Tightening it is a
  documented per-project step, not a vulnerability in itself.

## Supported versions

The `main` branch is the only supported version.
