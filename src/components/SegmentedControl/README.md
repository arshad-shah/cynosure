# SegmentedControl

A compact single choice (view switchers, modes, theme) on native radios: arrow keys, forms and reset are native; re-activating the current segment never fires `onChange`.

```tsx
<SegmentedControl label="View" options={[{ value: "tree", label: "Tree", icon: tree }, { value: "raw", label: "Raw", icon: code }]} defaultValue="tree" onChange={setView} />
<SegmentedControl label="Theme" iconOnly options={[{ value: "light", label: "Light", icon: sun }, { value: "dark", label: "Dark", icon: moon }]} />
```

| Prop                                         | Default          | Notes                                                                               |
| -------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------- |
| `label`                                      | –                | Accessible group name                                                               |
| `options`                                    | –                | `{ value, label, icon?, disabled? }[]`; `label` names icon-only segments            |
| `value` / `defaultValue` / `onChange(value)` | –                | Controlled or uncontrolled                                                          |
| `name`                                       | –                | Submits the value with its form; two controls may share a name and stay independent |
| `iconOnly` / `fullWidth`                     | `false`          | Visual options                                                                      |
| `size` / `tone`                              | `md` / `neutral` | Tone colours the active segment's content                                           |

## Tokens

- `--cy-segmented-control-{radius,track-bg,active-bg,padding}`

## Used by

Prism (Tree / Raw), Aperture (panel modes), ThemeToggle, Stepframe (view modes), Verql (result views).
