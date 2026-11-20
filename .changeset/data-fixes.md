---
"@arshad-shah/cynosure": patch
---

Data and lists: DataGrid no longer re-sorts and re-keys every row while scrolling when `sort` is controlled or `getRowId` is an inline function, and VirtualList no longer re-keys with an inline `getKey`. A hidden DataGrid column neither filters nor sorts (its filter and sort come back with it), and the keyboard tab stop stays on its row when rows change. Sorting compares dates by time, and booleans and bigints as values. DataGrid, Tree and VirtualList re-measure their rows when the row height changes (a new `size`). A Tree `reload()` answer that arrives after a newer one is ignored.
