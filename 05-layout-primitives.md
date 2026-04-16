# Phase 05 — Layout primitives

> **Goal:** Build the eleven layout primitives that are the **only components allowed to render raw HTML**. Every subsequent component composes these. Establish the vanilla-extract styling pattern, the responsive-prop system, and the `as`/`asChild` pattern once and for all.

**Depends on:** Phases 01–04.
**Blocks:** Every component from Phase 06 onwards.

> **This is the most load-bearing phase of the project.** Get the ergonomics, types, and CSS output right here — everything else just leans on it.

---

## The primitives

1. **`Box`** — the atom. Div by default. Takes every layout/space prop.
2. **`Stack`** — vertical flex container with a `gap` prop.
3. **`Inline`** — horizontal flex container with `gap` + wrapping.
4. **`Flex`** — escape-hatch flex container exposing every flex prop.
5. **`Grid`** — CSS Grid container with type-safe `templateColumns`/`templateRows`.
6. **`Center`** — centres its child (both axes).
7. **`Spacer`** — a flex child that grows to fill space.
8. **`Divider`** — `<hr>` with semantic variants (horizontal / vertical).
9. **`AspectRatio`** — maintains a ratio (`16/9`, `1`, etc.).
10. **`Container`** — max-width container with responsive padding.
11. **`Section`** — semantic `<section>` wrapper with vertical rhythm.

**Everything else in the library composes these.** If a Button wants a flex container of an icon and a label, it uses `Inline`. If a Card needs a vertical layout of header/body/footer, it uses `Stack`. No component after Phase 05 is allowed to render a raw `<div>`.

---

## Rule zero: the styling system

Lumen uses **vanilla-extract** for all component CSS. This is the choice and it's final — revisit only in a major version.

### Why vanilla-extract over alternatives

| | vanilla-extract | Panda CSS | StyleX | CSS Modules | Tailwind |
|---|---|---|---|---|---|
| Zero runtime | ✅ | ✅ | ✅ | ✅ | ✅ |
| Type-safe | ✅ | ✅ | ✅ | ⚠️ | ❌ |
| Variant API | ✅ (`recipe`) | ✅ | ❌ | ❌ | via cva |
| Per-component CSS chunks via Vite | ✅ | ✅ | ✅ | ✅ | ❌ (single atomic sheet) |
| Simple mental model | ✅ (writes real CSS) | ❌ (DSL) | ❌ (restrictive) | ✅ | ✅ |
| Works with arbitrary values at build time | ✅ | ✅ | ⚠️ | ✅ | ⚠️ |
| Mature | ✅ | 🟡 | 🟡 | ✅ | ✅ |

We pick **vanilla-extract** because it writes literal CSS inside `.css.ts` files with TS autocomplete on token refs. No runtime. No new DSL. Tiny author surface.

Install:

```bash
pnpm --filter @lumen/react add @vanilla-extract/css @vanilla-extract/recipes
pnpm -w add -D @vanilla-extract/vite-plugin
```

Register the Vite plugin in `vite.config.ts` for both Storybook and Vitest, and in tsup via `esbuild-plugin-vanilla-extract`.

### How tokens map to vanilla-extract

Create `packages/react/src/styles/vars.css.ts`:

```ts
import { createGlobalThemeContract } from '@vanilla-extract/css';

// Build this programmatically from the @lumen/tokens output shape.
// The resulting `vars` object mirrors the token tree with the CSS custom property
// names as string values, giving us TS-autocompleted access to tokens.
export const vars = createGlobalThemeContract(
  {
    color: {
      background: { canvas: '', surface: '', subtle: '', muted: '', raised: '', overlay: '', inverse: '' },
      foreground: { default: '', muted: '', subtle: '', disabled: '', inverse: '', onAccent: '' },
      border:     { default: '', subtle: '', strong: '', focus: '', disabled: '' },
      accent:     { solid: '', solidHover: '', soft: '', ring: '', onSolid: '' },
      // ...
    },
    space: { 0: '', 0.5: '', 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 8: '', 10: '', 12: '', 16: '', 20: '', 24: '', 32: '' },
    radius: { xs: '', sm: '', md: '', lg: '', xl: '', pill: '' },
    font: { /* … */ },
    shadow: { /* … */ },
    duration: { micro: '', short: '', medium: '', long: '' },
    zIndex: { /* … */ },
  },
  (_value, path) => `lumen-${path.join('-')}` // maps to --lumen-color-background-canvas, etc.
);
```

