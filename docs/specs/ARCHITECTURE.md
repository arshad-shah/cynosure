# Lumen UI — Architecture Reference

> Cross-cutting rules and patterns that every phase and every component must honour. If a phase document conflicts with this file, this file wins and the phase is wrong.

---

## The seven laws

1. **One source of truth for design decisions.** Every visual value lives in `@lumen/tokens` as a DTCG JSON entry. Never hardcode a colour, radius, space, duration, or shadow in a component.
2. **Six primitives render the DOM.** Only `Box`, `Stack`, `Inline`, `Flex`, `Grid`, `Center` (plus the utility trio `Spacer`, `Divider`, `AspectRatio`, `Container`, `Section`) may use intrinsic JSX elements directly. **Exception:** form controls (`<input>`, `<textarea>`, `<select>`) because browser behaviour depends on the native element.
3. **Variants are typed via `cva`.** Every component that has visual variants exposes them through `cva`, and its props interface extends `VariantProps<typeof componentRecipe>`.
4. **Accessibility is a build-time contract.** Every component has `@storybook/addon-a11y` stories that pass at `test: 'error'` level. A component that fails axe cannot be released.
5. **Controlled and uncontrolled both work.** Every stateful component accepts `value`/`defaultValue`/`onChange` (or its domain-appropriate naming) and uses `useControllableState` internally.
6. **`asChild` is the composition escape hatch.** Every component that renders a single root element supports `asChild`. Consumers compose by passing their own element; we merge props via `Slot`.
7. **Everything is tree-shakeable.** Every component has a per-component tsup entry and a per-component `exports` map entry. The root barrel is for convenience; the per-component paths are for production.

---

## The styling pipeline, end to end

```
┌─────────────────────────────┐
│  tokens/*.json (DTCG)       │  ← Authored by humans
└──────────────┬──────────────┘
               │  pnpm build (style-dictionary)
               ▼
┌─────────────────────────────┐
│  dist/css/base.css          │  ← :root { --lumen-*: …; }
│  dist/css/dark.css          │  ← [data-theme='dark'] { …; }
│  dist/ts/base.ts            │  ← typed constants
└──────────────┬──────────────┘
               │  consumed by
               ▼
┌─────────────────────────────┐
│  vars.css.ts                │  ← createGlobalThemeContract mirrors the shape
│    (vanilla-extract)        │     of tokens with `var(--lumen-…)` strings
└──────────────┬──────────────┘
               │  imported by
               ▼
┌─────────────────────────────┐
│  Component.css.ts           │  ← vanilla-extract recipes use vars
│    (vanilla-extract)        │     e.g. color: vars.color.accent.solid
└──────────────┬──────────────┘
               │  compiled at build time by vite-plugin-vanilla-extract
               ▼
┌─────────────────────────────┐
│  dist/Component.css         │  ← static CSS, no runtime
│  dist/Component.js          │  ← imports './Component.css'
└─────────────────────────────┘
```

**Theme switch at runtime** = `<html data-theme='dark'>` flips the cascaded custom properties; zero re-renders.
**Custom theme** = user ships an additional CSS file with `[data-theme='mine'] { --lumen-*: …; }` and sets the attribute.
**Per-component CSS** = Vite code-splits, consumer only ships CSS for components they imported.

---

## Standard component anatomy

Every published component follows this exact structure:

```
src/<category>/<ComponentName>/
├── <ComponentName>.tsx        # the component
├── <ComponentName>.css.ts     # vanilla-extract recipe
├── <ComponentName>.types.ts   # exported types (optional — can live in .tsx)
├── <ComponentName>.stories.tsx
├── <ComponentName>.mdx        # docs page
├── <ComponentName>.test.tsx   # Vitest tests (browser mode)
└── index.ts                   # re-exports the component + types
```

The component file:

