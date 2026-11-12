---
"@arshad-shah/cynosure": patch
---

`Avatar` and `Image` show their picture in server-rendered HTML that is never hydrated (an Astro page without a client directive). Before any script runs the picture shows as the browser has it; on mount an unfinished picture switches to the fallback or placeholder before the first paint, as before. `Image`'s `data-state` has a new first value, `pending`.
