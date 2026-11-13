# TextField

Single-line input with label, description, error, icons and an optional clear button (an `IconButton`).

```tsx
<TextField label="Email" type="email" name="email" required iconStart={mail} clearable />
<TextField label="Name" value={name} onChange={setName} error={nameError} />
```

| Prop                                                                                    | Default     | Notes                                                                     |
| --------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------- |
| `label` / `description` / `error`                                                       | –           | Through `Field` (linked and announced)                                    |
| `layout` / `width`                                                                      | `stack` / – | `split` settings row and the control width, as on `Field`                 |
| `value` / `defaultValue` / `onChange(value)`                                            | –           | Controlled or uncontrolled                                                |
| `type`                                                                                  | `text`      | `text`, `email`, `url`, `tel`, `password`, `number`, `search`             |
| `size`                                                                                  | `md`        | `xs` · `sm` · `md` · `lg` (`xs`: 20px, dense chrome, still 24px to press) |
| `variant`                                                                               | `outline`   | `outline` · `soft`                                                        |
| `iconStart` / `iconEnd`                                                                 | –           | Facet icons (RTL aware)                                                   |
| `addonStart`                                                                            | –           | Controls inside the field's start, before the input (ColorField's swatch) |
| `addonEnd`                                                                              | –           | Controls inside the field's end, after the input (NumberField's steppers) |
| `boxRef`                                                                                | –           | The field's box, to anchor a list to the whole field (Combobox, TagInput) |
| `clearable`                                                                             | `false`     | Clear button while filled; `labels.clear` overrides "Clear"               |
| `required`, `disabled`, `readOnly`, `name`, `maxLength`, `autoComplete`, `inputMode`, … | –           | Native input attributes                                                   |

Works in native forms: `FormData`, `form.reset()` and `required` validation. With `type="search"` the browser's own search decorations are hidden (use `clearable`).

- `revealable` (with `type="password"`): a Show/Hide button for API keys, tokens and passwords (`labels.show`, `labels.hide`).

## Tokens

- `--cy-text-field-font-size-xs`: Text size of an `xs` field. Default `--cy-font-size-xs`.
- `--cy-text-field-padding-inline-xs`: Inline padding of an `xs` field. Default `--cy-space-4`.
- `--cy-text-field-height-xs`: Height of an `xs` field. Default the `--cy-space-7` step (20px at comfortable scale).

- `--cy-text-field-{height-sm,height-md,height-lg,radius,padding-inline,bg,border,soft-bg}`
- `--cy-text-field-numeric`: `font-variant-numeric` of the typed text (default `normal`); DateField, NumberField and TimeField set `tabular-nums` so digits line up.
