---
"@arshad-shah/cynosure": patch
---

VirtualList: moving rows with Alt+arrows or a drag is linear in the list's length (it was quadratic, so a large selection in a long list froze the page), and scrolling no longer re-keys every item or re-measures every wrapped row.
