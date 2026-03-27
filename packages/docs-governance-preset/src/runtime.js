import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  collectInScopeMarkdownFiles,
  isDocsPathInScope,
  isMarkdownPath,
  loadDocsPolicy,
  matchesDocsPolicyPattern,
} from "@recallnet/docs-governance-policy";

import {
  createAgentsSection,
  createIndexSource,
  createRemarkConfigSource,
  defaultDocsPolicy,
  defaultFrontmatterSchema,
} from "./templates.js";

function ensureDirectory(pathValue) {
  mkdirSync(dirname(pathValue), { recursive: true });
}

function writeFileIfMissing(pathValue, contents, force = false) {
  if (!force && existsSync(pathValue)) {
    return false;
  }

  ensureDirectory(pathValue);
  writeFileSync(pathValue, contents, "utf8");
  return true;
}

function upsertPackageScripts(cwd) {
  const packageJsonPath = resolve(cwd, "package.json");
  if (!existsSync(packageJsonPath)) {
    return false;
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  packageJson.scripts ??= {};
  packageJson.scripts["docs:lint"] ??= "recall-docs-governance lint";
  packageJson.scripts["docs:lint:changed"] ??= "recall-docs-governance lint --changed";
  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");
  return true;
}

function ensureAgentsGuidance(cwd) {
  const agentsPath = resolve(cwd, "AGENTS.md");
  const section = createAgentsSection();

  if (!existsSync(agentsPath)) {
    writeFileSync(agentsPath, `# AGENTS\n\n${section}`, "utf8");
    return true;
  }

  const current = readFileSync(agentsPath, "utf8");
  if (current.includes("## Docs Governance")) {
    return false;
  }

  writeFileSync(agentsPath, `${current.replace(/\s*$/, "")}\n\n${section}`, "utf8");
  return true;
}

export function initDocsGovernanceRepo(options = {}) {
  const cwd = options.cwd ? resolve(options.cwd) : process.cwd();
  const force = options.force === true;
  const today = options.today ?? new Date().toISOString().slice(0, 10);

  const created = [];

  const docsPolicyPath = resolve(cwd, "docs", "docs-policy.json");
  if (
    writeFileIfMissing(docsPolicyPath, `${JSON.stringify(defaultDocsPolicy, null, 2)}\n`, force)
  ) {
    created.push("docs/docs-policy.json");
  }

  const schemaPath = resolve(cwd, "docs", "docs-frontmatter.schema.json");
  if (
    writeFileIfMissing(schemaPath, `${JSON.stringify(defaultFrontmatterSchema, null, 2)}\n`, force)
  ) {
    created.push("docs/docs-frontmatter.schema.json");
  }

  const remarkConfigPath = resolve(cwd, ".remarkrc.mjs");
  if (writeFileIfMissing(remarkConfigPath, createRemarkConfigSource(), force)) {
    created.push(".remarkrc.mjs");
  }

  const indexPath = resolve(cwd, "docs", "INDEX.md");
  if (writeFileIfMissing(indexPath, createIndexSource(today), force)) {
    created.push("docs/INDEX.md");
  }

  if (upsertPackageScripts(cwd)) {
    created.push("package.json#scripts");
  }

  if (ensureAgentsGuidance(cwd)) {
    created.push("AGENTS.md");
  }

  return {
    cwd,
    created,
  };
}

function resolveRemarkCliCommand(cwd) {
  const candidatePaths = [
    resolve(cwd, "node_modules", ".bin", "remark"),
    resolve(import.meta.dirname, "..", "node_modules", ".bin", "remark"),
  ];

  for (const candidatePath of candidatePaths) {
    if (existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  return "remark";
}

function collectChangedFiles(cwd) {
  try {
    const output = execFileSync("git", ["diff", "--name-only", "--diff-filter=ACMR", "HEAD"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return output
      .split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean);
  } catch {
    return null;
  }
}

function filterChangedInScopeFiles(changedFiles, policy) {
  const frontmatterExcludeGlobs = Array.isArray(policy?.frontmatter_exclude_globs)
    ? policy.frontmatter_exclude_globs
    : [];

  return changedFiles
    .filter(isMarkdownPath)
    .filter((pathValue) => isDocsPathInScope(pathValue, policy))
    .filter(
      (pathValue) =>
        !frontmatterExcludeGlobs.some((pattern) => matchesDocsPolicyPattern(pathValue, pattern))
    )
    .sort((left, right) => left.localeCompare(right, "en"));
}

export function lintDocsGovernance(options = {}) {
  const cwd = options.cwd ? resolve(options.cwd) : process.cwd();
  const { policy } = loadDocsPolicy({
    cwd,
    policyPath: options.policyPath ?? "docs/docs-policy.json",
  });

  const files = options.changed
    ? filterChangedInScopeFiles(collectChangedFiles(cwd) ?? [], policy)
    : collectInScopeMarkdownFiles(cwd, policy);
  if (files.length === 0) {
    return { status: 0, files: [] };
  }

  const remarkCliCommand = resolveRemarkCliCommand(cwd);
  execFileSync(remarkCliCommand, [...files, "--frail"], {
    cwd,
    stdio: "inherit",
  });

  return { status: 0, files };
}
