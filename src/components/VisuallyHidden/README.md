# VisuallyHidden

Content for screen readers only. It is out of sight but stays in the accessibility tree, so it is read in place: a name for an icon-only control, a heading that sighted users do not need, or context after a short link. With `focusable`, it is shown while something inside it has keyboard focus.

```tsx
import { VisuallyHidden } from "@arshad-shah/cynosure";

<p>Total: 42 <VisuallyHidden>items in the basket</VisuallyHidden></p>

<section aria-labelledby="plans">
  <VisuallyHidden as="h2" id="plans">Plans and pricing</VisuallyHidden>
  …
</section>

<VisuallyHidden focusable as="div">
  <Link href="#comments">Jump to the comments</Link>
</VisuallyHidden>
```

| Prop        | Default  | Notes                                                          |
| ----------- | -------- | -------------------------------------------------------------- |
| `children`  | required | The content for screen readers                                 |
| `as`        | `span`   | `span` · `div` · `p` · `h1`–`h6`                               |
| `focusable` | `false`  | Shown, in the normal flow, while something inside it has focus |
| `id`        | –        | For `aria-labelledby`, `aria-describedby` and in-page links    |
| `className` | –        | Layout of a focusable one while it is shown                    |

The ref goes to the rendered element.

## Behaviour and accessibility

- **Hidden, not removed:** one clipped pixel (`clip-path: inset(50%)`), positioned out of the flow so the line around it does not grow. It is never `display: none`, `visibility: hidden` or `aria-hidden`, so screen readers read it and it can name a control.
- **One rule for the whole library:** it renders the shared `.cy-visually-hidden` class from `base.css`, the same rule that Link, Kbd, Calendar, Tabs and the live regions use. Loading `base.css` (or `styles.css`) is enough; its own `visually-hidden.css` only adds the focusable variant.
- **Focusable:** a link or button inside a plain VisuallyHidden can still take focus but stays invisible, which fails WCAG 2.4.7. Use `focusable` for anything a keyboard can reach. For a page's skip link, use [SkipLink](../SkipLink/README.md).
- **Positioning:** the hidden element is absolutely positioned, so it is placed against the nearest positioned ancestor. Inside a scrolling area, give that area `position: relative` so the pixel scrolls with it.
- **Touch:** nothing to press of its own. A focusable one keeps the hit areas of what it holds.

## Tokens

None. The hidden size is `--cy-border-width`, one pixel.
