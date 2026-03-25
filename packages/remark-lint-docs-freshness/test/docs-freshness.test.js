import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";

import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";

import remarkLintDocsFreshness from "../src/index.js";

function initRepo() {
  const repoDir = mkdtempSync(join(tmpdir(), "remark-docs-freshness-"));
  mkdirSync(join(repoDir, "docs", "architecture"), { recursive: true });
  writeFileSync(
    join(repoDir, "docs", "docs-policy.json"),
    JSON.stringify(
      {
        "docs_policy/v1": {
          freshness: {
            default_review_policy: "periodic-7",
            review_policies: [
              { id: "historical", mode: "historical" },
              { id: "periodic-7", mode: "periodic", max_age_days: 7 },
            ],
          },
          in_scope_paths: ["docs/**"],
        },
      },
      null,
      2
    )
  );
  return repoDir;
}

async function lintFile(repoDir, relativePath, contents, options = {}) {
  const absolutePath = resolve(repoDir, relativePath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, contents);

  const file = await remark()
    .use(remarkFrontmatter)
    .use(remarkLintDocsFreshness, { cwd: repoDir, today: "2026-03-19", ...options })
    .process({ path: absolutePath, value: contents });

  return file.messages.map((entry) => String(entry.reason));
}

test("flags stale periodic docs", async () => {
  const repoDir = initRepo();
  const messages = await lintFile(
    repoDir,
    "docs/architecture/stale.md",
    `---\nreview_policy: periodic-7\nreviewed: 2026-03-01\n---\n\n# Stale\n`
  );

  assert.equal(messages.length, 1);
  assert.match(messages[0], /Document is stale/);
});

test("ignores historical docs", async () => {
  const repoDir = initRepo();
  const messages = await lintFile(
    repoDir,
    "docs/architecture/history.md",
    `---\nreview_policy: historical\nreviewed: 2026-01-01\n---\n\n# History\n`
  );

  assert.deepEqual(messages, []);
});
