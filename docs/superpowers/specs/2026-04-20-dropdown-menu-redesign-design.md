# DropdownMenu redesign — shared menu kit

**Status:** Approved design, ready for planning
**Date:** 2026-04-20
**Scope:** `packages/react/src/overlay/{DropdownMenu,ContextMenu,MenuBar}` and `overlay/shared/`

## Goals

1. Replace the ASCII `▾` trigger affordance with a proper animated chevron.
2. Elevate menu visuals to a refined, Linear/Vercel aesthetic — layered shadow, softer motion, better item states, polished kbd shortcut chip.
3. Promote `icon`, `description`, and `variant` (default | danger) to typed item props rather than ad-hoc composition.
4. Make menu items feel interactive: `cursor: pointer`.
5. Eliminate cross-file duplication between `DropdownMenu`, `ContextMenu`, and `MenuBar` by extracting a shared menu-kit factory — mirroring the Textarea composition pattern.

## Non-goals

- `navigation/Menu` and `NavigationMenu` — site-navigation pattern, out of scope.
- `Select`, `MultiSelect`, `Combobox` — listbox semantics (`role="listbox"`), different a11y contract, out of scope.
- Command palette, avatar/user-card header items — deferred.
- New visual-regression or e2e tooling.

## Background

Three files today — `DropdownMenu.tsx`, `ContextMenu.tsx`, `MenuBar.tsx` — each wrap a different Radix namespace (`@radix-ui/react-dropdown-menu`, `react-context-menu`, `react-menubar`) and re-implement the same visual contract. Each file defines its own copies of `CheckIcon`, `RadioDot`, and `ChevronRight` SVGs, and each exposes its own `Item` / `CheckboxItem` / `RadioItem` / `SubTrigger` / `Content` / `Label` / `Separator` / `Shortcut` `forwardRef` wrappers that only differ by Radix namespace. All three share `overlay/shared/menu.css.ts` for styling, so style changes already propagate — but API changes do not. Adding new item props (`icon`, `description`, `variant`) would require three parallel edits.

Storybook stories hard-code `▾` into button labels (e.g., `Actions ▾`), which looks unbranded and leaks into screenshots.

## Design

### Architecture — shared menu kit

New files in `packages/react/src/overlay/shared/`:

- **`menuIcons.tsx`** — single source for `CheckIcon`, `RadioDot`, `ChevronRight`, `ChevronDown` SVGs.
- **`menuItemContent.tsx`** — internal component that lays out a menu item's visual contents: fixed-width leading slot (icon or indicator), label stack (label + optional description), optional trailing (shortcut or sub-chevron). Sets `data-variant` on the root item element so CSS can style the danger state.
- **`createMenuKit.ts`** — factory that accepts a Radix menu namespace and returns a typed set of primitives bound to that namespace.

```ts
// createMenuKit.ts — signature
export function createMenuKit<N extends MenuNamespace>(Radix: N): MenuKit<N> {
  return {
    Content,
    Item,
    CheckboxItem,
    RadioItem,
    SubTrigger,
    SubContent,
    Label,
    Separator,
    Shortcut,
  };
}
```

The factory also exports a stand-alone `MenuTriggerButton` (a `Button` composed with a `ChevronDown` that rotates 180° on `data-state="open"`) — not part of the kit because it's DropdownMenu-only (ContextMenu has no visible trigger; MenuBar has its own trigger styling).

Each public file becomes a thin binding (~30 lines):

```tsx
// DropdownMenu.tsx
import * as Radix from '@radix-ui/react-dropdown-menu';
import { createMenuKit, MenuTriggerButton } from '../shared/createMenuKit.js';

const kit = createMenuKit(Radix);

export const DropdownMenu = Radix.Root;
export const DropdownMenuTrigger = Radix.Trigger;            // unchanged (asChild still works)
export const DropdownMenuTriggerButton = MenuTriggerButton;  // new ergonomic wrapper
export const DropdownMenuPortal = Radix.Portal;
export const DropdownMenuGroup = Radix.Group;
export const DropdownMenuSub = Radix.Sub;
export const DropdownMenuRadioGroup = Radix.RadioGroup;

export const DropdownMenuContent = kit.Content;
export const DropdownMenuItem = kit.Item;
export const DropdownMenuCheckboxItem = kit.CheckboxItem;
export const DropdownMenuRadioItem = kit.RadioItem;
export const DropdownMenuSubTrigger = kit.SubTrigger;
export const DropdownMenuSubContent = kit.SubContent;
export const DropdownMenuLabel = kit.Label;
export const DropdownMenuSeparator = kit.Separator;
export const DropdownMenuShortcut = kit.Shortcut;
```

