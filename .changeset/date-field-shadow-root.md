---
"@arshad-shah/cynosure": patch
---

DateField's calendar now opens on the chosen day inside a shadow root too; it used to find the calendar by id in the document, which missed it there.
