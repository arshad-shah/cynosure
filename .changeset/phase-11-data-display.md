---
'@lumen/react': minor
---

Phase 11 — data display components.

`@lumen/react` gains the heavyweight data-display surface: cards, tables, trees, timelines, progress, skeleton/spinner feedback, accordions, code blocks, scroll areas, and resizable panels.

- **Card family:** `Card` + `CardHeader` / `CardBody` / `CardFooter` / `CardTitle` / `CardDescription` / `CardImage` / `CardMedia`. Variants (`outlined` / `elevated` / `filled` / `ghost`), sizes (`sm` / `md` / `lg`), `orientation="horizontal"` for side-media layouts, `interactive` for hover/focus states, and the classic `asChild` escape hatch for clickable-card patterns.
- **Table (static) + DataTable:** `Table` + `TableHead` / `TableBody` / `TableFoot` / `TableRow` / `TableHeader` / `TableCell` / `TableCaption` cover the "already in final form" case with `line` / `striped` / `grid` / `minimal` variants, `stickyHeader`, and `layout` control. `DataTable` is the opt-in advanced mode backed by TanStack Table v8 — sortable headers (multi-column via Shift+click, `aria-sort` for every direction), checkbox selection with `onSelectionChange(rows)`, `Pagination` wired in beneath, global filter, loading skeletons, and a slot-based `emptyState`.
- **Tree:** hand-rolled tree with full keyboard navigation (ArrowUp/Down/Left/Right, Home/End, Enter/Space, `*` to expand the current sibling group). Controlled + uncontrolled `expandedIds`/`selectedIds` via `useControllableState`; `selectionMode="none" | "single" | "multiple"`; `aria-level` / `aria-expanded` / `aria-selected` on every row. Render prop exposes `{ item, depth, expanded, selected, focused, disabled }`.
- **Timeline:** `Timeline` + `TimelineItem` / `TimelineSeparator` / `TimelineDot` / `TimelineConnector` / `TimelineContent`. Vertical (default) or horizontal orientation, size scale, and colour-scheme / variant props on the dot for event severity.
- **Stat:** `Stat` + `StatLabel` / `StatValue` / `StatHelp` / `StatArrow` for KPI displays. Drop-in inside a `SimpleGrid`.
- **Progress + ProgressCircle:** linear and circular progress bars with value/indeterminate modes, striped + animated striped looks, a full colour-scheme palette, and `showValue` with optional custom formatter. Respects `prefers-reduced-motion`. SVG-based circular progress with `thickness` + `size` controls and a `{children}` slot for the centred percentage or icon.
- **Skeleton:** loading placeholder with `text` / `rect` / `circle` variants, pulse/wave/none animation, and `width` / `height` / `aspectRatio` layout props. Auto-disables animation under `prefers-reduced-motion`.
- **Spinner:** `border` / `dots` / `ring` variants, five sizes, three speeds, and a required `label` that becomes the `aria-label` (defaults to `"Loading"`). Already used internally by Button's loading state in Phase 07.
- **Accordion + Collapsible + Disclosure:** Radix-backed expand/collapse. Accordion supports `type="single"` (with `collapsible`) and `type="multiple"` with our own `default` / `contained` / `ghost` shell variants; height transitions drive off Radix's `--radix-accordion-content-height` custom property. `Collapsible` is the one-section variant for "show more" / settings panels. `Disclosure` is a semantic alias of `Collapsible`.
- **ScrollArea:** Radix-backed custom scrollbars with consistent styling across platforms. `type="hover"` default so scrollbars reveal on interaction; `scrollbars` prop limits to vertical or horizontal only.
- **Resizable + Splitter:** `react-resizable-panels`-backed split panes. `Resizable` + `ResizablePanel` + `ResizableHandle` with `direction="horizontal" | "vertical"`, `withHandle` for a visible drag grip, and a `Splitter` alias for design systems that use that vocabulary.
- **CodeBlock:** plain, zero-dependency renderer by default (line numbers, highlight lines, copy button, max-height scroll, language chip in the header). A lazy Shiki path is exposed via `createShikiRenderer()` + `useShikiRender()` — consumers import them from `@lumen/react/code-block` and pass the resulting HTML through the `html` prop, so Shiki never enters the default bundle graph.

New direct dependencies: `@radix-ui/react-accordion`, `@radix-ui/react-collapsible`, `@radix-ui/react-scroll-area`, `@tanstack/react-table`, `react-resizable-panels`, `shiki`.

All components ship per-component tsup entries with Node10 sidecar shims. 35 new unit tests (357/357 total pass).
