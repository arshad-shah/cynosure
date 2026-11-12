# Field

Label, description and error wiring for any control. Controls render through a render prop that receives the ids and state (`useField`).

```tsx
<Field label="Email" description="We never share it." error={error} required>
  {(f) => <InputBase id={f.id} aria-describedby={f.describedBy} invalid={f.invalid} required />}
</Field>;
```

| Prop          | Default | Notes                                                             |
| ------------- | ------- | ----------------------------------------------------------------- |
| `label`       | –       | Visible label (associated with the control, or labelling a group) |
| `description` | –       | Help text, linked via `aria-describedby`                          |
| `error`       | –       | Announced (`role="alert"`), linked, marks the control invalid     |
| `required`    | `false` | Draws the required marker (a shape, not a glyph)                  |
| `size`        | `md`    | `sm` · `md` · `lg`                                                |
| `group`       | `false` | Labels a `role="group"` (radio groups, segmented controls)        |

## Tokens

- `--cy-field-gap`, `--cy-field-label-weight`, `--cy-field-label-color`, `--cy-field-description-color`, `--cy-field-error-color`, `--cy-field-required-color`
