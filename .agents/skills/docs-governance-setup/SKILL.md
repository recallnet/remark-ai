---
name: docs-governance-setup
description: Install Recall's docs governance stack into a repo. Use this whenever a team repo needs astrochicken-style docs governance, remark-based frontmatter/link validation, freshness checks, orphan detection, docs policy bootstrapping, or a fast one-command setup instead of copied scripts.
---

# Docs Governance Setup

Set up docs governance by installing the preset and generating repo files.

Do not port hand-rolled markdown parsers from older repos. Prefer the smallest novel surface:

- `remark-frontmatter` for frontmatter parsing
- `remark-lint-frontmatter-schema` for frontmatter schema validation
- `remark-validate-links` for markdown link validation
- `@recallnet/remark-lint-docs-freshness` for review-date expiration
- `@recallnet/remark-lint-docs-reachability` for orphan detection

## Default workflow

1. Inspect the target repo root and package manager.
2. Install `@recallnet/docs-governance-preset` as a dev dependency.
3. Run:

```bash
pnpm exec recall-docs-governance init
```

4. Review the generated files:
   - `docs/docs-policy.json`
   - `docs/docs-frontmatter.schema.json`
   - `.remarkrc.mjs`
   - `docs/INDEX.md`
   - `AGENTS.md` docs-governance section
5. Adjust policy defaults for the repo:
   - review windows
   - in-scope paths
   - required roots
   - orphan allowlists
6. Run:

```bash
pnpm docs:lint
```

## What good setup looks like

- docs policy is repo-native and committed
- docs linting uses remark plugins instead of copied regex parsers
- every in-scope doc is reachable from rooted entry docs
- review expirations fail lint deterministically
- repo guidance tells contributors not to bypass the policy

## When customizing

Customize policy, schema, and doc roots. Do not fork the plugin logic unless the repo has a real semantic gap.

If the repo already has older docs scripts, replace them with the preset unless there is a verified behavior the preset cannot express.
