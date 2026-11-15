---
"@arshad-shah/cynosure": minor
---

ProgressBar: `meter` makes it a measurement (`role="meter"`, never indeterminate; a missing value reads 0) for password strength, entropy or a quota. `valueText` gives the value in words, shown with `showValue` and read out instead of the percentage. `steps` draws the track as separate pills lit up to round(value / max times steps), for a stepped gauge or "step 2 of 5"; new token `--cy-progress-bar-step-gap`.
