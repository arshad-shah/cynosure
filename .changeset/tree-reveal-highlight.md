---
"@arshad-shah/cynosure": minor
---

Tree: `handle.reveal(id, { align })` shows an item chosen elsewhere: it opens the item's closed ancestors (through `onExpandedChange`), scrolls it into view (virtual trees too; `nearest`, `start` or `center`) and makes it the tab stop without taking focus, returning false for an unknown id. `highlight` marks a query in every shown label without hiding or opening anything, for a search that steps through matches.
