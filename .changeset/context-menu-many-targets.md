---
"@arshad-shah/cynosure": minor
---

ContextMenu: one menu can serve many targets (the rows of a list, the tabs of a tab list) through the render prop's `targetFor(key)`; `label` and `items` may be functions of the key, and `onSelect` and `onOpenChange` receive it. Tabs and Tree use it instead of their own copies.
