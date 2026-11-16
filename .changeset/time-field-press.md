---
"@arshad-shah/cynosure": patch
---

TimeField: a press in the picker chooses only the pressed row. When the column had just moved (the browser bringing the row into view), the press used to choose the allowed time nearest to where the column stopped. A press on an unavailable hour now chooses nothing, and the column goes back to the current time.
