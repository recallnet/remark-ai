import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { createDocsGovernanceConfig, initDocsGovernanceRepo } from "../src/index.js";

test("createDocsGovernanceConfig wires the expected plugin stack", () => {
  const config = createDocsGovernanceConfig();

  assert.equal(Array.isArray(config.plugins), true);
  assert.equal(config.plugins.length, 5);
});

test("initDocsGovernanceRepo writes default files and package scripts", () => {
  const repoDir = mkdtempSync(join(tmpdir(), "docs-governance-preset-"));
  mkdirSync(join(repoDir, "docs"), { recursive: true });
  writeFileSync(
    join(repoDir, "package.json"),
    JSON.stringify({ name: "fixture", private: true, scripts: {} }, null, 2)
  );

  const result = initDocsGovernanceRepo({ cwd: repoDir, today: "2026-03-25" });

  assert.match(readFileSync(join(repoDir, ".remarkrc.mjs"), "utf8"), /createDocsGovernanceConfig/);
  assert.match(readFileSync(join(repoDir, "docs", "INDEX.md"), "utf8"), /reviewed: 2026-03-25/);
  assert.match(
    readFileSync(join(repoDir, "package.json"), "utf8"),
    /"docs:lint": "recall-docs-governance lint"/
  );
  assert.equal(result.created.includes("docs/docs-policy.json"), true);
});
