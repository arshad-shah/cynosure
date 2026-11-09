# Icons (Facet)

Facet icons are drawn from the Cynosure mark: 24 grid, 1.75 round stroke, softened squares, one accent star. Use them with `<Icon icon={search} />` (decorative) or `<Icon icon={search} label="Search" />`. Import icons by name from `@arshad-shah/cynosure/icons` so unused ones are tree-shaken.

Add one: draw it on a 24 grid with strokes only and a filled 3×3 star rect, export SVG, run `pnpm cy new icon <name> --from icon.svg`. Then set `motion` and mark the moving part `animate: true` in the generated file. See `src/icons/AGENTS.md` for the grammar.
