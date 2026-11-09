# Conventions

The rules in `AGENTS.md` are enforced by `pnpm check`:

| Rule              | What fails                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------ |
| `native-elements` | `<button a input textarea select dialog details summary option>` outside `src/foundations` |
| `title-attr`      | any `title=` (native tooltip)                                                              |
| `glyphs`          | emoji or text glyphs (✓ × › → …) in JSX text                                               |
| `literals`        | hex or px literals in component CSS/TSX outside `var()` fallbacks                          |
| `structure`       | a component without a stories file containing `play:` or a README with `## Used by`        |
| `scaffold-todo`   | an unfinished `TODO(cy)` from a generator                                                  |
| `agents`          | a documented folder without `AGENTS.md`                                                    |

Naming: components PascalCase; CSS classes `cy-<kebab>`, inner parts `cy-<kebab>-<part>`; tokens `--cy-<component>-<prop>`; private custom properties `--_name`. Props: `className`/`style` are for layout only; restyle through tokens. Strings: English defaults, overridable via a typed `labels` prop.
