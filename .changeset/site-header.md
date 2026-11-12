---
"@arshad-shah/cynosure": minor
---

New `SiteHeader`: the top bar of a website that scrolls as a document, where `AppShell` (an app frame) does not fit. It has a brand linked home, the site navigation as data (`{ label, href, current? }`, the current one marked `aria-current="page"`), an `actions` slot, a SkipLink before it, and it sticks to the top over a blurred view of the page (`sticky`, default true). Below `collapseBelow` (the header's own width, CSS only) the links move into a menu Sheet opened from a button; Escape closes it and focus returns to the button.
