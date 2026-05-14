# ColorPicker redesign — design

**Date:** 2026-05-14
**Branch:** `claude/colorpicker-redesign`
**Package:** `@cynosure/react`
**Component:** `forms/ColorPicker`

## Problem

The current `ColorPicker` reads as a generic React-Aria stack: undifferentiated rectangles, weak visual hierarchy, and chrome that doesn't survive a theme swap. Specific issues:

- **Theme breakage** — slider/area thumbs use `border: 2px solid white`; in dark or brand themes the thumb halo disappears or clashes. The `field` and `triggerButton` rely on `border.default`/`border.strong` swaps but the thumb does not.
- **Generic visual** — the popover body is "area, slider, toggle, cells, swatches" in a flat stack with no entry point or focal element. Nothing tells you which colour is currently selected without parsing the cells.
- **Flat hierarchy** — format toolbar, channel cells, and swatches all weigh the same; the swatch grid is unlabelled and the "+" affordance floats outside the row.
- **Trigger ambiguity** — the trigger button always renders the label slot; there is no first-class icon-only form.

## Goals

1. Give the picker a distinctive Cynosure identity (preview-first composition) that holds together across the full token set.
2. Restyle/rebuild internals while **keeping the public API stable** — same props (`label`, `size`, `variant`, `alpha`, `eyedropper`, `swatches`, `onSwatchesChange`, `maxSwatches`, `defaultFormat`, `children`).
3. Cover every surface: popover trigger + panel, inline panel, channel cells / format toolbar, saved-swatches block.
4. All visuals driven by `vars.color.*`, `vars.radius.*`, `vars.space.*`, `vars.shadow.*` — no hardcoded greys/whites/blues.

## Non-goals

- Changing the public prop surface.
- Switching off React-Aria Components for the area/slider primitives.
- Adding a presets API or palette generator (separate work).
- Redesigning the `Popover` shell — only the picker's own chrome.

## Design overview

The new panel is composed of four bands, top to bottom, separated by spacing rather than rules (except for the swatches divider):

```
┌──────────────────────────────────┐
│  HERO  ▢  #6C8CFF                │  preview chip on checker + hex + format readout
│        rgb 108·140·255           │
├──────────────────────────────────┤
│  AREA  [HSB picker, rounded]     │
│  HUE   ▬▬▬●▬▬▬▬                  │
│  ALPHA ▬▬▬▬▬●▬▬   (if alpha)    │
├──────────────────────────────────┤
│  TOOL  [HEX|RGB|HSL]  ⌖  ⎘       │  format toggle + eyedropper + copy
│  CELL  ┌───┐ ┌───┐ ┌───┐         │  channel cells (1 / 3 / 4 cols)
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
│  SAVED COLOURS                   │  uppercase label
│  ■ ■ ■ ■ ■ ■ +                   │  tiles + inline save tile
└──────────────────────────────────┘
```

The hero strip is the new focal element. It pulls the current colour out of the area into a labelled chip with the format-aware readout so the user can verify their pick without reading the cells.

### Anatomy

| Slot | Element | Notes |
|---|---|---|
| Hero strip | `<div role="presentation">` | preview chip + readout, on `background.muted` surface |
| Hero chip | RAC `ColorSwatch` | sits on checker (transparency reveal), `radius.md` |
| Hero hex | `<span>` | `font.body.md`, weight 600, tabular figures |
| Hero readout | `<span>` | secondary, `foreground.muted`, format-aware text |
| Area | RAC `ColorArea` + `ColorThumb` | `radius.md`, full panel width |
| Hue slider | RAC `ColorSlider` | `radius.full`, surface-coloured thumb |
| Alpha slider | RAC `ColorSlider` | rendered if `alpha`, checker beneath |
| Format toggle | Cynosure `ToggleGroup` | `variant="outline"`, `size="sm"`, `attached` |
| Eyedropper | Cynosure `IconButton` | `variant="ghost"`, hover wash from `background.muted` |
| Copy | Cynosure `IconButton` | swaps to ✓ for 1.2s after click |
| Channel cells | Custom (uses Input multi-well anatomy) | unchanged behaviour, restyled |
| Swatches section | `<fieldset>` | divider above, uppercase label "Saved colors · N of MAX" |
| Swatch tile | `<button>` + RAC `ColorSwatch` | `radius.sm`, active = `accent.solid` border + `accent.ring` shadow |
| Save tile | `<button>` | `+` glyph, dashed `border.default`, sits inside grid |
| Popover trigger | RAC `Button` | swatch + optional label; icon-only when `label` is omitted |

