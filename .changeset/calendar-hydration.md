---
"@arshad-shah/cynosure": patch
---

Calendar no longer risks a hydration mismatch: the device's date, language and weekend settle in the browser before the first paint, and a server draws no day as today and uses `locale` (or English) and Monday-first weeks until then.
