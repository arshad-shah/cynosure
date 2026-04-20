# Divider Redesign — Design

## Goal

Improve the `Divider` primitive so it matches the quality bar of MUI5's divider, but smaller and simpler. Today's implementation is visually flat (wrong default color for a thematic rule) and lacks the one feature users reach for most: an inline label.

## Scope

1. **Visual default**: switch the default line color from `border.default` to `border.subtle`.
2. **Label support**: render children inline with rules on either side (`start | center | end` alignment), horizontal orientation only.
3. **Soft edges**: opt-in `soft` prop that fades the rule toward its ends via `mask-image`.
4. **Tone escape hatch**: `tone` prop (`default | subtle`) so callers can still pick the stronger `border.default` when needed.
5. **Storybook rewrite**: replace current stories with a tighter set that actually shows the component off.

Out of scope: vertical labels, inset/middle margin presets (callers already have `spacing`/`length`), gradient colors beyond the soft-edge mask.

## API

```ts
export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  thickness?: '1' | '2';
  length?: LengthValue | 'full' | 'auto' | 'fit' | 'screen' | 'prose' | SpaceToken;
  spacing?: SpaceToken;

  // NEW
  tone?: 'default' | 'subtle';            // default: 'subtle'
  soft?: boolean;                          // default: false
  children?: ReactNode;                    // label content; horizontal only
  labelAlign?: 'start' | 'center' | 'end'; // default: 'center'; ignored without children

  decorative?: boolean;
  className?: string;
  style?: CSSProperties;
}
```

**Default color change**: the default `tone` is `subtle`, meaning the out-of-the-box divider becomes softer. Callers who relied on the stronger line pass `tone="default"`. This is a visual-only breaking change.

**Label + vertical**: if `children` is provided with `orientation="vertical"`, we ignore `children` and log a dev-mode warning. Vertical labels are rare and ugly; keeping them out keeps the CSS small.

## Rendering

### Without `children` (unchanged)

Render `<hr>` exactly as today. Accessibility behavior unchanged (`role="presentation"` + `aria-hidden` when decorative; `role="separator"` + `aria-orientation` otherwise).

### With `children`

Render:

```html
<div role="separator" aria-orientation="horizontal" class="...">
  <span class="label">{children}</span>
</div>
```

Rules drawn as `::before` and `::after` pseudo-elements on the container. No extra wrapper DOM.

Layout: flex row, `align-items: center`. The pseudo-rules get `flex: 1 1 0` (adjusted per `labelAlign`). Label gets inline padding (token `2`) so the rule doesn't kiss the text.

`labelAlign`:
- `center` (default): `::before` flex 1, `::after` flex 1
- `start`: `::before` fixed small width (space token `4`), `::after` flex 1
- `end`: mirror of `start`

When `decorative` is `true` with children, use `role="presentation"` + `aria-hidden="true"` on the container.

### Soft mode

Single CSS rule on the line (both `<hr>` and the `::before`/`::after` pseudo-rules):

```css
mask-image: linear-gradient(to right, transparent, #000 12%, #000 88%, transparent);
```

For vertical orientation, direction becomes `to bottom`. `-webkit-mask-image` fallback included.

## CSS structure (Divider.css.ts)

Keep existing exports. Add:

- `dividerTone` — recipe/style keyed on `tone` prop → sets `color` to the appropriate token
- `dividerSoft` — applies the mask-image (two variants for orientation via selector composition with `dividerHorizontal` / `dividerVertical`)
- `dividerLabeled` — container styles (flex, align-items, `::before`/`::after` rules using `currentColor` + `borderTopStyle` from variant)
- `dividerLabelStart` / `dividerLabelCenter` / `dividerLabelEnd` — flex-basis for the pseudo-rules
- `dividerLabelText` — inline padding + line-height reset for the label span

The label container re-uses `dividerSolid` / `dividerDashed` / `dividerDotted` to drive the rule style on the pseudo-elements (via `currentColor` borders).

## Accessibility

- `<hr>` path unchanged.
- Labeled path: container is `role="separator"` with `aria-orientation="horizontal"` when non-decorative; `role="presentation"` + `aria-hidden="true"` when decorative. The label text is still readable in the DOM when decorative (aria-hidden hides from AT, which is the intended behavior for purely visual rules).

## Storybook rewrite

Replace `Divider.stories.tsx` with these stories in order:

1. **Playground** — all controls including new `tone`, `soft`, `labelAlign`; `children` as a text arg.
2. **Variants** — a clean grid: solid / dashed / dotted × thickness 1/2.
3. **Tone & soft edges** — four rows: tone subtle, tone default, soft on subtle, soft + dashed.
4. **With label** — three rows showing `labelAlign` start / center / end, plus one row with an icon + text label.
5. **Vertical** — stat row (reuse existing `StatRow` example, cleaned up).
6. **In context** — card header + menu (reuse existing, tightened).

Drop `OrientationDemo` and `SemanticVsDecorative` as dedicated stories. The `decorative` prop is still documented via argTypes.

## Tests

Update `Divider.test.tsx`:
- Existing assertions stay.
- Add: renders `<hr>` when no children; renders `<div role="separator">` with children; children + `labelAlign` applies the right class; `tone="default"` vs `tone="subtle"` toggle the color style; `soft` adds the mask class; children with `orientation="vertical"` warns in dev and does not render the label.

## Migration notes

- Consumers who want the old default line visibility: pass `tone="default"`.
- No other breaking changes.
