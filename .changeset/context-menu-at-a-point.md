---
"@arshad-shah/cynosure": minor
---

ContextMenu: the app can open it itself, for things with no element of their own (objects drawn on a canvas). `open` controls it and `anchor` places it at a point (`{ x, y }` in client coordinates, or any element or virtual anchor, as Popover's `anchor`); `onOpenChange(false)` reports Escape, a choice, Tab or an outside press, and focus returns to what had it when the menu opened. `children` is optional in this form. With a target as well, a right-click asks to open through `onOpenChange(true)`, and a menu opened without `anchor` sits under the target.
