# SiteHeader

The top bar of a website that scrolls as a document (a marketing or documentation site built with Astro or React): a skip link, the brand, the site navigation and actions such as a theme toggle. It sticks to the top of the window by default. On narrow screens the navigation moves into a menu sheet opened from a button. For an app frame with a side navigation and its own scrolling area, use [AppShell](../AppShell/README.md).

```tsx
import { Button, SiteHeader, ThemeToggle } from "@arshad-shah/cynosure";

<SiteHeader
  brand={<img src="/logo.svg" alt="Acme" height={24} />}
  nav={[
    { label: "Docs", href: "/docs", current: true },
    { label: "Blog", href: "/blog" },
    { label: "Pricing", href: "/pricing" },
  ]}
  actions={
    <>
      <ThemeToggle />
      <Button href="/sign-in">Sign in</Button>
    </>
  }
/>
<main id="main">…</main>
```

| Prop                  | Default   | Notes                                                                                                    |
| --------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| `brand`               | –         | Logo or site name at the inline start                                                                    |
| `brandHref`           | `/`       | Where the brand links; `false` for no link                                                               |
| `nav`                 | `[]`      | `{ label, href, current? }[]`; `current` sets `aria-current="page"`                                      |
| `actions`             | –         | Controls at the inline end; they stay in the bar at every width                                          |
| `sticky`              | `true`    | Stays at the top of the window, over a blurred view of the page                                          |
| `skipLink`            | `true`    | Renders a [SkipLink](../SkipLink/README.md) before the header                                            |
| `skipTo`              | `#main`   | The skip link's target                                                                                   |
| `collapseBelow`       | `md`      | Header width below which the navigation moves into the menu: `sm` 40rem · `md` 48rem · `lg` 64rem        |
| `size`                | `lg`      | The bar's Container `size`, to line up with the page                                                     |
| `labels`              | see below | `nav` ("Main"), `openMenu` ("Open menu"), `menu` ("Menu", the sheet's title), `skip` ("Skip to content") |
| `id`                  | –         | Set on the `header`                                                                                      |
| `className` / `style` | –         | Layout only                                                                                              |

The ref goes to the `header` element.

## Behaviour and accessibility

- **Landmarks:** a `header` at the top level of the page is the banner landmark. The links are in a `nav` named by `labels.nav`, as a list. Put the page content in `<main id="main">`.
- **Current page:** the item with `current` is marked `aria-current="page"` in the bar and in the menu, and highlighted.
- **Tab order:** skip link, brand, navigation links, actions, then the page. The skip link comes before the `header` element, not inside it, so a sticky header's blur cannot change where it shows.
- **Narrow screens:** below `collapseBelow` the links leave the bar (and the accessibility tree) and a menu [IconButton](../IconButton/README.md) takes their place, with `aria-expanded`. It opens an end-side [Sheet](../Sheet/README.md) titled `labels.menu` holding the same links in a [SideNav](../SideNav/README.md). Escape, the close button or the backdrop closes it and focus returns to the menu button; choosing a link closes it and the browser follows the link.
- **No script needed for the layout:** the switch is a container query on the header's own width, so the right layout shows on the first paint of a server-rendered page, and inside narrow frames. The menu button needs JavaScript to open the sheet.
- **Sticky:** `position: sticky` at the top, under menus, dialogs and tooltips. The background is mixed with some transparency and the page behind is blurred. Give in-page targets a `scroll-margin-top` the height of the header so they are not scrolled under it.
- **Right to left:** the brand starts at the right and the actions end at the left.
- **Touch:** the brand, the links and the menu button have hit areas of at least 24px, 44px on coarse pointers; the links in the menu are 44px tall.

## Tokens

- `--cy-site-header-height`: least height of the bar (`--cy-control-height-lg` plus twice `--cy-space-5`)
- `--cy-site-header-background`: background of the bar (`--cy-color-bg`)
- `--cy-site-header-border`: the hairline under the bar (`--cy-color-line`)
- `--cy-site-header-blur`: blur behind a sticky bar (12px)
- `--cy-site-header-link-color`: navigation links (`--cy-color-muted`)
- `--cy-site-header-link-current-color`: the current and hovered link (`--cy-color-ink`)
- `--cy-site-header-link-highlight`: background of the current and hovered link (`--cy-color-soft`)
