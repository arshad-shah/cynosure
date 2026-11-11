---
"@arshad-shah/cynosure": minor
---

Button and IconButton now set `aria-current` on the element in both forms, so a link-form button (`href`) can say it is the current page; a link-form button also takes `style` now. Pagination with `getHref` renders the current page as a link with `aria-current="page"` instead of a button. Pagination's `onChange` gets the click event as a second argument, `(page, event)`, so a client-side router can call `event.preventDefault()` on a link press and navigate itself.