### Composition primitives

Layout uses Cynosure `Stack` and `Inline` (from `primitives/layout`) instead of bespoke flex declarations in `ColorPicker.css.ts`. The four bands become three `Stack` children at gap `3` (hero, area+sliders+toolbar+cells grouped at gap `3`, swatches). This shrinks `ColorPicker.css.ts` to per-element styles only.

### Token map (replaces hardcoded values)

| Old | New |
|---|---|
| `border: 2px solid white` (thumbs) | `border: 2px solid ${vars.color.background.surface}` |
| `box-shadow: 0 0 0 1px ${border.default}` (thumb halo) | `box-shadow: 0 0 0 1px ${vars.color.border.strong}` |
| Hardcoded `8px`, `12px` paddings | `vars.space.2`, `vars.space.3` |
| Bespoke hover (`borderColor: border.strong`) on icon buttons | hover wash `background.muted` via `IconButton variant="ghost"` |
| `border.focus` + `accent.ring` ad-hoc per element | shared `focusRing` mixin (new in `forms/shared/focusRing.css.ts`) |

The hero strip uses `background.muted` with a `1px solid border.subtle` so it reads as a recessed panel inside the popover surface.

### Size system

Three sizes, all driven by `styleVariants` keyed off `ColorPickerSize`:

| Token | sm | md | lg |
|---|---|---|---|
| Panel width | 15rem | 18rem | 22rem |
| Padding | `space.3` | `space.3` | `space.4` |
| Outer gap | `space.2` | `space.3` | `space.3` |
| Hero chip | 2rem | 2.375rem | 2.75rem |
| Hero hex font | `font.body.sm` | `font.body.md` | `font.body.lg` |
| Area height | 8rem | 10rem | 13rem |
| Hue slider height | 0.75rem | 1rem | 1.125rem |
| Alpha slider height | matches hue | matches hue | matches hue |
| Cell height | 1.625rem | 1.875rem | 2.125rem |
| Swatch tile | 1.25rem | 1.5rem | 1.75rem |
| Toggle / IconButton size | `xs` | `sm` | `sm` |

### State & focus

- **Focus-visible** on every interactive element uses a shared visual: `box-shadow: 0 0 0 2px ${accent.ring}` with `border-color: ${accent.solid}` where there's a border. Encoded once in `forms/shared/focusRing.css.ts`.
- **Active swatch** is detected by comparing the current colour's hex (lowercased) to the swatch hex; the active tile gets the same focus visual at rest plus `border-color: accent.solid`.
- **Hero readout** updates as the format toggle changes: `hex` shows `rgb a · b · c`, `rgb` shows `rgb(a, b, c)` (or `rgba(...)`), `hsl` shows `hsl(h°, s%, l%)`. Always derived; never stored.
- **Copy feedback** unchanged from current: swaps icon for 1.2s.

## Components and file changes

### Modified

- `packages/react/src/forms/ColorPicker/ColorPicker.tsx`
  - Public API unchanged.
  - Replace inline `<>` body with composed Stack of Hero / Area+Sliders / Toolbar+Cells / Swatches.
  - Pass `format` and the current `color` down to a new `HeroStrip` component so the readout updates when the toggle changes.
- `packages/react/src/forms/ColorPicker/ColorPicker.css.ts`
  - Rewrite: drop legacy single-`field` style (kept exported only as deprecated re-export; see migration), retitle/regroup variants per band, add `hero*`, remove redundant `formatStack`/`formatToolbar` (move into shared if needed), wire all values through `vars.*`.
- `packages/react/src/forms/ColorPicker/parts/FormatField.tsx`
  - No behavioural change; restyle via new toolbar tokens. Move copy/eyedropper actions into a tighter `Inline` row.
