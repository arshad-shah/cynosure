# Grid

Two-dimensional layout: a fixed number of equal columns, or as many columns as fit at a minimum width (card galleries, dashboards, settings tiles). Gaps are space tokens, and `GridItem` spans columns or rows.

```tsx
import { Grid, GridItem } from "@arshad-shah/cynosure";

<Grid columns={3} gap="6">…</Grid>
<Grid minItemWidth="16rem" columns={4}>…</Grid>   // as many as fit, at most 4
<Grid as="ul" minItemWidth="12rem">
  <GridItem as="li" span={2}>…</GridItem>
</Grid>;
```

| Prop           | Default | Notes                                                                             |
| -------------- | ------- | --------------------------------------------------------------------------------- |
| `columns`      | `1`     | Equal columns. With `minItemWidth`, the most columns there can be                 |
| `minItemWidth` | –       | Any CSS length: columns at least this wide, as many as fit, never wider than grid |
| `gap`          | `4`     | Space token between items                                                         |
| `rowGap`       | `gap`   | Space token between rows                                                          |
| `align`        | –       | `start` · `center` · `end` · `stretch` (block axis; items stretch by default)     |
| `as`           | `div`   | Neutral element only; use `ul`/`ol` with `GridItem as="li"`                       |

`GridItem`: `span` (columns, or `full` for the whole row; clamped to a fixed grid's columns), `rowSpan`, `as` (`div`, `li`, `section`, `article`, `aside`). Plain children need no wrapper.

- Columns follow the text direction (the first item is on the right in right-to-left text).
- A nested Grid never inherits its parent's columns.
- In a `minItemWidth` grid the column count depends on the width, so prefer `span="full"` to a fixed span there.

## Used by

Card galleries, dashboards and settings layouts in the web apps and sites (cross-product audit, 2026-11-10), in place of hand-written CSS grids.
