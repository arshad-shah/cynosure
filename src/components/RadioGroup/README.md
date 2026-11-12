# RadioGroup

One choice from a short list, on native radios: arrow keys move and select (wrapping, skipping disabled, RTL aware), Tab lands on the checked option, and forms, reset and `required` are native. Labelled as a group through `Field`.

```tsx
<RadioGroup
  label="Digest"
  name="digest"
  defaultValue="weekly"
  options={[
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly", description: "Every Monday" },
  ]}
/>;
```

| Prop                                         | Default         | Notes                                         |
| -------------------------------------------- | --------------- | --------------------------------------------- |
| `label` / `description` / `error`            | –               | Group label through `Field`                   |
| `options`                                    | –               | `{ value, label, description?, disabled? }[]` |
| `value` / `defaultValue` / `onChange(value)` | –               | Controlled or uncontrolled                    |
| `orientation`                                | `vertical`      | `vertical` · `horizontal`                     |
| `size` / `tone`                              | `md` / `accent` | Shared vocabulary                             |
| `name`, `required`, `disabled`               | –               | Native                                        |

## Tokens

- `--cy-radio-group-gap`, plus `--cy-checkbox-border` for the ring and `--cy-checkbox-size{,-sm,-lg}` for its size, so radios line up with checkboxes
- Each option is a [Choice](../Choice/README.md) row: `--cy-choice-gap` is the space before its label
