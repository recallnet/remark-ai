const REPO_DOCS_PROFILE_ID = "repo-docs";

const REPO_DOCS_TEMPLATE_ORDER = [
  "index",
  "decision",
  "observation",
  "how-to",
  "reference",
  "explanation",
  "runbook",
];

function createRepoDocsPolicy() {
  return {
    ["docs_policy/v1"]: {
      profile: REPO_DOCS_PROFILE_ID,
      freshness: {
        default_review_policy: "periodic-7",
        review_policies: [
          {
            id: "codebound",
            mode: "codebound",
          },
          {
            id: "generated",
            mode: "generated",
          },
          {
            id: "historical",
            mode: "historical",
          },
          {
            id: "periodic-7",
            mode: "periodic",
            max_age_days: 7,
          },
        ],
        path_defaults: [
          {
            path: "docs/**",
            review_policy: "periodic-7",
          },
          {
            path: "docs/INDEX.md",
            review_policy: "generated",
          },
          {
            path: "docs/templates/**",
            review_policy: "generated",
          },
        ],
      },
      in_scope_paths: ["docs/**"],
      frontmatter_exclude_globs: ["docs/templates/**"],
      required_doc_types: [],
      root_docs_allowlist: ["docs/INDEX.md"],
      root_level_exceptions: [],
      orphan_exclude_globs: ["docs/templates/**"],
      taxonomy: {
        exclude_globs: ["docs/templates/**"],
        doc_types: [
          {
            id: "index",
            path_globs: ["docs/INDEX.md"],
            filename_pattern: "^INDEX\\.md$",
          },
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
            id: "how-to",
            path_globs: ["docs/how-to/**"],
          },
          {
            id: "reference",
            path_globs: ["docs/reference/**", "docs/contracts/**"],
          },
          {
            id: "explanation",
            path_globs: ["docs/explanation/**", "docs/services/**"],
          },
          {
            id: "runbook",
            path_globs: ["docs/runbooks/**"],
          },
        ],
      },
      migration_debt: {
        legacy_in_scope_allowlist: [],
      },
    },
  };
}

function createRepoDocsFrontmatterSchema() {
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    additionalProperties: true,
    properties: {
      doc_type: {
        type: "string",
        enum: REPO_DOCS_TEMPLATE_ORDER,
      },
      owner: { type: "string", minLength: 1 },
      review_policy: {
        type: "string",
        enum: ["periodic-7", "codebound", "generated", "historical"],
      },
      reviewed: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
      status: {
        type: "string",
        enum: ["draft", "active", "deprecated", "superseded", "historical"],
      },
      summary: { type: "string", minLength: 1 },
      tags: {
        type: "array",
        minItems: 1,
        items: { type: "string", minLength: 1 },
      },
      written: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
      id: { type: "string", minLength: 1 },
      title: { type: "string", minLength: 1 },
      code_paths: {
        type: "array",
        items: { type: "string", minLength: 1 },
      },
      related_docs: {
        type: "array",
        items: { type: "string", minLength: 1 },
      },
    },
    required: [
      "doc_type",
      "owner",
      "review_policy",
      "reviewed",
      "status",
      "summary",
      "tags",
      "written",
    ],
  };
}

function createTemplateFrontmatter(docType, options = {}) {
  const lines = ["---", `doc_type: ${docType}`];

  if (options.id) {
    lines.push(`id: ${options.id}`);
  }

  if (options.title) {
    lines.push(`title: ${options.title}`);
  }

  lines.push(
    `owner: ${options.owner ?? "docs-stewards"}`,
    `review_policy: ${options.reviewPolicy ?? "periodic-7"}`,
    `reviewed: ${options.reviewed ?? "YYYY-MM-DD"}`,
    `status: ${options.status ?? "active"}`,
    `summary: ${options.summary ?? "Replace with a one-line summary."}`,
    "tags:",
    ...(options.tags ?? ["docs", docType]).map((tag) => `  - ${tag}`),
    `written: ${options.written ?? "YYYY-MM-DD"}`
  );

  if (Array.isArray(options.codePaths)) {
    if (options.codePaths.length === 0) {
      lines.push("code_paths: []");
    } else {
      lines.push("code_paths:");
      for (const codePath of options.codePaths) {
        lines.push(`  - ${codePath}`);
      }
    }
  }

  if (Array.isArray(options.relatedDocs)) {
    if (options.relatedDocs.length === 0) {
      lines.push("related_docs: []");
    } else {
      lines.push("related_docs:");
      for (const relatedDoc of options.relatedDocs) {
        lines.push(`  - ${relatedDoc}`);
      }
    }
  }

  lines.push("---", "");
  return `${lines.join("\n")}`;
}

