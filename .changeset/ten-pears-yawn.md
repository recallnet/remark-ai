---
"@recallnet/docs-governance-preset": patch
"@recallnet/remark-lint-docs-reachability": patch
---

Reduce docs governance hook latency by short-circuiting `lint --changed`
before full remark startup and caching the reachability report for the
life of a single lint process.
