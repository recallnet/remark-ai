import { relative, resolve } from "node:path";

import {
  DEFAULT_POLICY_PATH,
  isDocsPathInScope,
  loadDocsPolicy,
  matchesDocsPolicyPattern,
  normalizePath,
  resolveDocsReviewPolicy,
  resolveReviewPolicyConfig,
} from "@recallnet/docs-governance-policy";
import { parse } from "yaml";

const RULE_ID = "docs-freshness";

function findYamlNode(tree) {
  return tree?.children?.find((node) => node.type === "yaml") ?? null;
}

function parseFrontmatter(tree) {
  const yamlNode = findYamlNode(tree);
  if (!yamlNode?.value) {
    return null;
  }

  const data = parse(String(yamlNode.value));
  return data && typeof data === "object" && !Array.isArray(data) ? data : null;
}

function dateDiffDays(older, newer) {
  const olderMs = new Date(`${older}T00:00:00Z`).getTime();
  const newerMs = new Date(`${newer}T00:00:00Z`).getTime();
  return Math.floor((newerMs - olderMs) / 86400000);
}

export default function remarkLintDocsFreshness(options = {}) {
  const today = options.today ?? new Date().toISOString().slice(0, 10);
  const policyPath = options.policyPath ?? DEFAULT_POLICY_PATH;

  // @context decision !high [verified:2026-03-25] — Freshness resolves policy from repo state on every file run.
  // That keeps single-file editor linting aligned with whole-repo QA instead of relying on external batching state.
  return (tree, file) => {
    const cwd = options.cwd ? resolve(options.cwd) : process.cwd();
    const filePath = file.path ? normalizePath(relative(cwd, file.path)) : "";
    const { policy } = loadDocsPolicy({ cwd, policyPath });

    if (!filePath || !isDocsPathInScope(filePath, policy)) {
      return;
    }

    const excluded = Array.isArray(policy.frontmatter_exclude_globs)
      ? policy.frontmatter_exclude_globs.some((pattern) =>
          matchesDocsPolicyPattern(filePath, pattern)
        )
      : false;

    if (excluded) {
      return;
    }

    const frontmatter = parseFrontmatter(tree);
    if (!frontmatter) {
      file.message("Document freshness could not be checked because frontmatter is unreadable.", {
        ruleId: RULE_ID,
        source: "@recallnet/remark-lint-docs-freshness",
      });
      return;
    }

    const reviewPolicyId = String(
      frontmatter.review_policy || resolveDocsReviewPolicy(filePath, policy) || ""
    );
    const reviewPolicy = resolveReviewPolicyConfig(reviewPolicyId, policy);
    if (!reviewPolicy) {
      file.message(`Unknown review policy '${reviewPolicyId}'.`, {
        ruleId: RULE_ID,
        source: "@recallnet/remark-lint-docs-freshness",
      });
      return;
    }

    if (reviewPolicy.mode !== "periodic") {
      return;
    }

    const reviewed = String(frontmatter.reviewed || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewed)) {
      file.message(
        "Frontmatter field 'reviewed' must be a YYYY-MM-DD date for periodic review policies.",
        {
          ruleId: RULE_ID,
          source: "@recallnet/remark-lint-docs-freshness",
        }
      );
      return;
    }

    const ageDays = dateDiffDays(reviewed, today);
    if (ageDays > Number(reviewPolicy.max_age_days || 0)) {
      file.message(
        `Document is stale: reviewed=${reviewed} age_days=${ageDays} max_age_days=${reviewPolicy.max_age_days}.`,
        {
          ruleId: RULE_ID,
          source: "@recallnet/remark-lint-docs-freshness",
        }
      );
    }
  };
}
