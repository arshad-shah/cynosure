# SkipLink

"Skip to content": the first stop of a page's Tab order, so keyboard users can jump past the header and the navigation. It is hidden until it has focus, then shown fixed at the top-start corner of the window, above everything else, as an accent outline `Button`. It is a real link, so it works before and without JavaScript; with it, focus also moves to the target.

```tsx
import { SkipLink } from "@arshad-shah/cynosure";

<SkipLink />                       // goes to #main
<main id="main">…</main>

<SkipLink href="#article" labels={{ skip: "Skip to the article" }} />
```

[SiteHeader](../SiteHeader/README.md) and [AppShell](../AppShell/README.md) render one for you.

| Prop                  | Default                       | Notes                                                                               |
| --------------------- | ----------------------------- | ----------------------------------------------------------------------------------- |
| `href`                | `#main`                       | `#` and the id of the main content                                                  |
| `labels`              | `{ skip: "Skip to content" }` | The link text                                                                       |
| `id`                  | –                             | Set on the link                                                                     |
| `contained`           | `false`                       | At the corner of the nearest positioned ancestor (AppShell) instead of the window's |
| `className` / `style` | –                             | Layout only (e.g. AppShell places it inside the shell)                              |

The ref goes to the `a` element.

## Behaviour and accessibility

- **Order:** render it first in the page, before the header, so the first Tab reaches it.
- **Hidden until focused:** one clipped pixel (the shared `.cy-visually-hidden`) while it does not have focus; CSS shows it on focus, with or without script. It is in the accessibility tree all the time, so screen-reader users find it in the list of links too.
- **Without JavaScript:** the server markup is a plain `<a href="#main">`, which the browser follows to the target.
- **With JavaScript:** a click or Enter moves focus to the target. A target that cannot take focus (`main`, `div`) gets `tabindex="-1"`, so it can be focused from script without joining the Tab order; a target that already has a `tabindex`, or a link or button, is left as it is. The next Tab continues from the target. The URL is not changed, so a client-side router is not disturbed. With no element of that id, the browser follows the link as usual.
- **Shadow roots:** the target is looked up in the link's own shadow root first, where a hash link cannot reach, then in the document.
- **Right to left:** top-start is the top-right corner.
- **Sticky headers:** focus scrolls the target into view at the top of the window. Under a sticky header, give the target `scroll-margin-top` the height of the header.
- **Touch:** the shown link is at least 24px tall, 44px on coarse pointers.

## Tokens

- `--cy-skip-link-offset`: distance from the top and inline-start edges of the window (`--cy-space-4`)
- `--cy-skip-link-radius`: corner radius (`--cy-radius-md`)
