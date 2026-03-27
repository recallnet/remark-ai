# @recallnet/remark-lint-docs-reachability

Flags in-scope Markdown documents that are not reachable from policy-defined roots.

## Install

```bash
npm install -D remark @recallnet/remark-lint-docs-reachability
```

## Use

```js
import { remark } from "remark";
import remarkLintDocsReachability from "@recallnet/remark-lint-docs-reachability";

await remark()
  .use(remarkLintDocsReachability, {
    cwd: process.cwd(),
    policyPath: "./docs/docs-policy.json",
  })
  .process({
    path: "docs/architecture/cache.md",
    value: "# Cache\n",
  });
```

## What It Checks

- all in-scope Markdown files matched by `in_scope_paths`
- graph roots declared by docs policy
- repo-local Markdown links between in-scope docs
- policy allowlists for roots, legacy docs, and orphan exclusions

The rule reports messages such as:

```text
Document is not reachable from policy roots: docs/architecture/orphan.md
```

## Options

- `cwd`
  Repository root used to resolve the docs policy and scan in-scope docs.
- `policyPath`
  Path to the docs policy file relative to `cwd`.
  Defaults to `docs/docs-policy.json`.

## Notes

- External links are ignored. Reachability is only about repo-owned docs.
- Missing local link targets are ignored here; link correctness belongs to `remark-validate-links`.
- Broken symlinks outside the docs graph are skipped instead of crashing the scan.

This package intentionally complements:

- `remark-validate-links` for link validity
- `remark-lint-frontmatter-schema` for frontmatter schema checks
- `@recallnet/remark-lint-docs-taxonomy` for path and filename enforcement
