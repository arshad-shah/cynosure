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
| `size`        | `md`    | `xs` · `sm` · `md` · `lg` (an `xs` control has the `sm` label)    |
| `group`       | `false` | Labels a `role="group"` (radio groups, segmented controls)        |
| `layout`      | `stack` | `split`: label and description at the start, control at the end   |
| `width`       | –       | Control width: `sm` · `md` · `lg` (tokens) · `full`               |
- `layout="split"` is a settings row: the label and description at the start, the control at the end of the same row, centred on the text; when the field is too narrow for both (the text column below `--cy-field-split-text-min`), the control moves under the text. The error takes its own line below. The label still labels the control and the description and error still describe it. Also on every control built on Field (TextField, Select, Combobox, TagInput, PathField, NumberField, DateField, TimeField, ColorField, TextArea and HotkeyField), through the `FieldLayoutProps` type.
- `width` sets the control's width, so a column of settings lines up whatever the labels: `sm`, `md` and `lg` are the `--cy-field-control-width-*` tokens (160, 256 and 384px by default, never wider than the field), `full` the whole field. The control fills that width. Also on every control built on Field.

## Tokens

- `--cy-field-control-border`, `--cy-field-control-bg`, `--cy-field-control-radius`: the field skin, the box of every field (TextField and the fields built on it, Select, TextArea, HotkeyField), under each control's own tokens (`--cy-text-field-border`…). Restyle fields once here. Defaults `--cy-color-line`, `--cy-color-surface` and the control height times `--cy-radius-factor`.
- `--cy-field-control-sunken-bg`: the sunken fill of a box that cannot be edited (a read-only TextField or TextArea, a disabled HotkeyField). Default `--cy-color-soft`.
- `--cy-field-gap`, `--cy-field-label-weight`, `--cy-field-label-color`, `--cy-field-description-color`, `--cy-field-error-color`, `--cy-field-required-color`
- `--cy-field-control-width-sm`, `--cy-field-control-width-md`, `--cy-field-control-width-lg`: the control widths (160, 256, 384px)
- `--cy-field-split-text-min`: narrowest the label and description get in the split layout before the control moves under them (192px)
