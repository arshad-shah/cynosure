# TextField

Single-line input with label, description, error, icons and an optional clear button (an `IconButton`).

```tsx
<TextField label="Email" type="email" name="email" required iconStart={mail} clearable />
<TextField label="Name" value={name} onChange={setName} error={nameError} />
```

| Prop                                                                                    | Default   | Notes                                                                     |
| --------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------- |
| `label` / `description` / `error`                                                       | –         | Through `Field` (linked and announced)                                    |
| `value` / `defaultValue` / `onChange(value)`                                            | –         | Controlled or uncontrolled                                                |
| `type`                                                                                  | `text`    | `text`, `email`, `url`, `tel`, `password`, `number`, `search`             |
| `size`                                                                                  | `md`      | `sm` · `md` · `lg`                                                        |
| `variant`                                                                               | `outline` | `outline` · `soft`                                                        |
| `iconStart` / `iconEnd`                                                                 | –         | Facet icons (RTL aware)                                                   |
| `addonStart`                                                                            | –         | Controls inside the field's start, before the input (ColorField's swatch) |
| `addonEnd`                                                                              | –         | Controls inside the field's end, after the input (NumberField's steppers) |
| `clearable`                                                                             | `false`   | Clear button while filled; `labels.clear` overrides "Clear"               |
| `required`, `disabled`, `readOnly`, `name`, `maxLength`, `autoComplete`, `inputMode`, … | –         | Native input attributes                                                   |

Works in native forms: `FormData`, `form.reset()` and `required` validation. With `type="search"` the browser's own search decorations are hidden (use `clearable`).

- `revealable` (with `type="password"`): a Show/Hide button for API keys, tokens and passwords (`labels.show`, `labels.hide`).

## Tokens

- `--cy-text-field-{height-sm,height-md,height-lg,radius,padding-inline,bg,border,soft-bg}`
- `--cy-text-field-numeric`: `font-variant-numeric` of the typed text (default `normal`); DateField, NumberField and TimeField set `tabular-nums` so digits line up.
