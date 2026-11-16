# ColorSample

A colour shown as a surface (a palette entry, a picked colour), or text in one colour on another with its contrast ratio and the WCAG levels it meets (a contrast preview). It is read-only: to choose a colour use ColorSwatches or ColorField, and to show a row of colours without a choice use `ColorSwatches readOnly`.

```tsx
import { ColorSample } from "@arshad-shah/cynosure";

<ColorSample color={base} label="Base colour" />
<ColorSample color={background} ink={text}>The quick brown fox</ColorSample>
<ColorSample color={background} ink={text} largeText size="lg">Heading</ColorSample>
```

| Prop                  | Default | Notes                                                                                              |
| --------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| `color`               | –       | Any CSS colour, painted as the surface (over a checkerboard, so a translucent colour reads as one) |
| `ink`                 | –       | A text colour: draws `children` in it on `color` and shows the contrast line                       |
| `children`            | `Aa`    | The sample text, with `ink`                                                                        |
| `label`               | –       | The accessible name. Default: the colour, or "`ink` on `color`" with an ink                        |
| `contrast`            | `true`  | With `ink`: show the contrast ratio and the AA and AAA verdicts                                    |
| `largeText`           | `false` | Judge as large text: AA at 3:1 and AAA at 4.5:1 (else 4.5 and 7)                                   |
| `size`                | `md`    | `sm` · `md` · `lg`: the surface's height and the sample text's size                                |
| `labels`              | –       | `contrast(ratio)`, `pass(level)`, `fail(level)`, `on(ink, color)`, `sample`                        |
| `className` / `style` | –       | Layout only                                                                                        |
| `id`, `data-*`, `ref` | –       | Set on the root element                                                                            |

## Behaviour

- **Roles.** Without an ink the sample is an `img` named by `label` (default the colour). With an ink it is a `group` named by `label` (default "#767676 on #ffffff"), holding the text and the contrast line.
- **Contrast.** The WCAG 2 ratio of the pair as seen: a translucent colour is laid over white, then a translucent ink over that, each channel rounded to 8 bits. The ratio is cut (never rounded up) to two decimals, so 4.478 shows as 4.47 and fails AA. Each level is a Badge with a tick or a cross; its spoken text says "AA pass" or "AA fail".
- **Width.** It fills the width it is given; the surface has a height of its own.
- `sampleContrast(ink, color)` is exported: the same ratio, for your own checks.

## Tokens

- `--cy-color-sample-height`: height of the surface at `md` (default three times `--cy-space-10`; `sm` is half, `lg` five thirds)
- `--cy-color-sample-radius`: corner radius of the surface (default `--cy-radius-md`)
- `--cy-color-sample-gap`: space between the surface and the contrast line (default `--cy-space-3`)
