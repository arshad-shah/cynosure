# Inline

Horizontal layout with token gaps (`gap="0"` … `"10"` map to `--cy-space-*`), alignment and an `as` prop for neutral elements (`div`, `section`, `ul`, `ol`, `nav`, `aside`, `header`, `footer`, `span`).

```tsx
<Inline gap="4" align="center">
  …
</Inline>;
<Inline padding="4" paddingInline="6">
  …
</Inline>; // 8px above and below, 16px at the sides
```

| Prop                                                                        | Default    | Notes                                                                                                                                                |
| --------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gap`                                                                       | `3`        | Space token between children                                                                                                                         |
| `padding`                                                                   | –          | Space token of padding on all four sides                                                                                                             |
| `paddingInline` / `paddingBlock`                                            | –          | Space token for the sides / the top and bottom; each wins over `padding`                                                                             |
| `align` / `justify`                                                         | –          | Cross / main axis                                                                                                                                    |
| `wrap`                                                                      | `false`    | Wrap onto new lines                                                                                                                                  |
| `separator`                                                                 | –          | `dot` · `line`: a mark between the children, for a meta line ("PDF · 3 pages · 1.2 MB"); each child becomes one item (`li` with `as="ul"`/`"ol"`)    |
| `grow` / `shrink`                                                           | – / `true` | Take the free space along a flex parent's row or column / `false` keeps the box at its size when room runs out                                       |
| `fill`                                                                      | –          | 100% of the parent's width and height                                                                                                                |
| `minSize`                                                                   | –          | `"0"` lets the box be smaller than its content, so a child scrolls instead of overflowing                                                            |
| `overflow`                                                                  | –          | `hidden` · `auto` · `visible`                                                                                                                        |
| `inert` / `disabled`                                                        | `false`    | Block the region: nothing inside can be focused or clicked and assistive technology skips it (HTML `inert`); `disabled` also dims it                 |
| `hideBelow` / `hideAbove`                                                   | –          | Hidden while the window is narrower than / at least this breakpoint (`sm` 30rem, `md` 45rem, `lg` 60rem, `xl` 75rem). No script                      |
| `id`, `role`, `aria-*`, `data-*`, `tabIndex`, `dir`, `lang`, event handlers | –          | Passed to the element, as is `ref`: a link target, a named landmark or group, a drop zone's or canvas column's handlers, `data-*` for tests or state |
| `as`                                                                        | `div`      | Neutral element only                                                                                                                                 |
- Padding is a space token (`--cy-space-*`) applied with logical properties, inside the row's width. `"0"` is a value: `padding="4" paddingBlock="0"` pads the sides only.
- A nested Inline or Stack has no padding unless it asks for it; it never inherits its parent's.
- Inline is a Stack with `direction="row"`: Stack's stylesheet lays it out, and `inline.css` adds the centring (when `align` is not set) and `wrap`.
- **Meta lines:** `separator="dot"` (or `"line"`, a thin upright rule) draws a mark in the gap before every child but the first. Each child, text included, is wrapped in one item (a `li` when `as` is `ul` or `ol`); `null`, `false` and empty children are left out, so a missing value leaves no stray mark. The mark is a box drawn by CSS, not a character, so nothing extra is read out; it takes `CanvasText` in forced colours. Wrapped onto a new line, the line starts with a mark. For terms with their values ("Size 1.2 MB"), use DescriptionList's `layout="inline"`.
- The padding props and logic are shared with Stack and Grid (`src/foundations/layout.ts`).

## Tokens

- `--cy-inline-separator-color`: Colour of the separators between items (`separator`). Default `--cy-color-muted`.
- `--cy-inline-separator-size`: Diameter of a dot separator; a line separator is the border width wide and this tall times four. Default 0.25em.
