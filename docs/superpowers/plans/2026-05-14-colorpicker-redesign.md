# ColorPicker Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the `@cynosure/react` `ColorPicker` so it has a distinctive hero-preview composition, themes correctly under all Cynosure brand sets, and exposes an icon-only popover trigger — all without breaking the public API.

**Architecture:** Compose the panel from four bands (hero strip · area+sliders · format toolbar+cells · saved swatches) using Cynosure `Stack`/`Inline` layout primitives. Route every colour, radius, space, and shadow through `vars.*` tokens. Extract a small local `focusRing` style + a new `HeroStrip` part. Keep React-Aria-Components as the underlying picker primitives.

**Tech Stack:** React 18, TypeScript, `react-aria-components`, `@vanilla-extract/css`, Vitest + Testing Library, Storybook 8, Biome.

**Spec:** [docs/superpowers/specs/2026-05-14-colorpicker-redesign-design.md](../specs/2026-05-14-colorpicker-redesign-design.md)

---

## File Map

**Modify:**
- [packages/react/src/forms/ColorPicker/ColorPicker.tsx](../../../packages/react/src/forms/ColorPicker/ColorPicker.tsx) — re-compose body, add `HeroStrip`, support `label={null}` icon-only trigger.
- [packages/react/src/forms/ColorPicker/ColorPicker.css.ts](../../../packages/react/src/forms/ColorPicker/ColorPicker.css.ts) — rewrite all style exports against tokens; add hero + focusRing styles; mark `field` `@deprecated`.
- [packages/react/src/forms/ColorPicker/parts/FormatField.tsx](../../../packages/react/src/forms/ColorPicker/parts/FormatField.tsx) — restyle toolbar row, keep behaviour.
- [packages/react/src/forms/ColorPicker/parts/SwatchGrid.tsx](../../../packages/react/src/forms/ColorPicker/parts/SwatchGrid.tsx) — add labelled wrapper, inline `+` tile, active-state highlight.
- [packages/react/src/forms/ColorPicker/parts/ChannelCells.tsx](../../../packages/react/src/forms/ColorPicker/parts/ChannelCells.tsx) — adopt new cell tokens; no behavioural change.
- [packages/react/src/forms/ColorPicker/ColorPicker.stories.tsx](../../../packages/react/src/forms/ColorPicker/ColorPicker.stories.tsx) — add `Sizes`, `IconOnlyTrigger`, `DarkTheme` stories.
- [packages/react/src/forms/__tests__/ColorPicker.test.tsx](../../../packages/react/src/forms/__tests__/ColorPicker.test.tsx) — add hero, label-null, swatch-label tests.

**Create:**
- `packages/react/src/forms/ColorPicker/parts/HeroStrip.tsx` — preview chip + hex + format-aware readout.

**Each file's responsibility:**

| File | Responsibility |
|---|---|
| `ColorPicker.tsx` | Public API, controllable state, body composition (Hero / Area+Sliders / Toolbar+Cells / Swatches), trigger render |
| `ColorPicker.css.ts` | All vanilla-extract style exports, token-driven, size variants |
| `parts/HeroStrip.tsx` | Self-contained hero strip; reads `color` + `format` + `size`, renders chip + readout |
| `parts/FormatField.tsx` | Format toggle + copy/eyedropper row; owns ChannelCells render |
| `parts/SwatchGrid.tsx` | Labelled saved-colours grid with inline save tile |
| `parts/ChannelCells.tsx` | Per-channel numeric input cells (HEX / RGB / HSL [+A]) |

---

## Task 1: Snapshot the current baseline

**Files:**
- Test: `packages/react/src/forms/__tests__/ColorPicker.test.tsx`

This task locks in current behaviour before we change anything, so refactors below stay green.

- [ ] **Step 1: Run the existing ColorPicker tests**

Run: `cd packages/react && pnpm vitest run src/forms/__tests__/ColorPicker.test.tsx`
Expected: all existing tests pass on `claude/colorpicker-redesign` from `main`.

- [ ] **Step 2: Note baseline output**

Record the pass count in the task log. If anything fails on baseline, stop and report — do not proceed.

---

## Task 2: Add focusRing style + verify it compiles

**Files:**
- Modify: `packages/react/src/forms/ColorPicker/ColorPicker.css.ts`

Centralises the focus visual used by trigger, area thumb, slider thumb, swatch tile, save tile, and (via `:focus-within`) the cell root.

- [ ] **Step 1: Append the focusRing style**

