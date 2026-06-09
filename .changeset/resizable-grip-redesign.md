---
'@arshad-shah/cynosure-react': minor
---

Redesign the `Resizable` handle. The dotted grip icon is replaced by a thick,
rounded line centered on the divider — neutral at rest, firming up on hover,
and growing while it turns the accent colour as you drag (the divider line
turns accent too). The divider also gains an enlarged invisible grab zone
(a few px either side) so it's easy to grab anywhere along the border. Works
for both `horizontal` and `vertical` splits and respects
`prefers-reduced-motion`. `withHandle` now shows this line (no Lucide icon);
pass `children` to render a custom grip.
