---
"@arshad-shah/cynosure": patch
---

`HiddenValue` hides its input with the shared `.cy-visually-hidden` class from `styles/base.css`, so `styles/hidden-value.css` is gone; drop it from one-by-one stylesheet imports. Behaviour is unchanged.
