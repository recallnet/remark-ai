import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";

import remarkLintDocsTaxonomy from "../src/index.js";

function initRepo() {
  const repoDir = mkdtempSync(join(tmpdir(), "remark-docs-taxonomy-"));
  mkdirSync(join(repoDir, "docs", "decisions"), { recursive: true });
  mkdirSync(join(repoDir, "docs", "observations"), { recursive: true });
  mkdirSync(join(repoDir, "docs", "explanation"), { recursive: true });
  mkdirSync(join(repoDir, "docs", "services"), { recursive: true });
  mkdirSync(join(repoDir, "docs", "templates"), { recursive: true });
  writeFileSync(
    join(repoDir, "docs", "docs-policy.json"),
    JSON.stringify(
      {
        "docs_policy/v1": {
          in_scope_paths: ["docs/**"],
          frontmatter_exclude_globs: ["docs/templates/**"],
          taxonomy: {
            doc_types: [
              {
                id: "decision",
                path_globs: ["docs/decisions/**"],
                filename_pattern: "^[0-9]{3}-[a-z0-9-]+\\.md$",
              },
              {
                id: "observation",
                path_globs: ["docs/observations/**"],
                filename_pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9-]+\\.md$",
                allowed_filenames: ["research-log.md"],
              },
              {
                id: "explanation",
                path_globs: ["docs/explanation/**", "docs/services/**"],
              },
            ],
          },
        },
      },
      null,
      2
    )
  );
  return repoDir;
}

async function lintFile(repoDir, relativePath, value) {
  const file = await remark()
    .use(remarkFrontmatter)
    .use(remarkLintDocsTaxonomy, { cwd: repoDir })
    .process({ path: resolve(repoDir, relativePath), value });

  return file.messages.map((message) => String(message.reason));
}

test("accepts a valid decision doc path and filename", async () => {
  const repoDir = initRepo();
  const messages = await lintFile(
    repoDir,
    "docs/decisions/001-valid-decision.md",
    `---\ndoc_type: decision\n---\n\n# Decision\n`
  );

  assert.deepEqual(messages, []);
});

test("reports an invalid directory for a decision doc", async () => {
  const repoDir = initRepo();
  const messages = await lintFile(
    repoDir,
    "docs/decision.md",
    `---\ndoc_type: decision\n---\n\n# Decision\n`
  );

  assert.equal(messages.length, 2);
  assert.equal(
    messages.some((message) => /must live under/.test(message)),
    true
  );
  assert.equal(
    messages.some((message) => /must use a filename matching/.test(message)),
    true
  );
});

test("reports an invalid observation filename", async () => {
  const repoDir = initRepo();
  const messages = await lintFile(
    repoDir,
    "docs/observations/cache-notes.md",
    `---\ndoc_type: observation\n---\n\n# Observation\n`
  );

  assert.equal(messages.length, 1);
  assert.match(messages[0], /must use a filename matching/);
  assert.match(messages[0], /research-log\.md/);
});

test("allows explicit living observation filenames", async () => {
  const repoDir = initRepo();
  const messages = await lintFile(
    repoDir,
    "docs/observations/research-log.md",
    `---\ndoc_type: observation\n---\n\n# Observation\n`
  );

  assert.deepEqual(messages, []);
});

test("reports unknown doc types when taxonomy has no matching rule", async () => {
  const repoDir = initRepo();
  const messages = await lintFile(
    repoDir,
    "docs/decisions/001-unknown.md",
    `---\ndoc_type: unknown\n---\n\n# Unknown\n`
  );

  assert.deepEqual(messages, ["Unknown document type 'unknown' in docs/decisions/001-unknown.md."]);
});

test("accepts explanation docs under docs/services", async () => {
  const repoDir = initRepo();
  const messages = await lintFile(
    repoDir,
    "docs/services/cache-service.md",
    `---\ndoc_type: explanation\n---\n\n# Explanation\n`
  );

  assert.deepEqual(messages, []);
});

test("ignores excluded templates", async () => {
  const repoDir = initRepo();
  const messages = await lintFile(
    repoDir,
    "docs/templates/decision.md",
    `---\ndoc_type: decision\n---\n\n# Template\n`
  );

  assert.deepEqual(messages, []);
});
