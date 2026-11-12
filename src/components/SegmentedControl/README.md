# SegmentedControl

A compact single choice (view switchers, modes, theme) on native radios: arrow keys, forms and reset are native; re-activating the current segment never fires `onChange`.

```tsx
<SegmentedControl label="View" options={[{ value: "tree", label: "Tree", icon: tree }, { value: "raw", label: "Raw", icon: code }]} defaultValue="tree" onChange={setView} />
<SegmentedControl label="Theme" iconOnly options={[{ value: "light", label: "Light", icon: sun }, { value: "dark", label: "Dark", icon: moon }]} />
```

| Prop                                         | Default          | Notes                                                                                     |
| -------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------- |
| `label`                                      | –                | Accessible group name                                                                     |
| `options`                                    | –                | `{ value, label, icon?, disabled? }[]`; `label` names icon-only segments                  |
| `value` / `defaultValue` / `onChange(value)` | –                | Controlled or uncontrolled                                                                |
| `name`                                       | –                | Submits the value with its form; two controls may share a name and stay independent       |
| `iconOnly` / `fullWidth`                     | `false`          | Visual options                                                                            |
| `size` / `tone`                              | `md` / `neutral` | `xs` (20px, dense chrome) · `sm` · `md` · `lg`; tone colours the active segment's content |

## Tokens

- `--cy-segmented-control-font-size-xs`: Text size of an `xs` control. Default `--cy-font-size-xs`.
- `--cy-segmented-control-height-xs`: Height of an `xs` control. Default the `--cy-space-7` step (20px at comfortable scale).

- `--cy-segmented-control-{radius,track-bg,active-bg,padding}`
