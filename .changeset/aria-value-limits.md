---
"@arshad-shah/cynosure": patch
---

Slider and NumberField write `aria-valuemin` and `aria-valuemax` without exponent notation (0.0000005, not 5e-7), as they already did `aria-valuenow`.
