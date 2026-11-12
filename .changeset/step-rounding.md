---
"@arshad-shah/cynosure": patch
---

Slider and NumberField round to the decimals of both `step` and `min`, so `min={0.5} step={1}` reaches 0.5, 1.5 and so on, and steps written as `1e-7` no longer round to 0. Their ARIA and form values are written without exponent notation.
