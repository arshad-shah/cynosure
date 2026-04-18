# Phase 03 — Theming system

> **Goal:** Make `@arshad-shah/cynosure-tokens` usable at the app level. Provide `ThemeProvider`, `DirectionProvider`, dark-mode mechanics, custom theme authoring, and RTL/reduced-motion plumbing.

**Depends on:** Phase 02.
**Blocks:** Phases 05+ (components).

---

## What you're building

A runtime-free theming system. The provider is only responsible for setting `data-theme` and `dir` attributes and subscribing to media queries. All actual styling lives in CSS — no inline style objects, no context cascades of values, no re-renders per token.

### Deliverables

1. `@arshad-shah/cynosure-react` exports: `ThemeProvider`, `DirectionProvider`, `useTheme()`, `useDirection()`, `useColorScheme()`, `useReducedMotion()`.
2. `@arshad-shah/cynosure-themes` package with prebuilt themes: `default` (light/dark), `terminal` (GitHub Dark Terminal), `high-contrast`.
3. A documented **theme authoring recipe** for consumers to make their own.
4. A sample theme switcher in the playground.

---

## Architecture: the two-layer approach

**Layer A — the CSS layer** (`@arshad-shah/cynosure-tokens` emits, `@arshad-shah/cynosure-themes` extends):
- `:root` carries the base (light) palette.
- `[data-theme='dark']` overrides semantic tokens for dark.
- Custom themes emit `[data-theme='<name>']` selectors overriding whichever layer they want.

**Layer B — the React layer** (`ThemeProvider` in `@arshad-shah/cynosure-react`):
- Reads/writes `<html data-theme>` and `<html dir>`.
- Exposes a tiny `{ theme, setTheme, resolvedTheme, colorScheme }` through context.
- Syncs with `prefers-color-scheme` when `theme === 'system'`.
- Persists preference (configurable: `localStorage`, cookie, or none).
- Never holds token values in React state. The CSS cascade is the source of truth.

This separation is why switching themes is instant and cost-free: no re-render storm, no context explosion, just a single DOM attribute change that triggers CSS variable cascade.

---

## `ThemeProvider` API

```tsx
import { ThemeProvider } from '@arshad-shah/cynosure-react';

<ThemeProvider
  defaultTheme="system"           // "light" | "dark" | "system" | string custom
  themes={['light', 'dark', 'terminal']}  // allowed names; guards typos
  storageKey="cynosure-theme"        // null to disable persistence
  storage="localStorage"          // "localStorage" | "sessionStorage" | { get, set }
  attribute="data-theme"          // the HTML attribute to set
  disableTransitionOnChange       // adds a 1-frame *{transition:none} to avoid flash
  nonce={nonce}                   // for CSP environments
>
  <App />
</ThemeProvider>
```

### Types (authoritative)

```ts
// packages/react/src/theme/types.ts

export type ColorScheme = 'light' | 'dark';

export interface ThemeProviderProps {
  /** The default theme name when no persisted preference exists. */
  defaultTheme?: string;
  /** Allowed theme names. If provided, an unknown value falls back to defaultTheme. */
  themes?: readonly string[];
  /** HTML attribute used for the theme selector. Defaults to "data-theme". */
  attribute?: `data-${string}`;
  /** Storage strategy. `null` disables persistence entirely. */
  storage?: 'localStorage' | 'sessionStorage' | StorageAdapter | null;
  /** Key under which to persist. */
  storageKey?: string;
  /** When true, briefly disables transitions during theme change to avoid flash. */
  disableTransitionOnChange?: boolean;
  /** Whether to respect prefers-color-scheme for the "system" value. Default true. */
  enableSystem?: boolean;
  /** CSP nonce used on the injected inline script that prevents FOUC. */
  nonce?: string;
  children: React.ReactNode;
}

export interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

export interface ThemeContextValue {
  /** The currently chosen theme name (may be "system"). */
  theme: string;
  /** Resolved theme — if theme is "system", this is "light" or "dark". */
  resolvedTheme: string;
  /** The underlying colour scheme ("light" | "dark"), useful for mode-aware logic. */
  colorScheme: ColorScheme;
  /** Change the theme. */
  setTheme: (theme: string) => void;
  /** The list of allowed themes, as configured. */
  themes: readonly string[];
}
```

