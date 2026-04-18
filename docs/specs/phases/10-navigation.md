# Phase 10 — Navigation

> **Goal:** Ship every navigation pattern — inter-page, intra-page, wizard-style, and structural.

**Depends on:** Phases 01–09 (some use Popover/DropdownMenu from Phase 09).
**Blocks:** Nothing; downstream phases use these.

---

## Components

1. **`Tabs`**
2. **`Breadcrumb`**
3. **`Pagination`**
4. **`Menu`** (vertical menu, not the DropdownMenu) — for sidebars
5. **`NavigationMenu`** — the top-nav horizontal pattern with mega-menus
6. **`Sidebar`** — layout-level sidebar component with collapse
7. **`Stepper`**
8. **`Anchor`** (in-page anchor link with scroll behaviour)
9. **`BackToTop`**

---

## `Tabs`

```tsx
<Tabs defaultValue="overview" orientation="horizontal" variant="line">
  <TabsList aria-label="Dashboard sections">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
    <TabsTrigger value="reports" disabled>Reports</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">…</TabsContent>
  <TabsContent value="analytics">…</TabsContent>
</Tabs>
```

Backed by `@radix-ui/react-tabs`.

### Variants
- `variant`: `line` (default — underline), `solid` (filled active pill), `enclosed` (boxed tabs), `soft`
- `size`: `sm` | `md` | `lg`
- `orientation`: `horizontal` | `vertical`
- `colorScheme`: `accent` | `neutral`
- `fullWidth`: `boolean` — distributes tabs evenly

### Behaviour
- Radix gives: keyboard arrow navigation, home/end, automatic activation vs manual (use `activationMode="manual"` for async content).
- Our addition: animated underline for `variant="line"` — use a tiny `<TabsIndicator />` that absolutely-positions itself based on the active trigger's layout (measured via ResizeObserver). Falls back to no animation under `prefers-reduced-motion`.

---

## `Breadcrumb`

```tsx
<Breadcrumb>
  <BreadcrumbItem>
    <BreadcrumbLink href="/">Home</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbSeparator />
  <BreadcrumbItem>
    <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbSeparator />
  <BreadcrumbItem isCurrent>
    <BreadcrumbPage>Cynosure</BreadcrumbPage>
  </BreadcrumbItem>
</Breadcrumb>
```

### Parts

- `Breadcrumb` — renders `<Box as="nav" aria-label="Breadcrumb">` wrapping an `<Inline as="ol">`.
- `BreadcrumbItem` — `<Box as="li">`.
- `BreadcrumbLink` — our `Link` component.
- `BreadcrumbPage` — current page (non-link); gets `aria-current="page"`.
- `BreadcrumbSeparator` — default is a chevron icon; `children` overrides.
- `BreadcrumbEllipsis` — for collapsed middle items on mobile.

### Collapse behaviour
On narrow containers, middle items can be collapsed into a `BreadcrumbEllipsis` that opens a `DropdownMenu` with hidden items. This is consumer-driven; provide a `maxItems` convenience prop on `Breadcrumb`:

```tsx
<Breadcrumb maxItems={3} itemsBeforeCollapse={1} itemsAfterCollapse={2}>…</Breadcrumb>
```

Auto-collapses middle items when count exceeds `maxItems`.

---

## `Pagination`

```tsx
<Pagination
  totalPages={42}
  currentPage={page}
  onPageChange={setPage}
  siblingCount={1}
  boundaryCount={1}
  showFirstLast
/>
```

### Parts

Two modes of use — **compound** (full control) and **prop-driven** (above). Support both.

```tsx
<Pagination totalPages={42} currentPage={page} onPageChange={setPage}>
  <PaginationPrevious />
  <PaginationPages />
  <PaginationNext />
</Pagination>
```

### Page-range logic
Extract into a pure utility function (testable). Input: `{ totalPages, currentPage, siblingCount, boundaryCount }`. Output: `Array<number | 'ellipsis'>`.

Example for totalPages=42, currentPage=10, siblingCount=1, boundaryCount=1:
`[1, 'ellipsis', 9, 10, 11, 'ellipsis', 42]`

