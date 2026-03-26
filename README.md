# remark-for-ai

Docs governance for AI-heavy repos, built on the remark ecosystem instead of
hand-rolled markdown parsing.

This repo exists for one reason: docs rot faster when agents are writing them.

Agents are very good at producing markdown. They are much worse at keeping a
docs tree small, current, connected, and honest over time. Left alone, they
generate the same failure pattern over and over:

- stale docs that still sound authoritative
- duplicate docs that disagree with each other
- docs that no one links to but no one deletes
- frontmatter that drifts from repo policy
- review dates that become fiction instead of signal

The result is worse than missing docs. You get a tree full of plausible lies.

This repo is the enforcement layer for that problem.

It makes docs behave more like code:

- policy lives in the repo
- failures happen in lint and hooks
- every live doc must justify its existence
- review windows expire
- orphan docs fail
- existing remark plugins do the generic markdown work
- we only implement the genuinely missing governance rules

---

## The Problem With "Just Write More Docs"

A team asks an agent to document a system. It does exactly that.

It writes:

- `docs/cache-strategy.md`
- `docs/cache-strategy-v2.md`
- `docs/new-cache-design.md`
- `docs/redis-notes.md`

All four are coherent. Two are half obsolete. One was never linked from
anywhere. All still have confident prose.

Six weeks later, another agent needs to change caching behavior. It reads the
wrong doc first, updates code based on dead assumptions, and writes a fifth
document trying to reconcile the mess.

Tests may still pass. Reviews may still pass. The docs tree is what failed.

That is the problem this repo solves.

The standard we want is much harsher and much simpler:

- if a doc is important, keep it fresh
- if a doc is not important enough to keep fresh, make it historical or delete
  it
- if a doc is live, it should be reachable from a rooted docs graph
- if a doc is orphaned, remove it or link it properly
- git history is already the archive; the live docs tree should describe the
  current repo, not every thought anyone ever had

`rm` is a governance feature.

## Why Remark, Not Another Custom Parser

The markdown ecosystem already solved most of the hard, boring parts:

- frontmatter parsing
- markdown AST construction
- link parsing
- heading / anchor handling
- cross-file link validation

Trying to rebuild that with regexes is a maintenance debt factory.

So this repo does not compete with remark. It composes with it.

We rely on existing packages for generic markdown concerns:

- `remark-frontmatter`
- `remark-lint-frontmatter-schema`
- `remark-validate-links`

And we add the missing governance pieces:

- `@recallnet/remark-lint-docs-freshness`
- `@recallnet/remark-lint-docs-reachability`
- `@recallnet/docs-governance-policy`
- `@recallnet/docs-governance-preset`

That is the design philosophy of this repo in one sentence:

**use the ecosystem for markdown semantics; add only the smallest novel surface
area needed to make docs self-describing, expiring, and enforceable.**

## What This Actually Enforces

### 1. Frontmatter is not optional metadata sludge

Docs declare what they are, who owns them, how they should be reviewed, and
when they were last reviewed.

Example:

```yaml
---
doc_type: design
owner: platform
review_policy: periodic-7
reviewed: 2026-03-25
status: active
summary: Redis cache invalidation rules for writes and backfills.
tags:
  - cache
  - redis
written: 2026-03-25
---
```

If a repo wants active docs, it has to tell the truth about them.

### 2. Review windows expire

If a doc says it follows `periodic-7`, then seven days later it must be
reviewed again, marked historical, switched to a more appropriate policy, or
deleted.

That gives you a live docs tree whose timestamps mean something.

### 3. Orphans fail

Important docs should not exist as disconnected markdown blobs.

This repo enforces a rooted docs graph, typically from `docs/INDEX.md`. If an
in-scope doc is not reachable from the declared roots, lint fails.

That keeps navigation intentional and forces teams to answer a useful question:
if this doc matters, where do readers discover it?

### 4. Repo policy is explicit

Governance lives in `docs/docs-policy.json`, not in tribal memory.

That policy decides:

- which paths are in scope
- which review policies exist
- which paths get which default review policy
- which docs are graph roots
- which docs or globs are temporarily excluded

## Why Other Approaches Fall Short

### Commit history

Commit history is a good archive. It is a bad live navigation system and a bad
source of freshness guarantees.

Git tells you what changed. It does not enforce that a stale doc gets reviewed
or deleted.

### Wikis and Notion pages

External docs are almost never part of the merge path. They drift because they
are optional at exactly the moment rigor matters most.

This repo keeps docs governance inside the repo, inside hooks, inside CI.

### "We’ll just tell people to clean docs up"

That fails for the same reason "just be careful" fails in codebases. Standards
without enforcement decay into vibes.

Agents amplify that failure because they can generate bad-but-convincing docs
faster than humans notice the damage.

## Recommended Default Operating Model

These defaults are deliberately opinionated.

- active docs default to `periodic-7`
- `docs/INDEX.md` is the canonical root
- `docs/templates/**` is excluded from freshness and orphan checks
- historical docs are allowed, but should be rare and explicit
- generated or codebound docs should only be used when truly correct
- if seven-day review feels too aggressive, the first question should be
  whether the repo has too many active docs

The bias here is intentional:

keep fewer docs, keep them fresher, and delete aggressively.

## Quick Start

Install the preset:

```bash
pnpm add -D @recallnet/docs-governance-preset
```

Bootstrap a repo:

```bash
pnpm exec recall-docs-governance init
```

Lint docs:

```bash
pnpm docs:lint
```

That generates:

- `docs/docs-policy.json`
- `docs/docs-frontmatter.schema.json`
- `.remarkrc.mjs`
- `docs/INDEX.md`
- package scripts for docs linting
- `AGENTS.md` guidance for repo contributors

## Recommended Config

```js
import { createDocsGovernanceConfig } from "@recallnet/docs-governance-preset";

export default createDocsGovernanceConfig({
  policyPath: "./docs/docs-policy.json",
  frontmatterSchemaPath: "./docs/docs-frontmatter.schema.json",
});
```

## Packages

### `@recallnet/docs-governance-policy`

Shared policy loader and repo-policy semantics:

- loads `docs/docs-policy.json`
- resolves review-policy defaults
- computes graph roots and allowlists
- enumerates in-scope markdown files

### `@recallnet/docs-governance-preset`

The easiest adoption path:

- exports the recommended remark config
- provides `recall-docs-governance init`
- provides `recall-docs-governance lint`
- bootstraps the default repo policy and schema files

### `@recallnet/remark-lint-docs-freshness`

Fails docs whose declared review window has expired.

### `@recallnet/remark-lint-docs-reachability`

Fails docs that are in scope but not reachable from declared roots.

## What This Repo Does Not Try To Do

It does not try to be a full docs platform.

It does not replace:

- architecture docs
- onboarding guides
- ADRs
- project management
- search
- wikis

It does one narrower job:

**make repo-native docs auditable, reachable, and fresh enough to trust.**

## QA and Release Model

This repo uses the standard Recall Labs release path:

- Changesets for versioning
- npmjs trusted publishing through GitHub Actions
- Husky hooks for pre-commit and pre-push gates
- ESLint, Prettier, tests, `jscpd`, and `knip`
- `codecontext` enforcement for non-obvious repo constraints

To ship:

1. `pnpm install`
2. `pnpm check`
3. add a `.changeset/*.md`
4. merge to `main`
5. let `.github/workflows/publish-packages.yml` publish

## The Pitch In One Line

If `codecontext` governs code decisions, this governs docs decisions.

Same philosophy:

- repo-native
- frontmatter-based
- enforceable in hooks
- hostile to drift

Different target:

- not code intent
- docs truthfulness
