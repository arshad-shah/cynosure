# Button

```tsx
import { Button } from "@arshad-shah/cynosure";
import { download, trash } from "@arshad-shah/cynosure/icons";

<Button variant="solid" tone="accent" icon={download} onClick={save}>Export</Button>
<Button>Cancel</Button>                                       // outline · neutral (default)
<Button variant="soft" tone="danger" icon={trash}>Delete</Button>
<Button loading>Saving</Button>                               // LoadingDots, aria-busy, keeps width
```

| Prop                  | Default   | Notes                                                                                                                                                                   |
| --------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`             | `outline` | `solid` (filled, lit), `soft` (tinted), `outline`, `ghost`                                                                                                              |
| `tone`                | `neutral` | `accent`, `neutral`, `danger`, `success`, `warning`, `info`                                                                                                             |
| `color`               | –         | Any CSS colour, overriding `tone` (a brand button). Text on a solid fill is white or black, whichever reads; other variants darken or lighten it to read on the surface |
| `size`                | `md`      | `sm` 26, `md` 32, `lg` 40 px at comfortable scale                                                                                                                       |
| `icon` / `iconEnd`    | –         | Facet icons; inline-start / inline-end (RTL aware)                                                                                                                      |
| `loading`             | `false`   | Centred `LoadingDots`, `aria-busy`, ignores activation, keeps width                                                                                                     |
| `pressed`             | –         | Toggle button (`aria-pressed`)                                                                                                                                          |
| `type`                | `button`  | Never submits unless `type="submit"`                                                                                                                                    |
| `fullWidth`           | `false`   | Fills its container                                                                                                                                                     |
| `aria-current`        | –         | Marks the current item of a set (`"page"`, `"step"`…), button or link                                                                                                   |
| `className` / `style` | –         | Layout only                                                                                                                                                             |

Every variant × tone pair is distinct and keeps text at ≥ 4.5:1 (tested). Soft, outline and ghost text uses the tone's text role (`--cy-color-<tone>-text`).

**Tokens:** `--cy-button-{height-sm,height-md,height-lg,radius,padding-inline,gap,font-weight,max-width,solid-shadow,soft-mix,outline-mix,press-scale}`. Set them with `createTheme({ components: { button: { radius: "4px" } } })`.

**Accessibility and touch:** hit area ≥ 24px always and ≥ 44px on coarse pointers; Enter and Space activate; visible focus ring (also in forced-colors mode); long labels truncate with an ellipsis.

- `href` (with `target`): a real link styled as a button; only safe URLs are linked. A link takes `target`, `aria-label`, `aria-current`, `className`, `style`, `data-testid` and `onClick`; the other button attributes (`disabled`, `loading`, `pressed`, `type`, `confirm`, `keepFocus`) do not apply to it.
- `aria-current`: set on the element in both forms. A link to the page being shown takes `aria-current="page"` (as Pagination does with `getHref`), so a screen reader says "current page".
- `confirm`: ask before acting, in place. The first press shows this text ("Press again to delete"); a second press within 4 seconds acts; Escape, leaving or the timeout disarms it.
- `keepFocus`: a pointer press leaves focus where it was, for on-screen keypads beside a field.

## Used by

Every product (all action buttons).
