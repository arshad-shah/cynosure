# ColorSwatches

A palette to pick a colour from: brand colours, presets, or the colours someone used recently. An APG radio group of colour buttons; ColorField shows one in its picker through `swatches`.

```tsx
import { ColorSwatches } from "@arshad-shah/cynosure";

<ColorSwatches
  label="Recent colours"
  swatches={[{ value: "#c2410c", label: "Ember" }, "rgb(47 102 176)", "rebeccapurple"]}
  value={colour}
  onChange={setColour}
/>;
```

| Prop                 | Default | Notes                                                                                      |
| -------------------- | ------- | ------------------------------------------------------------------------------------------ |
| `label`              | –       | Name of the group                                                                          |
| `swatches`           | –       | Any CSS colours, as strings or `{ value, label }` (the label is spoken; default the value) |
| `value` / `onChange` | –       | Matched by colour, so "#FFF" and "white" are the same swatch                               |
| `disabled`, `size`   | –, `md` |                                                                                            |
- One tab stop; arrow keys move and choose (once a colour is chosen); Home and End jump. Tab only focuses: it never replaces a colour that matches no swatch.
- The chosen swatch has a ring and a tick that is dark on light colours and light on dark ones. Transparent colours show over a checkerboard.
- Hit areas are at least 24px, 44px on touch screens.

## Tokens

- `--cy-color-swatches-size`, `--cy-color-swatches-radius`