function createRepoDocsTemplateSources() {
  return {
    "docs/templates/index.md": `${createTemplateFrontmatter("index", {
      reviewPolicy: "generated",
      status: "active",
      summary: "Replace with the canonical root doc summary.",
      tags: ["docs", "index"],
      title: "Docs Index",
      id: "docs-index",
      relatedDocs: [],
      codePaths: [],
    })}# Docs Index

Start here. Link every live in-scope doc from this root or another rooted doc.
`,
    "docs/templates/decision.md": `${createTemplateFrontmatter("decision", {
      status: "draft",
      summary: "Replace with the decision summary.",
      title: "Decision Title",
      id: "decision-title",
      relatedDocs: [],
      codePaths: [],
    })}# ADR-XXX: Decision Title

## Context

Describe the problem or trigger for this decision.

## Decision

Describe the chosen approach.

## Consequences

- Note the important consequences.
`,
    "docs/templates/observation.md": `${createTemplateFrontmatter("observation", {
      summary: "Replace with the investigation summary.",
      title: "Observation Title",
      id: "observation-title",
      relatedDocs: [],
      codePaths: [],
    })}# Observation Title

## Context

Describe why this investigation happened.

## Findings

Record the evidence and observations.

## Follow-ups

- Note the next actions.
`,
    "docs/templates/how-to.md": `${createTemplateFrontmatter("how-to", {
      summary: "Replace with the task outcome.",
      title: "How To Do Something",
      id: "how-to-do-something",
      relatedDocs: [],
      codePaths: [],
    })}# How To Do Something

## Prerequisites

- List prerequisites.

## Steps

1. Describe the first step.
2. Describe the second step.
`,
    "docs/templates/reference.md": `${createTemplateFrontmatter("reference", {
      summary: "Replace with the reference scope.",
      title: "Reference Title",
      id: "reference-title",
      relatedDocs: [],
      codePaths: [],
    })}# Reference Title

## Overview

Describe the interface, config, or facts captured here.

## Details

Add the reference material.
`,
    "docs/templates/explanation.md": `${createTemplateFrontmatter("explanation", {
      summary: "Replace with the architecture or rationale summary.",
      title: "Explanation Title",
      id: "explanation-title",
      relatedDocs: [],
      codePaths: [],
    })}# Explanation Title

## Overview

Explain the rationale, architecture, or trade-offs.
`,
    "docs/templates/runbook.md": `${createTemplateFrontmatter("runbook", {
      summary: "Replace with the operational procedure summary.",
      title: "Runbook Title",
      id: "runbook-title",
      relatedDocs: [],
      codePaths: [],
    })}# Runbook Title

## Preconditions

- List the checks before you begin.

## Procedure

1. Describe the first operational step.
2. Describe the second operational step.
`,
  };
}

export function getDocsGovernanceProfile(profileName = REPO_DOCS_PROFILE_ID) {
  if (profileName !== REPO_DOCS_PROFILE_ID) {
    throw new Error(`Unknown docs governance profile: ${profileName}`);
  }

  return {
    id: REPO_DOCS_PROFILE_ID,
    coreDirectories: [
      "docs/decisions",
      "docs/how-to",
      "docs/observations",
      "docs/reference",
      "docs/explanation",
      "docs/runbooks",
      "docs/templates",
    ],
    docsPolicy: createRepoDocsPolicy(),
    frontmatterSchema: createRepoDocsFrontmatterSchema(),
    templateSources: createRepoDocsTemplateSources(),
  };
}

export function createRemarkConfigSource(options = {}) {
  const policyPath = options.policyPath ?? "./docs/docs-policy.json";
  const frontmatterSchemaPath =
    options.frontmatterSchemaPath ?? "./docs/docs-frontmatter.schema.json";
  const profile = options.profile ?? REPO_DOCS_PROFILE_ID;

  return `import { createDocsGovernanceConfig } from "@recallnet/docs-governance-preset";

export default createDocsGovernanceConfig({
  profile: ${JSON.stringify(profile)},
  policyPath: ${JSON.stringify(policyPath)},
  frontmatterSchemaPath: ${JSON.stringify(frontmatterSchemaPath)}
});
`;
}

export function createIndexSource(today = new Date().toISOString().slice(0, 10)) {
  return `---
doc_type: index
id: docs-index
title: Docs Index
owner: docs-stewards
review_policy: generated
reviewed: ${today}
status: active
summary: Canonical root for docs reachability and navigation.
tags:
  - docs
  - index
written: ${today}
code_paths: []
related_docs: []
---

# Docs Index

Start here. Every in-scope doc should be reachable from this index or another rooted doc.
`;
}

export function createAgentsSection() {
  return `## Docs Governance

- Use the canonical \`repo-docs\` profile instead of hand-rolled markdown parsing or custom repo layouts.
- Keep docs frontmatter valid and review dates current.
- Default active docs to \`periodic-7\`. If a repo cannot sustain 7-day review, it usually has too many active docs.
- \`review_policy\` controls freshness. \`status\` is lifecycle metadata only and does not bypass review requirements.
- Use \`generated\`, \`codebound\`, or \`historical\` only when they are genuinely correct, not as an escape hatch from freshness enforcement.
- Add new docs to the rooted docs graph so orphan checks stay clean.
- Root the graph from \`docs/INDEX.md\`.
- Put templates under \`docs/templates/\` and keep live curated docs in their canonical taxonomy directories.
- Prefer deleting stale docs over re-dating them. Git history already preserves old text; the live docs tree should describe current reality, not accumulate dead docs.
- Run \`pnpm docs:lint\` before merging doc structure or policy changes.
`;
}
