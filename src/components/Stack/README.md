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

| Prop                             | Default    | Notes                                                                                                                           |
| -------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `gap`                            | `4`        | Space token between children                                                                                                    |
| `padding`                        | –          | Space token of padding on all four sides                                                                                        |
| `paddingInline` / `paddingBlock` | –          | Space token for the sides / the top and bottom; each wins over `padding`                                                        |
| `direction`                      | `column`   | `column` or `row`. For a row that centres and wraps, use Inline (a Stack in a row)                                              |
| `align` / `justify`              | –          | Cross / main axis; `align` also takes `baseline`                                                                                |
| `sticky` / `stickyOffset`        | – / `0`    | Stays in view while the page scrolls (`position: sticky`); the offset is any CSS length, e.g. a header's height                 |
| `grow` / `shrink`                | – / `true` | Take the free space along a flex parent's row or column / `false` keeps the box at its size when room runs out                  |
| `fill`                           | –          | 100% of the parent's width and height                                                                                           |
| `minSize`                        | –          | `"0"` lets the box be smaller than its content, so a child scrolls instead of overflowing                                       |
| `overflow`                       | –          | `hidden` · `auto` · `visible`                                                                                                   |
| `hideBelow` / `hideAbove`        | –          | Hidden while the window is narrower than / at least this breakpoint (`sm` 30rem, `md` 45rem, `lg` 60rem, `xl` 75rem). No script |
| `id`, `role`, `aria-*`           | –          | Passed to the element: a link target, a named landmark or group                                                                 |
| `as`                             | `div`      | Neutral element only                                                                                                            |
- Padding is a space token (`--cy-space-*`) applied with logical properties, inside the stack's width. `"0"` is a value: `padding="4" paddingInline="0"` pads the top and bottom only.
- A nested Stack or Inline has no padding unless it asks for it; it never inherits its parent's.
- `grow`, `shrink`, `fill`, `minSize` and `overflow` (`BoxProps` in `space.ts`, shared with Inline and Grid) become `data-cy-*` attributes styled in `src/styles/base.css`. For a keyboard-scrollable area use ScrollArea.
- Inline renders a Stack with `direction="row"` and adds its own rules (centring, `wrap`) in `inline.css`.
- `space.ts` in this folder holds the `Space` type and the padding props and logic shared with Inline, Grid and Container.
