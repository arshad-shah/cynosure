---
"@arshad-shah/cynosure": patch
---

CompareSlider calls `onChange` only when the divider actually moves, not for Home at the start, arrows past an end or a pointer resting on one spot.