```tsx
// Button.tsx
import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'cva';
import { cn } from '../../utils/cn';
import * as styles from './Button.css';

const button = cva(styles.base, {
  variants: {
    variant:     { solid: styles.variantSolid,   /* … */ },
    colorScheme: { accent: styles.colorAccent,   /* … */ },
    size:        { md: styles.sizeMd,            /* … */ },
  },
  defaultVariants: { variant: 'solid', colorScheme: 'accent', size: 'md' },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
          VariantProps<typeof button> {
  /** Renders as the child element using Slot composition. */
  asChild?: boolean;
  /** Shows a spinner and disables interaction. */
  loading?: boolean;
  /** Icon rendered before the label. */
  leftIcon?: React.ReactNode;
  /** Icon rendered after the label. */
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, colorScheme, size, className, asChild, loading, leftIcon, rightIcon, children, disabled, type, ...rest },
  ref,
) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : type ?? 'button'}
      disabled={disabled || loading}
      data-loading={loading || undefined}
      className={cn(button({ variant, colorScheme, size }), className)}
      {...rest}
    >
      {/* compose with Inline primitive, not raw span */}
      {children}
    </Comp>
  );
});
```

The recipe file:

```ts
// Button.css.ts
import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const base = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space['2'],
  borderRadius: vars.radius.component.md,
  fontFamily: vars.font.family.sans,
  fontWeight: vars.font.weight.medium,
  cursor: 'pointer',
  transition: `background-color ${vars.duration.motion.short}, color ${vars.duration.motion.short}`,
  ':disabled': { cursor: 'not-allowed', opacity: 0.5 },
  ':focus-visible': {
    outline: `2px solid ${vars.color.accent.ring}`,
    outlineOffset: '2px',
  },
});

export const variantSolid = style({
  backgroundColor: vars.color.accent.solid,
  color: vars.color.accent.onSolid,
  ':hover:not(:disabled)': { backgroundColor: vars.color.accent.solidHover },
});

// … more variants
```

The index file:

