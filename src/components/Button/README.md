# Button

```tsx
import { Button } from "@arshad-shah/cynosure";
import { download } from "@arshad-shah/cynosure/icons";

<Button variant="primary" icon={download} onClick={save}>
  Export
</Button>;
```

| Prop               | Default     | Notes                                                                        |
| ------------------ | ----------- | ---------------------------------------------------------------------------- |
| `variant`          | `secondary` | `primary` (accent, lit, star spins on hover), `secondary`, `ghost`, `danger` |
| `size`             | `md`        | `sm` 26, `md` 32, `lg` 40 px at comfortable scale                            |
| `icon` / `iconEnd` | –           | Facet icons; inline-start / inline-end (RTL aware)                           |
| `loading`          | `false`     | Spinner, `aria-busy`, ignores activation, keeps width                        |
| `pressed`          | –           | Toggle button (`aria-pressed`)                                               |
| `type`             | `button`    | Never submits unless `type="submit"`                                         |
| `fullWidth`        | `false`     | Fills its container                                                          |

**Tokens:** `--cy-button-{height-sm,height-md,height-lg,radius,padding-inline,gap,font-weight,max-width,primary-bg,primary-ink,primary-hover,primary-shadow,secondary-bg,secondary-ink,secondary-border,hover-bg,press-scale,star-rotate,star-scale}`. Set them with `createTheme({ components: { button: { radius: "4px" } } })`.

**Accessibility and touch:** hit area ≥ 24px always and ≥ 44px on coarse pointers; Enter and Space activate; visible focus ring; long labels truncate with an ellipsis.

## Used by

Every product (all action buttons).
