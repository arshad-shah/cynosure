---
"@arshad-shah/cynosure": patch
---

`themeInitScript` marks the root `data-cy-mode="system"` when nothing valid is saved (or storage is blocked), so a dark-OS visitor sees dark from the first paint instead of light until `CynosureTheme` mounts. A `data-cy-mode` the page already set is kept.
