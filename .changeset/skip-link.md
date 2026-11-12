---
"@arshad-shah/cynosure": minor
---

New `SkipLink`: "Skip to content", hidden until focused and then shown at the window's top-start corner. It is a plain link that works without JavaScript; with it, focus moves to the target (given `tabindex="-1"` when it needs one) without changing the URL, also inside shadow roots. `AppShell` and `SiteHeader` now both use it, so the library has one skip link.
