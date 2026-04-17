# NumberInput redesign

**Status:** approved
**Date:** 2026-04-17
**Package:** `@lumen/react` · `src/forms/NumberInput`

## Summary

Keep the current stacked-stepper shape; re-ground every detail in Lumen tokens. Swap the `▲`/`▼` unicode glyphs for lucide chevrons, widen stepper hit targets, add inline `prefix`/`suffix` slots, and tighten cursor, hover, and divider details so the control reads as flat, token-driven, and coherent with `Input` / `Textarea`.

No new interaction model. No gradients, no custom shadows. Chevron direction (up-top, down-bottom) is unchanged.

## Motivation

- `▲`/`▼` violate the lucide-only icon rule and look noticeably heavier than the rest of the UI.
- Stepper hit targets (`min-width: 1.5rem`) are tight for pointer and terrible for touch.
- No way to show a unit (`px`, `%`, `$`) inline — consumers are working around it with bespoke wrappers.
- Hover/divider colors don't track the shared wrapper cleanly, so the steppers read as a separate component grafted on.
- Cursors don't follow the Lumen cursor rule across all states.

## Scope

**In scope**

- Visual redesign of `NumberInput` in `@lumen/react`.
- New `prefix` and `suffix` props (inline muted text inside the field).
- Stepper sizing, iconography, hover, divider, cursor fixes.
- Story and test updates to cover the new slots and states.

**Out of scope**

- Changing the underlying React Aria `NumberField` behavior (parsing, keyboard handling, wheel, locale).
- A new interaction model (drag-to-scrub, slider hybrid, tri-pane). These were considered and explicitly rejected in favor of a polish pass on the existing shape.
- Touching the shared `controlWrapper*` recipe — it already carries the focus/invalid/disabled/readonly logic and will be reused as-is.

## Design

### Structure

```
<NumberField>                      ← react-aria-components, unchanged
  <Group class="controlWrapper…">  ← shared recipe (outline | filled | ghost)
    <div class="field">
      {prefix && <span class="prefix">{prefix}</span>}
      <Input class="fieldInput" />
      {suffix && <span class="suffix">{suffix}</span>}
    </div>
    <div class="steppers" aria-hidden="true">
      <Button slot="increment"><ChevronUp /></Button>
      <Button slot="decrement"><ChevronDown /></Button>
    </div>
  </Group>
</NumberField>
```

The `field` container is new — it lets `prefix`/`suffix` flank the `<Input>` without the input shrinking when the number grows. `<Input>` keeps `flex: 1; min-width: 0`.

### API

```ts
export interface NumberInputOwnProps extends BaseNumberFieldProps {
  size?: FormControlSize;           // unchanged: 'sm' | 'md' | 'lg'
  variant?: FormControlVariant;     // unchanged: 'outline' | 'filled' | 'ghost'
  invalid?: boolean;                // unchanged
  className?: string;
  style?: CSSProperties;
  prefix?: ReactNode;               // NEW — muted text before the value ($, €, #)
  suffix?: ReactNode;               // NEW — muted text after the value (px, %, kg)
  incrementLabel?: string;          // unchanged
  decrementLabel?: string;          // unchanged
}
```

No breaking changes. Existing consumers keep working.

### Tokens

- **Icons:** `lucide-react` `ChevronUp` / `ChevronDown`. Stroke width `2.4`, size scales with control size (11 / 12 / 14 px).
- **Stepper hover fill:** `vars.color.background.muted` (deeper than today's `background.subtle`, reads cleanly against the recessed well).
- **Stepper active fill:** `vars.color.border.default` for a brief pressed flash.
- **Dividers:** the column-divider and the inter-stepper border both use `vars.color.border.default` — matches the outer hairline, eliminates the seam visible today.
- **Prefix/suffix color:** `vars.color.foreground.muted`, `0.875em`, weight 500.
- **Focus ring:** unchanged — inherited from `controlWrapperBase`.
- **No new color, radius, shadow, or duration tokens introduced.**

### Size scale

Steppers grow with the control. All values are in the existing `controlSize` recipe; the stepper column gets per-size `min-width` overrides:

| size | height | stepper min-width | icon |
|------|--------|-------------------|------|
| sm   | 2rem   | 1.625rem          | 11px |
| md   | 2.5rem | 1.75rem           | 12px |
| lg   | 3rem   | 2rem              | 14px |

### Cursors (per Lumen cursor rule)

- Field: `text` (default for the input; the `field` wrapper also declares `cursor: text` so clicking the prefix/suffix still focuses the input).
- Stepper buttons: `pointer`.
- Wrapper with `data-disabled="true"`: `not-allowed` (inherits from `controlWrapperBase`). Steppers in disabled state also set `cursor: not-allowed`.
- Readonly: native `text` cursor for the field; steppers are non-interactive (RAC handles this) — use default cursor.

### States

All states already live on the shared wrapper via `data-*` attributes. No new state logic. Visual coverage required in stories:

- rest, hover, focus, focus + invalid, invalid (blurred), readonly, disabled.

### Accessibility

- Increment / decrement buttons keep `aria-label` (localizable via `incrementLabel` / `decrementLabel`).
- The `<div class="steppers" aria-hidden="true">` wrapper is preserved — the buttons themselves carry the labels, but the decorative grouping div is hidden.
- `prefix` / `suffix` render inside the `Group` but outside the `<Input>`; screen readers read them as adjacent text. For locale-sensitive units (currency, %), consumers should still set a proper `aria-label` or `<Label>` on the field — documented in the story.
- Focus management is unchanged — RAC owns it.

## File plan

- `packages/react/src/forms/NumberInput/NumberInput.tsx` — add `prefix`/`suffix`, swap glyphs to lucide, restructure to add `field` wrapper.
- `packages/react/src/forms/NumberInput/NumberInput.css.ts` — rewrite: remove obsolete `numberInputGroup`, tune stepper sizes, add `field`/`prefix`/`suffix` styles, per-size stepper overrides, cursor coverage.
- `packages/react/src/forms/NumberInput/NumberInput.stories.tsx` — add stories: sizes, variants, states, with prefix, with suffix, currency example.
- `packages/react/src/forms/__tests__/NumberInput.test.tsx` — add tests: renders prefix, renders suffix, stepper buttons click (already likely covered, confirm), correct cursors on disabled wrapper.

## Testing strategy

- **Unit / RTL:** render with/without `prefix`, with/without `suffix`, click increment/decrement, assert value changes; assert `data-disabled` / `data-invalid` / `data-readonly` propagate.
- **Visual (stories):** one story per size, one per variant, one per state, one per slot combo — mirrors `Input`'s stories.
- **No snapshot tests** — the project does not use them.

## Risks & trade-offs

- **Prefix/suffix vs addons.** The shared recipe already has `controlAddonLeft`/`controlAddonRight` for visually-joined blocks. Adding inline `prefix`/`suffix` to `NumberInput` creates two idioms. Decision: inline slots are the right call here — a unit like `px` is part of the value, not an addon. Addons remain available via `className`-level composition if someone really wants them, but we don't expose them as props on `NumberInput`.
- **Chevrons vs plus/minus.** Chevrons communicate "stack of two actions, each a nudge in a direction." Plus/minus would read better as two separate buttons flanking the field (direction B from brainstorming), which we explicitly rejected. Chevrons stay.
- **Stepper column widths are still narrow.** We're trading mobile ergonomics for compactness. Consumers who need big thumb targets should compose a segmented pattern on top — not this component.
