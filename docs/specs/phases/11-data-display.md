# Phase 11 — Data display

> **Goal:** Components for rendering structured data — cards, tables, trees, timelines, progress, and the container components (Accordion, Collapsible).

**Depends on:** Phases 01–10.
**Blocks:** Nothing core; these are the heavyweights that justify the library.

---

## Components

1. **`Card`** family (`Card`, `CardHeader`, `CardBody`, `CardFooter`, `CardTitle`, `CardDescription`, `CardImage`)
2. **`Table`** (static) + **`DataTable`** (sortable, selectable, paginated)
3. **`Tree`**
4. **`Timeline`**
5. **`Stat`**
6. **`Progress`** / **`ProgressCircle`**
7. **`Skeleton`**
8. **`Spinner`**
9. **`Accordion`** / **`Collapsible`** / **`Disclosure`**
10. **`CodeBlock`** (syntax highlighted)
11. **`ScrollArea`**
12. **`Resizable`** / **`Splitter`**

---

## `Card`

Compound component for card-shaped content.

```tsx
<Card variant="elevated" interactive>
  <CardImage src="/hero.jpg" alt="" aspectRatio={16/9} />
  <CardHeader>
    <CardTitle>Cynosure UI</CardTitle>
    <CardDescription>A tiny React component library.</CardDescription>
  </CardHeader>
  <CardBody>
    <Text>…</Text>
  </CardBody>
  <CardFooter>
    <Button>Learn more</Button>
  </CardFooter>
</Card>
```

### Variants
- `variant`: `outlined` (default — 1px border), `elevated` (shadow, no border), `filled` (muted bg), `ghost`
- `size`: `sm` | `md` | `lg` (controls internal padding scale)
- `interactive`: boolean — adds hover/focus states and cursor pointer
- `orientation`: `vertical` (default) | `horizontal` — for media on the side
- `asChild`: classic pattern for wrapping as a clickable card (`<Card asChild><Link /></Card>`)

### Parts all compose primitives

```tsx
// CardHeader = <Stack gap="1" padding="…">
// CardBody   = <Box padding="…">
// CardFooter = <Inline gap="2" justify="end" padding="…">
// CardTitle  = <Heading level={3} size="md">
// CardDescription = <Text color="muted.fg" size="sm">
// CardImage  = <AspectRatio><Box as="img" /></AspectRatio>
```

No raw elements. Every part is composed.

---

## `Table` (static)

For simple data display where the data is already in final form.

```tsx
<Table variant="striped" size="md" stickyHeader>
  <TableCaption>Recent invoices</TableCaption>
  <TableHead>
    <TableRow>
      <TableHeader>Invoice</TableHeader>
      <TableHeader>Status</TableHeader>
      <TableHeader align="end">Amount</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>INV-001</TableCell>
      <TableCell><Badge colorScheme="success">Paid</Badge></TableCell>
      <TableCell align="end">$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Props on `Table`
- `variant`: `line` (default — horizontal row lines), `striped`, `grid`, `minimal`
- `size`: `sm` | `md` | `lg` (row height, padding)
- `stickyHeader`: boolean
- `layout`: `auto` | `fixed`

### Parts
- `Table` → `<Box as="table">`
- `TableHead` → `<Box as="thead">`, `TableBody` → `<Box as="tbody">`, `TableFoot` → `<Box as="tfoot">`
- `TableRow` → `<Box as="tr">`
- `TableHeader` → `<Box as="th">` with `scope="col"` by default
- `TableCell` → `<Box as="td">` with `align` (`start` | `center` | `end`), `numeric` (enforces tabular numbers)
- `TableCaption` → `<Box as="caption">`

Tables are one of the few places where "composing primitives" is clunky — the table element hierarchy is strict. We use `Box as="…"` polymorphism to satisfy the semantic HTML requirement while still channelling styling through `Box`.

---

## `DataTable`

The advanced table. Opt-in features: sorting, selection, pagination, filtering, column resizing, virtualisation.

### Strategy
Use **TanStack Table v8** (headless) + our own rendering components. TanStack is the standard; we don't reinvent table state.

```bash
pnpm --filter @arshad-shah/cynosure-react add @tanstack/react-table
```

### API

```tsx
const columns: ColumnDef<Invoice>[] = [
  { accessorKey: 'id', header: 'Invoice' },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusBadge status={getValue()} /> },
  { accessorKey: 'amount', header: 'Amount', cell: ({ getValue }) => formatCurrency(getValue()) },
];

<DataTable
  columns={columns}
  data={invoices}
  sortable
  selectable                              // adds a checkbox column
  onSelectionChange={setSelected}
  pagination={{ pageSize: 20 }}
  filter={{ global: search }}
  virtualize                              // only render visible rows
  emptyState={<EmptyState />}
  loading={isLoading}
