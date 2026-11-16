---
"@arshad-shah/cynosure": minor
---

Stack, Inline, Grid, Section and Toolbar take `inert` and `disabled`, to block a region as a whole while a job runs: nothing inside can be focused, clicked or typed into and assistive technology skips it (the HTML `inert` attribute, set as a property so React 18 honours it too); `disabled` also dims it as a disabled Button is.