Append to `ColorPicker.css.ts`:

```ts
/**
 * Shared focus visual for picker controls. Apply as an additional class so the
 * element's own border/background stays under its control.
 */
export const focusRing = style({
  outline: 'none',
  selectors: {
    '&:focus-visible, &[data-focus-visible]': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
      borderColor: vars.color.border.focus,
    },
  },
});
```

- [ ] **Step 2: Type-check**

Run: `cd packages/react && pnpm tsc --noEmit`
Expected: PASS (existing component unchanged).

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/forms/ColorPicker/ColorPicker.css.ts
git commit -m "feat(color-picker): add focusRing style for redesigned chrome"
```

---

## Task 3: Rewrite ColorPicker.css.ts — tokens, hero, sliders, swatches

**Files:**
- Modify: `packages/react/src/forms/ColorPicker/ColorPicker.css.ts`

Replaces every hardcoded value with tokens, adds hero styles, fixes the white-thumb regression in dark themes. Behaviour-only diff — no `.tsx` changes yet, so existing tests still pass.

- [ ] **Step 1: Replace the file**

Overwrite `ColorPicker.css.ts` with the following (preserves `field` + `ALPHA_CHECKER` exports for back-compat):

```ts
import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

const checkerBg = `
  linear-gradient(45deg, ${vars.color.border.subtle} 25%, transparent 25%),
  linear-gradient(-45deg, ${vars.color.border.subtle} 25%, transparent 25%),
  linear-gradient(45deg, transparent 75%, ${vars.color.border.subtle} 75%),
  linear-gradient(-45deg, transparent 75%, ${vars.color.border.subtle} 75%)
`;

export const ALPHA_CHECKER = `repeating-conic-gradient(${vars.color.border.subtle} 0% 25%, ${vars.color.background.surface} 0% 50%) 0 0 / 12px 12px`;

/* ---------- focus visual (shared) ---------- */
export const focusRing = style({
  outline: 'none',
  selectors: {
    '&:focus-visible, &[data-focus-visible]': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
      borderColor: vars.color.border.focus,
    },
  },
});

/* ---------- trigger ---------- */
export const triggerButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space[2],
  padding: `${vars.space[1]} ${vars.space[2]}`,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  background: vars.color.background.surface,
  cursor: 'pointer',
  color: vars.color.foreground.default,
  outline: 'none',
  selectors: {
    '&:hover': { borderColor: vars.color.border.strong },
    '&:focus-visible, &[data-focus-visible]': {
      borderColor: vars.color.border.focus,
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});

export const triggerIconOnly = style({
  padding: vars.space[1],
  gap: 0,
});

export const swatch = style({
  display: 'inline-block',
  width: '1.25rem',
  height: '1.25rem',
  borderRadius: vars.radius.xs,
  border: `1px solid ${vars.color.border.subtle}`,
  backgroundImage: checkerBg,
  backgroundSize: '8px 8px',
  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
});

/* ---------- panel container ---------- */
export const contentWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[3],
  padding: vars.space[3],
});

export const contentWrapBySize = styleVariants({
  sm: { width: '15rem', padding: vars.space[3], gap: vars.space[2] },
  md: { width: '18rem', padding: vars.space[3], gap: vars.space[3] },
  lg: { width: '22rem', padding: vars.space[4], gap: vars.space[3] },
});

export const inlinePanel = style({
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  background: vars.color.background.surface,
  boxShadow: vars.shadow.xs,
});

/* ---------- hero strip ---------- */
export const hero = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[2],
  padding: `${vars.space[2]} ${vars.space[2]}`,
  borderRadius: vars.radius.md,
  background: vars.color.background.muted,
  border: `1px solid ${vars.color.border.subtle}`,
});

