# remark docs governance

Small monorepo for the parts of docs governance that do not already exist in the remark ecosystem.

Current packages:

- `@recallnet/docs-governance-policy`: shared loader and path-policy helpers.
- `@recallnet/docs-governance-preset`: one-command repo bootstrap and preset config.
- `@recallnet/remark-lint-docs-freshness`: checks `reviewed` dates against policy-defined review windows.
- `@recallnet/remark-lint-docs-reachability`: experimental orphan/reachability rule. Not the first publish target.

The intent is to pair these with existing ecosystem packages instead of rebuilding markdown parsing:

- `remark-frontmatter`
- `remark-lint-frontmatter-schema`
- `remark-validate-links`

## Minimal Novel Surface

The first publish target should be `@recallnet/remark-lint-docs-freshness`.

That is the smallest genuinely new rule surface for the stated need:

- docs declare their own review date and policy in frontmatter
- lint fails when the review window is expired

Everything else should stay delegated to existing remark packages unless we find a hard gap:

- frontmatter parsing: `remark-frontmatter`
- frontmatter schema validation: `remark-lint-frontmatter-schema`
- markdown AST and link parsing: `remark` / `remark-parse`
- intra-repo link validation: `remark-validate-links`

## Recommended Stack

```js
import { createDocsGovernanceConfig } from "@recallnet/docs-governance-preset";

export default createDocsGovernanceConfig({
  policyPath: "./docs/docs-policy.json",
  frontmatterSchemaPath: "./docs/docs-frontmatter.schema.json",
});
```

Or bootstrap a repo in one command:

```bash
pnpm add -D @recallnet/docs-governance-preset
pnpm exec recall-docs-governance init
pnpm docs:lint
```

## Policy shape

The shared loader expects a repo-local `docs/docs-policy.json` file with the `docs_policy/v1` top-level key used in `../astrochicken`.

## QA

This repo uses a trimmed Recall Labs stack:

- Changesets for npmjs releases
- Husky pre-commit and pre-push hooks
- ESLint with `codecontext` enforcement
- Prettier for formatting
- Node built-in tests
- Optional `jscpd` and `knip` repo checks

## Publish

1. `pnpm install`
2. `pnpm check`
3. Add a changeset for whichever package is actually shipping.
4. Merge to `main` and let `.github/workflows/publish-packages.yml` publish through npmjs trusted publishing.
5. Verify the version on npmjs before calling it released.
