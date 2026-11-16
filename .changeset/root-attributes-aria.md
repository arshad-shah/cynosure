---
"@arshad-shah/cynosure": minor
---

`RootAttributes` now types `role` and every `aria-*` attribute, so Text, Heading, Notice, EmptyState, Card, Badge, List, Stat, IconTile, Avatar, Kbd, DescriptionList and Table take them and pass them to their root element: status text can be a live region (`<Text role="status" aria-live="polite">`). A role or ARIA state the component sets itself still wins.
