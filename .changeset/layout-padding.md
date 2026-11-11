---
"@arshad-shah/cynosure": minor
---

`Stack`, `Inline` and `Grid` take `padding`, `paddingInline` and `paddingBlock`: space tokens that pad the layout's own box, so a wrapper element is no longer needed for it. The specific prop wins over `padding`, and a nested layout never inherits its parent's padding. Layouts that do not use the new props are unchanged.
