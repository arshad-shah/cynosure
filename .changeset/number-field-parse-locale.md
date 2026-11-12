---
"@arshad-shah/cynosure": patch
---

NumberField reads back its own text in every locale: other digits (Arabic-Indic in `ar-EG`, Devanagari…), currency text with dots such as "1.234,50 kr.", unit text and accounting brackets. Edits there are no longer undone on blur.
