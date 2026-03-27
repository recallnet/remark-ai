import remarkLintDocsFreshness from "@recallnet/remark-lint-docs-freshness";
import remarkLintDocsReachability from "@recallnet/remark-lint-docs-reachability";
import remarkFrontmatter from "remark-frontmatter";
import remarkLintFrontmatterSchema from "remark-lint-frontmatter-schema";
import remarkValidateLinks from "remark-validate-links";

export { initDocsGovernanceRepo, lintDocsGovernance } from "./runtime.js";

export function createDocsGovernanceConfig(options = {}) {
  const frontmatterSchemaPath =
    options.frontmatterSchemaPath ?? "./docs/docs-frontmatter.schema.json";
  const schemaPatterns = options.schemaPatterns ?? ["docs/**/*.md"];
  const policyPath = options.policyPath ?? "./docs/docs-policy.json";

  return {
    plugins: [
      remarkFrontmatter,
      [
        remarkLintFrontmatterSchema,
        {
          schemas: {
            [frontmatterSchemaPath]: schemaPatterns,
          },
        },
      ],
      remarkValidateLinks,
      [remarkLintDocsFreshness, { policyPath }],
      [remarkLintDocsReachability, { policyPath }],
    ],
  };
}
