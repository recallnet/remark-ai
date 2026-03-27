# @recallnet/docs-governance-preset

One-package bootstrap for Recall docs governance.

It wires the existing remark ecosystem plus Recall's governance rules:

- `remark-frontmatter`
- `remark-lint-frontmatter-schema`
- `remark-validate-links`
- `@recallnet/remark-lint-docs-taxonomy`
- `@recallnet/remark-lint-docs-freshness`
- `@recallnet/remark-lint-docs-reachability`

## Install

```bash
pnpm add -D @recallnet/docs-governance-preset
pnpm exec recall-docs-governance init --profile repo-docs
```

Then run:

```bash
pnpm docs:lint
```
