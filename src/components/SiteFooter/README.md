# SiteFooter

The bottom of a website: the brand and a tagline, columns of links under headings, and a bottom row for the copyright, legal links and social links. Columns sit side by side when wide and stack when narrow.

```tsx
import { IconButton, Link, SiteFooter } from "@arshad-shah/cynosure";
import { mail } from "@arshad-shah/cynosure/icons";

<SiteFooter
  brand="Acme"
  tagline="Tools for small teams, made with care."
  columns={[
    { title: "Product", links: [{ label: "Pricing", href: "/pricing" }] },
    { title: "Resources", links: [{ label: "Status", href: "https://status.acme.dev", external: true }] },
  ]}
  legal={
    <>
      © 2026 Acme. <Link href="/privacy">Privacy</Link>
    </>
  }
  social={
    <IconButton icon={mail} label="Email" href="mailto:hello@acme.dev" variant="ghost" tone="neutral" />
  }
/>;
```

| Prop                  | Default | Notes                                                             |
| --------------------- | ------- | ----------------------------------------------------------------- |
| `brand`               | –       | Logo or site name                                                 |
| `tagline`             | –       | A sentence under the brand, muted                                 |
| `columns`             | `[]`    | `{ title, links: { label, href, external? }[] }[]`                |
| `headingLevel`        | `2`     | `2` · `3` · `4`: level of the column titles                       |
| `legal`               | –       | Bottom row, start: copyright and legal links (small, muted text)  |
| `social`              | –       | Bottom row, end: usually IconButtons with `href`                  |
| `size`                | `lg`    | The Container `size`, to line up with the page                    |
| `labels`              | –       | `nav` ("Footer"): name of the links' navigation landmark          |
| `id`, `aria-label`    | –       | Set on the `footer`; name it when a page has more than one footer |
| `className` / `style` | –       | Layout only                                                       |

The ref goes to the `footer` element.

## Behaviour and accessibility

- **Landmarks:** a `footer` at the top level of the page is the contentinfo landmark. All the columns are in one `nav` named "Footer" (`labels.nav`), so the page gets one extra landmark, not one per column.
- **Headings:** each column title is a [Heading](../Heading/README.md) at `headingLevel` (2 by default, after the page's `h1`), and the column's list is named by it.
- **Links:** each link is a neutral [Link](../Link/README.md). `external` opens it in a new tab with an icon and "(opens in new tab)" read after it.
- **Order:** brand, then the columns in order, then legal and social. Tab follows the same order.
- **Narrow screens:** the columns wrap onto more rows when each would be narrower than `--cy-site-footer-column-min-width`, and the legal text and social links stack. Nothing overflows at 320px.
- **Touch:** each link row is at least 24px tall and each link's hit area at least 24px; on coarse pointers both are 44px, so neighbouring links never share a finger's target. Social IconButtons have their own 44px hit areas.

## Tokens

- `--cy-site-footer-background`: background (`--cy-color-surface`)
- `--cy-site-footer-border`: the hairline above the footer and above the bottom row (`--cy-color-line`)
- `--cy-site-footer-padding-block`: space above and below the content and between its rows (`--cy-space-10`)
- `--cy-site-footer-column-min-width`: least width of a link column before the columns wrap (10rem)
