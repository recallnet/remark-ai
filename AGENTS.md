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
- The intended release path is:
  add a `.changeset/*.md`, commit source changes and the pending changeset,
  push to `main`, and let CI run `pnpm changeset version` plus publish.
- Do not run `pnpm changeset version` locally as the normal release path.
  If you push an already-versioned commit with no pending changeset, the
  publish workflow will intentionally skip.
- That workflow only publishes when CI succeeds on `main` and there is at
  least one pending file in `.changeset/`.
- Do not manually run `npm publish` for workspace packages in this repo.
  Use the repo's `pnpm`/Changesets publish path so workspace dependencies are
  rewritten correctly at publish time.

## Commits

- This is a Recall Labs project. Use the global `recall-commit` skill as the
  default commit flow.
- For every normal commit in this repo, follow the `recall-commit` procedure:
  gather commit context, stage intentionally, write a conventional commit with
  structured body sections, reflect on any high-leverage learnings, and capture
  them when warranted.
- Use `AGENT-LEARNINGS.md` for confirmed or hypothesis-level learnings that
  would change how a future agent approaches similar work.
- Zero learnings is valid. Do not fabricate entries just to satisfy the flow.
- Never amend after a hook failure. Fix the problem, restage, and create a new
  commit.

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

## Docs Governance

- Use the canonical `repo-docs` profile instead of hand-rolled markdown parsing or custom repo layouts.
- Keep docs frontmatter valid and review dates current.
- Default active docs to `periodic-7`. If a repo cannot sustain 7-day review, it usually has too many active docs.
- `review_policy` controls freshness. `status` is lifecycle metadata only and does not bypass review requirements.
- Use `generated`, `codebound`, or `historical` only when they are genuinely correct, not as an escape hatch from freshness enforcement.
- Add new docs to the rooted docs graph so orphan checks stay clean.
- Root the graph from `docs/INDEX.md`.
- Put templates under `docs/templates/` and keep live curated docs in their canonical taxonomy directories.
- Prefer deleting stale docs over re-dating them. Git history already preserves old text; the live docs tree should describe current reality, not accumulate dead docs.
- Run `pnpm docs:lint` before merging doc structure or policy changes.
