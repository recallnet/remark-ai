# AGENTS

## Package Publishing

- This repo publishes packages through Changesets, not from every successful
  merge to `main`.
- The publish automation lives in
  `.github/workflows/publish-packages.yml`.
- The only user-facing package registry for this repo is npmjs.
- Do not send users to GitHub Packages for install or version verification.
- npmjs publishing uses GitHub Actions trusted publishing via OIDC, not an
  `NPM_TOKEN` secret.
- That workflow only publishes when CI succeeds on `main` and there is at
  least one pending file in `.changeset/`.
- If there is no pending changeset, the workflow does nothing, even if code in
  a publishable package changed.
- Do not manually run `npm publish` for workspace packages in this repo.
  Use the repo's `pnpm`/Changesets publish path so workspace dependencies are
  rewritten correctly at publish time.

## codecontext

- Use inline `@context` annotations for non-obvious, high-value reasoning that
  future edits could easily erase.
- Required for:
  critical decision logic and invariants
  security-sensitive behavior and hard-won lessons
  external integration quirks and contract mismatches
  regression guards explaining why a simpler change would be wrong
- Preferred forms: `@context decision`, `@context risk`,
  `@context requirement`, `@context history`
- Keep notes short and specific: what is true, why it matters, and what would
  break if changed.
- Use `#ref` for supporting material when helpful, but refs are just pointers
  to repo files or docs. Do not require any special doc schema.
- Before editing critical files, run:
  `npx @recallnet/codecontext-cli --scope <file>`
- After editing, run:
  `npx @recallnet/codecontext-cli --diff HEAD <file>`
- For broader orientation, run:
  `npx @recallnet/codecontext-cli --report`
- Do not use `@context` for obvious narration, duplicated ADR prose, or
  generic comments.
