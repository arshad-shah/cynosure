# Heading

A section or page heading. `level` sets the element (`h1` to `h6`) and `size` sets how it looks, so the page outline stays correct whatever the design asks for.

```tsx
import { Heading } from "@arshad-shah/cynosure";

<Heading level={1}>Projects</Heading>                    // h1, looks "2xl"
<Heading>Recent exports</Heading>                        // h2, looks "xl" (default)
<Heading level={2} size="sm" tone="muted">Filters</Heading>  // still an h2 in the outline
<Heading level={1} size="display" align="center">Capture anything</Heading>
<Heading level={3} truncate>{file.name}</Heading>
```

| Prop                  | Default            | Notes                                                                                                                       |
| --------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `level`               | `2`                | `1` to `6`: the element and the level assistive technology reports                                                          |
| `size`                | follows `level`    | `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl` (1.4 × 2xl), `display`. Level 1 is `2xl`, 2 `xl`, 3 `lg`, 4 `md`, 5 `sm`, 6 `xs` |
| `tone`                | `neutral`          | `neutral` (ink), `muted`, `accent`, `inherit` (the parent's colour)                                                         |
| `weight`              | `bold`             | `medium`, `bold`                                                                                                            |
| `align`               | – (follows parent) | `start`, `center`, `end`; start and end swap in right-to-left layouts                                                       |
| `truncate`            | `false`            | `true`: one line with an ellipsis. A number: cut after that many lines                                                      |
| `id`                  | –                  | For `aria-labelledby` and links to the section                                                                              |
| `className` / `style` | –                  | Layout only                                                                                                                 |

The ref is the heading element (`HTMLHeadingElement`).

**Behaviour:** the display font (`--cy-font-display`), a line height of 1.2, balanced wrapping (`text-wrap: balance`) and no margins: space headings with [Stack](../Stack/README.md) or the layout around them. `size="display"` grows with the viewport and stays between 1.25 and 2 times `2xl`. Long words break instead of overflowing.

**Accessibility:** a real `h1` to `h6`, so it appears in the page outline and screen reader heading lists at `level`. Choose the level from the page structure and the size from the design. A truncated heading keeps its full text as its accessible name. Nothing is pressable, so there is no hit area.

## Tokens

- `--cy-heading-size-xs`: font size of `size="xs"` (falls back to `--cy-font-size-xs`)
- `--cy-heading-size-sm`: font size of `size="sm"` (`--cy-font-size-sm`)
- `--cy-heading-size-md`: font size of `size="md"` (`--cy-font-size-md`)
- `--cy-heading-size-lg`: font size of `size="lg"` (`--cy-font-size-lg`)
- `--cy-heading-size-xl`: font size of `size="xl"` (`--cy-font-size-xl`)
- `--cy-heading-size-2xl`: font size of `size="2xl"` (`--cy-font-size-2xl`)
- `--cy-heading-size-display`: font size of `size="display"` (between 1.25 and 2 times `--cy-font-size-2xl`, following the viewport width)
- `--cy-heading-font-family`: font family (`--cy-font-display`)
- `--cy-heading-font-weight`: weight of bold headings (`--cy-font-weight-bold`)
- `--cy-heading-line-height`: line height as a number (1.2)

Set them with `createTheme({ components: { heading: { sizeXl: "1.5rem", "size-2xl": "2rem" } } })`.