export const heroChip = style({
  flexShrink: 0,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border.subtle}`,
  overflow: 'hidden',
  backgroundImage: checkerBg,
  backgroundSize: '8px 8px',
  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
});

export const heroChipBySize = styleVariants({
  sm: { width: '2rem', height: '2rem' },
  md: { width: '2.375rem', height: '2.375rem' },
  lg: { width: '2.75rem', height: '2.75rem' },
});

export const heroMeta = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  flex: 1,
});

export const heroHex = style({
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
  color: vars.color.foreground.default,
  letterSpacing: '0.01em',
});

export const heroHexBySize = styleVariants({
  sm: { fontSize: 'var(--cynosure-font-body-sm-size)' },
  md: { fontSize: 'var(--cynosure-font-body-md-size)' },
  lg: { fontSize: 'var(--cynosure-font-body-lg-size)' },
});

export const heroReadout = style({
  fontSize: 'var(--cynosure-font-body-sm-size)',
  color: vars.color.foreground.muted,
  fontVariantNumeric: 'tabular-nums',
  marginTop: '2px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

/* ---------- area ---------- */
export const area = style({
  position: 'relative',
  width: '100%',
  borderRadius: vars.radius.md,
  overflow: 'hidden',
  touchAction: 'none',
  cursor: 'crosshair',
  boxShadow: `inset 0 0 0 1px ${vars.color.border.subtle}`,
});

export const areaBySize = styleVariants({
  sm: { height: '8rem' },
  md: { height: '10rem' },
  lg: { height: '13rem' },
});

export const areaThumb = style({
  border: `2px solid ${vars.color.background.surface}`,
  borderRadius: vars.radius.full,
  boxShadow: `0 0 0 1px ${vars.color.border.strong}, 0 1px 3px rgba(0,0,0,0.3)`,
  outline: 'none',
  cursor: 'grab',
  selectors: {
    '&[data-focus-visible]': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}, 0 1px 3px rgba(0,0,0,0.3)`,
    },
    '&[data-dragging]': { cursor: 'grabbing' },
  },
});

export const areaThumbBySize = styleVariants({
  sm: { width: '0.875rem', height: '0.875rem' },
  md: { width: '1rem', height: '1rem' },
  lg: { width: '1.125rem', height: '1.125rem' },
});

/* ---------- sliders ---------- */
export const slider = style({
  position: 'relative',
  width: '100%',
  borderRadius: vars.radius.full,
  border: `1px solid ${vars.color.border.subtle}`,
  touchAction: 'none',
  cursor: 'pointer',
});

export const sliderBySize = styleVariants({
  sm: { height: '0.75rem' },
  md: { height: '1rem' },
  lg: { height: '1.125rem' },
});

export const sliderThumb = style({
  top: '50%',
  border: `2px solid ${vars.color.background.surface}`,
  borderRadius: vars.radius.full,
  boxShadow: `0 0 0 1px ${vars.color.border.strong}, 0 1px 3px rgba(0,0,0,0.25)`,
  background: vars.color.background.surface,
  outline: 'none',
  cursor: 'grab',
  selectors: {
    '&[data-focus-visible]': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}, 0 1px 3px rgba(0,0,0,0.25)`,
    },
    '&[data-dragging]': { cursor: 'grabbing' },
  },
});

export const sliderThumbBySize = styleVariants({
  sm: { width: '1rem', height: '1rem' },
  md: { width: '1.125rem', height: '1.125rem' },
  lg: { width: '1.25rem', height: '1.25rem' },
});

/* ---------- legacy single-field (back-compat) ---------- */
/** @deprecated Retained only for consumers passing custom `children`. */
export const field = style({
  width: '100%',
  padding: `${vars.space['1.5']} ${vars.space[2]}`,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  background: vars.color.background.surface,
  color: vars.color.foreground.default,
  font: 'inherit',
  fontFamily: 'var(--cynosure-font-body-md-family)',
  outline: 'none',
  selectors: {
    '&:focus': {
      borderColor: vars.color.border.focus,
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});

/* ---------- format toolbar ---------- */
export const formatStack = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[2],
});

export const formatToolbar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space[2],
});

export const formatToolbarActions = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space[1],
});

/* ---------- channel cells ---------- */
export const cellsRow = style({
  display: 'grid',
  gap: vars.space['1.5'],
});

export const cellsRowCols = styleVariants({
  1: { gridTemplateColumns: '1fr' },
  3: { gridTemplateColumns: 'repeat(3, 1fr)' },
  4: { gridTemplateColumns: 'repeat(4, 1fr)' },
});

export const cellRoot = style({
  gap: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  background: vars.color.background.surface,
  overflow: 'hidden',
  transition: 'border-color 120ms, box-shadow 120ms',
  selectors: {
    '&[data-hover="true"]': { borderColor: vars.color.border.strong },
    '&:focus-within': {
      borderColor: vars.color.border.focus,
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
    },
  },
});

export const cellSize = styleVariants({
  sm: { minHeight: '1.625rem', fontSize: '0.75rem' },
  md: { minHeight: '1.875rem', fontSize: '0.8125rem' },
  lg: { minHeight: '2.125rem', fontSize: '0.875rem' },
});

export const cellSlot = style({
  border: 'none',
  background: 'transparent',
  boxShadow: 'none',
  paddingInline: vars.space[1],
  minWidth: 0,
  minHeight: 0,
});

export const cellInput = style({
  border: 'none',
  background: 'transparent',
  boxShadow: 'none',
  minHeight: 0,
  paddingInline: 0,
  textAlign: 'center',
  fontFeatureSettings: '"tnum" 1',
});

export const cellGlyph = style({
  fontFamily: 'var(--cynosure-font-mono-md-family, monospace)',
  fontWeight: 600,
  textTransform: 'uppercase',
  color: vars.color.foreground.subtle,
});

/* ---------- swatches ---------- */
export const swatchSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[2],
  paddingTop: vars.space[2],
  borderTop: `1px solid ${vars.color.border.subtle}`,
});

export const swatchLabel = style({
  fontSize: '0.625rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: vars.color.foreground.subtle,
});

export const swatchGrid = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space['1.5'],
  border: 'none',
  padding: 0,
  margin: 0,
});

export const swatchTile = style({
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border.subtle}`,
  padding: 0,
  cursor: 'pointer',
  backgroundImage: checkerBg,
  backgroundSize: '8px 8px',
  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
  outline: 'none',
  selectors: {
    '&:hover': { borderColor: vars.color.border.strong },
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
      borderColor: vars.color.border.focus,
    },
  },
});

