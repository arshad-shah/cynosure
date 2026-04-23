---
'@arshad-shah/cynosure-react': minor
---

Add four new components and dedupe existing code to reuse them.

**New components**

- `Calendar` / `RangeCalendar` (`@arshad-shah/cynosure-react/calendar`) — standalone
  date grids built on React Aria. One-month or two-month layouts, an optional
  `footer` slot for things like "Go to today" or keyboard hints, and the same
  styling language as the pickers.
- `CommandPalette` + `CommandMenu` (`@arshad-shah/cynosure-react/command-palette`) —
  ⌘K surface powered by `cmdk`. Composable parts (`CommandInput`, `CommandList`,
  `CommandEmpty`, `CommandLoading`, `CommandGroup`, `CommandSeparator`,
  `CommandItem` with `icon`/`description`/`shortcut`, `CommandShortcut`,
  `CommandFooter`), plus a pre-wired `CommandMenu` that binds ⌘K/Ctrl+K out of
  the box for the common dev-tooling case.
- `Carousel` (`@arshad-shah/cynosure-react/carousel`) — Embla wrapper with
  `CarouselViewport`, `CarouselContainer`, `CarouselSlide`, `CarouselPrevious`,
  `CarouselNext`, and `CarouselDots`. Responsive `slidesPerView`, horizontal or
  vertical orientation, loop, keyboard nav, and drag-to-scroll.
- Chart primitives (`@arshad-shah/cynosure-react/chart`) — `ChartContainer`,
  `ChartTooltip`/`ChartTooltipContent`, `ChartLegend`/`ChartLegendContent`, and
  a `chartSeriesProps(config, key)` helper over Recharts. Series config drives
  tooltip + legend labels and colours; themed SVG defaults (grid, axis, tick,
  label, cursor) applied via CSS variables. Exported via the `/chart` subpath
  only (like `CodeBlock` with Shiki) so Recharts stays out of the default
  bundle graph.

**Dedupe**

- `DatePicker` and `DateRangePicker` now reuse `<Calendar>` / `<RangeCalendar>`
  instead of open-coding `AriaCalendarGrid` + headers. The shared Calendar
  stylesheet is the single source of truth for day cells, month grids, and the
  dual-month layout.

**Dependencies (catalog)**

- `cmdk@1.1.1`, `embla-carousel-react@8.6.0`, `recharts@3.8.1` — all listed as
  externals so tree-shakers keep them off the critical path unless the relevant
  component is actually imported.