/>
```

### Features
- **Sort**: header click; visual indicator (up/down caret); multi-column sort with Shift+click.
- **Select**: per-row and select-all checkboxes; integrates with Phase 07's `Checkbox`.
- **Pagination**: renders our `Pagination` component underneath.
- **Filter**: per-column filter popover (uses Phase 09 `Popover`).
- **Column resize**: drag handles on header edges (throttle during drag, update width on release).
- **Virtualisation**: uses `@tanstack/react-virtual`.
- **Empty state**: render a consumer-provided `emptyState` when `data.length === 0`.
- **Loading state**: render skeleton rows when `loading`.

### A11y
- Sortable headers are `<button>`s with `aria-sort="ascending" | "descending" | "none"`.
- Selectable rows have a `<Checkbox label="Select row" />`.
- Row focus management: tab moves through actionable cells only.

---

## `Tree`

Recursive nested-list component with expand/collapse.

```tsx
<Tree
  items={treeData}
  expandedIds={expanded}
  onExpandedChange={setExpanded}
  selectedIds={selected}
  onSelectionChange={setSelected}
  selectionMode="single"
>
  {(item, { depth, expanded, selected }) => (
    <TreeItem key={item.id}>
      <TreeItemLabel icon={<FolderIcon />} depth={depth}>
        {item.label}
      </TreeItemLabel>
    </TreeItem>
  )}
</Tree>
```

### Strategy
Use **React Aria's `Tree`** component — it handles keyboard (arrow keys, Home/End, `*` to expand all), selection semantics, and screen-reader announcements correctly. Re-skin with our tokens.

### Props
- `selectionMode`: `none` | `single` | `multiple`
- `allowExpandCollapse`: boolean (default true)
- `virtualize`: boolean — for very large trees

---

## `Timeline`

For chronological event displays (activity feeds, changelogs).

```tsx
<Timeline>
  <TimelineItem>
    <TimelineSeparator>
      <TimelineDot colorScheme="success" />
      <TimelineConnector />
    </TimelineSeparator>
    <TimelineContent>
      <Text weight="semibold">Deployed v1.2.0</Text>
      <Text size="sm" color="muted.fg">2 hours ago</Text>
    </TimelineContent>
  </TimelineItem>
  <TimelineItem>…</TimelineItem>
</Timeline>
```

### Parts
- `Timeline` — vertical by default; `orientation="horizontal"` for alternative.
- `TimelineItem` — `Inline gap="3"`.
- `TimelineSeparator` — `Stack align="center"` containing dot + connector.
- `TimelineDot` — small circle; accepts `colorScheme`, `variant` (solid/outline), `icon`.
- `TimelineConnector` — the line between items; last item's connector is auto-hidden.
- `TimelineContent` — flex-1 content area.

### Variants on `Timeline`
- `align`: `start` (default) | `alternate` — alternates items left/right of a central axis
- `size`: `sm` | `md` | `lg`

---

## `Stat`

Display a single numeric insight.

```tsx
<Stat>
  <StatLabel>Monthly revenue</StatLabel>
  <StatValue>£12,450</StatValue>
  <StatHelp>
    <StatArrow direction="increase" />
    23.36%
  </StatHelp>
</Stat>
```

Compose in a `SimpleGrid` for dashboards.

---

## `Progress`

```tsx
<Progress value={60} max={100} size="md" colorScheme="accent" showValue />
<Progress indeterminate />
```

Use React Aria's `ProgressBar` for semantics (`role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`).

### Props
- `value`: number
- `max`: number (default 100)
- `size`: `xs` | `sm` | `md` | `lg`
- `colorScheme`: `accent` | `success` | `warning` | `danger` | `neutral`
- `showValue`: boolean — render `{value}%` next to the bar
- `indeterminate`: boolean
- `striped`: boolean
- `animated`: boolean — only with striped

---

## `ProgressCircle`

Circular progress indicator.

```tsx
<ProgressCircle value={75} size="md" thickness="4">
  <Text size="sm" weight="bold">75%</Text>
</ProgressCircle>
```

SVG-based with two `<circle>` elements (track + progress), `stroke-dasharray` + `stroke-dashoffset` math for the fill.

---

## `Skeleton`

Loading placeholder that matches the shape of incoming content.

```tsx
<Stack gap="2">
  <Skeleton height="6" width="40%" />
  <Skeleton height="4" width="100%" />
  <Skeleton height="4" width="80%" />
</Stack>

