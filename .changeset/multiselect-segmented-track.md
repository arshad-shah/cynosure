---
'@arshad-shah/cynosure-react': patch
---

`MultiSelect` now uses the shared segmented track like the other inputs: the
chips sit in a raised value tile and the chevron in its own slot tile inside
the tinted track. Also fixes the dropdown list rendering with a large gap to
the left of each row — the `<ul role="listbox">` was inheriting the browser's
default list padding; the shared listbox style now resets it.
