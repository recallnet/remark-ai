import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import { remark } from "remark";

import remarkLintDocsReachability, { buildReachabilityReport } from "../src/index.js";

function initRepo() {
  const repoDir = mkdtempSync(join(tmpdir(), "remark-docs-reachability-"));
  mkdirSync(join(repoDir, "docs"), { recursive: true });
  writeFileSync(
    join(repoDir, "docs", "docs-policy.json"),
    JSON.stringify(
      {
        "docs_policy/v1": {
          in_scope_paths: ["docs/**"],
          required_doc_types: [{ doc_type: "root", path: "docs/z-root.md" }],
          root_docs_allowlist: ["docs/z-root.md"],
          orphan_exclude_globs: ["docs/allowed/**"],
          migration_debt: {
            legacy_in_scope_allowlist: ["docs/legacy.md"],
          },
        },
      },
      null,
      2
    )
  );
  return repoDir;
}

test("computes orphan docs from policy roots", () => {
  const repoDir = initRepo();
  writeFileSync(join(repoDir, "docs", "z-root.md"), "# Root\n\n[Child](./a-child.md)\n");
  writeFileSync(join(repoDir, "docs", "a-child.md"), "# Child\n");
  writeFileSync(join(repoDir, "docs", "m-orphan.md"), "# Orphan\n");
  mkdirSync(join(repoDir, "docs", "allowed"), { recursive: true });
  writeFileSync(join(repoDir, "docs", "allowed", "skip.md"), "# Skip\n");
  writeFileSync(join(repoDir, "docs", "legacy.md"), "# Legacy\n");

  const report = buildReachabilityReport({ cwd: repoDir });
  assert.deepEqual(report.orphanDocuments, ["docs/m-orphan.md"]);
});

test("reports orphan for current file", async () => {
  const repoDir = initRepo();
  writeFileSync(join(repoDir, "docs", "z-root.md"), "# Root\n\n[Child](./a-child.md)\n");
  writeFileSync(join(repoDir, "docs", "a-child.md"), "# Child\n");
  writeFileSync(join(repoDir, "docs", "m-orphan.md"), "# Orphan\n");

  const orphanPath = resolve(repoDir, "docs", "m-orphan.md");
  const file = await remark()
    .use(remarkLintDocsReachability, { cwd: repoDir })
    .process({ path: orphanPath, value: "# Orphan\n" });

  assert.equal(file.messages.length, 1);
  assert.match(String(file.messages[0].reason), /not reachable from policy roots/);
});

test("skips broken symlinks instead of crashing reachability scanning", () => {
  const repoDir = initRepo();
  writeFileSync(join(repoDir, "docs", "z-root.md"), "# Root\n");
  mkdirSync(join(repoDir, ".agent", "skills", "adversarial-verifier"), { recursive: true });
  symlinkSync(
    join(repoDir, "missing-target"),
    join(repoDir, ".agent", "skills", "adversarial-verifier", "adversarial-verifier")
  );

  const report = buildReachabilityReport({ cwd: repoDir });
  assert.deepEqual(report.documents, ["docs/z-root.md"]);
});
