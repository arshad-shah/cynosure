---
'@arshad-shah/cynosure-react': minor
---

`Tree`: add accessor props (`getId`, `getLabel`, `getChildren`, `getDisabled`)
so consumers can plug in their own data shape without remapping. Default
behaviour is unchanged — accessors fall back to the original `TreeNode` shape.
Ships a companion `mapToTreeNodes(items, { getId, getLabel, getChildren, … })`
helper for callers who prefer a one-shot transform.
