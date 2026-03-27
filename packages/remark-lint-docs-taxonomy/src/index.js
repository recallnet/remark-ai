import { basename, relative, resolve } from "node:path";

import {
  DEFAULT_POLICY_PATH,
  isDocsPathExcluded,
  isDocsPathInScope,
  loadDocsPolicy,
  matchesDocsPolicyPattern,
  normalizePath,
  resolveTaxonomyExcludeGlobs,
  resolveTaxonomyRule,
} from "@recallnet/docs-governance-policy";
import { parse } from "yaml";

const RULE_ID = "docs-taxonomy";

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

function compileFilenamePattern(pattern) {
  try {
    return new RegExp(pattern);
  } catch {
    return null;
  }
}

function formatList(values) {
  return values.map((value) => `\`${value}\``).join(", ");
}

export default function remarkLintDocsTaxonomy(options = {}) {
  const policyPath = options.policyPath ?? DEFAULT_POLICY_PATH;

  // @context decision !high [verified:2026-03-27] — Taxonomy still reports unknown doc_type values.
  // Schema validation should catch them in canonical setups, but policy-level enforcement keeps the failure visible if a repo narrows schema coverage.
  return (tree, file) => {
    const cwd = options.cwd ? resolve(options.cwd) : process.cwd();
    const filePath = file.path ? normalizePath(relative(cwd, file.path)) : "";

    if (!filePath) {
      return;
    }

    const { policy } = loadDocsPolicy({ cwd, policyPath });
    if (!isDocsPathInScope(filePath, policy)) {
      return;
    }

    if (isDocsPathExcluded(filePath, resolveTaxonomyExcludeGlobs(policy))) {
      return;
    }

    const frontmatter = parseFrontmatter(tree);
    if (!frontmatter || typeof frontmatter.doc_type !== "string") {
      return;
    }

    const docType = frontmatter.doc_type.trim();
    const rule = resolveTaxonomyRule(docType, policy);
    if (!rule) {
      file.message(`Unknown document type '${docType}' in ${filePath}.`, {
        ruleId: RULE_ID,
        source: "@recallnet/remark-lint-docs-taxonomy",
      });
      return;
    }

    const pathGlobs = Array.isArray(rule.path_globs) ? rule.path_globs : [];
    if (
      pathGlobs.length > 0 &&
      !pathGlobs.some((pattern) => matchesDocsPolicyPattern(filePath, pattern))
    ) {
      file.message(
        `Document type '${docType}' at ${filePath} must live under ${formatList(pathGlobs)}.`,
        {
          ruleId: RULE_ID,
          source: "@recallnet/remark-lint-docs-taxonomy",
        }
      );
    }

    const filename = basename(filePath);
    const allowedFilenames = Array.isArray(rule.allowed_filenames) ? rule.allowed_filenames : [];
    const filenamePattern =
      typeof rule.filename_pattern === "string"
        ? compileFilenamePattern(rule.filename_pattern)
        : null;

    if (typeof rule.filename_pattern === "string" && filenamePattern === null) {
      file.message(
        `Taxonomy policy for document type '${docType}' has an invalid filename pattern '${rule.filename_pattern}'.`,
        {
          ruleId: RULE_ID,
          source: "@recallnet/remark-lint-docs-taxonomy",
        }
      );
      return;
    }

    const matchesFilename =
      allowedFilenames.includes(filename) ||
      (filenamePattern ? filenamePattern.test(filename) : true);

    if (!matchesFilename) {
      const guidance = [];
      if (typeof rule.filename_pattern === "string") {
        guidance.push(`pattern \`${rule.filename_pattern}\``);
      }
      if (allowedFilenames.length > 0) {
        guidance.push(`allowlist ${formatList(allowedFilenames)}`);
      }

      file.message(
        `Document type '${docType}' at ${filePath} must use a filename matching ${guidance.join(" or ")}.`,
        {
          ruleId: RULE_ID,
          source: "@recallnet/remark-lint-docs-taxonomy",
        }
      );
    }
  };
}
