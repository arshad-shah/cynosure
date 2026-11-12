---
"@arshad-shah/cynosure": minor
---

New `VisuallyHidden`: content for screen readers only (`as` `span`, `div`, `p` or a heading), with a `focusable` variant that is shown while something inside it has focus. The shared `.cy-visually-hidden` rule it uses moved from `link.css` to `base.css`, so it no longer depends on loading Link's stylesheet.
