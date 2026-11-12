---
"@arshad-shah/cynosure": minor
---

`SkipLink` is shown as an accent outline `Button` link, hidden by the shared `.cy-visually-hidden` until it has focus (still CSS only, so it works without JavaScript), and takes `contained` to show at the corner of the nearest positioned ancestor (AppShell sets it). The `--cy-skip-link-background` and `--cy-skip-link-color` tokens are deprecated and have no effect: restyle it through the `--cy-button-*` tokens.
