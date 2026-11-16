---
"@arshad-shah/cynosure": minor
---

Notice, EmptyState, Card, Badge and List pass `id` and any `data-*` attribute to their root element, and Notice, EmptyState and Badge now forward their `ref` to it (Card and List already did). List takes `aria-labelledby`, to be named by the heading above it instead of `label`. New types `RootAttributes` and `DataAttributes`.
