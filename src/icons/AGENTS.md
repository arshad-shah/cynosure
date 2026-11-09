# src/icons (Facet icons)

One file per icon exporting typed `IconData`. Add icons only with `pnpm cy new icon <name> --from file.svg`.

**Facet grammar:** 24×24 grid, stroke only (1.75 round caps and joins, set by CSS), softened-square geometry (rounded rects over circles where it reads well), and usually one accent star: a filled 3×3 rect with radius 0.8 (2.5 allowed for tight icons) placed in open space. Mark the moving part with `animate: true` and pick one shared `motion` (`tilt rotate flip draw lift drop spin pop nudge slide`).

`validateIcon` (run by tests and the generator) rejects text, fills other than the star, off-grid geometry and bad names. The gallery story `Foundations/Icon → Gallery` shows every icon.
