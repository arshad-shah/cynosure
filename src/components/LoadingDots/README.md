# LoadingDots

Three dots that pulse in sequence: Cynosure's indicator for short, indeterminate waits (buttons, inline status, list footers). By default it follows the surrounding font size and text colour, so it fits anywhere text does.

```tsx
import { LoadingDots } from "@arshad-shah/cynosure";

<LoadingDots label="Saving document" />          // announced: role="status"
<LoadingDots size="lg" tone="accent" />           // decorative
<LoadingDots color="#14b8a6" speed="slow" />      // one-off colour
```

| Prop                  | Default   | Notes                                                                                            |
| --------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| `size`                | `inherit` | `inherit` follows the font size; `sm` 12, `md` 16, `lg` 24 px (× scale)                          |
| `tone`                | `inherit` | `accent`, `neutral`, `muted`, `danger`, `success`, `warning`, `info`, or the current text colour |
| `color`               | –         | Any CSS colour for one-off cases; prefer tones or tokens                                         |
| `speed`               | `normal`  | `slow`, `normal`, `fast`                                                                         |
| `label`               | –         | Gives `role="status"` and an accessible name. Omit when the parent already reports busy state.   |
| `className` / `style` | –         | Layout only                                                                                      |

Reduced motion (OS setting or `createTheme({ motion: "reduced" })`) shows three static, fully visible dots.

## Tokens

- `--cy-loading-dots-dot-size`: dot diameter (default 0.5em)
- `--cy-loading-dots-gap`: space between dots (default 0.3em)
- `--cy-loading-dots-color`: dot colour (default: tone or currentColor)
- `--cy-loading-dots-duration`: one pulse cycle (default 6 × motion base)
- `--cy-loading-dots-size-{sm,md,lg}`: font size for each fixed size
