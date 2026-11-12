# Pagination

Moves between the pages of a list or table. A `nav` landmark named "Pagination" with previous and next controls and numbered pages; the current page carries `aria-current="page"`. Every control is a `Button` or `IconButton`.

```tsx
import { Pagination, pageCount } from "@arshad-shah/cynosure";

<Pagination count={pageCount(members.length, 25)} page={page} onChange={setPage} />
<Pagination count={10} defaultPage={3} showEdges />
<Pagination count={10} variant="compact" />                    // "Page 3 of 10" between previous and next
<Pagination count={10} page={page} getHref={(p) => `?page=${p}`} />  // real links
```

| Prop                          | Default | Notes                                                                                         |
| ----------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| `count`                       | –       | Required. How many pages. One page or fewer renders nothing                                   |
| `page` / `defaultPage`        | – / `1` | The current page, from 1. Controlled or uncontrolled. Values out of range are clamped         |
| `onChange`                    | –       | `(page, event) => void`, on every press that changes the page. `event` is the click           |
| `siblings`                    | `1`     | Pages shown each side of the current one                                                      |
| `boundaries`                  | `1`     | Pages always shown at each end                                                                |
| `variant`                     | `pages` | `pages` numbered · `compact` previous and next around "Page 3 of 10"                          |
| `showEdges`                   | `false` | First-page and last-page controls                                                             |
| `getHref`                     | –       | `(page) => string`. Page numbers, previous and next become real links; `onChange` still fires |
| `disabled`                    | `false` | Disables every control                                                                        |
| `size`                        | `md`    | `sm` · `md` (Button heights)                                                                  |
| `labels`                      | –       | `nav`, `previous`, `next`, `first`, `last`, `page(n)`, `status(page, count)`                  |
| `className` / `style` / `ref` | –       | On the `nav`. Layout only                                                                     |

Helpers, exported beside the component:

- `pageCount(total, pageSize)`: the number of pages for a number of items, never less than 1.
- `pageRange(page, count, siblings = 1, boundaries = 1)`: the pages shown, in order, with `"gap"` where pages are left out. `pageRange(5, 10)` is `[1, "gap", 4, 5, 6, "gap", 10]`. The list has the same length on every page, so the controls do not move under the pointer, and a gap never stands for a single page.

## Behaviour and accessibility

- **Names:** a page number is named "Page 3". The current one is the same control with `aria-current="page"`, so a screen reader says "Page 3, current page" once. Do not add "current" to `labels.page`.
- **Ends:** previous (and first) are disabled on page 1, next (and last) on the last page. They are disabled Buttons, so they leave the Tab order.
- **Ellipses** are an icon in a list item hidden from assistive technology, and cannot be focused. There is no ARIA pattern for pagination; an unnamed list item would only add noise, and the page names on each side ("Page 6", "Page 10") already say what is left out.
- **Keyboard:** Tab moves between the controls; Enter and Space press them. There are no arrow keys.
- **Focus:** the pressed control keeps focus when the numbers move along (a link that becomes the current page stays a link and keeps focus). When it can no longer hold focus (previous on reaching page 1), focus goes to the current page, or in the compact variant to the control that still works.
- **Compact:** the "Page 3 of 10" text is a polite live region (`role="status"`), so a change of page is announced.
- **Links:** with `getHref` every page number is a link, and the current page is a link to its own address with `aria-current="page"`. Only the disabled ends (previous on page 1, next on the last page) are buttons, because they lead nowhere. A click with Ctrl, Cmd, Shift or Alt is left to the browser (new tab or window) and does not call `onChange`.
- **Client-side routers:** `onChange` gets the click event as its second argument. Call `event.preventDefault()` to stop the browser following the link, then navigate yourself. The page is still reported, and the links keep working without JavaScript and in a new tab:

  ```tsx
  <Pagination
    count={pages}
    page={page}
    getHref={(p) => `/members?page=${p}`}
    onChange={(p, event) => {
      event.preventDefault();
      router.push(`/members?page=${p}`);
    }}
  />
  ```
- **Narrow spaces:** the row wraps instead of overflowing. Use `variant="compact"` on phones.
- **Touch:** each control has a 44px hit area on coarse pointers, and the space between controls grows so the hit areas do not overlap. The visible size does not change.
- **Right to left:** the order follows the reading direction and the chevrons are mirrored.
- **Forced colours:** the current page has a border in the system's selection colour.

## Tokens

- `--cy-pagination-gap`: space between the controls
- `--cy-pagination-page-padding`: inline padding of a page number (its width is never less than its height)
- `--cy-pagination-muted-color`: colour of the ellipsis and of the "Page 3 of 10" text

Heights, radius and colours of the controls are Button's tokens (`--cy-button-*`).
