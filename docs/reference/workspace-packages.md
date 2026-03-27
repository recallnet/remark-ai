---
doc_type: reference
id: workspace-packages
title: Workspace Packages
owner: docs-stewards
review_policy: codebound
reviewed: 2026-03-27
status: active
summary: Package-level map of the workspace and the role each published package plays.
tags:
  - packages
  - workspace
  - reference
written: 2026-03-27
code_paths:
  - packages/docs-governance-policy
  - packages/docs-governance-preset
  - packages/remark-lint-docs-freshness
  - packages/remark-lint-docs-reachability
  - packages/remark-lint-docs-taxonomy
related_docs:
  - ../explanation/system-architecture.md
  - ./commands-and-quality-gates.md
---

# Workspace Packages

## Package Map

| Package                                    | Path                                      | Role                                                            |
| ------------------------------------------ | ----------------------------------------- | --------------------------------------------------------------- |
| `@recallnet/docs-governance-policy`        | `packages/docs-governance-policy/`        | Shared loader and resolution helpers for docs policy semantics. |
| `@recallnet/docs-governance-preset`        | `packages/docs-governance-preset/`        | Canonical `repo-docs` profile, preset wiring, and CLI.          |
| `@recallnet/remark-lint-docs-freshness`    | `packages/remark-lint-docs-freshness/`    | Enforces review-window freshness from policy.                   |
| `@recallnet/remark-lint-docs-reachability` | `packages/remark-lint-docs-reachability/` | Detects orphaned docs outside the rooted graph.                 |
| `@recallnet/remark-lint-docs-taxonomy`     | `packages/remark-lint-docs-taxonomy/`     | Enforces path and filename rules by `doc_type`.                 |

## Dependency Shape

The packages are intentionally layered:

- policy helpers sit at the bottom
- the lint rules depend on policy helpers
- the preset depends on the lint rules plus the core remark packages

That keeps the low-level rule logic reusable while giving repos a single package to install for the common path.

## When To Read Package READMEs

Use the package README files when you need package-specific install or usage details:

- [../../packages/docs-governance-policy/README.md](../../packages/docs-governance-policy/README.md)
- [../../packages/docs-governance-preset/README.md](../../packages/docs-governance-preset/README.md)
- [../../packages/remark-lint-docs-freshness/README.md](../../packages/remark-lint-docs-freshness/README.md)
- [../../packages/remark-lint-docs-reachability/README.md](../../packages/remark-lint-docs-reachability/README.md)
- [../../packages/remark-lint-docs-taxonomy/README.md](../../packages/remark-lint-docs-taxonomy/README.md)

This reference page is the quick orientation layer, not a replacement for those package docs.
