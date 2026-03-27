import remarkLintDocsFreshness from "@recallnet/remark-lint-docs-freshness";
import remarkLintDocsReachability from "@recallnet/remark-lint-docs-reachability";
import remarkLintDocsTaxonomy from "@recallnet/remark-lint-docs-taxonomy";
import remarkFrontmatter from "remark-frontmatter";
import remarkLintFrontmatterSchema from "remark-lint-frontmatter-schema";
import remarkValidateLinks from "remark-validate-links";

import { getDocsGovernanceProfile } from "./templates.js";

export {
  FATAL_FAILURE_EXIT_CODE,
  LINT_FAILURE_EXIT_CODE,
  initDocsGovernanceRepo,
  lintDocsGovernance,
} from "./runtime.js";
export { populateDocsGovernanceRepo } from "./populate.js";

export function createDocsGovernanceConfig(options = {}) {
  const profile = getDocsGovernanceProfile(options.profile);
  const frontmatterSchemaPath =
    options.frontmatterSchemaPath ?? "./docs/docs-frontmatter.schema.json";
  const schemaPatterns = options.schemaPatterns ?? ["docs/**/*.md"];
  const policyPath = options.policyPath ?? "./docs/docs-policy.json";

  return {
    profile: profile.id,
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
      [remarkLintDocsTaxonomy, { policyPath }],
      remarkValidateLinks,
      [remarkLintDocsFreshness, { policyPath }],
      [remarkLintDocsReachability, { policyPath }],
    ],
  };
}
