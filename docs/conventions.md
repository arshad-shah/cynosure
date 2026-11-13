# Conventions

The rules in `AGENTS.md` are enforced by `pnpm check`:

| Rule              | What fails                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `native-elements` | `<button a input textarea select dialog details summary option>` outside `src/foundations`                                |
| `title-attr`      | any `title=` (native tooltip)                                                                                             |
| `glyphs`          | emoji or text glyphs (✓ × › → …) in JSX text                                                                              |
| `literals`        | hex or px literals in component CSS/TSX outside `var()` fallbacks                                                         |
| `structure`       | a component without a stories file containing `play:` or a README                                                         |
| `own-styles`      | a stylesheet not named `<kebab-folder>.css`, or a selector naming another component's class                               |
| `own-classes`     | a component putting another component's class in `className` (render that component)                                      |
| `hidden-text`     | a hand-written visually-hidden rule (`clip-path: inset(50%)`); use `.cy-visually-hidden`                                  |
| `foundation-use`  | a composite using a foundation part not listed in `FOUNDATION_USERS` (`tools/cli/lib/check.ts`)                           |
| `live-region`     | `role="status"`, `"alert"`, `"log"` or `aria-live` on `.cy-visually-hidden` text outside foundations; render `LiveRegion` |
| `docs`            | a component or foundation without a hand-written `<Name>.mdx` using `<Meta of={Stories} />`                               |
| `touch-hidden`    | a story tagged `touch` without `!dev` (it would fail on the published Storybook)                                          |
| `scaffold-todo`   | an unfinished `TODO(cy)` from a generator                                                                                 |
| `agents`          | a documented folder without `AGENTS.md`                                                                                   |

Naming: components PascalCase; CSS classes `cy-<kebab>`, inner parts `cy-<kebab>-<part>`; tokens `--cy-<component>-<prop>`; private custom properties `--_name`. Props: `className`/`style` are for layout only; restyle through tokens. Strings: English defaults, overridable via a typed `labels` prop.

## Prop vocabulary (every component)

Components expose the same props with the same meaning, so control is predictable everywhere:

| Prop                                | Values                                                                                                                                                               | Meaning                                                         |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `size`                              | `sm` · `md` · `lg` (some also `inherit` or a number; Button, IconButton, Select, TextField, ProgressBar, SegmentedControl and Field also `xs`, the `DenseSize` type) | Physical size; scales with the theme's `scale`                  |
| `tone`                              | `accent` · `neutral` · `danger` · `success` · `warning` · `info` (+ `inherit`, `muted` where colour is inherited)                                                    | Semantic colour (`Tone` type in `src/tokens/schema.ts`)         |
| `variant`                           | component-specific, e.g. Button `solid` · `soft` · `outline` · `ghost`                                                                                               | Fill or visual style                                            |
| `color`                             | any CSS colour                                                                                                                                                       | One-off override of `tone`; prefer tones or tokens              |
| `disabled`, `loading`, `pressed`, … | boolean                                                                                                                                                              | Behaviour and state                                             |
| `label` / `labels`                  | string / typed object                                                                                                                                                | Accessible name / overridable built-in strings                  |
| `className`, `style`                | –                                                                                                                                                                    | Layout only (margin, placement, width). Restyle through tokens. |

Props become `data-size`, `data-tone` and `data-variant` attributes that the component's CSS maps to tokens. Every story declares `argTypes` with a control for each prop. `pnpm cy new component` generates this shape.

### Slots

Content props that place things in a component's own layout use the same names:

- **`leading` / `trailing`**: content at the start or end of the component's own row, inside it (an icon, a count, a Badge, a "New tab" button): TitleBar, ListRow, Tree items, TabList, Disclosure's summary row, Select, SearchField, FloatingToolbar. Never `start`, `end` or `summaryEnd` for this.
- **`actions`**: buttons for the thing the component shows (IconButtons, a Menu), usually revealed on hover or focus: ListRow, Tree items, ChatMessage, CodeBlock.
- **Commands**: a chosen context-menu item or a pressed row action is reported through `onCommand(value, …)` (Tree's with the item, a Tab's for itself), not `onSelect`, which is for choosing a value.
- **`start` / `end`**: whole clusters of separate parts at the two ends of a bar (StatusBar's segments). Use them only where the component lays out two such groups.

## Ownership: reuse components, never their insides

- **One stylesheet per component folder**, `<kebab-folder>.css`, and it styles only that folder's classes (`cy-<component>` and `cy-<component>-*` for each component the folder exports). Shared rules live in `src/styles/base.css` (`.cy-reset`, `.cy-visually-hidden`).
- **Want another component's look? Render it.** Never put its classes on your elements or select them in your CSS. Adjust it through its `--cy-<component>-*` tokens (set on your own element; custom properties cascade) or its props. If the knob is missing, add a token or prop to that component, with a test.
- **Layout of a child** (position, margin, size of a slot) goes on a class of your own passed through the child's `className`, e.g. `<Icon className="cy-calendar-icon" />`.
- **A piece several components share** (an option list, a choice row) is a component of its own with its own folder, stylesheet, stories and docs.
- **Foundations** (`ButtonBase`, `LinkBase`, `InputBase`, …) are used directly only for patterns no component covers (a tab, a menu item, a whole-card link); `FOUNDATION_USERS` in `tools/cli/lib/check.ts` lists who may, and why is in `src/foundations/AGENTS.md`. Everything else uses the component that owns the element: Button, Link, TextField, Checkbox.
- `styles/manifest.json` then lists, for each component, exactly the stylesheets of the components it renders.