`createGlobalThemeContract` does NOT emit any CSS — it just types the variables. The actual values come from `@lumen/tokens/css`. This means: consumers can style using `vars.color.accent.solid` in a `.css.ts` file and we generate correct `var(--lumen-color-accent-solid)` without runtime overhead.

---

## The shared prop API — responsive, token-aware

Every primitive accepts a common superset of props. Type them once:

```ts
// packages/react/src/primitives/layout/types.ts
import type { vars } from '../../styles/vars.css.js';

type SpaceToken = keyof typeof vars.space;          // '0' | '1' | '2' | …
type RadiusToken = keyof typeof vars.radius;
type ColorToken =
  | `${keyof typeof vars.color.background}.bg`
  | `${keyof typeof vars.color.foreground}.fg`
  | `${keyof typeof vars.color.accent}.accent`
  | /* etc. */ ;

type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type Responsive<T> = T | Partial<Record<Breakpoint, T>>;

export interface LayoutProps {
  // space
  padding?:   Responsive<SpaceToken>;
  paddingX?:  Responsive<SpaceToken>;
  paddingY?:  Responsive<SpaceToken>;
  paddingTop?: Responsive<SpaceToken>; paddingRight?: Responsive<SpaceToken>;
  paddingBottom?: Responsive<SpaceToken>; paddingLeft?: Responsive<SpaceToken>;
  margin?:    Responsive<SpaceToken | 'auto'>;
  marginX?:   Responsive<SpaceToken | 'auto'>;
  marginY?:   Responsive<SpaceToken | 'auto'>;
  marginTop?: Responsive<SpaceToken | 'auto'>; /* …and friends */

  // size
  width?:     Responsive<SpaceToken | 'full' | 'auto' | 'fit' | `${number}%` | `${number}px`>;
  height?:    Responsive<SpaceToken | 'full' | 'auto' | 'fit' | 'screen'>;
  minWidth?:  Responsive<SpaceToken | 'full' | `${number}px` | `${number}%`>;
  maxWidth?:  Responsive<SpaceToken | 'full' | 'prose' | `${number}px`>;
  minHeight?: Responsive<SpaceToken | 'full' | 'screen'>;
  maxHeight?: Responsive<SpaceToken | 'full' | 'screen'>;

  // visual
  background?: Responsive<ColorToken>;
  color?:      Responsive<ColorToken>;
  borderColor?: Responsive<ColorToken>;
  borderWidth?: Responsive<'0' | '1' | '2' | '4'>;
  borderStyle?: Responsive<'solid' | 'dashed' | 'dotted' | 'none'>;
  borderRadius?: Responsive<RadiusToken>;
  boxShadow?:   Responsive<keyof typeof vars.shadow>;
  opacity?:     Responsive<number>;
  overflow?:    Responsive<'visible' | 'hidden' | 'auto' | 'scroll'>;

  // display
  display?:     Responsive<'block' | 'inline' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'inline-grid' | 'none' | 'contents'>;
  position?:    Responsive<'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'>;
  top?: Responsive<SpaceToken | '0' | 'auto'>; /* …and friends */
  zIndex?: Responsive<keyof typeof vars.zIndex>;
}
```

### Rendering responsive props as CSS variables

A component doesn't try to compile arbitrary values into classes at runtime. Instead, it:

1. Receives the prop.
2. Normalises it to a `Record<Breakpoint, value>`.
3. Emits inline-style CSS variables for each breakpoint: `style={{ '--p-base': vars.space[2], '--p-md': vars.space[4] }}`.
4. The component's base `.css.ts` reads those variables with media queries.

A single utility handles this:

```ts
// utils/responsiveStyle.ts
export function responsiveStyle<T extends string>(
  value: Responsive<T> | undefined,
  varBase: string,
  transform?: (v: T) => string,
): React.CSSProperties | undefined {
  if (value === undefined) return undefined;
  const map = typeof value === 'object' ? value : { base: value };
  const out: Record<string, string> = {};
  for (const [bp, v] of Object.entries(map)) {
    out[`${varBase}-${bp}`] = transform ? transform(v as T) : (v as string);
  }
  return out as React.CSSProperties;
}
```

And the `.css.ts` reads them:

