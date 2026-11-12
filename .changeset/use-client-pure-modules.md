---
"@arshad-shah/cynosure": patch
---

`"use client"` now marks only modules that run React, so `themeInitScript()`, `qrToSvg()` and the zoom and layout helpers can be called from React Server Components.
