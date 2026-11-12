---
"@arshad-shah/cynosure": minor
---

`Calendar` gains `markDay`, which marks a day without drawing it: a `tone` tints the cell, `dots` puts up to three coloured dots under the number, and `label` is added to the day's accessible name. The day state passed to `renderDay` and `markDay` has a `weekend` flag that follows the locale. With `renderDay`, a day's height is its own token, `--cy-calendar-content-size`, and defaults to 66px on touch screens (it was 110px), so a six-week month fits a phone while every day stays a 44px target.
