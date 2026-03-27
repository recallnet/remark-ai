---
doc_type: reference
id: commands-and-quality-gates
title: Commands And Quality Gates
owner: docs-stewards
review_policy: codebound
reviewed: 2026-03-27
status: active
summary: Root commands, hooks, and CI gates that define the expected development loop.
tags:
  - commands
  - ci
  - quality
written: 2026-03-27
code_paths:
  - package.json
  - .husky/pre-commit
  - .husky/pre-push
  - .github/workflows/ci.yml
  - .github/workflows/publish-packages.yml
related_docs:
  - ../explanation/system-architecture.md
  - ./workspace-packages.md
---

# Commands And Quality Gates

## Root Commands

| Command          | Purpose                                                                         |
| ---------------- | ------------------------------------------------------------------------------- |
| `pnpm lint`      | Run ESLint across the repo.                                                     |
| `pnpm test`      | Run the Node built-in test suite under `packages/*/test/*.test.js`.             |
| `pnpm build`     | Verify package exports with `scripts/check-exports.mjs`.                        |
| `pnpm check`     | Run the standard combined quality pass: format check, lint, test, build.        |
| `pnpm docs:lint` | Run the canonical docs governance checks through `recall-docs-governance lint`. |
| `pnpm cpd`       | Run duplicate-code detection on `packages/` and `scripts/`.                     |
| `pnpm knip`      | Check for unused files and dependencies.                                        |
| `pnpm changeset` | Create a pending release changeset.                                             |

## Pre-Commit Gate

`.husky/pre-commit` is the hard local gate. It runs, in order:

1. formatting on staged files through `lint-staged`
2. lockfile sync validation
3. `codecontext` staged checks
4. `pnpm lint`
5. `pnpm test`
6. `pnpm build`
7. a secrets-pattern scan
8. a changeset reminder/check

Normal commits should assume these checks will run.

## Pre-Push Gate

`.husky/pre-push` requires a clean working tree, then runs:

- `pnpm check`
- `pnpm cpd`
- `pnpm knip`

`cpd` and `knip` are informational quality rails at push time, not just CI surprises.

## CI And Release Flow

- `.github/workflows/ci.yml`
  Runs on pushes and pull requests targeting `main`. It enforces quality checks and verifies that package changes carry a pending changeset.
- `.github/workflows/publish-packages.yml`
  Publishes from `main` through Changesets and trusted npmjs publishing.

## Release Constraints

- Do not run `pnpm changeset version` locally as the normal release path.
- Add a `.changeset/*.md`, commit it, and let the publish workflow version and publish on `main`.
- npmjs is the user-facing package registry for this repo.
