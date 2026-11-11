---
"@arshad-shah/cynosure": minor
---

New `Heading` component: a section or page heading whose `level` (the `h1` to `h6` element) is separate from its `size` (`xs` to `2xl`, plus `display` for a hero title), so the page outline stays correct whatever the heading looks like. It has `tone`, `weight`, `align` and `truncate` (one line or a number of lines), uses the display font with a tight line height and balanced wrapping, and has no margins. Each size has a token (`--cy-heading-size-*`) so a product can retune its heading scale.
