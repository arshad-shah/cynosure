---
"@arshad-shah/cynosure": minor
---

Button, IconButton, Select, TextField, ProgressBar and SegmentedControl take `size="xs"` (the new `DenseSize` type): about 20px tall (the new global `--cy-control-height-xs`, `control.height.xs` in a theme), with smaller text, icons and padding, for dense desktop chrome. Button and TextField also take `--cy-button-height-xs`, `--cy-button-padding-inline-xs`, `--cy-text-field-height-xs` and `--cy-text-field-padding-inline-xs`. Only the look shrinks: the hit area stays at least 24px, and 44px on coarse pointers.