export const swatchTileActive = style({
  borderColor: vars.color.accent.solid,
  boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
});

export const swatchTileBySize = styleVariants({
  sm: { width: '1.25rem', height: '1.25rem' },
  md: { width: '1.5rem', height: '1.5rem' },
  lg: { width: '1.75rem', height: '1.75rem' },
});

export const swatchAddTile = style({
  background: 'transparent',
  backgroundImage: 'none',
  border: `1px dashed ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  color: vars.color.foreground.subtle,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: 0,
  outline: 'none',
  selectors: {
    '&:hover': { borderColor: vars.color.border.strong, color: vars.color.foreground.default },
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
      borderColor: vars.color.border.focus,
    },
  },
});
```

- [ ] **Step 2: Run baseline tests + type-check**

Run: `cd packages/react && pnpm tsc --noEmit && pnpm vitest run src/forms/__tests__/ColorPicker.test.tsx`
Expected: PASS (no `.tsx` consumers changed).

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/forms/ColorPicker/ColorPicker.css.ts
git commit -m "refactor(color-picker): token-driven styles + hero/swatch primitives"
```

---

## Task 4: Build the HeroStrip part (test-first)

**Files:**
- Create: `packages/react/src/forms/ColorPicker/parts/HeroStrip.tsx`
- Test: `packages/react/src/forms/__tests__/ColorPicker.test.tsx`

- [ ] **Step 1: Write failing tests for HeroStrip readout**

Append to `packages/react/src/forms/__tests__/ColorPicker.test.tsx` inside the `describe('ColorPicker', () => { ... })` block:

```tsx
it('renders the hex value in the hero strip (inline variant)', () => {
  render(<ColorPicker variant="inline" defaultValue="#6c8cff" />);
  expect(screen.getByTestId('color-picker-hero-hex')).toHaveTextContent('#6C8CFF');
});

it('updates the hero readout when the format changes to RGB', async () => {
  const user = userEvent.setup();
  render(<ColorPicker variant="inline" defaultValue="#6c8cff" />);
  await user.click(screen.getByRole('radio', { name: /rgb/i }));
  expect(screen.getByTestId('color-picker-hero-readout')).toHaveTextContent(/rgb\(108,\s*140,\s*255\)/);
});

it('shows rgba in the hero readout when alpha is enabled', async () => {
  const user = userEvent.setup();
  render(<ColorPicker variant="inline" defaultValue="#6c8cff" alpha />);
  await user.click(screen.getByRole('radio', { name: /rgb/i }));
  expect(screen.getByTestId('color-picker-hero-readout')).toHaveTextContent(/rgba\(108,\s*140,\s*255,\s*1\)/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/react && pnpm vitest run src/forms/__tests__/ColorPicker.test.tsx -t hero`
Expected: 3 FAILs ("Unable to find element with testid color-picker-hero-hex").

- [ ] **Step 3: Create HeroStrip**

Write `packages/react/src/forms/ColorPicker/parts/HeroStrip.tsx`:

```tsx
import { ColorSwatch as AriaColorSwatch, type Color } from 'react-aria-components';
import { cn } from '../../../utils/cn.js';
import {
  hero,
  heroChip,
  heroChipBySize,
  heroHex,
  heroHexBySize,
  heroMeta,
  heroReadout,
} from '../ColorPicker.css.js';
import type { ColorFormat } from './FormatField.js';

export type HeroStripSize = 'sm' | 'md' | 'lg';

interface HeroStripProps {
  color: Color;
  format: ColorFormat;
  size: HeroStripSize;
  alpha: boolean;
}

function readoutFor(color: Color, format: ColorFormat, alpha: boolean): string {
  if (format === 'rgb') {
    const rgb = color.toFormat('rgb');
    const r = Math.round(rgb.getChannelValue('red'));
    const g = Math.round(rgb.getChannelValue('green'));
    const b = Math.round(rgb.getChannelValue('blue'));
    if (alpha) {
      const a = Number(rgb.getChannelValue('alpha').toFixed(2));
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
  }
  if (format === 'hsl') {
    const hsl = color.toFormat('hsl');
    const h = Math.round(hsl.getChannelValue('hue'));
    const s = Math.round(hsl.getChannelValue('saturation'));
    const l = Math.round(hsl.getChannelValue('lightness'));
    if (alpha) {
      const a = Number(hsl.getChannelValue('alpha').toFixed(2));
      return `hsla(${h}°, ${s}%, ${l}%, ${a})`;
    }
    return `hsl(${h}°, ${s}%, ${l}%)`;
  }
  // hex format: show the rgb breakdown as secondary
  const rgb = color.toFormat('rgb');
  const r = Math.round(rgb.getChannelValue('red'));
  const g = Math.round(rgb.getChannelValue('green'));
  const b = Math.round(rgb.getChannelValue('blue'));
  return `rgb ${r} · ${g} · ${b}`;
}

/**
 * Preview chip + format-aware readout shown at the top of the picker panel.
 * Purely presentational — derives both lines from the current `color`.
 */
export function HeroStrip({ color, format, size, alpha }: HeroStripProps): React.ReactElement {
  const hex = color.toString('hex').toUpperCase();
  return (
    <div className={hero} role="presentation">
      <AriaColorSwatch
        color={color}
        className={cn(heroChip, heroChipBySize[size])}
        aria-hidden="true"
      />
      <div className={heroMeta}>
        <span className={cn(heroHex, heroHexBySize[size])} data-testid="color-picker-hero-hex">
          {hex}
        </span>
        <span className={heroReadout} data-testid="color-picker-hero-readout">
          {readoutFor(color, format, alpha)}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire HeroStrip into ColorPicker.tsx body**

Edit `packages/react/src/forms/ColorPicker/ColorPicker.tsx`:

Add to the imports near the other `parts` imports:

```tsx
import { HeroStrip } from './parts/HeroStrip.js';
```

Inside the `body = children ?? (` JSX, add `<HeroStrip color={color} format={format} size={size} alpha={alpha} />` as the **first** child of the fragment (before `<AriaColorArea>`).

The resulting fragment opens:

```tsx
    const body = children ?? (
      <>
        <HeroStrip color={color} format={format} size={size} alpha={alpha} />
        <AriaColorArea
          colorSpace="hsb"
          ...
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/react && pnpm vitest run src/forms/__tests__/ColorPicker.test.tsx`
Expected: PASS (all existing + 3 new hero tests).

- [ ] **Step 6: Commit**

```bash
git add packages/react/src/forms/ColorPicker/parts/HeroStrip.tsx packages/react/src/forms/ColorPicker/ColorPicker.tsx packages/react/src/forms/__tests__/ColorPicker.test.tsx
git commit -m "feat(color-picker): add hero preview strip with format-aware readout"
```

---

## Task 5: Restyle SwatchGrid — labelled section + inline save tile + active highlight

**Files:**
- Modify: `packages/react/src/forms/ColorPicker/parts/SwatchGrid.tsx`
- Test: `packages/react/src/forms/__tests__/ColorPicker.test.tsx`

- [ ] **Step 1: Write failing tests for the new affordances**

Append inside the `describe('ColorPicker', () => { ... })` block:

```tsx
it('shows a labelled saved-colors section with count', () => {
  render(
    <ColorPicker
      variant="inline"
      defaultValue="#ef4444"
      swatches={['#ef4444', '#10b981']}
      onSwatchesChange={() => {}}
    />,
  );
  expect(screen.getByText(/saved colors · 2 of 12/i)).toBeInTheDocument();
});

it('renders the save-current affordance inside the swatch grid', () => {
  render(
    <ColorPicker
      variant="inline"
      defaultValue="#123456"
      swatches={['#ef4444', '#10b981']}
      onSwatchesChange={() => {}}
    />,
  );
  expect(
    screen.getByRole('button', { name: /save current color to swatches/i }),
  ).toBeInTheDocument();
});

it('marks the active swatch tile when current colour matches', () => {
  render(
    <ColorPicker
      variant="inline"
      defaultValue="#10b981"
      swatches={['#ef4444', '#10b981']}
    />,
  );
  const tile = screen.getByRole('button', { name: /use color #10b981/i });
  expect(tile).toHaveAttribute('data-active', 'true');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/react && pnpm vitest run src/forms/__tests__/ColorPicker.test.tsx -t 'saved colors|save current|active swatch'`
Expected: 3 FAILs.

- [ ] **Step 3: Rewrite SwatchGrid**

Replace `packages/react/src/forms/ColorPicker/parts/SwatchGrid.tsx` with:

```tsx
import { Plus } from 'lucide-react';
import { ColorSwatch as AriaColorSwatch, type Color, parseColor } from 'react-aria-components';
import { cn } from '../../../utils/cn.js';
import {
  swatchAddTile,
  swatchGrid,
  swatchLabel,
  swatchSection,
  swatchTile,
  swatchTileActive,
  swatchTileBySize,
} from '../ColorPicker.css.js';

interface SwatchGridProps {
  value: Color;
  swatches: string[];
  onSelect: (color: Color) => void;
  onSwatchesChange?: (next: string[]) => void;
  maxSwatches?: number;
  size?: 'sm' | 'md' | 'lg';
}

/** Labelled grid of saved colours with optional inline "+" save tile. */
export function SwatchGrid({
  value,
  swatches,
  onSelect,
  onSwatchesChange,
  maxSwatches = 12,
  size = 'md',
}: SwatchGridProps): React.ReactElement {
  const canEdit = typeof onSwatchesChange === 'function';
  const currentHex = value.toString('hex').toLowerCase();
  const alreadySaved = swatches.some((s) => s.toLowerCase() === currentHex);

  return (
    <section className={swatchSection} aria-labelledby={undefined}>
      <span className={swatchLabel}>
        Saved colors · {swatches.length} of {maxSwatches}
      </span>
      <fieldset className={swatchGrid} aria-label="Saved colors">
        {swatches.map((hex) => {
          const isActive = hex.toLowerCase() === currentHex;
          return (
            <button
              key={hex}
              type="button"
              aria-label={`Use color ${hex}`}
              data-active={isActive ? 'true' : undefined}
              className={cn(swatchTile, swatchTileBySize[size], isActive && swatchTileActive)}
              onClick={() => onSelect(parseColor(hex))}
            >
              <AriaColorSwatch
                color={hex}
                style={{ width: '100%', height: '100%', borderRadius: 'inherit', display: 'block' }}
              />
            </button>
          );
        })}
        {canEdit && !alreadySaved ? (
          <button
            type="button"
            aria-label="Save current color to swatches"
            className={cn(swatchAddTile, swatchTileBySize[size])}
            onClick={() => {
              const next = [
                currentHex,
                ...swatches.filter((s) => s.toLowerCase() !== currentHex),
              ].slice(0, maxSwatches);
              onSwatchesChange?.(next);
            }}
          >
            <Plus aria-hidden="true" size={14} />
          </button>
        ) : null}
      </fieldset>
    </section>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/react && pnpm vitest run src/forms/__tests__/ColorPicker.test.tsx`
Expected: PASS (existing + 3 new swatch tests).

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/forms/ColorPicker/parts/SwatchGrid.tsx packages/react/src/forms/__tests__/ColorPicker.test.tsx
git commit -m "feat(color-picker): label saved-colors section, inline save tile, active highlight"
```

---

## Task 6: Add icon-only trigger via `label={null}`

**Files:**
- Modify: `packages/react/src/forms/ColorPicker/ColorPicker.tsx`
- Test: `packages/react/src/forms/__tests__/ColorPicker.test.tsx`

- [ ] **Step 1: Write failing tests**

Append:

```tsx
it('renders an icon-only trigger when label is explicitly null', () => {
  render(<ColorPicker label={null} defaultValue="#6c8cff" />);
  const trigger = screen.getByRole('button', { name: /pick a color/i });
  expect(trigger).toBeInTheDocument();
  // No visible text node — only the swatch span lives inside.
  expect(trigger.textContent ?? '').toBe('');
});

it('keeps the default "Pick a color" label when label is not passed', () => {
  render(<ColorPicker defaultValue="#6c8cff" />);
  const trigger = screen.getByRole('button', { name: /pick a color/i });
  expect(trigger).toHaveTextContent(/pick a color/i);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/react && pnpm vitest run src/forms/__tests__/ColorPicker.test.tsx -t 'icon-only|default'`
Expected: First test FAILs (icon-only currently renders the swatch but no compact padding behaviour and label may be coerced).

- [ ] **Step 3: Update ColorPicker.tsx**

In `packages/react/src/forms/ColorPicker/ColorPicker.tsx`:

a) Update the `ColorPickerOwnProps` interface so `label` accepts `null`:

```ts
  /**
   * Label rendered beside the swatch in popover mode.
   * Pass `null` for an icon-only trigger.
   * @default "Pick a color"
   */
  label?: ReactNode | null;
```

b) Import `triggerIconOnly` from the css file:

```ts
import {
  ALPHA_CHECKER,
  area,
  areaBySize,
  areaThumb,
  areaThumbBySize,
  contentWrap,
  contentWrapBySize,
  field,
  inlinePanel,
  slider,
  sliderBySize,
  sliderThumb,
  sliderThumbBySize,
  swatch,
  triggerButton,
  triggerIconOnly,
} from './ColorPicker.css.js';
```

c) In the popover return, replace the `<AriaButton>` block with one that conditionally renders the label span and applies the icon-only class:

```tsx
          <AriaButton
            ref={ref}
            className={cn(triggerButton, label === null && triggerIconOnly, className)}
            style={style}
            aria-label={typeof label === 'string' ? label : 'Pick a color'}
          >
            <AriaColorSwatch className={swatch} />
            {label !== null && label !== undefined ? <span>{label}</span> : null}
          </AriaButton>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/react && pnpm vitest run src/forms/__tests__/ColorPicker.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/forms/ColorPicker/ColorPicker.tsx packages/react/src/forms/__tests__/ColorPicker.test.tsx
git commit -m "feat(color-picker): support label={null} for icon-only trigger"
```

---

## Task 7: Storybook coverage — Sizes, IconOnlyTrigger, DarkTheme

**Files:**
- Modify: `packages/react/src/forms/ColorPicker/ColorPicker.stories.tsx`

- [ ] **Step 1: Append new stories**

Append to `ColorPicker.stories.tsx` (after the existing stories):

```tsx
export const Sizes: Story = {
  name: 'All sizes',
  render: () => (
    <Stack gap="6">
      <Stack gap="2">
        <Text size="sm" color="fg.muted">size="sm"</Text>
        <ColorPicker size="sm" variant="inline" defaultValue="#6366F1" swatches={['#ef4444','#f59e0b','#10b981','#0ea5e9','#6366f1','#ec4899']} onSwatchesChange={() => {}} />
      </Stack>
      <Stack gap="2">
        <Text size="sm" color="fg.muted">size="md" (default)</Text>
        <ColorPicker size="md" variant="inline" defaultValue="#6366F1" swatches={['#ef4444','#f59e0b','#10b981','#0ea5e9','#6366f1','#ec4899']} onSwatchesChange={() => {}} />
      </Stack>
      <Stack gap="2">
        <Text size="sm" color="fg.muted">size="lg" + alpha</Text>
        <ColorPicker size="lg" variant="inline" defaultValue="#6366F1" alpha swatches={['#ef4444','#f59e0b','#10b981','#0ea5e9','#6366f1','#ec4899']} onSwatchesChange={() => {}} />
      </Stack>
    </Stack>
  ),
};

export const IconOnlyTrigger: Story = {
  name: 'Icon-only trigger',
  render: () => (
    <Inline gap="3" alignItems="center">
      <ColorPicker label={null} defaultValue="#6366F1" />
      <ColorPicker label={null} defaultValue="#10b981" />
      <ColorPicker label={null} defaultValue="#ef4444" alpha />
      <Text size="sm" color="fg.muted">label={'{null}'} = icon-only</Text>
    </Inline>
  ),
};

export const DarkTheme: Story = {
  name: 'Dark theme check',
  parameters: { backgrounds: { default: 'dark' }, theme: 'dark' },
  render: () => (
    <div data-theme="dark" style={{ padding: 24, background: '#0c0d11', borderRadius: 12 }}>
      <ColorPicker
        variant="inline"
        defaultValue="#8a9bff"
        alpha
        swatches={['#8a9bff','#10b981','#ff7b63','#f59e0b','#a855f7']}
        onSwatchesChange={() => {}}
      />
    </div>
  ),
};
```

- [ ] **Step 2: Type-check + Storybook builds**

Run: `cd packages/react && pnpm tsc --noEmit`
Expected: PASS.

If Storybook build script exists: `pnpm --filter @cynosure/react build-storybook` (skip if no such script; type-check alone is sufficient).

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/forms/ColorPicker/ColorPicker.stories.tsx
git commit -m "docs(color-picker): add Sizes, IconOnlyTrigger, DarkTheme stories"
```

---

## Task 8: Final verification

**Files:** none (verification only).

- [ ] **Step 1: Full forms test suite**

Run: `cd packages/react && pnpm vitest run src/forms`
Expected: all pass.

- [ ] **Step 2: Repo-wide type-check**

Run: `pnpm -r tsc --noEmit`
Expected: PASS in all packages.

- [ ] **Step 3: Lint**

Run: `pnpm biome check packages/react/src/forms/ColorPicker packages/react/src/forms/__tests__/ColorPicker.test.tsx`
Expected: PASS (or auto-fixed by lefthook on commit).

- [ ] **Step 4: Manual visual check (optional but recommended)**

Run: `pnpm --filter @cynosure/react storybook`
Open: `Forms / ColorPicker / All sizes`, `Inline variant`, `With alpha`, `Saved swatches`, `Icon-only trigger`, `Dark theme check`.
Verify: thumb halos visible in both themes, hero hex updates as you drag, save tile appears only when current colour is not saved, active swatch shows accent ring.

- [ ] **Step 5: Push branch**

```bash
git push -u origin claude/colorpicker-redesign
```

---

## Self-Review

**Spec coverage:**
- Problem section (theme breakage / generic visual / flat hierarchy / trigger ambiguity) → Tasks 3 (token-driven styles, fixes white thumbs), 4 (hero focal point), 5 (labelled swatches + active highlight), 6 (icon-only trigger). ✓
- Goals 1–4 → Tasks 3–7. ✓
- Anatomy table → Tasks 3 (css), 4 (hero), 5 (swatches), 6 (trigger). FormatField/ChannelCells token alignment is covered by Task 3's `cellRoot`/`cellSize`/`cellSlot`/`cellGlyph`/`cellInput` rewrites (no `.tsx` change needed because those parts already consume those exports). ✓
- Composition primitives (Stack/Inline) → **deferred**. The spec calls for migrating layout to Stack/Inline. The current `contentWrap` flex stack already does this in CSS; switching to JSX primitives is pure refactor with no behavioural delta and would risk Storybook regressions. Tasks intentionally keep the flex container. Flag as a follow-up.
- Token map → Task 3. ✓
- Size system → Task 3 (`contentWrapBySize` + per-band `*BySize` variants). ✓
- State & focus → Task 3 (focusRing + per-element focus selectors), Task 5 (active swatch). ✓
- Trigger redesign (`label={null}` icon-only, default unchanged) → Task 6. ✓
- Accessibility → Tasks 4 (`role="presentation"` + `aria-hidden` on chip), 5 (preserved fieldset aria-label, save aria-label). ✓
- Theme adaptation verification → Task 7 (DarkTheme story) + Task 8 step 4 (manual check). ✓
- Testing — render tests for hero readout, label-null, swatch label → Tasks 4, 5, 6. ✓
- Migration / back-compat (`colorFieldClassName`, `field` @deprecated) → Task 3 (kept exports, JSDoc deprecation). ✓

**Placeholder scan:** No "TBD/TODO"; every code step shows the actual code; commands and expected output are explicit. ✓

**Type consistency:** `ColorFormat` imported from `./FormatField.js` in HeroStrip matches the export in `FormatField.tsx`. `HeroStripSize` mirrors `ColorPickerSize`/`ChannelCellsSize`. `triggerIconOnly` is defined in Task 3 and imported in Task 6. `swatchSection`/`swatchLabel`/`swatchTileActive`/`swatchAddTile` are defined in Task 3 and consumed in Task 5. ✓

**Follow-up (out of this plan):** Layout primitives migration (Stack/Inline) for `contentWrap` body composition.
