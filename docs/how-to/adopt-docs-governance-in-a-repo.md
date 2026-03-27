---
doc_type: how-to
id: adopt-docs-governance-in-a-repo
title: Adopt Docs Governance In A Repo
owner: docs-stewards
review_policy: codebound
reviewed: 2026-03-27
status: active
summary: Practical steps for installing the preset, initializing the canonical profile, and validating a repo.
tags:
  - how-to
  - onboarding
  - docs-governance
written: 2026-03-27
code_paths:
  - packages/docs-governance-preset/src
  - README.md
related_docs:
  - ../reference/commands-and-quality-gates.md
  - ../reference/workspace-packages.md
  - ../explanation/system-architecture.md
---

# Adopt Docs Governance In A Repo

## Prerequisites

- a Node-compatible package manager path in the target repo
- permission to add a dev dependency and a docs lint script

## Steps

1. Install the preset package.

   ```bash
   pnpm add -D @recallnet/docs-governance-preset
   ```

2. Initialize the canonical profile.

   ```bash
   pnpm exec recall-docs-governance init --profile repo-docs
   ```

3. Run docs lint.

   ```bash
   pnpm docs:lint
   ```

4. Move or create curated docs under the canonical taxonomy:
   - `docs/decisions/`
   - `docs/observations/`
   - `docs/how-to/`
   - `docs/reference/`
   - `docs/explanation/`
   - `docs/runbooks/`

5. Link every live curated doc from `docs/INDEX.md` or another rooted doc.

## What Init Writes

- `.remarkrc.mjs`
- `docs/docs-policy.json`
- `docs/docs-frontmatter.schema.json`
- `docs/INDEX.md`
- `docs/templates/*.md`
- `package.json` scripts for docs lint

## Verification

A healthy first pass should satisfy both of these:

- `pnpm exec recall-docs-governance lint`
- `pnpm docs:lint`

If the repo is also the source tree for the preset package, make sure the root workspace can resolve `@recallnet/docs-governance-preset` locally during development.
