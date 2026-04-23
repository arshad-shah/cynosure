# Sidebar Redesign — Design Spec

Date: 2026-04-22
Status: Approved (brainstorm)
Owner: Arshad Shah
Scope: Full replacement of `packages/react/src/navigation/Sidebar` with first-class navigation primitives, tooltip integration, nested flyouts, keyboard nav, and polished visual design aligned with the rest of the cynosure library.

## Goals

- Replace the current thin shell (which delegates item rendering to `Menu`) with purpose-built navigation primitives.
- First-class tooltip support in collapsed icon-rail mode.
- Nested sub-items that work as an inline disclosure when expanded and a popover flyout when collapsed (VS Code style).
- Clean, modern visual design using only `vars.*` tokens.
- Roving-focus keyboard navigation.
- Split the current 279-line file into focused modules (each < ~100 lines).

## Non-goals

- Built-in routing. Consumers control `isActive` and pass their own `<Link>` via `asChild`.
- Right-side flyout logic when `side="right"` is beyond MVP — MVP mirrors side for the flyout anchor but does not re-layout header icons.
- Changes to the `Drawer` primitive used on mobile.

## API Surface

All primitives are `forwardRef`, styled via vanilla-extract in `Sidebar.css.ts`, no inline styles. Icons come from `lucide-react`.

### Shell

- `SidebarProvider` — state: `collapsed`, `mobileOpen`, `side`, `variant` (`"sidebar" | "floating" | "inset"`), `collapsible` (`"icon" | "offcanvas" | "none"`), `mobileQuery`. Mounts a `TooltipProvider` with `delayMs=200` so all items share timing.
- `Sidebar` — semantic `<aside>` root. On mobile (when `mobileQuery` matches), renders inside `Drawer`.
- `SidebarHeader`, `SidebarBody`, `SidebarFooter` — layout slots.
- `SidebarSeparator` — 1px hairline, marginBlock `vars.space['2']`.
- `SidebarTrigger` — context-aware toggle. Default icons: `PanelLeftOpen` / `PanelLeftClose` (desktop), `Menu` / `X` (mobile). `icon` prop overrides.

### Navigation primitives (new)

- `SidebarNav` — semantic `<nav>` wrapper. Owns roving-focus state. Requires `aria-label` (or `aria-labelledby`).
- `SidebarGroup` — titled section. Props: `label`, `collapsible`, `defaultOpen`, `action` (trailing slot).
- `SidebarItem` — single nav entry. Props:
  - `icon?: ReactNode`
  - `label?: ReactNode` (or children)
  - `badge?: ReactNode`
  - `isActive?: boolean`
  - `disabled?: boolean`
  - `asChild?: boolean` (Radix `Slot`, for Next/RR `<Link>`)
  - `tooltip?: ReactNode | false` (override or disable auto-tooltip)
  - Standard `HTMLAttributes<HTMLElement>`.
- `SidebarSubNav` — container for nested sub-items. Renders inline when expanded, as `Popover` flyout when collapsed-to-icon.
- `SidebarSubItem` — child item (no icon slot, smaller indent, 2rem tall).

### Hook

- `useSidebar()` — unchanged fields plus `isCollapsedIconRail: boolean` (true when `collapsed && collapsible === "icon" && !isMobile`).

## Behavior

### Collapse modes

- `icon` (default) — collapses rail to `3.25rem`, labels hide, tooltips auto-show, badges reposition as 6px accent dot on icon top-right.
- `offcanvas` — width 0, slides out, no tooltip logic.
- `none` — always full-width.

### Tooltips (icon rail)

- When `isCollapsedIconRail === true`, every `SidebarItem` auto-wraps its trigger in a `Tooltip` with `side="right"` (or `"left"` when sidebar `side="right"`), `content = label`.
- `tooltip={false}` disables; `tooltip={<custom/>}` overrides.
- Provider-level `TooltipProvider` mounted once by `SidebarProvider`.

