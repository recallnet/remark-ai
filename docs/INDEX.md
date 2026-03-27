---
doc_type: index
id: docs-index
title: Docs Index
owner: docs-stewards
review_policy: generated
reviewed: 2026-03-27
status: active
summary: Canonical root for docs reachability and navigation.
tags:
  - docs
  - index
written: 2026-03-27
code_paths: []
related_docs: []
---

# Docs Index

Start here. Every in-scope doc should be reachable from this index or another rooted doc.

## Start Here

- [System architecture](./explanation/system-architecture.md)
- [Commands and quality gates](./reference/commands-and-quality-gates.md)
- [Workspace packages](./reference/workspace-packages.md)
- [Adopt docs governance in a repo](./how-to/adopt-docs-governance-in-a-repo.md)

## Scope

This repo provides deterministic docs governance for agent-heavy repositories.
The live surface is a small workspace:

- policy helpers for interpreting `docs/docs-policy.json`
- a preset package and CLI for bootstrapping the canonical profile
- remark lint rules for taxonomy, freshness, and reachability

## Repo Entry Docs

- [../README.md](../README.md) explains the motivation and package roles at a high level.
- [../AGENTS.md](../AGENTS.md) captures repo-specific operating constraints for agents.

## Planned Expansion

- `docs/services/` can hold deeper package-level operational docs if the workspace grows beyond the current package summaries.
- `docs/runbooks/` is reserved for release, recovery, or migration procedures that need step-by-step treatment.
