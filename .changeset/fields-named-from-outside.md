---
"@arshad-shah/cynosure": minor
---

Fields can be named and described from outside, the same way on each: Select, Slider and NumberField take `id` (the trigger, the slider or a range's group, the input), and Select, Slider, NumberField, Checkbox and Switch take `aria-labelledby` (names the control instead of its own label; pair with `labelHidden`) and `aria-describedby` (merged before the control's own description and error). Checkbox and Switch (and Choice) gain `labelHidden`.
