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

## Prop vocabulary (every component)

Components expose the same props with the same meaning, so control is predictable everywhere:

| Prop                                | Values                                                                                                            | Meaning                                                         |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `size`                              | `sm` · `md` · `lg` (some also `inherit` or a number)                                                              | Physical size; scales with the theme's `scale`                  |
| `tone`                              | `accent` · `neutral` · `danger` · `success` · `warning` · `info` (+ `inherit`, `muted` where colour is inherited) | Semantic colour (`Tone` type in `src/tokens/schema.ts`)         |
| `variant`                           | component-specific, e.g. Button `solid` · `soft` · `outline` · `ghost`                                            | Fill or visual style                                            |
| `color`                             | any CSS colour                                                                                                    | One-off override of `tone`; prefer tones or tokens              |
| `disabled`, `loading`, `pressed`, … | boolean                                                                                                           | Behaviour and state                                             |
| `label` / `labels`                  | string / typed object                                                                                             | Accessible name / overridable built-in strings                  |
| `className`, `style`                | –                                                                                                                 | Layout only (margin, placement, width). Restyle through tokens. |

Props become `data-size`, `data-tone` and `data-variant` attributes that the component's CSS maps to tokens. Every story declares `argTypes` with a control for each prop. `pnpm cy new component` generates this shape.
