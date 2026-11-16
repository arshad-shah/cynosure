---
"@arshad-shah/cynosure": minor
---

TextArea: `onFiles` takes files dropped on the field, filtered by `accept`; while files are over it the field shows the accent border and fill, and the drop leaves the text alone so the caller can read a text file (`await file.text()`) and set the value. Dragged text still drops natively. `acceptsFile` now lives in a shared foundation, still exported.
