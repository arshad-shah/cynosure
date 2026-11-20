---
"@arshad-shah/cynosure": patch
---

Dialog and Popover open with focus on the first control Tab reaches, as their Tab trap already counts it: a radio group's checked radio, never an unchecked one or a roving item that is not the group's stop. Tabs read their reveal padding, and DocumentViewport its gap, in any CSS length, as Popover's offset already was.
