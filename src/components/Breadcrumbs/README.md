# Breadcrumbs

The trail from the top of a site or app to the current page (WAI-ARIA APG breadcrumb): a `nav` landmark named "Breadcrumb" holding an ordered list. Items are data, so the current page, the separators and the collapsing are always right.

```tsx
import { Breadcrumbs } from "@arshad-shah/cynosure";

<Breadcrumbs
  items={[
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Cynosure" }, // the last item is the current page
  ]}
/>

<Breadcrumbs items={trail} maxItems={3} /> // first item, a "more" menu, the last two
```

| Prop                  | Default                                             | Notes                                                                                                     |
| --------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `items`               | required                                            | `{ label, href?, onClick?, icon? }[]`, from the top to the current page                                   |
| `maxItems`            | every item                                          | With more items: the first and the last `maxItems - 1` stay, the rest go into a menu. Under 2 counts as 2 |
| `separator`           | `chevronRight`                                      | Facet icon between crumbs; decorative, mirrored in right-to-left text                                     |
| `size`                | `md`                                                | `sm` · `md` (text size)                                                                                   |
| `labels`              | `{ nav: "Breadcrumb", more: "Show the full path" }` | Landmark name; name of the "more" button and its menu                                                     |
| `className` / `style` | –                                                   | Layout only                                                                                               |

The ref goes to the `nav` element.

## Items

- The **last item** is the current page: text with `aria-current="page"`, never pressable (its `href` and `onClick` are ignored).
- An earlier item with `href` is a [Link](../Link/README.md). With `onClick` too, the handler gets the click first: call `event.preventDefault()` to route on the client.
- An earlier item with only `onClick` is a ghost [Button](../Button/README.md).
- An earlier item with neither is plain text.
- `icon` is decorative and sits before the label.

## Behaviour and accessibility

- `nav` landmark named by `labels.nav`; an `ol` with one `li` per visible crumb (plus one for the "more" button when collapsed).
- Separators are `aria-hidden` icons, one between each pair of visible entries.
- Tab moves through the links and buttons in trail order; the current page is not a tab stop.
- `maxItems`: the hidden items are listed, in trail order, in a [Menu](../Menu/README.md) opened by an [IconButton](../IconButton/README.md) (Enter, click, tap or Arrow Down; Arrow Down moves on; Escape closes and returns focus to the button). Choosing an item is the same click as in the trail: the link is followed, or `onClick` is called. A hidden item with neither `href` nor `onClick` is listed as disabled.
- Long names are cut with an ellipsis at `--cy-breadcrumbs-item-max-width` (or the container's width when that is smaller) and the trail wraps onto more lines, so it never overflows its container.
- Touch: the "more" button's hit area is at least 44px on coarse pointers, and the menu rows are 44px tall.

## Tokens

- `--cy-breadcrumbs-gap`: space between crumbs and separators
- `--cy-breadcrumbs-item-max-width`: widest a crumb's label gets before the ellipsis (24ch)
- `--cy-breadcrumbs-separator-color`: colour of the separators (muted)

## Used by

The docs site (the path above every page), the tools app (category and tool pages), Verql (workspace, connection, table) and Planr (project and board paths).
