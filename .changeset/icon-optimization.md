---
"@arshad-shah/cynosure": patch
---

Icons: path data is now stored as small as it draws identically. 136 Facet icons have shorter path data (544 characters in all) that renders to the same pixels; nothing looks different. New tooling keeps it that way: `cy new icon` optimizes new icons, and `pnpm icons:optimize` (checked by `pnpm verify`) rewrites an icon only when a browser renders it pixel-identically.
