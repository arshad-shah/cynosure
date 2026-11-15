---
"@arshad-shah/cynosure": minor
---

RadioGroup: `variant="card"` shows the options as picture cards in a grid (option `media` above the label), for choosing by picture: a signature style, a theme, a layout. `columns` sets cards per row (default 2) and a narrow container wraps to fewer, never below `--cy-radio-group-card-min-width` (8rem). The native radios stay, visually hidden, so forms, reset, `required`, Tab and Left/Right are native; Up and Down move a row. The chosen card has an accent border and soft background. Choice gains `variant="card"` and `media`, with tokens `--cy-choice-card-padding`, `--cy-choice-card-radius`, `--cy-choice-card-checked-background`, `--cy-choice-media-min-height` and `--cy-choice-media-background`.
