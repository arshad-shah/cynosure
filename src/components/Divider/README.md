# Divider

A line that separates content: between sections of a page or card (horizontal), between items in a row such as a footer of links (vertical), optionally with a short label in the line ("or").

```tsx
import { Divider, Inline, Stack } from "@arshad-shah/cynosure";

<Stack>
  <Profile />
  <Divider />
  <Billing />
</Stack>

<Divider>or</Divider>                                   // a label in the line
<Divider labelAlign="start">Today</Divider>

<Inline>
  <Link href="/docs">Docs</Link>
  <Divider orientation="vertical" />                    // as tall as the row
  <Link href="/privacy">Privacy</Link>
</Inline>

<Divider decorative={false}>Earlier messages</Divider>  // a real separator, named by its label
```

| Prop                  | Default      | Notes                                                                                               |
| --------------------- | ------------ | --------------------------------------------------------------------------------------------------- |
| `orientation`         | `horizontal` | `horizontal` fills the container's width; `vertical` stretches to the height of its flex row        |
| `children`            | –            | A short label drawn in the line. Horizontal only: a vertical divider ignores it                     |
| `labelAlign`          | `center`     | `start`, `center`, `end`. A start or end label sits flush with that edge (follows `dir`)            |
| `variant`             | `solid`      | `solid`, `dashed`                                                                                   |
| `tone`                | `neutral`    | `neutral` (the quiet line colour), `strong` (for emphasis)                                          |
| `spacing`             | `none`       | `none`, `sm`, `md`, `lg`: margin above and below a horizontal line, before and after a vertical one |
| `decorative`          | `true`       | `false` makes it `role="separator"`                                                                 |
| `className` / `style` | –            | Layout only                                                                                         |
| `data-testid`         | –            | Set on the root element                                                                             |

The forwarded ref is the root `div`.

## Behaviour

- **Element:** a `div`, not an `hr`, so that it can hold a label and stand vertically.
- **No margins by default.** Stack and Inline `gap` usually give the space; `spacing` adds margins along the flow only.
- **Vertical** uses `align-self: stretch`, so it needs a flex (or grid) row to take its height from: Inline, Toolbar, any `display: flex` row. Outside one it is one line of text tall.
- **Horizontal** also uses `align-self: stretch`, so it fills a Stack even when the Stack centres its children.
- **Label:** drawn between two lines, or with one line when `labelAlign` is `start` or `end`. Keep it short; long labels wrap.
- `tone` is `neutral` or `strong` only: a divider is never a status colour, so it does not take the shared `Tone` values.

## Accessibility

- **Decorative (default):** `role="none"`. Assistive technology gets no separator. A label is still read as plain text.
- **`decorative={false}`:** `role="separator"`. `aria-orientation="vertical"` is set on a vertical divider; horizontal is the role's default and is not repeated. A label becomes the separator's accessible name (`aria-labelledby`).
- Nothing is focusable or pressable, so there is no keyboard or touch behaviour.
- The line is drawn with borders, which stay visible in forced-colors mode (they use `CanvasText` there).

## Tokens

- `--cy-divider-thickness`: thickness of the line (falls back to `--cy-border-width`)
- `--cy-divider-color`: line colour of the neutral tone (`--cy-color-line`)
- `--cy-divider-color-strong`: line colour of the strong tone (`--cy-color-muted`)
- `--cy-divider-label-gap`: space between the label and the line on each side of it (`--cy-space-4`)
- `--cy-divider-label-color`: text colour of the label (`--cy-color-muted`)
- `--cy-divider-label-size`: text size of the label (`--cy-font-size-sm`)
- `--cy-divider-spacing-sm`: space around the line with `spacing="sm"` (`--cy-space-2`)
- `--cy-divider-spacing-md`: space around the line with `spacing="md"` (`--cy-space-4`)
- `--cy-divider-spacing-lg`: space around the line with `spacing="lg"` (`--cy-space-6`)

Set them with `createTheme({ components: { divider: { thickness: "2px" } } })`.
