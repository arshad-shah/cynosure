# src/tokens

The token schema (`schema.ts`), defaults (`defaults.ts`), colour maths (`color.ts`), `createTheme` and `themeToCss`/`themeProperties`; named themes (`named-themes.ts`: `defineTheme`, `createThemeRegistry`); editor and chart themes from resolved colours (`editor-themes.ts`, `chart-themes.ts`), none importing the library they serve.

- One source of truth: every CSS variable is generated from these TS objects. Never hand-write a `--cy-*` declaration elsewhere.
- Naming: `--cy-<group>-<name>` (kebab case of the object path). Colours are `--cy-color-*` using `light-dark()`.
- Theme input is validated centrally (`assertSafe`): keys must be token names; values cannot contain `; { } < > \` or comments. Keep it that way; add a test for any new input path.
- Component tokens are declared in the component (`declare module "../../tokens/schema.js" { interface ComponentTokens { … } }`), not here. Add them with `pnpm cy new token <component.token> --doc "…"`.
- Changing a default changes every product: note it in `docs/PROGRESS.md` decision log.
- Named themes are plain JSON from plugins: `defineTheme` checks their shape (known fields, leaf types against `BASE_GLOBAL`, no `__proto__`), then builds them through `createTheme` (so `assertSafe` still runs) and rejects text below 4.5:1. Never add a path that builds a theme from outside input without it.
- `seriesColors` is the one list in `ColorTokens`; `colorPairs` turns it into `--cy-color-series-1…8`. Anything that walks palettes must allow for it.
- Tests: `tests/unit/named-themes.test.ts` (shape, contrast, registry, JSON round trip), `tests/unit/chart-themes.test.ts` (series contrast and spacing, `resolveColors`, `swiftChartTheme`), `tests/unit/tokens.test.ts` (exact approved values, contrast ≥ 4.5:1, validation, CSS shape).
