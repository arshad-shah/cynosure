---
"@arshad-shah/cynosure": patch
---

A controlled ColorField keeps its saturation and hue at black and through 8-bit rounding: bringing the brightness back up returns the colour you had, not grey. A `value` the parent changes itself is still read afresh.
