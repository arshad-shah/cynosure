---
"@arshad-shah/cynosure": minor
---

`renderLink` on every component that renders a link: Button's link form (and so IconButton), Card links, ListRow links, Pagination (with `getHref`: pages, previous, next, first and last) and SiteHeader (the brand and the navigation, in the bar and in the narrow screens' menu). They share Link's contract, `LinkRenderProps`, now a general one (the class, any `data-*`, `id`, ARIA names and `aria-current`, `target` with a safe `rel`, the click handler, the style, an optional ref and the content; an unsafe `href` arrives as `undefined`), so one router renderer serves them all. SideNav's `NavLinkProps` fits it too. New type `RenderLink`. LinkRenderProps no longer lists Link's own `data-tone`, `data-size` and `data-underline` by name: they arrive as `data-*` attributes.
