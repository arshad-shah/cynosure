---
"@arshad-shah/cynosure": minor
---

Inline: `separator="dot"` (or `"line"`, a thin upright rule) makes a meta line ("PDF · 3 pages · 1.2 MB"): a mark drawn by CSS in the gap before every child but the first, hidden from assistive technology. Each child, text included, becomes one item (a list item with `as="ul"` or `"ol"`), and empty children are left out, so a missing value leaves no stray mark. Tokens `--cy-inline-separator-color` and `--cy-inline-separator-size`; the mark takes `CanvasText` in forced colours.
