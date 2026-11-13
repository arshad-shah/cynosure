---
"@arshad-shah/cynosure": minor
---

Tooltip: `disabled` turns the tooltip off without remounting its trigger, and `describe={false}` shows a tip that repeats the trigger's name without reading it to screen readers again; `whenTruncated` turns it on only while text is cut short (measured with one ResizeObserver) and implies `describe={false}`. Tabs, StatusBar and DataGrid use it, so StatusBar and DataGrid no longer read a cut-short text twice and DataGrid's tip shows only when the cell is cut.
