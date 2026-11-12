# Inline

Horizontal layout with token gaps (`gap="1"` … `"10"` map to `--cy-space-*`), alignment and an `as` prop for neutral elements (`div`, `section`, `ul`, `ol`, `nav`, `aside`, `header`, `footer`, `span`).

```tsx
<Inline gap="4" align="center">
  …
</Inline>;
<Inline padding="4" paddingInline="6">
  …
</Inline>; // 8px above and below, 16px at the sides
```

| Prop                             | Default | Notes                                                                                                                           |
| -------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `gap`                            | `3`     | Space token between children                                                                                                    |
| `padding`                        | –       | Space token of padding on all four sides                                                                                        |
| `paddingInline` / `paddingBlock` | –       | Space token for the sides / the top and bottom; each wins over `padding`                                                        |
| `align` / `justify`              | –       | Cross / main axis                                                                                                               |
| `wrap`                           | `false` | Wrap onto new lines                                                                                                             |
| `hideBelow` / `hideAbove`        | –       | Hidden while the window is narrower than / at least this breakpoint (`sm` 30rem, `md` 45rem, `lg` 60rem, `xl` 75rem). No script |
| `id`, `role`, `aria-*`           | –       | Passed to the element: a link target, a named landmark or group                                                                 |
| `as`                             | `div`   | Neutral element only                                                                                                            |
- Padding is a space token (`--cy-space-*`) applied with logical properties, inside the row's width. `"0"` is a value: `padding="4" paddingBlock="0"` pads the sides only.
- A nested Inline or Stack has no padding unless it asks for it; it never inherits its parent's.
- The padding props and logic are shared with Stack and Grid (`../Stack/space.ts`).
