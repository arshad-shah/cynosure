---
'@lumen/react': minor
---

Phase 05 — layout primitives.

`@lumen/react` gains eleven polymorphic layout primitives built on **vanilla-extract** — the only components in the library allowed to render raw HTML, and the foundation every subsequent phase composes on top of.

- **Primitives:** `Box`, `Stack`, `Inline`, `Flex`, `Grid`, `Center`, `Spacer`, `Divider`, `AspectRatio`, `Container`, `Section`. Each lives in its own folder with a `.tsx` + `.css.ts` + `.stories.tsx` + `index.ts` and ships a dedicated per-component entry point (`@lumen/react/box`, `@lumen/react/stack`, …).
- **Shared layout props:** every primitive accepts the `LayoutProps` superset — padding/margin, width/height, background/color/border/shadow, display/position, and grid child hints — and each prop can be a **single token** or a **responsive map** (`{ base, sm, md, lg, xl, '2xl' }`). Values are emitted as cascading CSS custom properties read by a shared vanilla-extract class with mobile-first `@media` rules.
- **Tokens, not strings:** token-shaped values (`padding="4"`, `background="bg.surface"`, `boxShadow="md"`, `borderRadius="lg"`) resolve to `var(--lumen-*)` references, keeping every primitive theme-aware out of the box. Plain lengths (`"200px"`, `"50%"`) pass through; aliases (`"full"`, `"screen"`, `"prose"`, `"auto"`, `"fit"`) map to their CSS equivalents.
- **Polymorphism:** every primitive takes either `as` (renders a different element, narrowing its intrinsic attributes) or `asChild` (uses `Slot` to merge props onto the single child), matching the Radix composition pattern.
- **Opinionated shorthands:** `Stack` (vertical, with `dividers`), `Inline` (horizontal, wraps by default), `Flex` (escape hatch), `Grid` (typed `columns`/`templateColumns` with responsive maps), `Center`, `Spacer`, `Divider` (horizontal `<hr>` + vertical `<div role="separator" aria-orientation="vertical">`), `AspectRatio` (native `aspect-ratio`), `Container` (predefined `sm`/`md`/`lg`/`xl`/`2xl`/`prose`/`full` sizes), `Section` (semantic section with vertical rhythm presets).
- **Build:** `@vanilla-extract/vite-plugin` drives Storybook + Vitest, `@vanilla-extract/esbuild-plugin` drives the tsup build. Each primitive is listed in the package `exports` map and ships a Node10-resolution sidecar `package.json`, so both modern (`@lumen/react/box`) and legacy resolvers see their declarations.
