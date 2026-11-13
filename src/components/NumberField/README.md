# NumberField

A number input: type it in your own format ("1.234,5" in German, "€1,234.50" as a price), or step it with the arrow keys, Page Up/Down, Home/End or the − and + buttons. An APG spinbutton built on TextField; forms get the plain number.

```tsx
import { NumberField } from "@arshad-shah/cynosure";

<NumberField label="Seats" name="seats" defaultValue={5} min={1} max={50} />
<NumberField label="Price" value={price} onChange={setPrice} step={0.01}
  formatOptions={{ style: "currency", currency: "EUR" }} />;
```

| Prop                                               | Default     | Notes                                                                                    |
| -------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------- |
| `layout` / `width`                                 | `stack` / – | `split` settings row and the control width, as on `Field`                                |
| `value` / `defaultValue`                           | – / `null`  | A number, or `null` for empty                                                            |
| `onChange`                                         | –           | Called when a value is committed: a step, Enter, or leaving the field                    |
| `min` / `max`                                      | –           | Typed and stepped values are clamped; Home/End jump to them                              |
| `step` / `largeStep`                               | `1` / 10×   | Arrows and steppers / Page Up and Down; stepped values snap to `step` counted from `min` |
| `locale` / `formatOptions`                         | browser / – | How numbers are read and written (`Intl.NumberFormat`: currency, percent, units, digits) |
| `hideSteppers`                                     | `false`     | Hide − and + (the keyboard still steps)                                                  |
| `name`, `form`, `required`, `disabled`, `readOnly` | –           | Forms receive the plain number ("1234.5"), not the formatted text                        |
| `labels`                                           | –           | `decrement` ("Decrease"), `increment` ("Increase")                                       |

Also takes TextField's `label`, `labelHidden`, `description`, `error`, `placeholder`, `size` and `variant`. `parseNumber(text, locale, options)` is exported for reading numbers elsewhere; it reads whatever `Intl.NumberFormat` writes for that locale and options (other digits such as Arabic-Indic, currency, percent and unit text, accounting brackets).

- `role="spinbutton"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and the formatted value as `aria-valuetext`.
- Typing commits on Enter or leaving the field; unreadable text goes back to the last value; an empty field is `null`.
- Percent values are typed as people say them (20 means 20%) and stored as fractions (0.2).
- The steppers are not tab stops; their hit areas are at least 24px, 44px on touch screens.

- `scrub`: drag the label sideways to change the value, as design tools do: one `step` every 4 pixels, Shift for ten; Escape mid-drag puts it back. A vertical swipe still scrolls on touch screens.

## Tokens

Uses TextField's tokens (`--cy-text-field-*`).
