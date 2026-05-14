---
'@arshad-shah/cynosure-react': minor
'@arshad-shah/cynosure-docs': minor
---

Add `Mark` and `HighlightedText` components for inline text highlighting.

`Mark` is a thin inline-flow primitive that wraps text in a semantic `<mark>` (or opt-in `<span>`) styled with Cynosure tokens. It supports four variants (`marker`, `underline`, `chip`, `bold`), six colour schemes, and two intensities, and wraps cleanly across lines via `box-decoration-break: clone`. `HighlightedText` is the companion helper for the common "highlight these ranges in this string" case — feed it a source string and an array of `{ start, length }` ranges and it handles the segment bookkeeping.
