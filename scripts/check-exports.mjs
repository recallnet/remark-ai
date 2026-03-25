const modulePaths = [
  "../packages/docs-governance-policy/src/index.js",
  "../packages/docs-governance-preset/src/index.js",
  "../packages/remark-lint-docs-freshness/src/index.js",
  "../packages/remark-lint-docs-reachability/src/index.js",
];

for (const modulePath of modulePaths) {
  await import(new URL(modulePath, import.meta.url).href);
}

process.stdout.write("export check ok\n");
