---
"@arshad-shah/cynosure": minor
---

Link and Breadcrumbs: `renderLink` renders the anchor with your router's link component, as SideNav's does. Link hands it its class and data attributes (its look), `aria-current`, the click handler, the ref and the content (an `href` with a scheme that is not allowed arrives as `undefined`; `external` arrives as `target` and a safe `rel`). Breadcrumbs passes it to each crumb's Link, so router crumbs keep their look, and a crumb chosen from the menu of hidden items routes through the same element. New type `LinkRenderProps`.
