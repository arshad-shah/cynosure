---
"@arshad-shah/cynosure": minor
---

Button, IconButton, Select, TextField, ProgressBar and SegmentedControl take `size="xs"` (the new `DenseSize` type): about 20px tall, with smaller text, icons and padding from new `--cy-<component>-*-xs` tokens, for dense desktop chrome. Only the look shrinks: the hit area stays at least 24px, and 44px on coarse pointers.
