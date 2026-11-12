---
"@arshad-shah/cynosure": patch
---

`DeviceFrame` fixes from a product page. On a dark page the phone and tablet bezel no longer disappears: it is a dark grey lifted off the page with a lighter rim (3:1 against the page), and still the ink on a light page. Live content on a phone now starts clear of the camera island (below it upright, beside it turned) instead of running under it; a screenshot, video or canvas still fills the screen. The new `safeArea` prop decides for any content.
