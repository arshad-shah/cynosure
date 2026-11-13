---
"@arshad-shah/cynosure": minor
---

Tree, for schema explorers: items take `iconTone`/`iconColor`, `trailing`, a typed `data` payload, `actions` (buttons on hovered, focused or selected rows, in the Tab order after the focused row) and a `contextMenu` (one ContextMenu beside the tree), all reporting through `onCommand`; `kind: "group"` heading rows that count their children and are never selected; `filter` (a string or a function returning match positions) shows matches with their ancestors and marks them; `loadingIds`, `errorIds`, `onRetry`, `renderError` and `renderEmpty` for loading driven by a store; and a `handle` whose `reload(id)` runs `loadChildren` again.
