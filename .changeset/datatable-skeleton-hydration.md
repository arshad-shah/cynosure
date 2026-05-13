---
'@arshad-shah/cynosure-react': patch
---

Fix `DataTable` loading-state hydration mismatch. The skeleton cells used
`Math.random()` at render time to vary their widths, so the server and
client rendered different markup — React logged a hydration warning and
the widths visibly snapped on mount. Widths are now derived
deterministically from each cell's `(rowIdx, colIdx)`, so SSR and the
first client paint match.
