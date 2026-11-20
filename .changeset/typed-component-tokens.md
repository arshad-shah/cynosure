---
"@arshad-shah/cynosure": patch
---

Text's `size3xl`, `size4xl` and `size5xl` theme tokens now reach the stylesheet: `createTheme({ components: { text: { size3xl } } })` wrote `--cy-text-size3xl`, while Text reads `--cy-text-size-3xl`. A number after a letter in a component token's name now starts a word, as in the global `--cy-font-size-3xl`. Toolbar (`gap`, `padding`), Accordion (`gap`) and Icon (`size`, `sizeSm`, `sizeMd`, `sizeLg`, `stroke`) tokens are typed, as are Checkbox `sizeSm` and `sizeLg` and Switch `heightSm` and `heightLg`; a unit test fails when a stylesheet reads a component token its type does not declare.