- `packages/react/src/forms/ColorPicker/parts/SwatchGrid.tsx`
  - Add uppercase label "Saved colors · N of MAX" above the grid.
  - Render the save tile as a styled `<button>` inside the grid (dashed border, `+` glyph) instead of an `IconButton` outside.
  - Active-tile state highlight using `accent.solid` border + `accent.ring`.
- `packages/react/src/forms/ColorPicker/parts/ChannelCells.tsx`
  - Behaviour unchanged.
  - Cell visual aligned with new toolbar (height tokens, glyph weight, `accent.ring` focus-within).

### New

- `packages/react/src/forms/ColorPicker/parts/HeroStrip.tsx`
  - Props: `color: Color`, `format: ColorFormat`, `size: ColorPickerSize`.
  - Renders preview chip (RAC `ColorSwatch` on checker) + bold hex + format-aware secondary readout.
- `packages/react/src/forms/shared/focusRing.css.ts` (if it doesn't already exist — see explore step in plan)
  - Single exported `focusRing` style for reuse across forms.

### Removed / cleaned

- `field` style in `ColorPicker.css.ts` is now unused by the main flow; keep the export for the documented `colorFieldClassName` back-compat consumer but mark `@deprecated` in JSDoc.
- Bespoke hover/focus selector blocks duplicated across `triggerButton`, `swatchTile`, `slider`, `area` thumbs — replaced by `focusRing` mixin reuse.

## Trigger redesign

The popover trigger keeps its API:

- Default `label="Pick a color"` is **unchanged** — preserves the existing public API.
- With a truthy `label`: renders swatch + label text, padded as today, focus ring through `focusRing`.
- **`label={null}`**: renders icon-only — square button, just the swatch, same dims as the swatch. The `aria-label` falls back to `"Pick a color"` so screen-reader behaviour matches the default labelled trigger.
- The current implementation already accepts a `ReactNode` label; the icon-only behaviour is new for `null` and is purely additive.

## Accessibility

- Hero strip is `role="presentation"`; the colour is already announced by the slider/area combo.
- Format toggle keeps existing `aria-label="Color format"`.
- Saved-colours `<fieldset>` keeps `aria-label="Saved colors"`; the visible label is added but not used for the aria attr to avoid double announcement.
- Save tile gets `aria-label="Save current color to swatches"`.
- Focus ring contrast: `accent.ring` already meets 3:1 against `background.surface` per the existing token audit. Re-verify against `background.muted` for the hero chip context.

## Theme adaptation

Verify in Storybook against:

- Default light, default dark.
- Brand themes that swap `accent.*` (the existing demo themes — `cynosure`, `mint`, `ember`).
- High-contrast (if available in the theme set).

Visual check per theme: thumb halo visible, hero chip checker visible, active-swatch ring visible, format toggle active state legible.

## Testing

- Existing tests in `packages/react/src/forms/__tests__/` for ColorPicker — keep passing without modification (API stable).
- Add a render test: `HeroStrip` reads the active format's readout (hex / rgb / hsl / alpha forms).
- Add a render test: when `label` is omitted, trigger has no text node child.
- Add a render test: swatch label shows "Saved colors · N of MAX".
- Visual: update Storybook with stories for `Sizes`, `WithAlpha`, `SavedSwatches`, `IconOnlyTrigger`, `DarkTheme` (using theme decorator).

## Migration / back-compat

- `colorFieldClassName` re-export retained, marked `@deprecated` — consumers passing custom `children` keep working.
- No public-API breakage. `label={null}` is a new opt-in for icon-only triggers; the default stays `"Pick a color"`.

## Risks

- **Hero readout text length** at `size="sm"` with `rgba(255, 255, 255, 0.70)` may overflow the chip's flex sibling. Mitigation: `min-width: 0` on the meta column and truncate with ellipsis; only the secondary `.sub` truncates, the hex never does.
- **Two-line hero in sm** if hex + readout don't fit one column. Acceptable — designed to wrap that way.
- **Active-swatch detection** uses lowercased hex comparison. Alpha is not part of the comparison (today's behaviour). Document that swatches are 6-digit hex only.

## Out of scope

- Presets / palette API.
- Custom colour-space (OKLCH/P3) support.
- Drag-to-reorder saved swatches.
- Right-click context menu on swatches.