### Nested items

- `SidebarItem` with a `SidebarSubNav` child:
  - **Expanded rail:** inline disclosure. Caret (ChevronRight, 14px) rotates 90° on open. Children render indented by `vars.space['6']` with a vertical hairline on the leading edge.
  - **Collapsed rail:** item becomes a `Popover.Trigger`. On hover or click, `SidebarSubNav` renders in `Popover.Content` — `side="right"`, `sideOffset=4`, min-width `12rem`, `background.surface`, `radius.md`, `shadow.md`, `border.subtle`, padded, with an internal label header showing the parent name.

### Keyboard nav (roving tabindex within `SidebarNav`)

- ArrowDown / ArrowUp — move focus between items (skips disabled).
- Home / End — first / last focusable item.
- Enter / Space — activate.
- ArrowRight — expand collapsible group or open flyout.
- ArrowLeft — collapse group, close flyout, or move focus to parent.

### Active state

- Consumer-controlled via `isActive`. Sets `aria-current="page"` and `data-active="true"`.

### Mobile

- When `mobileQuery` matches, `Sidebar` renders inside `Drawer`. Always full-width inside the drawer; `collapsed` is ignored there. `SidebarTrigger` toggles `mobileOpen`.

### Motion

- Rail width and label opacity animate on `vars.duration.fast` with `ease-in-out`. Labels fade + translate-x slightly on collapse.
- All transitions respect `[data-cynosure-reduced-motion]`.

## Visual design

All via `vars.*`. No hardcoded values.

### Shell

- Expanded width: `16rem`. Collapsed icon rail: `3.25rem`.
- `sidebar` variant: `background.surface`, `border.subtle` trailing edge.
- `floating`: margin `vars.space['2']`, `radius.lg`, full border, `shadow.sm`.
- `inset`: `background.canvas`, no border.
- Header: 3rem tall, paddingInline `vars.space['3']`, bottom hairline.
- Footer: paddingInline `vars.space['2']`, paddingBlock `vars.space['2']`, top hairline.
- Body: paddingInline `vars.space['2']`, paddingBlock `vars.space['2']`, gap `vars.space['4']` between groups. Thin scrollbar, `scrollbar-gutter: stable`.

### Group label

- Uppercase, `font-body-xs`, weight 600, letter-spacing 0.05em, `foreground.muted`, paddingInline `vars.space['2']`, paddingBlock `vars.space['1']`.
- Hidden when collapsed; replaced by a 1px `border.subtle` separator to preserve section rhythm.

### SidebarItem

- Height 2.25rem, paddingInline `vars.space['2']`, gap `vars.space['2.5']`, `radius.md`, `font-body-sm`, weight 500.
- Icon: 1.125rem (18px), color `foreground.muted`.
- Label: `foreground.default`, single line, ellipsis.
- Badge: trailing `Badge` primitive at `size="xs" variant="soft"`; in collapsed rail becomes a 6px accent dot on the icon top-right.
- **Hover (inactive):** `background.surface.hover` (or `accent.soft` at 50% fallback).
- **Focus-visible:** 2px `accent.ring` outer ring, no background change.
- **Active:** `background.accent.soft`, label + icon `accent.strong`, weight 600, plus a 3px × 1rem accent bar on leading edge via `::before` absolute, `background.accent.solid`, pill radius. This combines soft-pill (Linear/Vercel) with accent-rail (GitHub) treatments.
- **Disabled:** opacity 0.5, cursor not-allowed, no hover.
- Caret for items with `SidebarSubNav`: 14px chevron, trailing, rotates 90° on open.
- **Collapsed icon rail:** item becomes centered 2.25rem square, icon-only, same active color treatment (leading bar hides).

### SidebarSubNav

- **Expanded:** indent `vars.space['6']`, leading-edge vertical hairline to visually connect to parent. Sub-items 2rem tall, no icon slot.
- **Collapsed flyout:** `Popover.Content`, `side="right"`, `sideOffset=4`, min-width `12rem`, `background.surface`, `radius.md`, `shadow.md`, `border.subtle`, paddingBlock `vars.space['2']`; header row shows parent label.

