# Stack

Vertical layout with token gaps (`gap="1"` … `"10"` map to `--cy-space-*`), alignment and an `as` prop for neutral elements (`div`, `section`, `ul`, `ol`, `nav`, `aside`, `header`, `footer`, `span`).

```tsx
<Stack gap="4" align="center">
  …
</Stack>;
<Stack padding="6" paddingBlock="8">
  …
</Stack>; // 16px at the sides, 24px above and below
```

| Prop                             | Default | Notes                                                                    |
| -------------------------------- | ------- | ------------------------------------------------------------------------ |
| `gap`                            | `4`     | Space token between children                                             |
| `padding`                        | –       | Space token of padding on all four sides                                 |
| `paddingInline` / `paddingBlock` | –       | Space token for the sides / the top and bottom; each wins over `padding` |
| `align` / `justify`              | –       | Cross / main axis                                                        |
| `as`                             | `div`   | Neutral element only                                                     |
- Padding is a space token (`--cy-space-*`) applied with logical properties, inside the stack's width. `"0"` is a value: `padding="4" paddingInline="0"` pads the top and bottom only.
- A nested Stack or Inline has no padding unless it asks for it; it never inherits its parent's.
- `space.ts` in this folder holds the `Space` type and the padding props and logic shared with Inline, Grid and Container.

## Used by

Every product layout (toolbars, forms, settings panels, cards).
