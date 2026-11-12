# Grid

Two-dimensional layout: a fixed number of equal columns, or as many columns as fit at a minimum width (card galleries, dashboards, settings tiles). Gaps are space tokens, and `GridItem` spans columns or rows.

```tsx
import { Grid, GridItem } from "@arshad-shah/cynosure";

<Grid columns={3} gap="6">…</Grid>
<Grid minItemWidth="16rem" columns={4}>…</Grid>   // as many as fit, at most 4
<Grid columns={{ base: 1, sm: 2, lg: 4 }}>…</Grid> // a count per width of the grid itself
<Grid columns={2} padding="6">…</Grid>            // 16px of padding around the grid
<Grid as="ul" minItemWidth="12rem">
  <GridItem as="li" span={2}>…</GridItem>
</Grid>;
```

| Prop                             | Default | Notes                                                                                                                                                                                                      |
| -------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `columns`                        | `1`     | Equal columns: a number, or one per breakpoint (`{ base, sm, md, lg, xl }`). With `minItemWidth`, the most columns there can be. A string is a track list for unequal columns (`"2fr 1fr"`, `"16rem 1fr"`) |
| `minItemWidth`                   | –       | Any CSS length: columns at least this wide, as many as fit, never wider than grid                                                                                                                          |
| `gap`                            | `4`     | Space token between items                                                                                                                                                                                  |
| `rowGap`                         | `gap`   | Space token between rows                                                                                                                                                                                   |
| `padding`                        | –       | Space token of padding on all four sides                                                                                                                                                                   |
| `paddingInline` / `paddingBlock` | –       | Space token for the sides / the top and bottom; each wins over `padding`                                                                                                                                   |
| `align`                          | –       | `start` · `center` · `end` · `stretch` (block axis; items stretch by default)                                                                                                                              |
| `as`                             | `div`   | Neutral element only; use `ul`/`ol` with `GridItem as="li"`                                                                                                                                                |
| `hideBelow` / `hideAbove`        | –       | Hidden while the window is narrower than / at least this breakpoint (`sm` 30rem, `md` 45rem, `lg` 60rem, `xl` 75rem). No script                                                                            |
| `id`, `role`, `aria-*`           | –       | Passed to the element: a link target, a named landmark or group                                                                                                                                            |

`GridItem`: `span` (columns, or `full` for the whole row; clamped to the columns a `columns` grid has at its current width), `rowSpan`, `as` (`div`, `li`, `section`, `article`, `aside`). Plain children need no wrapper.

- Columns follow the text direction (the first item is on the right in right-to-left text).
- A nested Grid never inherits its parent's columns.
- In a `minItemWidth` grid the column count depends on the width, so prefer `span="full"` to a fixed span there.

## Columns per breakpoint

`columns={{ base: 1, sm: 2, lg: 4 }}` gives a column count for each width of the grid's own content box (inside its padding), not of the window, so it works in panels, popups and shadow roots. It is CSS only (a size container plus arithmetic on the grid's width): no script measures anything, server-rendered markup is right on the first paint and nothing shifts afterwards.

| Breakpoint | Applies from (grid width) | At a 16px root font size |
| ---------- | ------------------------- | ------------------------ |
| `base`     | 0                         | 0                        |
| `sm`       | 30rem                     | 480px                    |
| `md`       | 45rem                     | 720px                    |
| `lg`       | 60rem                     | 960px                    |
| `xl`       | 75rem                     | 1200px                   |
- The scale is exported as `GRID_BREAKPOINTS` (with the types `GridBreakpoint` and `GridColumns`). `grid.css` repeats the four widths, because CSS cannot read them from TypeScript: change both together.
- A breakpoint that is left out keeps the count of the one below it; without `base` the grid starts at one column. Counts that are not whole numbers of one or more are skipped the same way.
- The widths are in rem, like the other container queries in the library, so they follow the page's root font size.
- `GridItem` spans are clamped to the columns in effect at each width, for items that are direct children of the grid.
- With `minItemWidth`, the count for the current width is the most columns there can be.
- A grid with `columns` per breakpoint is a size container (`container-type: inline-size`). Its width must therefore come from its parent, which it does in normal block and stretched flex or grid layouts; in a shrink-to-fit place (an inline-flex box, a float, a flex row without `flex: 1`) give it a width. It is also the containing block of fixed-position descendants.
- The scale was chosen so that a grid filling a `Container` of size `sm`, `md`, `lg` or `xl` (default gutters) reaches the breakpoint of the same name.

## Padding

`padding`, `paddingInline` and `paddingBlock` pad the grid's own box with space tokens, inside its width; the specific one wins over `padding`, and `"0"` counts as a value. A nested Grid never inherits its parent's padding. The props and logic are shared with Stack and Inline (`../Stack/space.ts`).

## GridItem

| Prop                                              | Default | Notes                                                                                                              |
| ------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| `span`                                            | `1`     | Columns to span, or `full`. In a grid with `columns` per breakpoint, one per breakpoint: `{ base: "full", md: 2 }` |
| `rowSpan`                                         | `1`     | Rows to span                                                                                                       |
| `order`                                           | `0`     | Visual position (CSS `order`), or one per breakpoint. The reading and tab order stay the source order              |
| `sticky` / `stickyOffset`                         | – / `0` | Stays in view while the page scrolls past its row, keeping its own height (a sidebar)                              |
| `hideBelow` / `hideAbove`, `id`, `role`, `aria-*` | –       | As on Grid                                                                                                         |

**Unequal columns that change with the width:** give the grid equal columns per breakpoint and the items a span per breakpoint. `columns={{ base: 1, md: 3 }}` with a main item of `span={{ md: 2 }}` is one column on phones and two to one from `md`; `order={{ base: 2, md: 1 }}` moves it after its sibling on phones only. Item spans and orders per breakpoint follow the grid's own width, like its columns.
