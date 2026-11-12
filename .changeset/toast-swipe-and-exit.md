---
"@arshad-shah/cynosure": patch
---

Swiping a Toast away now runs through the shared drag handling: Escape mid-swipe puts it back and taps on its buttons stay taps. A leaving toast (and a closing Dialog) waits for its longest exit transition, delays included.
