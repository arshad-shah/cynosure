---
"@arshad-shah/cynosure": patch
---

TextField, TextArea, NumberField (and the fields built on TextField) keep a caller's `aria-describedby` instead of overwriting it: your ids are read first, then the field's own description and error. Field takes the ids as `describedBy`, and `useField` as the `describedBy` option.
