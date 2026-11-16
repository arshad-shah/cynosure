---
"@arshad-shah/cynosure": minor
---

AppShell: `brand` heads the navigation column beside the top bar (and starts the bar when narrow); `navToggle` adds a bar button (`labels.collapseNav` / `expandNav`) that collapses the column to SideNav's icon rail, controlled with `navCollapsed` / `defaultNavCollapsed` / `onNavCollapsedChange` and remembered with `navCollapsedKey` (localStorage, or any sync or async `navCollapsedStorage`). A SideNav in the column follows the rail unless given `collapsed`; `useAppShell()` gains `navCollapsed`.
