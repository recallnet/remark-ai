#!/usr/bin/env node
import { initDocsGovernanceRepo, lintDocsGovernance } from "./index.js";

function parseArgs(argv) {
  const [command = "help", ...rest] = argv;
  const options = {
    command,
    changed: false,
    force: false,
  };

  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];
    if (value === "--changed") {
      options.changed = true;
      continue;
    }

    if (value === "--force") {
      options.force = true;
      continue;
    }

    if (value === "--dir") {
      options.cwd = rest[index + 1];
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${value}`);
  }

  return options;
}

function printHelp() {
  process.stdout.write(`Usage:
  recall-docs-governance init [--dir <path>] [--force]
  recall-docs-governance lint [--dir <path>] [--changed]
`);
}

try {
  const options = parseArgs(process.argv.slice(2));

  if (options.command === "help" || options.command === "--help" || options.command === "-h") {
    printHelp();
    process.exit(0);
  }

  if (options.command === "init") {
    const result = initDocsGovernanceRepo({ cwd: options.cwd, force: options.force });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    process.exit(0);
  }

  if (options.command === "lint") {
    lintDocsGovernance({ cwd: options.cwd, changed: options.changed });
    process.exit(0);
  }

  throw new Error(`Unknown command: ${options.command}`);
} catch (error) {
  process.stderr.write(`[docs-governance] fatal=${JSON.stringify({ message: error.message })}\n`);
  process.exit(1);
}
