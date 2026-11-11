---
"@arshad-shah/cynosure": minor
---

`SideNav` takes one primary action among its items: `{ kind: "action", id, label, icon, onClick }` (type `NavAction`). In `layout="bar"` it is a round accent button raised above the tab bar, placed where it sits in `items`; in the column it is a full-width accent button and in the rail an icon button. It is a button, never the current page, and does not call `onNavigate`. New tokens: `--cy-side-nav-action-size` and `--cy-side-nav-action-lift`.
