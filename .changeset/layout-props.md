---
"@arshad-shah/cynosure": minor
---

Layout primitives take what page layouts asked for. `Stack`, `Inline`, `Grid`, `GridItem` and `Container` accept `id`, `role` and `aria-*` in their types (they already passed them on) and `hideBelow` / `hideAbove` (a breakpoint of the window: hidden with CSS, no script). `Grid` `columns` takes a track list for unequal columns (`"2fr 1fr"`). `GridItem` takes `span` and `order` per breakpoint (`{ base: "full", md: 2 }`), measured on the grid's width like its columns, for unequal columns that change with the width and for reordering. `GridItem` and `Stack` take `sticky` and `stickyOffset`. The breakpoint scale is now shared as `BREAKPOINTS`; `GRID_BREAKPOINTS` is the same object.
