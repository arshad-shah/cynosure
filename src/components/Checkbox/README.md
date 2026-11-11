# Checkbox

A native checkbox under a drawn Facet box: forms (`FormData`, reset, `required`), keyboard (Space) and label clicks come for free. The whole row is the click and touch target.

```tsx
<Checkbox label="Email me updates" name="updates" value="yes" />
<Checkbox label="Select all" checked={all} indeterminate={some} onChange={toggleAll} />
```

| Prop                                               | Default  | Notes                                     |
| -------------------------------------------------- | -------- | ----------------------------------------- |
| `label` / `description`                            | –        | Description linked via `aria-describedby` |
| `checked` / `defaultChecked` / `onChange(checked)` | –        | Controlled or uncontrolled                |
| `indeterminate`                                    | `false`  | Announced as mixed                        |
| `size`                                             | `md`     | box 14 · 16 · 20 px                       |
| `tone`                                             | `accent` | Fill colour when checked                  |
| `name`, `value`, `required`, `disabled`            | –        | Native                                    |

## Tokens

- `--cy-checkbox-{size,radius,border}`

## Used by

Planr (task lists), Aperture (settings), Prism (preferences), Verql (row selection), request-interceptor (rule toggles).
