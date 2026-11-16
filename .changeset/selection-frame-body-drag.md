---
"@arshad-shah/cynosure": patch
---

SelectionFrame: dragging the object's body moves it again with a real mouse, pen or finger. The body's drag read the pointer button from the move that started it, which browsers report as -1, so it gave up at the first move; it now goes through `useDrag`.
