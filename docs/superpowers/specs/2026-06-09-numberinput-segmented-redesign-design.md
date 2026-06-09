# NumberInput — Segmented Redesign

**Date:** 2026-06-09
**Status:** Approved design, pending implementation plan
**Component:** `packages/react/src/forms/NumberInput`
**Branch:** `numberinput-segmented-redesign` (off `main`)

## Motivation

Today's `NumberInput` is a horizontal field with a cramped **vertical ▲/▼ stepper
column** flush to the trailing edge. The stepper targets are small (a ~30px-wide
column split into two half-height buttons), which is poor for touch, and the
layout is visually distinct from the rest of the Cynosure form controls, which
use a **segmented** visual language.

This redesign replaces the stepper column with a **segmented control** —
`[ − ][ value ][ + ]` — three raised segments inside a tinted track. This gives
large, obviously-tappable targets and brings the component into line with the
library's segmented controls.

## Goals

- Replace the vertical stepper column with a horizontal segmented layout.
- Large, touch-friendly tap targets (~44px) at the default size.
- Visual consistency with the library's existing segmented controls and tokens.
- Keep all current capabilities: editable value, `$`/`%` affixes, sizes,
  variants, invalid/disabled/read-only states, and React Aria's locale-correct
  parsing + keyboard support.
- Add touch-oriented interactions: hold-to-repeat, mobile numeric keypad,
  pressed-segment feedback, long-press-to-clear.

## Non-Goals

- No change to the underlying numeric model — we keep React Aria's `NumberField`
  for parsing, formatting, clamping (`minValue`/`maxValue`/`step`), and keyboard
  behavior (↑/↓, PageUp/PageDown, Home/End, wheel).
- No drag/scrub-to-change interaction (was offered, not selected).
- No preset-chips affordance.
- This is a **replacement**, not an additional variant — the old vertical-column
  layout is removed (see Breaking Changes).

## Chosen Direction

**Segmented control (Direction C).** Selected for consistency with the library's
other segmented controls. The segmented `− / value / +` structure is **constant**;
the existing `variant` prop tints the track rather than changing the structure.

### Visual structure

```
┌─────────────────────────────────────────┐  ← track (tinted, padded 4px,
│  ┌─────┐ ┌───────────────────┐ ┌─────┐  │     rounded; focus ring lives here)
│  │  −  │ │   $ 1,250  ▏       │ │  +  │  │
│  └─────┘ └───────────────────┘ └─────┘  │  ← three raised segments
└─────────────────────────────────────────┘
   button     editable value      button
              (affixes inline)
```

- **Track**: tinted background, `1px` border (in `outline`), `4px` padding,
  rounded corners, `4px` gap between segments. The **focus ring** (outset
  box-shadow) is drawn on the track so it surrounds the whole control.
- **− / + segments**: equal-width buttons, raised (surface fill + subtle
  shadow), with their own corner radius. Minimum tap target ~44px tall at `md`.
  Render Lucide `Minus` / `Plus` icons.
- **Value segment**: flexes to fill; raised surface; contains the **editable**
  `<input>` plus inline `prefix`/`suffix` affixes (muted, `tabular-nums` for the
  value). This stays a real text field — users can type.

### Variants (track tinting only)

| `variant`  | Track                                  | Segments                          |
|------------|----------------------------------------|-----------------------------------|
| `outline`  | tinted bg + border (default)           | raised surface + shadow           |
| `filled`   | stronger solid bg, no border           | raised surface                    |
| `ghost`    | transparent track, no border           | flat; surface/shadow on hover only|

### Sizes

`sm` · `md` · `lg`, matching the other form controls. `md` is the default and
targets ~44px button height for touch. `sm`/`lg` scale segment width, height,
radius, and font size proportionally.

### States

- **Focus**: ring on the track (input focus drives it, since the field is
  primary).
- **Invalid** (`invalid` / `isInvalid`): error-colored border/ring + value tint.
- **Disabled** / **Read-only**: dimmed; segments lose their raise; buttons
  disabled. Read-only keeps the value legible and disables steppers.

## Component API

The public API is a **superset** of today's — existing props are preserved so
the change is source-compatible for consumers (only the rendered DOM/visuals
change). Built on `react-aria-components` `NumberField`.

```ts
export interface NumberInputOwnProps extends BaseNumberFieldProps {
  size?: FormControlSize;          // 'sm' | 'md' | 'lg'  (default 'md')
  variant?: FormControlVariant;    // 'outline' | 'filled' | 'ghost' (default 'outline')
  invalid?: boolean;               // mirrors isInvalid
  className?: string;
  style?: CSSProperties;
  prefix?: ReactNode;              // inline, muted, before value
  suffix?: ReactNode;              // inline, muted, after value
  incrementLabel?: string;         // aria-label override for +
  decrementLabel?: string;         // aria-label override for −

  // New (touch behaviors) — all opt-out-able, sensible defaults:
  /** Hold −/+ to repeat with acceleration. @default true */
  holdToStep?: boolean;
  /** Long-press the value segment to clear to empty/min. @default false */
  clearOnLongPress?: boolean;
}
```

`BaseNumberFieldProps` continues to pass through `value`/`defaultValue`/
`onChange`, `minValue`, `maxValue`, `step`, `formatOptions`, `isDisabled`,
`isReadOnly`, etc.

