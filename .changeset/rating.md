---
"@arshad-shah/cynosure": minor
---

New component: Rating. Read-only, it draws any value exactly (4.3 fills 30% of the fifth star, measured across the star's shape) and reads as one image ("Rated 4.3 out of 5"). Interactive, it is a slider (arrows by `step`, Page Up/Down by a star, Home and End), with a precise hover preview (the star under the pointer, stepped across its shape; past the last star it stops at `max`) and press or tap to set. `step` (1 or 0.5), `max`, `size`, `color`, `showValue`, `disabled`, `name` (form value), `labels`; tokens `--cy-rating-gap`, `--cy-rating-filled`, `--cy-rating-empty`. Right-to-left and forced colours supported; the row is at least 44px tall on touch screens.
