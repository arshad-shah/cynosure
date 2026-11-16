---
"@arshad-shah/cynosure": minor
---

VirtualList `onRangeChange(start, end)`: the rows in view (end exclusive) whenever they change, on mount, scroll and resize, never twice for the same rows, for rows fetched by position (a log held in a worker). Rows that expand are measured again with `wrap` (documented and tested).
