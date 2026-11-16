---
"@arshad-shah/cynosure": minor
---

SelectionFrame keeps a small object's body free of handles: below `compactBelow` on screen (twice the hit area by default: 48px, 88px on touch screens), the handles across the short side are hidden and the rest move just outside the object, so a tick or a line of highlight can still be dragged by its body and resized by its corners. The frame carries `data-compact` (`x`, `y` or `xy`).
