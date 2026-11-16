---
"@arshad-shah/cynosure": minor
---

CommandPalette: `onQueryChange` reports the query so commands can be built from it ("Go to line 42"); recently run commands can be kept between visits with `recentKey` (localStorage, or any sync or async `recentStorage`) or held by the app with `recent` / `onRecentChange`; a disabled command's `disabledReason` is shown in its row, is the option's description, is reachable with the arrows and is announced when it is chosen (`labels.unavailable`).