```ts
// index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

---

## Props naming conventions

| Prop               | Type                | Meaning                                                  |
| ------------------ | ------------------- | -------------------------------------------------------- |
| `variant`          | string union        | Primary visual style (e.g. solid/soft/outline/ghost)    |
| `colorScheme`      | string union        | Semantic colour (accent, success, danger, warning, etc.) |
| `size`             | string union        | Size scale (xs/sm/md/lg/xl)                              |
| `shape`            | string union        | Border-radius treatment (default/pill/square)            |
| `orientation`      | 'horizontal'\|'vertical' | Layout direction                                    |
| `align`, `justify` | string union        | Alignment axes (on layout primitives)                    |
| `value`, `defaultValue`, `onChange` | —  | Controllable text/number/complex values                  |
| `checked`, `defaultChecked`, `onCheckedChange` | — | Controllable boolean state               |
| `open`, `defaultOpen`, `onOpenChange` | —     | Controllable open/close state (overlays)                 |
| `selected`, `defaultSelected`, `onSelectedChange` | — | Controllable selection state (chips, toggles)     |
| `asChild`          | boolean             | Render as the child element via Slot                     |
| `as`               | ElementType         | Render as a different intrinsic element (primitives only)|
| `disabled`         | boolean             | Prevents interaction                                     |
| `readOnly`         | boolean             | Displays but doesn't allow editing                       |
| `invalid`          | boolean             | Applies error-state styling                              |
| `required`         | boolean             | Marks as required; affects FormField behaviour           |
| `loading`          | boolean             | Shows spinner, prevents interaction                      |

**Never** use:
- `type` for visual style — `type` means something specific to HTML inputs/buttons.
- `color` — conflicts with CSS prop/attribute. Use `colorScheme`.
- `isDisabled`/`isLoading`/`isOpen` — drop the `is` prefix. Shorter, consistent with HTML.

---

## File-level conventions

- Named exports only. **No default exports** anywhere in source except the tsup `.config.ts` files. Named exports improve autocomplete, tree-shaking, and refactoring.
- `.css.ts` files are pure — no runtime logic beyond vanilla-extract's `style`/`recipe`/`createVar`/`createTheme`.
- Component files start with imports ordered: React → other packages → internal packages → relative → `.css`. Biome enforces via `organizeImports`.
- One component per file. Sub-components (DialogHeader, DialogTitle, etc.) may live alongside the root if they don't exceed ~300 lines total; otherwise split.
- Test files import from `@testing-library/react`, never directly from the source's neighbours — keeps tests self-contained.

---

## Peer dependency policy

| Dep                                     | Peer  | Range              | Notes                                              |
|-----------------------------------------|-------|--------------------|----------------------------------------------------|
| `react`, `react-dom`                    | ✅    | `>=19.0.0`          | Strict. Older Reacts aren't supported.             |
| `react-hook-form`                       | Optional | `>=7.0.0`       | Only needed if using `@lumen/react/rhf`.          |
| `@tanstack/react-table`                 | Optional | `>=8.0.0`       | Only needed if using `DataTable`.                  |
| `lucide-react`                          | ✅    | `>=0.400.0`         | Our icon set.                                      |
| `@lumen/tokens`, `@lumen/core`          | —     | `workspace:*`       | Internal deps; pnpm resolves from workspace.       |

Direct deps we bring:
- `@radix-ui/react-*` — the specific primitives we use.
- `react-aria-components`, `@internationalized/date` — for advanced form controls only (Select, Combobox, DatePicker, Slider, ColorPicker).
- `cva` — variants.
- `@radix-ui/react-slot` — composition.
- `sonner` — toast.
- `react-resizable-panels` — Resizable.
- `shiki` — only for `CodeBlock`, lazy-loaded language packs.

---

## SSR & React Server Components

- **Component body:** must not throw on SSR. `window`, `document`, `matchMedia` references are guarded with `useIsomorphicLayoutEffect` or typeof checks.
- **`ThemeProvider`:** renders a flash-prevention script via `getThemeInitScript()` — consumers insert this in `<head>` on SSR frameworks.
- **Vanilla-extract CSS:** extracted at build time, served as a plain stylesheet. No SSR concerns.
- **RSC compatibility:** because our components are client-rendered (need hooks, refs, events), export them as client components. Documented in the Next.js guide: `'use client'` at the top of each consumer file that imports interactive Lumen components.

Future work (post-v1): investigate if purely presentational components (Box, Stack, Inline, Grid, Card, Heading with no interactivity) can be marked as server-safe. Not worth the complexity for v1.

---

## Browser support

- **Evergreen:** Chrome, Edge, Firefox, Safari — last 2 versions.
- **CSS features required:** CSS custom properties, `:has()`, `aspect-ratio`, logical properties, container queries (optional), `:focus-visible`.
- **Non-goals:** IE11 (dead), Opera Mini.

Browserslist:

```
> 0.5%, last 2 versions, Firefox ESR, not dead, not op_mini all
```

---

## Performance budgets (reminder)

Initial ceilings; treat as sacred:

- Box, Stack, Inline, Grid, Center, Spacer, Divider, AspectRatio, Container: **≤ 3 KB gz** each
- Text, Heading, Code, Kbd, Link: **≤ 2 KB gz** each
- Button: **≤ 5 KB gz**
- Input, Textarea: **≤ 6 KB gz**
- Checkbox, Radio, Switch: **≤ 8 KB gz**
- Select, Combobox: **≤ 20 KB gz**
- DatePicker: **≤ 30 KB gz**
- Dialog, Popover, DropdownMenu: **≤ 12 KB gz**
- DataTable: **≤ 45 KB gz**
- Full barrel `@lumen/react`: **≤ 150 KB gz** (target, not a hard ceiling)

---

## Versioning

- All `@lumen/*` packages linked → single version bumps across the board.
- Breaking change → major bump → migration guide required.
- Additive change → minor bump.
- Bug fix → patch bump.
- Changesets drive this; write one per PR.

---

## The "am I doing it right" checklist

Before opening a PR for a new component, ask:

- [ ] Does this compose layout primitives and Radix/React-Aria bases? (No raw `<div>`, `<span>`, `<ul>`, etc.)
- [ ] Does it expose `asChild` where there's a single root element?
- [ ] Does it support controlled + uncontrolled?
- [ ] Are variants, sizes, and colour schemes typed via `cva`?
- [ ] Are all values sourced from `vars.*` (tokens)?
- [ ] Is there a per-component tsup entry and `exports` map entry?
- [ ] Stories cover: default, all variants, all sizes, all states, RTL, `asChild`?
- [ ] At least one `play` function covering keyboard interaction?
- [ ] Axe a11y stories pass?
- [ ] JSDoc on every prop?
- [ ] MDX page with description, examples, accessibility notes?
- [ ] Changeset written?
- [ ] `PROGRESS.md` updated?

If any answer is "no", the PR isn't ready.
