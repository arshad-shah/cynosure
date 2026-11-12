---
"@arshad-shah/cynosure": patch
---

TimeField submits its 24-hour value, not the text being typed: a form will not submit while the text is not an allowed time, and a form reset brings back `defaultValue`.
