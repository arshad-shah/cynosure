---
"@arshad-shah/cynosure": patch
---

A product palette now reaches everything worked out from it. `createTheme({ palettes })` applies each palette's colours first and derives from them: `accentSoft` is mixed with the palette's own surface (it used Cynosure's), an accent given for one palette re-derives that palette's hover, active, soft, text and on-accent colours, and the high-contrast palettes (`prefers-contrast: more`, `contrast="more"`) start from the product's light and dark palettes instead of falling back to Cynosure's. Colours a patch sets explicitly still win.