```ts
// Box.css.ts
import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const box = style({
  padding: `var(--box-p-base, 0)`,
  '@media': {
    '(min-width: 40em)': { padding: 'var(--box-p-sm, var(--box-p-base, 0))' },
    '(min-width: 48em)': { padding: 'var(--box-p-md, var(--box-p-sm, var(--box-p-base, 0)))' },
    '(min-width: 64em)': { padding: 'var(--box-p-lg, var(--box-p-md, var(--box-p-sm, var(--box-p-base, 0))))' },
    // …
  },
});
```

This is verbose but it compiles to the smallest possible per-component CSS file. No runtime compilation, no style tag injection, clean cascade.

### `polymorphic` / `asChild`

Every primitive accepts either:

- **`as` prop** — `<Box as="section">` renders a `section`. TypeScript narrows props to the intrinsic element's attributes.
- **`asChild` prop** — `<Box asChild><a href="/">…</a></Box>` uses `Slot` to merge props onto the child. Great for composition.

Implementation pattern (pseudocode):

```tsx
const Comp = asChild ? Slot : (as ?? 'div');
return <Comp ref={ref} className={cn(boxClass, className)} style={{ ...boxStyle, ...style }} {...rest} />;
```

For rigorous types, use the community-standard `Polymorphic` helpers pattern (see `react-polymorphic-box` or `@radix-ui/react-polymorphic`). Implement a local, minimal version in `utils/polymorphic.ts` — 30 lines.

---

## Each primitive in detail

### `Box`

The zero-opinion primitive. Renders a `div` by default. Accepts every `LayoutProps` + any intrinsic attribute + `as` / `asChild`.

```tsx
<Box padding={{ base: 2, md: 4 }} background="surface.bg" borderRadius="md">
  …
</Box>
```

### `Stack`

Vertical flex. Subset of flex props, but opinionated names.

```tsx
<Stack gap="4" align="start" justify="between" dividers>
  …
</Stack>
```

Props:
- `gap?: Responsive<SpaceToken>`
- `align?: Responsive<'start' | 'center' | 'end' | 'stretch'>` → maps to `align-items`
- `justify?: Responsive<'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'>`
- `dividers?: boolean | React.ReactNode` — inserts `<Divider/>` between children (or custom element)
- `as`/`asChild` default to `div`; set `as="ul"` to render a list (children become `li` automatically — this one specific case is legal because the primitive owns the composition contract).

### `Inline`

Horizontal flex, wraps by default.

```tsx
<Inline gap="2" align="center" wrap>
  <Button>Save</Button>
  <Button variant="ghost">Cancel</Button>
</Inline>
```

Props: same as Stack but `wrap?: boolean` default `true`.

### `Flex`

Escape hatch. Exposes every CSS flex prop (`direction`, `wrap`, `grow`, `shrink`, `basis`, `gap`, `align`, `justify`). Use only when `Stack`/`Inline` aren't enough. 90% of consumer code should not touch this.

### `Grid`

CSS Grid with typed template string shortcuts.

```tsx
<Grid columns={{ base: 1, md: 3 }} gap="4" rowGap="2">
  …
</Grid>

<Grid templateColumns="200px 1fr 200px" gap="4">
  …
</Grid>
```

- `columns?: Responsive<number>` — shorthand for `repeat(N, minmax(0, 1fr))`.
- `rows?: Responsive<number>`
- `templateColumns?: Responsive<string>`
- `templateRows?: Responsive<string>`
- `gap`, `columnGap`, `rowGap`

Children can have `<Box gridColumn="span 2" />` for span control (add `gridColumn`, `gridRow`, `gridArea` to `LayoutProps`).

### `Center`

```tsx
<Center minHeight="screen"><Spinner /></Center>
```

Shorthand for `display: flex; align-items: center; justify-content: center;`. No extra props beyond layout.

### `Spacer`

`<Spacer />` → `flex: 1 1 auto; align-self: stretch;`. Nothing else. For shoving flex children apart.

### `Divider`

`<Divider />` → `<hr>` styled; `<Divider orientation="vertical" />` → renders a `<div role="separator" aria-orientation="vertical">` with `height: auto; width: 1px;` because `<hr>` doesn't work vertically cleanly.

Props:
- `orientation?: 'horizontal' | 'vertical'` (default horizontal)
- `variant?: 'solid' | 'dashed' | 'dotted'`
- `thickness?: '1' | '2'`

### `AspectRatio`

```tsx
<AspectRatio ratio={16 / 9}>
  <img src="…" />
</AspectRatio>
```

Uses `aspect-ratio` CSS property (widely supported). No padding-hack.

Props: `ratio?: number | string` (default `1`). Renders a `div` wrapping the child with `position: relative` and the child stretched to fill.