### Implementation notes

- **No hydration flash (FOUC).** Render an inline `<script>` via a server-rendered helper (`getThemeInitScript(options)`) that runs before paint and sets `data-theme` based on storage / system. The React provider picks up from there on the client. For SSR apps (Next.js), consumers place this in `<head>`; for CSR, inject at mount *before* first render using `useLayoutEffect`.
- **No context of token values.** Only `theme`, `setTheme`, `colorScheme`. Components read CSS variables directly.
- **Media query listener** for `prefers-color-scheme`, guarded with `matchMedia` feature detection.
- **Disable-transition-on-change:** insert a `<style>` node with `*,*:before,*:after { transition: none !important; }`, flush, restore — all within one animation frame.

### File layout

```
packages/react/src/theme/
├── ThemeProvider.tsx
├── DirectionProvider.tsx
├── getThemeInitScript.ts
├── hooks/
│   ├── useTheme.ts
│   ├── useColorScheme.ts
│   ├── useDirection.ts
│   ├── useReducedMotion.ts
│   └── useBreakpoint.ts
├── types.ts
└── index.ts
```

---

## `DirectionProvider`

Simple context for `dir="ltr" | "rtl"`. Mirrors Radix's `DirectionProvider` so that Radix primitives inside Cynosure inherit direction automatically.

```tsx
<DirectionProvider dir="rtl">
  <App />
</DirectionProvider>
```

Sets `<html dir="rtl">` by default; can be scoped to a subtree by rendering a `<div dir="rtl">`.

**Rule:** all components must work in both directions. Test one RTL story per component in Phase 14.

---

## Reduced motion

`useReducedMotion()` — wraps `matchMedia('(prefers-reduced-motion: reduce)')`. Every animated component must check this and either disable or shorten its animations.

