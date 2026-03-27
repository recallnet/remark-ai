# @recallnet/remark-lint-docs-freshness

Checks Markdown frontmatter `reviewed` dates against policy-defined `max_age_days`.

## Install

```bash
npm install -D remark remark-frontmatter @recallnet/remark-lint-docs-freshness
```

## Use

Use with `remark-frontmatter` so YAML frontmatter is available to the rule:

```js
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkLintDocsFreshness from "@recallnet/remark-lint-docs-freshness";

await remark()
  .use(remarkFrontmatter)
  .use(remarkLintDocsFreshness, {
    cwd: process.cwd(),
    policyPath: "./docs/docs-policy.json",
  })
  .process({
    path: "docs/architecture/cache.md",
    value: `---
review_policy: periodic-7
reviewed: 2026-03-01
---

# Cache`,
  });
```

## What It Checks

- only files that match `in_scope_paths` in `docs/docs-policy.json`
- only docs using periodic review policies
- frontmatter `reviewed` values in `YYYY-MM-DD` format
- whether `reviewed` is older than the policy's `max_age_days`

The rule reports messages such as:

```text
Document is stale: reviewed=2026-03-01 age_days=18 max_age_days=7.
```

## Options

- `cwd`
  Repository root used to resolve the docs policy and the current file path.
- `policyPath`
  Path to the docs policy file relative to `cwd`.
  Defaults to `docs/docs-policy.json`.
- `today`
  Override the current date as `YYYY-MM-DD`.
  Useful for deterministic tests.

## Notes

- Docs with non-periodic policies such as `historical` are ignored.
- If frontmatter is missing or unreadable for an in-scope file, the rule reports that freshness could not be checked.
- Frontmatter parsing uses `vfile-matter`, which is the unified-recommended way to expose YAML metadata on `file.data.matter`.
- This package is intended for docs-governance setups that keep freshness policy in repo config rather than hardcoding date thresholds in lint config.