### `Container`

```tsx
<Container size="lg" paddingX={{ base: 4, md: 6 }}>
  …
</Container>
```

Max-width container with predefined sizes:
- `sm` — 640px
- `md` — 768px
- `lg` — 1024px (default)
- `xl` — 1280px
- `2xl` — 1536px
- `prose` — 65ch (for readable text)
- `full` — 100%

### `Section`

Semantic `<section>` wrapper with vertical rhythm (`padding-block`).

```tsx
<Section space="lg">
  <Container>
    …
  </Container>
</Section>
```

- `space?: 'sm' | 'md' | 'lg' | 'xl'` — vertical padding preset
- `as` can be `'main' | 'article' | 'aside' | 'section'` (default)

---

## Per-component file layout

Every primitive lives in its own folder. **This pattern is mandatory for every future component.**

```
packages/react/src/primitives/layout/Box/
├── Box.tsx                   # the React component
├── Box.css.ts                # vanilla-extract styles
├── Box.stories.tsx           # Storybook
├── Box.test.tsx              # Vitest browser-mode tests
├── Box.types.ts              # exported prop types
└── index.ts                  # barrel (re-exports Box and Box.types)
```

The `index.ts` is the only file referenced by the package's main `index.ts`:

```ts
// packages/react/src/index.ts
export * from './primitives/layout/Box';
export * from './primitives/layout/Stack';
// …
```

The tsup config adds one entry per primitive so consumers can do `import { Box } from '@lumen/react/box'` for the narrowest possible graph:

```ts
// packages/react/tsup.config.ts
entry: {
  index: 'src/index.ts',
  box: 'src/primitives/layout/Box/index.ts',
  stack: 'src/primitives/layout/Stack/index.ts',
  // …all 11 primitives
}
```

And the `exports` map in `package.json` mirrors:

```json
"exports": {
  ".":         { "types": "./dist/index.d.ts",  "import": "./dist/index.js" },
  "./box":     { "types": "./dist/box.d.ts",    "import": "./dist/box.js" },
  "./stack":   { "types": "./dist/stack.d.ts",  "import": "./dist/stack.js" },
  …
  "./styles.css": "./dist/styles.css"
}
```

---

## Testing requirements (per primitive)

Every primitive must have, at minimum:

### Stories
1. **Default** — bare render.
2. **AllProps** — every major prop varied, a visual matrix.
3. **Responsive** — demonstrate breakpoint behaviour via story-level viewport addon.
4. **Polymorphic** — `as="section"` and `asChild` with an anchor.
5. **RTL** — wrapped in `<DirectionProvider dir="rtl">`.

### Interaction test (via `play` function)
- For Box: verify className merges, style merges, ref forwards.
- For Stack/Inline: verify `gap` emits the right CSS variable; verify `dividers` inserts `<Divider>` between children.

### A11y test
- `@storybook/addon-a11y` should report zero violations on all stories.
- `Divider` must have `role="separator"` when vertical.

### Unit test
- Polymorphic behaviour: `as` prop changes tag; `asChild` merges onto child.
- Prop → CSS-variable: given `padding={{ base: 2, md: 4 }}`, the resulting element has the expected `--p-base` and `--p-md` inline style values.

---

## Exit criteria

- [ ] All 11 primitives exist with files matching the required layout.
- [ ] Vanilla-extract pipeline builds per-component CSS files; each primitive's CSS is ≤ 1 KB gzipped.
- [ ] `import { Box } from '@lumen/react/box'` works and yields a ≤ 3 KB gzipped bundle (Box + shared Slot util + minimal CSS).
- [ ] A story gallery in Storybook renders every primitive with every variant without console warnings.
- [ ] A11y addon reports no violations.
- [ ] Every primitive has ≥ 90% line coverage from Vitest.
- [ ] RTL flip visually inverts `Inline` and `Stack align="start"` vs `"end"` — verified with a manual Storybook check.
- [ ] `publint` and `attw` still clean.
- [ ] Playground renders a dashboard-like layout using only layout primitives + theme colours.
- [ ] Changesets: `@lumen/react` minor "Layout primitives".

## Decisions to log

- Vanilla-extract vs alternatives. Rationale above. Lock this in.
- Shared `LayoutProps` type. Once this type is exported, breaking changes to it are major-version bumps.
- `Stack`'s `dividers` prop. It's a convenience; resist adding more conveniences for now — keep the primitives primitive.
