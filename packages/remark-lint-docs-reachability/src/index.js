import { existsSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

import {
  DEFAULT_POLICY_PATH,
  collectInScopeMarkdownFiles,
  computeOrphanAllowlist,
  computeReachabilityRoots,
  isMarkdownPath,
  loadDocsPolicy,
  normalizePath,
} from "@recallnet/docs-governance-policy";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";

const RULE_ID = "docs-reachability";

function isExternalDestination(destination) {
  if (!destination) {
    return true;
  }

  if (destination.startsWith("//")) {
    return true;
  }

  return /^[a-zA-Z][a-zA-Z\\d+.-]*:/.test(destination);
}

function splitDestination(target) {
  const hashIndex = target.indexOf("#");
  const beforeHash = hashIndex >= 0 ? target.slice(0, hashIndex) : target;
  const queryIndex = beforeHash.indexOf("?");
  return {
    pathRaw: queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash,
  };
}

// @context decision !high [verified:2026-03-25] — Links that escape the repo are excluded from reachability.
// Orphan detection is only about repo-owned docs; external link correctness belongs to `remark-validate-links`.
function resolveTargetPath({ repoRoot, sourcePath, pathRaw }) {
  if (!pathRaw) {
    return sourcePath;
  }

  const sourceAbsolute = resolve(repoRoot, sourcePath);
  const targetAbsolute = pathRaw.startsWith("/")
    ? resolve(repoRoot, `.${pathRaw}`)
    : resolve(dirname(sourceAbsolute), pathRaw);
  const relPath = normalizePath(relative(repoRoot, targetAbsolute));

  if (!relPath || relPath === ".") {
    return sourcePath;
  }

  if (relPath.startsWith("../") || relPath === "..") {
    return null;
  }

  return relPath;
}

function collectLinks(tree) {
  const links = [];

  function visit(node) {
    if (!node || typeof node !== "object") {
      return;
    }

    if (node.type === "link" && typeof node.url === "string") {
      links.push(node.url);
    }

    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        visit(child);
      }
    }
  }

  visit(tree);
  return links;
}

function computeReachableDocuments(roots, edges) {
  const adjacency = new Map();
  for (const edge of edges) {
    const list = adjacency.get(edge.source) ?? [];
    list.push(edge.target);
    adjacency.set(edge.source, list);
  }

  const reachable = new Set();
  const queue = [...roots];

  while (queue.length > 0) {
    const current = queue.shift();
    if (reachable.has(current)) {
      continue;
    }

    reachable.add(current);

    for (const target of adjacency.get(current) ?? []) {
      if (!reachable.has(target)) {
        queue.push(target);
      }
    }
  }

  return reachable;
}

// @context decision:tradeoff !high [verified:2026-03-25] — The graph is rebuilt from disk instead of shared remark batch state.
// That keeps orphan detection deterministic for CI, editor-on-save linting, and one-file invocations.
export function buildReachabilityReport(options = {}) {
  const cwd = options.cwd ? resolve(options.cwd) : process.cwd();
  const policyPath = options.policyPath ?? DEFAULT_POLICY_PATH;
  const { policy } = loadDocsPolicy({ cwd, policyPath });
  const documents = collectInScopeMarkdownFiles(cwd, policy);
  const inScopeMarkdownSet = new Set(documents);
  const parser = remark().use(remarkFrontmatter);
  const edges = [];

  for (const sourcePath of documents) {
    const tree = parser.parse(readFileSync(resolve(cwd, sourcePath), "utf8"));
    for (const destination of collectLinks(tree)) {
      if (isExternalDestination(destination)) {
        continue;
      }

      const { pathRaw } = splitDestination(destination);
      const resolvedTargetPath = resolveTargetPath({
        repoRoot: cwd,
        sourcePath,
        pathRaw,
      });

      if (!resolvedTargetPath || !isMarkdownPath(resolvedTargetPath)) {
        continue;
      }

      if (!existsSync(resolve(cwd, resolvedTargetPath))) {
        continue;
      }

      if (inScopeMarkdownSet.has(resolvedTargetPath)) {
        edges.push({ source: sourcePath, target: resolvedTargetPath });
      }
    }
  }

  const roots = computeReachabilityRoots(policy, inScopeMarkdownSet);
  const allowlist = computeOrphanAllowlist(policy, inScopeMarkdownSet);
  const reachable = computeReachableDocuments(roots, edges);
  const rootSet = new Set(roots);
  const allowlistSet = new Set(allowlist);
  const orphanDocuments = documents.filter(
    (docPath) => !reachable.has(docPath) && !rootSet.has(docPath) && !allowlistSet.has(docPath)
  );

  return {
    documents,
    edges,
    roots,
    allowlist,
    orphanDocuments,
  };
}

export default function remarkLintDocsReachability(options = {}) {
  return (_tree, file) => {
    const cwd = options.cwd ? resolve(options.cwd) : process.cwd();
    const filePath = file.path ? normalizePath(relative(cwd, file.path)) : "";

    if (!filePath) {
      return;
    }

    const report = buildReachabilityReport({ cwd, policyPath: options.policyPath });
    if (report.orphanDocuments.includes(filePath)) {
      file.message(`Document is not reachable from policy roots: ${filePath}`, {
        ruleId: RULE_ID,
        source: "@recallnet/remark-lint-docs-reachability",
      });
    }
  };
}
