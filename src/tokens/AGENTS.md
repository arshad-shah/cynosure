# src/tokens

The token schema (`schema.ts`), defaults (`defaults.ts`), colour maths (`color.ts`), `createTheme` and `themeToCss`/`themeProperties`.

- One source of truth: every CSS variable is generated from these TS objects. Never hand-write a `--cy-*` declaration elsewhere.
- Naming: `--cy-<group>-<name>` (kebab case of the object path). Colours are `--cy-color-*` using `light-dark()`.
- Theme input is validated centrally (`assertSafe`): keys must be token names; values cannot contain `; { } < > \` or comments. Keep it that way; add a test for any new input path.
- Component tokens are declared in the component (`declare module "../../tokens/schema.js" { interface ComponentTokens { … } }`), not here. Add them with `pnpm cy new token <component.token> --doc "…"`.
- Changing a default changes every product: note it in `docs/PROGRESS.md` decision log.
- Tests: `tests/unit/tokens.test.ts` (exact approved values, contrast ≥ 4.5:1, validation, CSS shape).