`ContextMenu.tsx` and `MenuBar.tsx` follow the same shape with their respective Radix namespaces. MenuBar retains its own `MenuBar` (Root) and `MenuBarTrigger` wrappers because it has unique menubar-chrome styling (`menubarRoot`, `menubarTrigger`).

**Why a factory, not React context + render props:** Radix namespaces are type-distinct. `Radix.Item` from `react-dropdown-menu` and `Radix.Item` from `react-context-menu` accept the same props but are different component types. A context-based composition would erase types. A factory preserves them: each kit's components are correctly typed against the namespace they were created from.

**Public export surface is unchanged.** No breaking changes for consumers.

### Item API (shared across all three menus)

```tsx
interface MenuItemProps {
  icon?: ReactNode;                    // 14×14 leading slot, inherits currentColor
  description?: ReactNode;             // muted second line
  variant?: 'default' | 'danger';      // danger recolors label + highlight fill
  // ... all underlying Radix.Item props pass through
}
```

Applies to `Item`, `CheckboxItem`, `RadioItem`, and `SubTrigger`. On `CheckboxItem` / `RadioItem`, the indicator occupies the leading slot; passing both `icon` and a checkbox/radio role triggers a dev-only `console.warn`. (Production: icon wins — no crash.)

### CSS polish (single source: `overlay/shared/menu.css.ts`)

**`menuContent` (surface):**
- **Layered shadow:** replace single `vars.shadow.lg` with two stacked shadows — a tight `0 1px 2px rgba(0,0,0,0.08)` for the edge and a diffuse `0 12px 32px -8px rgba(0,0,0,0.18)` for the lift.
- **Subtle top inner highlight:** `inset 0 1px 0 rgba(255,255,255,0.04)` applied in dark theme only (selector will match the existing theme convention in `vars.css.ts`; to be confirmed during implementation).
- **Padding:** `space.1` → `space.1.5`.
- **Min width:** `10rem` → `12rem`.
- **Border:** unchanged (`vars.color.border.default`).
- **Transform origin:** respects Radix `data-side` so the open/close scale originates from the trigger edge:
  - `[data-side="bottom"]` → `transform-origin: top center`
  - `[data-side="top"]` → `transform-origin: bottom center`
  - `[data-side="left"]` → `transform-origin: center right`
  - `[data-side="right"]` → `transform-origin: center left`

**`menuItem`:**
- **Cursor:** `default` → `pointer`.
- **Padding:** `paddingBlock: space.2` (up from `1.5`), `paddingInline: space.2`, `paddingInlineStart: space.2.5`.
- **Highlight transition:** `transition: background-color 120ms ease, color 120ms ease` (no snap-on).
- **Leading gutter:** a fixed 20px inline-start slot is reserved inside `menuItemContent` (not via item padding). Items without an icon still align with items that have one.
- **Danger variant:** `&[data-variant="danger"]` sets `color: vars.color.feedback.danger.solid`; on `[data-highlighted]`, background becomes `vars.color.feedback.danger.soft` with preserved danger text color.
- **Disabled:** keep `opacity: 0.5`; add `cursor: not-allowed`.

**`menuItemDescription` (new):** `fontSize: body-xs`; `color: vars.color.foreground.muted`; `marginTop: 2px`.

**`menuLabel`:** drop `paddingInlineStart: space.6` — aligns naturally with the new icon gutter. Keep uppercase + `0.05em` letter-spacing.

**`menuSeparator`:** unchanged.

**`menuShortcut` (kbd chip):** `padding: 0 space.1`; `border: 1px solid vars.color.border.subtle`; `borderRadius: vars.radius.xs`; `fontSize: body-xs`. Retains `marginInlineStart: auto` for end alignment.

**`menuIndicator`:** move from absolute-positioned inline-start to inline-flow inside `menuItemContent`'s leading slot. Removes positioning math and works with RTL without special-casing.

### Motion

- **Surface open/close:** keep existing `menuIn` / `menuOut` keyframes but tighten translation from `-2px` to `-4px`. Duration stays `vars.duration.fast` (~120ms). Combined with the new `transform-origin` rules, the menu scales from the trigger edge.
- **Trigger chevron (`MenuTriggerButton`):** `<ChevronDown />` sized 14px; `transform: rotate(180deg)` on `[data-state="open"]` parent; `transition: transform 160ms cubic-bezier(0.2, 0, 0, 1)`. The `data-state` attribute is already set by Radix.Trigger — no additional wiring.
- **Item highlight:** 120ms bg/color fade (from the CSS section). No slide or scale — Linear/Vercel restraint.
- **Submenu chevron:** no rotation. Sub-menus open on hover; rotation would flicker.
- **Reduced motion:** every keyframe and transition is wrapped so `@media (prefers-reduced-motion: reduce)` disables the animation. The menu still opens instantly.

