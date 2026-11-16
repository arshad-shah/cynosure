---
"@arshad-shah/cynosure": minor
---

Checkbox: `variant="card"` with `media` draws a bordered card with a picture above the label, for a grid of pictures to tick (the pages of a PDF). The whole card, picture included, toggles the box, which stays drawn over the picture's top end corner; a ticked card takes the accent border and soft background. `onChange(checked, event)` is unchanged, so a Shift+click on a picture still reads `event.nativeEvent.shiftKey`.
