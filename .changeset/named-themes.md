---
"@arshad-shah/cynosure": minor
---

Named themes: `createTheme({ mode })` fixes a theme to light or dark so the colour-mode switch does not flip it, and `defineTheme` and `createThemeRegistry` check plain-JSON theme definitions (plugin themes) at runtime, rejecting bad input or unreadable text with `CynosureThemeError`. `useCynosureTheme()` returns the theme, palette and resolved colours where it is called, for canvas and chart code.
