---
"@arshad-shah/cynosure": minor
---

Text, Heading, Stat, IconTile, Avatar, Kbd and DescriptionList pass `id` and any `data-*` attribute to their root element (`RootAttributes`), and Kbd and DescriptionList now forward their `ref` to it (the others already did). Table forwards its `ref` to its root (the bordered wrapper) in both forms; its type is `TableComponent`.
