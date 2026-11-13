# ColorField

A colour input. Type any CSS colour (a hex code, `rgb()`, `hsl()`, `oklch()` or a name), or pick one: a saturation and brightness area, a hue slider, an optional opacity slider, and the screen eyedropper where the browser has one.

```tsx
<ColorField label="Accent" defaultValue="rgb(51 102 255)" onChange={setAccent} />
<ColorField label="Overlay" alpha format="rgb" name="overlay" />
```

| Prop                                           | Default     | Notes                                                     |
| ---------------------------------------------- | ----------- | --------------------------------------------------------- |
| `layout` / `width`                             | `stack` / – | `split` settings row and the control width, as on `Field` |
| `label`, `labelHidden`, `description`, `error` | –           | As TextField                                              |
| `value` / `defaultValue` / `onChange`          | `black`     | Any CSS colour in; `onChange` reports it in `format`      |
| `format`                                       | `hex`       | `hex` (six digits, eight with opacity) · `rgb` · `oklch`  |
| `alpha`                                        | `false`     | Adds the opacity slider and keeps opacity in the value    |
| `name`, `required`, `disabled`                 | –           | Native form behaviour through a hidden value              |
| `labels`                                       | –           | `pick`, `area`, `hue`, `alpha`, `eyedropper`, `invalid`   |
- Typed text is read on Enter or when leaving the field; text that is not a colour shows `labels.invalid` and changes nothing.
- The area is a keyboard slider: Left/Right for saturation, Up/Down for brightness, Shift for steps of ten.
- The eyedropper button appears only where `EyeDropper` exists (Chromium today).
- `readColor(text)` is exported: it reads any CSS colour (alpha included) into sRGB.

Tokens: `--cy-color-field-swatch-size`, `--cy-color-field-area-height`, `--cy-color-field-picker-width` (and TextField's for the field).

Pass `swatches` (any CSS colours, or `{ value, label }`) to offer brand, preset or recent colours in the picker as a [ColorSwatches](../ColorSwatches/README.md) group; keep recent colours yourself.