CSS-level: also add a global snippet in `@arshad-shah/cynosure-tokens/css` (appended to `base.css`):

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --cynosure-duration-motion-micro: 0ms;
    --cynosure-duration-motion-short: 0ms;
    --cynosure-duration-motion-medium: 0ms;
    --cynosure-duration-motion-long: 0ms;
  }
}
```

This means any component using `var(--cynosure-duration-motion-short)` in a `transition-duration` automatically loses motion without code changes.

---

## `useBreakpoint` and responsive props

Responsive props (`<Box padding={{ base: 2, md: 4 }} />`) are implemented using CSS custom properties + container queries where possible. In Phase 05 you'll implement the runtime helper; here, establish the contract:

```ts
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
```

The breakpoint values come from tokens:

```css
--cynosure-breakpoint-sm: 40em;   /* 640px */
--cynosure-breakpoint-md: 48em;   /* 768px */
--cynosure-breakpoint-lg: 64em;   /* 1024px */
--cynosure-breakpoint-xl: 80em;   /* 1280px */
--cynosure-breakpoint-2xl: 96em;  /* 1536px */
```

**Strategy:** responsive props generate inline CSS custom properties on the element (`style={{ '--p-base': 2, '--p-md': 4 }}`), and components have pre-compiled media queries reading those properties. This avoids runtime CSS-in-JS while keeping the ergonomics.

```css
.box { padding: calc(var(--p-base) * 0.25rem); }
@media (min-width: 48em) { .box { padding: calc(var(--p-md, var(--p-base)) * 0.25rem); } }
```

This is a Phase 05 concern in detail; just ship the breakpoint tokens and the `useBreakpoint` hook here.

---

## `@arshad-shah/cynosure-themes` package

A small package that ships pre-built themes as CSS files. Consumers pick and choose.

```
packages/themes/
├── src/
│   ├── terminal/
│   │   └── index.css           # GitHub Dark Terminal — Arshad's named design language
│   ├── high-contrast/
│   │   └── index.css
│   └── index.ts                # empty; CSS-only package
├── package.json
└── tsconfig.json
```

`package.json` exports:

```json
{
  "exports": {
    "./terminal": "./src/terminal/index.css",
    "./high-contrast": "./src/high-contrast/index.css",
    "./package.json": "./package.json"
  },
  "sideEffects": ["*.css"]
}
```

### `packages/themes/src/terminal/index.css` — the GitHub Dark Terminal theme

Honouring Arshad's named design language from memory.

```css
[data-theme='terminal'] {
  /* Canvas & surfaces */
  --cynosure-color-background-canvas: #0d0f14;
  --cynosure-color-background-surface: #161b22;
  --cynosure-color-background-subtle: #10141a;
  --cynosure-color-background-muted: #1c232c;
  --cynosure-color-background-raised: #1c232c;
  --cynosure-color-background-overlay: rgba(0, 0, 0, 0.7);

  /* Foreground */
  --cynosure-color-foreground-default: #e6edf3;
  --cynosure-color-foreground-muted: #7d8590;
  --cynosure-color-foreground-subtle: #484f58;
  --cynosure-color-foreground-disabled: #30363d;

  /* Borders */
  --cynosure-color-border-default: #30363d;
  --cynosure-color-border-subtle: #21262d;
  --cynosure-color-border-strong: #484f58;
  --cynosure-color-border-focus: #388bfd;

  /* Accent — muted blue with glow */
  --cynosure-color-accent-solid: #388bfd;
  --cynosure-color-accent-solidHover: #4493f8;
  --cynosure-color-accent-soft: rgba(56, 139, 253, 0.1);
  --cynosure-color-accent-ring: #388bfd;
  --cynosure-color-accent-onSolid: #ffffff;

  /* Typography */
  --cynosure-font-family-sans: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
  --cynosure-font-family-mono: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;

  /* Radii — tighter than default, terminal aesthetic */
  --cynosure-radius-component-sm: 2px;
  --cynosure-radius-component-md: 4px;
  --cynosure-radius-component-lg: 6px;

  /* Subtle glow on accent rings */
  --cynosure-shadow-component-focus: 0 0 0 1px #388bfd, 0 0 8px rgba(56, 139, 253, 0.4);
}
```

This theme is the reference implementation of Arshad's "GitHub Dark Terminal" design language — near-black backgrounds, JetBrains Mono, muted blue accent with glow.

---

## Theme authoring recipe (docs)

Write an MDX page in Storybook: *Foundations → Theming → Authoring a custom theme*. Walk through:

1. Copy the `[data-theme='…']` block from `@arshad-shah/cynosure-themes/terminal`.
2. Override only what you care about. Unlisted tokens cascade from `:root`.
3. Include the CSS file after `@arshad-shah/cynosure-tokens/css`.
4. Pass the name to `<ThemeProvider themes={['light', 'dark', 'mybrand']}>`.
5. Optional: run the contrast check script (Phase 14) against the new theme.

---

## Playground demonstration

Update `apps/playground/src/App.tsx` to include a theme switcher using Cynosure's own Button (imported from `@arshad-shah/cynosure-react`, even though Button arrives in Phase 07 — this phase can stub Button as a native `<button>` and swap later, OR wait for Phase 07). Better: ship a minimal `<select>` switcher now and upgrade in Phase 07.

---

## Exit criteria

- [ ] `ThemeProvider` mounted in the playground toggles `data-theme` between `light`, `dark`, `terminal` and colours visibly change without a reload.
- [ ] FOUC prevented: reloading with dark preference renders dark immediately (inspect the initial paint — no flash).
- [ ] `useTheme()`, `useColorScheme()`, `useDirection()`, `useReducedMotion()` all have Vitest unit tests with simulated media queries.
- [ ] `@arshad-shah/cynosure-themes/terminal` imported as a CSS side-effect makes the terminal theme available.
- [ ] `DirectionProvider dir="rtl"` flips document direction and Radix primitives pick it up (verify by mounting a stub Radix `Popover` in the playground).
- [ ] Biome passes; `publint` passes; `attw` passes for both `@arshad-shah/cynosure-themes` and the updated `@arshad-shah/cynosure-react`.
- [ ] Changesets: `@arshad-shah/cynosure-react` minor, `@arshad-shah/cynosure-themes` minor.

## Decisions to log

- Whether to ship `next-themes` as a reference implementation or roll our own. **Default: roll our own** — it's <500 LOC, no surprises, no peer-dep.
- Whether to expose theme-switching via a cookie for SSR. For now: localStorage only; consumers can pass a custom `StorageAdapter` for cookies.
