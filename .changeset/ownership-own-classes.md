---
"@arshad-shah/cynosure": patch
---

Each component styles only its own classes, with no change in look: Pagination, Calendar, CopyButton, QRCode, Dialog, Notice, SideNav, SortableList, Toast and FloatingToolbar place, mirror and colour the Buttons, IconButtons, Icons, Tooltips and Toolbars they render through those components' props and tokens and their own layout classes; Sheet draws its docked panel on its own classes (`.cy-sheet`, `.cy-sheet-panel`, `.cy-sheet-actions`) over the Dialog's frame. Announcer, CopyButton, Field, FileDrop, SideNav's collapsed rail, SortableList, Steps and Table hide text with the shared `.cy-visually-hidden`. SiteHeader's brand and navigation links are `Link`s, drawn as before by the span inside each.