### A11y
- Wrapper is `<nav aria-label="Pagination">`.
- Current page button gets `aria-current="page"`.
- Prev/Next buttons have `aria-label`s.
- Ellipsis is `aria-hidden`.

---

## `Menu` (vertical sidebar menu)

Distinct from `DropdownMenu`. This is the persistent sidebar-style menu.

```tsx
<Menu>
  <MenuGroup label="Main">
    <MenuItem icon={<HomeIcon />} isActive>Home</MenuItem>
    <MenuItem icon={<SettingsIcon />}>Settings</MenuItem>
  </MenuGroup>
  <MenuDivider />
  <MenuGroup label="Workspace" collapsible defaultOpen>
    <MenuItem indent={1}>Project A</MenuItem>
    <MenuItem indent={1}>Project B</MenuItem>
  </MenuGroup>
</Menu>
```

### Parts
- `Menu` — wrapper, `<Stack as="nav" gap="0.5">`.
- `MenuGroup` — optional `label`; `collapsible` adds a caret trigger; uses `<Disclosure>` from Phase 11.
- `MenuItem` — polymorphic (`asChild` for router `Link`). Accepts `icon`, `iconRight`, `isActive`, `disabled`, `indent`, `badge`.
- `MenuDivider` — the `Divider` primitive.

### Active state
Consumer owns `isActive` — most routers provide this via their `NavLink` (`Next.js`, `React Router`). Our `MenuItem` simply renders active styling when the prop is true. Document the router integration recipe in docs.

### Nested state with `indent`
Instead of true nested menus (confusing UX), expose `indent` levels (0 default, 1, 2). `MenuGroup` auto-manages indent inside itself.

---

## `NavigationMenu`

The horizontal top-nav pattern with rich hover-to-reveal panels (the "mega menu").

```tsx
<NavigationMenu>
  <NavigationMenuItem>
    <NavigationMenuTrigger>Products</NavigationMenuTrigger>
    <NavigationMenuContent>
      <Grid columns={3} gap="4" padding="6">
        <NavigationMenuLink href="/a">A</NavigationMenuLink>
        <NavigationMenuLink href="/b">B</NavigationMenuLink>
        <NavigationMenuLink href="/c">C</NavigationMenuLink>
      </Grid>
    </NavigationMenuContent>
  </NavigationMenuItem>
  <NavigationMenuItem>
    <NavigationMenuLink href="/pricing">Pricing</NavigationMenuLink>
  </NavigationMenuItem>
</NavigationMenu>
```

Backed by `@radix-ui/react-navigation-menu`. Features:
- Hover + focus opens panel (with delay).
- Keyboard navigation through items and into panels.
- Visual indicator that slides between active triggers (opt-in via `<NavigationMenuIndicator />`).
- Viewport mode: all panels share a single viewport that animates height between content changes (opt-in via `<NavigationMenuViewport />`).

---

## `Sidebar` — layout-level

This is a layout pattern, not a small component. It's a container that manages collapse state, responsive behaviour, and overlay-on-mobile.

```tsx
<SidebarProvider defaultCollapsed={false}>
  <Box display="flex" minHeight="screen">
    <Sidebar>
      <SidebarHeader>
        <Heading level={1} size="md">Cynosure</Heading>
      </SidebarHeader>
      <SidebarBody>
        <Menu>…</Menu>
      </SidebarBody>
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
    <Box flex="1">
      <SidebarTrigger />  {/* Hamburger button for mobile / collapse toggle for desktop */}
      <main>…</main>
    </Box>
  </Box>
</SidebarProvider>
```

### Responsive behaviour
- Desktop (≥ md breakpoint): inline flex sidebar; can collapse to an icon-rail (width 64px) showing only icons.
- Mobile (< md): rendered as a `Drawer side="left"` instead of inline.

### Context value

```ts
interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggleCollapsed: () => void;
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}
```

### SidebarTrigger
A context-aware button: on mobile it opens the drawer; on desktop it toggles collapse. Uses `useBreakpoint` to switch behaviour.

