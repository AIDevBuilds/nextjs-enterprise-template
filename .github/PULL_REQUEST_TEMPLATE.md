## What changed

<!-- One or two sentences. What does this PR do and why? -->

## How to verify

<!-- Steps a reviewer can follow, or the command they should run. -->

## Checklist

- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes (new logic has tests)
- [ ] `npm run build` passes
- [ ] `npm run test:e2e` passes (if user-facing behaviour changed)
- [ ] Follows the rules in [CLAUDE.md](../CLAUDE.md) — layering, no `process.env`
      outside `src/env.ts`, no business logic in components, all user-facing
      strings localised
- [ ] Route paths verified in `next build` output (if `src/app/` changed)

## ⬆️ Candidate for the base template

<!-- If this contains something generic and reusable, name the files here so it
     can be promoted upstream. Delete this section if not applicable. -->