<Skeleton variant="circle" width="10" height="10" />
<Skeleton variant="rect" aspectRatio={16/9} />
```

### Props
- `variant`: `text` (default) | `rect` | `circle`
- `animation`: `pulse` (default) | `wave` | `none`
- Layout props (width, height, aspectRatio) inherited.

Animation respects `prefers-reduced-motion` — automatically `none` when reduced.

---

## `Spinner`

```tsx
<Spinner size="md" colorScheme="accent" label="Loading" />
```

Used internally by Button (loading state), DataTable (loading state), etc.

### Props
- `size`: `xs` | `sm` | `md` | `lg` | `xl`
- `colorScheme`: `accent` | `neutral` | `currentColor` (inherits)
- `speed`: `slow` | `normal` | `fast`
- `label`: required (becomes `aria-label`; defaults to "Loading")
- `variant`: `border` (default), `dots`, `ring`

SVG-based with CSS-driven rotation. No JS animation.

---

## `Accordion`

```tsx
<Accordion type="multiple" defaultValue={['item-1']}>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>Yes. It follows the WAI-ARIA pattern.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">…</AccordionItem>
</Accordion>
```

Backed by `@radix-ui/react-accordion`.

### Props on `Accordion`
- `type`: `single` | `multiple`
- `collapsible`: boolean (for `type="single"`, allows closing all)
- `variant`: `default` (separators between items) | `contained` (bordered box), `ghost`
- `size`: `sm` | `md` | `lg`

### Animation
Height transitions are the tricky bit. Radix provides a `data-state` attribute; we transition `height` via CSS `calc(var(--radix-accordion-content-height))` (Radix sets this CSS var). Works natively, respects reduced motion via our token.

---

## `Collapsible`

Single-section version of Accordion — a primitive disclosure.

```tsx
<Collapsible>
  <CollapsibleTrigger asChild><Button>Toggle</Button></CollapsibleTrigger>
  <CollapsibleContent>
    …
  </CollapsibleContent>
</Collapsible>
```

Backed by `@radix-ui/react-collapsible`. Use it for "Show more" patterns, advanced settings panels, etc.

---

## `Disclosure`

Exposed as an alias of `Collapsible` for semantic clarity in some contexts. Same component; different name.

---

## `CodeBlock`

Syntax-highlighted code display.

```tsx
<CodeBlock language="tsx" showLineNumbers copyable>
{`const x = 1;
const y = 2;`}
</CodeBlock>
```

### Strategy
Use **Shiki** (the VS Code syntax highlighter) for quality. Shiki's bundle is large (~1 MB for all languages), but it:
- Lazy-loads languages on demand.
- Produces static HTML output (no runtime re-highlighting).
- Uses real themes (including our terminal-aesthetic highlighting).

Install:
```bash
pnpm --filter @arshad-shah/cynosure-react add shiki
```

### Props
- `language`: Shiki language identifier
- `showLineNumbers`: boolean
- `copyable`: boolean — adds a copy button (uses our `useClipboard` hook)
- `theme`: string (shiki theme name) — defaults to one light + one dark matching our theme
- `highlightLines`: number[] — highlight specific lines
- `maxHeight`: string — adds scroll above threshold

### Composition
Outer wrapper is a `Card variant="filled"`. Copy button is an `IconButton` with a state-change tooltip.

**Note:** CodeBlock is heavyweight. Export as a separate entry point (`@arshad-shah/cynosure-react/code-block`); don't include in the root barrel.

---

## `ScrollArea`

Custom-styled scrollable area with consistent scrollbars across platforms.

```tsx
<ScrollArea height="400" width="100%">
  <Stack gap="2">{items.map(i => …)}</Stack>
</ScrollArea>
```

Backed by `@radix-ui/react-scroll-area`. Styled scrollbars that match our tokens. Default to showing scrollbars on hover, always on touch devices.

---

## `Resizable` / `Splitter`

Pane resizer for split layouts (IDE-like).

```tsx
<Resizable direction="horizontal">
  <ResizablePanel defaultSize={30} minSize={20}>
    <Sidebar />
  </ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={70}>
    <main>…</main>
  </ResizablePanel>
</Resizable>
```

### Strategy
Use **`react-resizable-panels`** (battle-tested, Vercel-maintained).

```bash
pnpm --filter @arshad-shah/cynosure-react add react-resizable-panels
```

Re-skin its handles with our tokens.

`Splitter` is an alias for `Resizable` — some design systems use this name.

---

## Testing requirements

Per component:
- Stories: every variant, every size, every state, RTL, loading, empty.
- Interaction tests:
  - DataTable: sort click toggles direction; selection updates; pagination; filter applies.
  - Tree: arrow keys navigate; Right/Left expand/collapse; Enter selects; typeahead works.
  - Accordion: multiple open at once when `type="multiple"`; single when `type="single"`.
  - Resizable: drag handle with pointer events updates sizes.
- A11y stories pass.
- DataTable has snapshot tests against a fixed dataset (deterministic output).

---

## Exit criteria

- [ ] All components exist with per-component entry points.
- [ ] DataTable supports sort, select, paginate, filter, virtualise on a 10,000-row demo without jank.
- [ ] Tree supports single/multi selection with full keyboard.
- [ ] Accordion height animation works and is reduced-motion aware.
- [ ] CodeBlock is gated behind its own entry point (`/code-block`) to keep the main bundle lean.
- [ ] Bundle:
  - `import { DataTable }` ≤ 40 KB gzipped (TanStack Table + our code).
  - `import { CodeBlock }` can be larger (Shiki) but documented.
- [ ] Changesets: `@arshad-shah/cynosure-react` minor "Data display components".

## Decisions to log

- TanStack Table for DataTable. Industry standard, best-in-class headless API.
- React Aria Tree over Radix (no Radix Tree primitive; Aria is the best option).
- Shiki for CodeBlock. Consumers opt in via the separate entry point.
- `react-resizable-panels` for Resizable. Reimplementing is not worth it.
