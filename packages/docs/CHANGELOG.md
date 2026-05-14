# @arshad-shah/cynosure-docs

## 3.1.0

### Minor Changes

- [#73](https://github.com/arshad-shah/cynosure/pull/73) [`709f454`](https://github.com/arshad-shah/cynosure/commit/709f454027bac8fb047b92279ebdbca9c5ae5bf5) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Add `Mark` and `HighlightedText` components for inline text highlighting.

  `Mark` is a thin inline-flow primitive that wraps text in a semantic `<mark>` (or opt-in `<span>`) styled with Cynosure tokens. It supports four variants (`marker`, `underline`, `chip`, `bold`), six colour schemes, and two intensities, and wraps cleanly across lines via `box-decoration-break: clone`. `HighlightedText` is the companion helper for the common "highlight these ranges in this string" case — feed it a source string and an array of `{ start, length }` ranges and it handles the segment bookkeeping.

### Patch Changes

- Updated dependencies [[`2a72943`](https://github.com/arshad-shah/cynosure/commit/2a72943167861c1ce29a8fcfc8ba65e65efd0902), [`709f454`](https://github.com/arshad-shah/cynosure/commit/709f454027bac8fb047b92279ebdbca9c5ae5bf5), [`96c9b92`](https://github.com/arshad-shah/cynosure/commit/96c9b9274d2ba1011daf05ea36a7327cd161afd3)]:
  - @arshad-shah/cynosure-react@3.1.0

## 3.0.0

### Patch Changes

- Updated dependencies [[`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86), [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86), [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86), [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86), [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86), [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86), [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86), [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86), [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86), [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86), [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86), [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86)]:
  - @arshad-shah/cynosure-react@3.0.0
  - @arshad-shah/cynosure-themes@3.0.0
  - @arshad-shah/cynosure-tokens@3.0.0

## 2.1.0

### Patch Changes

- Updated dependencies [[`8cf2f7d`](https://github.com/arshad-shah/cynosure/commit/8cf2f7dcbe9be3e0fd20b73b588b1cb8fe506b64)]:
  - @arshad-shah/cynosure-react@2.1.0

## 2.0.0

### Patch Changes

- Updated dependencies [[`66f58c9`](https://github.com/arshad-shah/cynosure/commit/66f58c97f73a50fe2b60c895846453c2c3de7725)]:
  - @arshad-shah/cynosure-react@2.0.0
