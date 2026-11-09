# src/components

Composite components. Create with `pnpm cy new component <Name>` (never by hand), then replace every `TODO(cy)`.

## Recipe

1. **Test first.** In `<Name>.stories.tsx` write play tests for: pointer, keyboard (APG pattern), touch (`userEvent.pointer({ keys: "[TouchA]" })`), focus, controlled and uncontrolled values, disabled, labels override, RTL, hostile host (`computeUnderHostileHost`), shadow root where relevant. Coarse-pointer checks go in a story tagged `touch`. Visual stories are tagged `visual`. Run `pnpm test:stories` and watch them fail.
2. **Build from existing components.** Need a button? `Button`/`IconButton`. Never a native element (see `src/foundations/AGENTS.md`).
3. **CSS** in `<kebab>.css`: the root selector is doubled (`.cy-x.cy-x`) so host type/attribute rules such as Tailwind v3 `[type=button]` never win; the root rule declares `box-sizing: border-box !important; margin: 0; letter-spacing: normal; text-transform: none` and its fonts; inner parts carry `.cy-reset`. Every value reads `var(--cy-<kebab>-<prop>, <global token>)`. Variants via `data-*` attributes. Hit area via a `::before` sized `max(100%, var(--_hit))`, `--_hit` = `--cy-hit-min`, `--cy-hit-coarse` under `(pointer: coarse)`.
4. **Tokens**: declare `<Name>Tokens` and augment `ComponentTokens`; add tokens with `pnpm cy new token`.
5. **README**: usage, props table, tokens, a11y and touch notes, `## Used by` (two or more products, or one essential use).
   **Docs page** `<Name>.mdx` (the Storybook Docs tab; there is no autodocs): `<Meta of={Stories} />`, a lead sentence, a lead `<Canvas>`, When to use / Use something else when, Usage, curated example canvases (never test-plumbing stories), `<ArgTypes>`, Behaviour and accessibility (keyboard table), Touch, Theming (real tokens), Related. Facts only from source and tests. Template: `src/components/Button/Button.mdx`.
6. `pnpm check && pnpm test:stories && pnpm size` must pass.

Reference implementation: `Button/` (read it before writing a new component).