### Trigger ergonomics

`DropdownMenuTriggerButton` (new) wraps `Button` with a chevron slot:

```tsx
<DropdownMenu>
  <DropdownMenuTriggerButton variant="outline">Actions</DropdownMenuTriggerButton>
  <DropdownMenuContent>…</DropdownMenuContent>
</DropdownMenu>
```

Internally: `<Radix.Trigger asChild><Button {...rest}>{children}<ChevronDown className={chevron} /></Button></Radix.Trigger>`. Accepts every prop `Button` does. For custom triggers, `DropdownMenuTrigger` (the Radix slot) remains exported.

All DropdownMenu stories migrate from `<Button>Actions ▾</Button>` to `<DropdownMenuTriggerButton>Actions</DropdownMenuTriggerButton>`.

## Cross-component reach

Refactor applies to:

| Component | Treatment |
|---|---|
| `DropdownMenu` | Refactored onto the kit. Gains `DropdownMenuTriggerButton`. Items gain `icon` / `description` / `variant`. |
| `ContextMenu` | Refactored onto the kit. Items gain `icon` / `description` / `variant`. No `TriggerButton` (right-click invocation). |
| `MenuBar` | Refactored onto the kit. Items gain `icon` / `description` / `variant`. `MenuBar` (Root) and `MenuBarTrigger` retain their unique wrappers. |

All three automatically inherit CSS polish and cursor changes since they already share `menu.css.ts`.

## Testing

- Existing tests (`DropdownMenu.test.tsx`, `ContextMenu.test.tsx`, `MenuBar.test.tsx`) pass unchanged — DOM semantics and ARIA roles are preserved.
- **New kit tests** — one unit test per kit primitive verifying: (a) `icon` renders in the leading slot; (b) `description` renders with the description style and reads as the accessible description; (c) `variant="danger"` sets `data-variant="danger"` on the item element.
- **Trigger test** — verify `DropdownMenuTriggerButton` chevron receives `data-state="open"` when the menu opens (via Radix's attribute).

No new visual-regression tooling.

## Files touched

**New:**
- `packages/react/src/overlay/shared/menuIcons.tsx`
- `packages/react/src/overlay/shared/menuItemContent.tsx`
- `packages/react/src/overlay/shared/createMenuKit.ts`
- `packages/react/src/overlay/shared/createMenuKit.css.ts` (chevron transition, description style, leading slot)

**Modified:**
- `packages/react/src/overlay/shared/menu.css.ts` — shadow, padding, cursor, kbd chip, transform-origin, reduced-motion, danger variant, description style.
- `packages/react/src/overlay/DropdownMenu/DropdownMenu.tsx` — becomes thin kit binding + exports `DropdownMenuTriggerButton`.
- `packages/react/src/overlay/ContextMenu/ContextMenu.tsx` — thin kit binding.
- `packages/react/src/overlay/MenuBar/MenuBar.tsx` — thin kit binding (keeps `MenuBar` Root and `MenuBarTrigger`).
- `packages/react/src/overlay/DropdownMenu/DropdownMenu.stories.tsx` — use `DropdownMenuTriggerButton`; demonstrate `icon` / `description` / `variant` props.
- `packages/react/src/overlay/ContextMenu/ContextMenu.stories.tsx` — demonstrate new item props.
- `packages/react/src/overlay/MenuBar/MenuBar.stories.tsx` — demonstrate new item props.
- `packages/react/src/overlay/__tests__/*.test.tsx` — add kit-behavior assertions.

## Risks and mitigations

- **Type preservation across factory:** generic `createMenuKit<N>` must infer the Radix namespace so returned components stay typed against their concrete Radix primitive. Mitigation: factory uses `typeof Radix.Item` etc. on the namespace parameter; verified by compiling with `strict`.
- **`data-variant` attribute collision:** Radix sets several `data-*` attrs. `data-variant` is not among them (checked). Reserved for our use.
- **Tree-shaking:** each public file's thin binding consumes the full kit. In practice every app using DropdownMenu pulls in all of DropdownMenu's primitives regardless — no regression, but no improvement either.
- **Radix namespace drift:** if a future Radix major version diverges the three menu APIs, the factory may need widening. Mitigation: the kit's type surface is internal; breaking changes stay contained to the factory's generic bound.
