---
"@arshad-shah/cynosure": patch
---

Theming: `createTheme({ components })` overrides for components with multi-word names (`sideNav`, `timeField`, `segmentedControl`…) are now written as the custom properties their styles read (`--cy-side-nav-…`). Before, they were written with the camelCase name (`--cy-sideNav-…`) and had no effect.
