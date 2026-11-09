# Select

A select-only combobox (WAI-ARIA APG): the trigger is a Cynosure button with `role="combobox"`, the list is a top-layer `listbox` (never clipped, works in shadow roots). Forms work through `HiddenValue`.

```tsx
<Select
  label="Fruit"
  name="fruit"
  options={[
    { value: "apple", label: "Apple" },
    { value: "pear", label: "Pear", description: "Seasonal" },
  ]}
/>;
```

| Prop                                         | Default          | Notes                                                    |
| -------------------------------------------- | ---------------- | -------------------------------------------------------- |
| `label` / `description` / `error`            | –                | Through `Field`                                          |
| `options`                                    | –                | `{ value, label, description?, icon?, disabled? }[]`     |
| `value` / `defaultValue` / `onChange(value)` | –                | Controlled or uncontrolled                               |
| `placeholder`                                | `"Select…"`      | Also `labels.placeholder`; `labels.empty` for no options |
| `size` / `variant`                           | `md` / `outline` | Shared vocabulary                                        |
| `name`, `required`, `disabled`               | –                | `required` participates in form validation               |

**Keyboard:** ArrowDown/Up, Enter or Space open; arrows, Home, End, PageUp, PageDown move (disabled skipped); Enter, Space or Tab select; Escape closes without change; typing jumps (ignored during IME composition). Coarse pointers get 44px rows.

## Tokens

- `--cy-select-{radius,bg,border,list-bg,list-shadow,list-max-height,option-active-bg}`

## Used by

Prism (search field scope), Aperture (property pickers), Verql (database picker), Planr, Stepframe (language).