### Variants
- `variant`: `floating` | `inset` | `sidebar` (default) — styling variations
- `collapsible`: `icon` | `offcanvas` | `none` — determines collapse behaviour
- `side`: `left` | `right`

---

## `Stepper`

For multi-step flows (checkout, onboarding).

```tsx
<Stepper currentStep={current} orientation="horizontal">
  <Step title="Account" description="Sign up" />
  <Step title="Profile" description="Tell us about you" />
  <Step title="Plan" description="Choose a plan" />
  <Step title="Done" description="You're all set" />
</Stepper>
```

### Props
- `currentStep`: zero-indexed active step
- `orientation`: `horizontal` | `vertical`
- `variant`: `numbered` (default), `dots`, `lines`, `icons`
- `interactive`: boolean — if true, clicking a completed step calls `onStepChange`
- `size`: `sm` | `md` | `lg`

### Parts
- `Step` — accepts `title`, `description`, `icon` (overrides default number), `status` (`pending` | `active` | `complete` | `error`).

Status derives from position relative to `currentStep` unless explicitly set.

### A11y
Uses `<ol>` internally; each step is `<li>` with `aria-current="step"` for the active one.

---

## `Anchor`

In-page anchor link with smooth scroll and history integration.

```tsx
<Anchor id="installation" level={2}>Installation</Anchor>
```

Renders a heading (`<Heading level={level}>`) with an invisible-until-hover `#` link that copies the URL to clipboard when clicked. Commonly used in docs.

### Props
- `id`: required, used as the fragment
- `level`: heading level (default 2)
- `offsetTop?: number` — scroll offset (for fixed headers)
- `onCopy?: () => void` — callback when anchor is copied

### Behaviour
- Click anchor link → update hash → smooth scroll (respecting `prefers-reduced-motion`).
- Copy URL with fragment to clipboard.
- Show a transient "Copied!" toast (via our `toast` API).

---

## `BackToTop`

Fixed button that appears after scrolling past a threshold.

```tsx
<BackToTop showAfter={400} position="bottom-right" />
```

### Props
- `showAfter`: scroll distance before showing (default 300px)
- `position`: `bottom-right` (default) | `bottom-left` | `bottom-center`
- `smooth`: boolean — smooth scroll (default true, respecting reduced motion)

### Implementation
- `useEffect` adds a scroll listener (throttled via `useThrottledCallback`).
- Renders an `IconButton` in a `Portal`.
- Entrance animation via CSS transition on `opacity` + `transform`.

---

## Testing requirements

Per component:
- Stories: all variants, all sizes, all states, RTL.
- Interaction tests:
  - Tabs: click changes; arrow keys navigate; Home/End; disabled skipped.
  - Pagination: click page → onPageChange fires; prev/next work; page-range util unit-tested separately with a table of cases.
  - Breadcrumb: `maxItems` collapse behaviour verified.
  - Menu: active state visible; `asChild` with mock NextLink works.
  - Sidebar: collapse toggles; mobile breakpoint switches to Drawer mode (simulated via `matchMedia` mock).
  - Stepper: status derivation from currentStep is correct; `interactive` click fires.
- A11y stories pass.

---

## Exit criteria

- [ ] All navigation components exist with per-component entry points.
- [ ] Sidebar responsive behaviour works on desktop (inline) and mobile (drawer), verified in Storybook with viewport addon.
- [ ] Pagination page-range algorithm has 100% branch coverage.
- [ ] Breadcrumb collapse behaviour works and is tested.
- [ ] Tabs indicator animates smoothly (when motion enabled) and is absent under reduced motion.
- [ ] RTL flip verified for Tabs, Breadcrumb, Sidebar.
- [ ] Changesets: `@arshad-shah/cynosure-react` minor "Navigation components".

## Decisions to log

- `Sidebar` is a layout pattern rather than a small widget. It owns responsive behaviour and context; consumers assemble its content from `Menu` + other primitives.
- `Menu` (this phase) vs `DropdownMenu` (Phase 09) are separate components with different semantics. Document the distinction in the docs site.
