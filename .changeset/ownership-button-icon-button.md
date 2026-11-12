---
"@arshad-shah/cynosure": minor
---

`Button` takes `square` (as wide as it is tall, no padding, for one icon) and, with `href`, `id` and `linkRef` (the link element). `IconButton` is a `square` Button and takes `flipRtl` (the icon is mirrored in right-to-left text), `iconColor` and `wrapperClassName` (layout of the element around it). `Tooltip` takes `className` for its anchor and `Icon` takes `flipRtl`. IconButton no longer has a stylesheet: `dist/styles/iconbutton.css` is gone (its rules are now Button's `square`).
