# src/icons (Facet icons)

One file per icon exporting typed `IconData`. Add icons only with `pnpm cy new icon <name> --from file.svg --category <category>`.

**Facet grammar:** 24×24 grid, stroke only (1.75 round caps and joins, set by CSS), softened-square geometry (rounded rects over circles where it reads well), stroke only: no fills and no accent dot (dots that belong to a glyph, like the "i" in info, are zero-length round-capped strokes such as `M12 7.75h.01`). Every icon has a `category` from `ICON_CATEGORIES`. Mark the moving part with `animate: true` and pick one shared `motion` (`tilt rotate flip draw lift drop spin pop nudge slide`).

`validateIcon` (run by tests and the generator) rejects text, any fill, unknown categories, off-grid geometry and bad names. The gallery story `Foundations/Icon → Gallery` shows every icon.
