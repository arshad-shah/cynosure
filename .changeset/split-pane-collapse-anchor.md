---
"@arshad-shah/cynosure": minor
---

SplitPane: `collapsed`, `defaultCollapsed` and `onCollapsedChange` collapse a pane from a menu or button and restore its remembered size, `onResizeEnd` fires once when a drag or key resize ends, and `anchor="end"` gives the size to the end pane (a right sidebar or bottom dock that keeps its pixels). Collapsing no longer reports a size of 0 through `onSizeChange`: the size is kept.