> Open API question for the plan: confirm whether `holdToStep` / `clearOnLongPress`
> are worth exposing as props or should just be built-in defaults with no prop.
> Lean: ship `holdToStep` always-on (no prop), keep `clearOnLongPress` behind a
> prop defaulting to `false`.

## Behavior

1. **Hold-to-repeat + acceleration.** Pressing and holding − or + steps once
   immediately, waits a short delay (~400ms), then repeats on an interval that
   accelerates (e.g. 150ms → 50ms) the longer it's held. Releasing, pointer
   leave, blur, or reaching min/max stops it. Works for mouse, touch, and pen
   (pointer events). If react-aria's stepper buttons already provide continuous
   press, prefer that; otherwise implement a small `useHoldRepeat` hook.
2. **Mobile numeric keypad.** Ensure the value `<input>` advertises the right
   `inputMode` (`decimal` when fractional digits are allowed by `formatOptions`,
   else `numeric`) so phones show the number pad. Verify react-aria's default and
   override only if needed.
3. **Pressed-segment feedback.** − / + segments visibly depress/tint on
   pointer-down (`data-pressed` / `:active`), using `accent.solid` per the token
   guidance. Minimum ~44px tap target at `md`.
4. **Long-press to clear** (`clearOnLongPress`). Long-pressing the value segment
   (~500ms) clears the value (to empty, or to `minValue` if set). Distinct from
   hold-to-repeat, which lives on the − / + buttons. Off by default.

## Accessibility

- The editable value is a real `<input>` exposed by react-aria as
  `role="spinbutton"` with `aria-valuenow/min/max`. Preserve this.
- − / + are real `<button>`s with `aria-label` (`Increment` / `Decrement`,
  overridable via `incrementLabel` / `decrementLabel`); the stepper group stays
  `aria-hidden`-decorated as today only where appropriate — verify the buttons
  themselves remain reachable to AT.
- Keyboard parity with today: ↑/↓ step, PageUp/PageDown large step, Home/End to
  min/max, typing edits the value. Hold-to-repeat is pointer-only; keyboard
  repeat is the OS key-repeat as before.
- Affixes are `aria-hidden` (decorative); the accessible value is the number.
- Focus ring must be visible (`:focus-visible`) and meet contrast.
- Respect `prefers-reduced-motion` for the acceleration/press transitions.

## Implementation Notes

- Reuse the shared `controlSize` / `controlWrapperVariant` vocabulary where it
  still applies; the track replaces `controlWrapperBase`'s single-frame look, so
  expect new `NumberInput.css.ts` exports for the track + segments and removal of
  the `numberInputSteppers*` / `numberInputStepperSize` column styles.
- Tokens: track tint from `color.background.muted` / `border.subtle`; segment
  surface from `color.background.canvas`/elevation; pressed from
  `color.accent.solid`; transitions via `duration.fast`. Respect existing token
  conventions (`accent.solid` not `strong`; no `space['2.5']`).
- Keep the component a single focused file plus its `.css.ts`; the optional
  `useHoldRepeat` hook can live alongside or in `forms/shared` if reused.

## Breaking Changes

- The rendered DOM and CSS class names change. Consumers relying on internal
  NumberInput CSS classes or DOM shape (not the public API) will need updates.
- The vertical-column layout is gone. Visual regression for anyone who depended
  on its exact look.
- Public props are preserved, so typical usage (`<NumberInput value … />`) is
  unaffected. A `patch`/`minor` changeset with a short note is sufficient.

## Testing

- **Stories**: port existing stories (Playground, Variants, Sizes, MinMaxStep,
  Affixes, States, Controlled, InsideFormField) to the new visuals; add a
  hold-to-repeat interaction story and a long-press-to-clear story.
- **Browser tests** (`NumberInput.browser.test.tsx`, mirroring the existing
  pattern): increment/decrement via clicks, arrow keys change value, hold-to-
  repeat changes by >1 over time, min/max clamping disables the right button,
  invalid/disabled rendering, affix rendering, long-press clear (when enabled).
- **Unit tests**: any `useHoldRepeat` timing logic with fake timers.
- Verify `biome`, `tsc --noEmit`, and the size-limit budget for `number-input`.

## Related / Out of Scope for This Doc

This branch (`numberinput-segmented-redesign`) is also the home for **retiring
the `@arshad-shah/cynosure-core` and `@arshad-shah/cynosure-icons` packages**
(deleting the unused passthrough packages, dropping the `cynosure-core`
dependency from `cynosure-react`, and adding deprecation changesets). That work
is tracked separately from this design but lands on the same branch. A prior
attempt lives on the `retire-core-and-icons-packages` branch and PR #116; the
retirement should be re-applied cleanly against current `main` here.

## Open Questions for the Plan

1. Expose `holdToStep` / `clearOnLongPress` as props, or bake them in? (Lean:
   `holdToStep` always-on, `clearOnLongPress` behind an off-by-default prop.)
2. Does react-aria's `NumberField` already give continuous press-and-hold on its
   stepper buttons? If so, drop the custom hook.
3. Exact `ghost` variant treatment for a segmented control (segments flat until
   hover vs always subtly raised).
4. Confirm `inputMode` is correct out of the box from react-aria, or override.
