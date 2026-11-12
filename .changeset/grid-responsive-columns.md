---
"@arshad-shah/cynosure": minor
---

`Grid` `columns` also takes a count per breakpoint, `columns={{ base: 1, sm: 2, lg: 4 }}`. The breakpoints (`sm` 30rem, `md` 45rem, `lg` 60rem, `xl` 75rem, exported as `GRID_BREAKPOINTS`) are widths of the grid itself, not the window, so it adapts inside panels, popups and shadow roots. It is CSS only, so server-rendered markup is right on the first paint, and `GridItem` spans are clamped to the columns in effect at each width.