### SidebarTrigger

- 2.25rem square hit target, ghost style, `radius.sm`, hover `accent.soft`, focus-visible 2px `accent.ring`.

## File layout

```
packages/react/src/navigation/Sidebar/
  context.ts                    // SidebarContext, useSidebar (+ isCollapsedIconRail)
  Sidebar.tsx                   // SidebarProvider + Sidebar (shell only)
  SidebarHeader.tsx             // Header, Body, Footer, Separator
  SidebarTrigger.tsx            // SidebarTrigger
  SidebarNav.tsx                // SidebarNav + SidebarGroup + roving-focus
  SidebarItem.tsx               // SidebarItem (tooltip wrap, active, asChild)
  SidebarSubNav.tsx             // SidebarSubNav + SidebarSubItem (disclosure ↔ flyout)
  Sidebar.css.ts                // all styles
  useIsMobile.ts                // extracted hook
  useRovingFocus.ts             // extracted hook
  index.ts                      // barrel export
  Sidebar.stories.tsx           // rewritten stories (lucide icons only)
  __tests__/Sidebar.test.tsx    // new tests
```

## Dependencies

- Add: `@radix-ui/react-slot` (for `asChild`).
- Already available: `@radix-ui/react-popover`, `@radix-ui/react-tooltip`, `@radix-ui/react-dialog` (Drawer), `lucide-react`.

## Testing

Vitest + Testing Library, matching existing tests in `packages/react/src/navigation/__tests__/`.

- Shell: controlled + uncontrolled `collapsed`; mobile query switches to `Drawer`; `SidebarTrigger` toggles correctly on desktop vs mobile.
- Item: renders icon + label + badge; `isActive` sets `aria-current="page"` and `data-active`; `asChild` forwards props to a stub `<a>`; `disabled` prevents click.
- Tooltip: absent when expanded; present with label when collapsed; `tooltip={false}` opt-out works.
- Group: collapsible toggles; non-collapsible groups render no caret; `action` slot renders.
- SubNav: inline disclosure when expanded; `Popover` content when collapsed; keyboard (ArrowRight opens, ArrowLeft closes, ArrowUp/Down navigate inside).
- Roving focus: arrow keys move through items in a `SidebarNav`; Home/End jump; disabled items skipped.
- A11y: axe clean on Default, Collapsed, and Mobile stories.

## Stories

1. `Default` — header, nav, footer with user chip.
2. `CollapsibleRail` — desktop expand/collapse demo, tooltips visible.
3. `NestedNav` — `SidebarSubNav` inline + flyout when collapsed.
4. `WithGroups` — multiple groups, one collapsible, one with trailing `action`.
5. `AsChildLinks` — `asChild` with stub `<a>` showing router integration.
6. `MobileDrawer` — `mobileQuery="(min-width: 0px)"`.
7. `RightSide` — inspector panel.
8. `FloatingVariant` + `InsetVariant`.
9. `DocsShell` — realistic docs-site use case.

All stories use `lucide-react` icons — drop hand-rolled SVG icons from the current stories file.

## Breaking changes

- Consumers using `<Menu>` inside `<SidebarBody>` should migrate to `<SidebarNav>` + `<SidebarItem>`. `Menu` still renders but won't receive tooltip-on-collapse or roving focus.
- `SidebarTrigger` default icons change from `ListCollapse` / `Hamburger` to `PanelLeftOpen` / `PanelLeftClose` (desktop) and `Menu` / `X` (mobile). Consumers passing `icon` are unaffected.
- Migration note in story file header; CHANGELOG entry required.

## Out of scope

- RTL-specific reflow beyond what logical properties already give us.
- Drag-to-resize rail width.
- Persisting `collapsed` to `localStorage` — left to the consumer.
