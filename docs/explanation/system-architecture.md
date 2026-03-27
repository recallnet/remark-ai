---
doc_type: explanation
id: system-architecture
title: System Architecture
owner: docs-stewards
review_policy: codebound
reviewed: 2026-03-27
status: active
summary: How the workspace packages fit together to enforce deterministic docs governance.
tags:
  - architecture
  - docs-governance
  - remark
written: 2026-03-27
code_paths:
  - packages/docs-governance-policy/src
  - packages/docs-governance-preset/src
  - packages/remark-lint-docs-freshness/src
  - packages/remark-lint-docs-reachability/src
  - packages/remark-lint-docs-taxonomy/src
related_docs:
  - ../reference/workspace-packages.md
  - ../reference/commands-and-quality-gates.md
  - ../how-to/adopt-docs-governance-in-a-repo.md
---

# System Architecture

This workspace splits docs governance into a small number of responsibilities so repos can adopt a single preset without hardcoding governance logic into every `.remarkrc`.

## Package Roles

- `@recallnet/docs-governance-policy`
  Loads `docs/docs-policy.json`, normalizes paths, resolves policy defaults, and exposes shared helpers used by the lint rules and preset.
- `@recallnet/docs-governance-preset`
  Owns the canonical `repo-docs` profile, generates bootstrap files, and exposes the `recall-docs-governance` CLI.
- `@recallnet/remark-lint-docs-taxonomy`
  Enforces that a document's `doc_type` matches allowed directories and filename conventions from policy.
- `@recallnet/remark-lint-docs-freshness`
  Checks `reviewed` dates against policy-defined review windows.
- `@recallnet/remark-lint-docs-reachability`
  Ensures in-scope docs are reachable from rooted docs such as `docs/INDEX.md`.

## Runtime Flow

1. A consumer repo installs `@recallnet/docs-governance-preset`.
2. `recall-docs-governance init --profile repo-docs` writes `.remarkrc.mjs`, docs policy, schema, index, templates, and docs lint scripts.
3. `pnpm docs:lint` loads the repo's committed policy and schema.
4. Remark runs schema validation, taxonomy validation, link validation, freshness checks, and reachability checks.
5. Agents fix or delete docs until the repo returns to a governed state.

## Why The Split Matters

The preset is intentionally thin. It wires together the existing remark ecosystem plus a small set of repo-governance rules. The rules remain policy-driven instead of being re-encoded in each repo's config.

That lets repos adopt one profile while still making deterministic decisions from committed files:

- policy owns allowed paths, roots, exclusions, and review modes
- schema owns required frontmatter shape
- rules enforce behavior without needing an LLM in the loop

## Source-Repo Development Detail

This repo is both the implementation source and a consumer of the preset during development. To make the local CLI and generated `.remarkrc.mjs` work here, the root workspace depends on `@recallnet/docs-governance-preset` as a dev dependency.

That is a source-repo convenience, not a special rule for downstream consumers.
