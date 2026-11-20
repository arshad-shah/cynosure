# RadioGroup

One choice from a short list, on native radios: arrow keys move and select (wrapping, skipping disabled, RTL aware), Tab lands on the checked option, and forms, reset and `required` are native. Labelled as a group through `Field`. With `variant="card"` the options are picture cards in a grid (a signature style, a theme, a layout).

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

| Prop                                         | Default         | Notes                                                                                   |
| -------------------------------------------- | --------------- | --------------------------------------------------------------------------------------- |
| `label` / `description` / `error`            | –               | Group label through `Field`                                                             |
| `labelHidden`                                | `false`         | Visually hides the group label; it still names the group. Prefer visible labels         |
| `aria-describedby`                           | –               | Ids of more elements that describe the group, read before its own description and error |
| `options`                                    | –               | `{ value, label, description?, disabled?, media? }[]`; `media` is a card's picture      |
| `value` / `defaultValue` / `onChange(value)` | –               | Controlled or uncontrolled                                                              |
| `orientation`                                | `vertical`      | `vertical` · `horizontal` (lists only)                                                  |
| `variant`                                    | `list`          | `list` · `card`: picture cards in a grid                                                |
| `columns`                                    | `2`             | Cards per row; a narrow container wraps to fewer                                        |
| `size` / `tone`                              | `md` / `accent` | Shared vocabulary                                                                       |
| `name`, `required`, `disabled`               | –               | Native; without `name` nothing is submitted                                             |
| `className` / `style`                        | –               | Layout only                                                                             |

## Cards

```tsx
<RadioGroup
  label="Signature style"
  variant="card"
  columns={3}
  options={fonts.map((f) => ({ value: f.id, label: f.name, media: <FontSample font={f} text={name} /> }))}
/>;
```

- Each option is a card: its `media` above the label. The label names the radio (the picture is not read), and `description` and `disabled` work as in a list.
- The chosen card has an accent border and a soft accent background; the focused card shows the focus ring.
- The native radios stay (visually hidden), so forms, reset, `required`, Tab and Left/Right (wrapping, skipping disabled, RTL) are native. Up and Down move a row, by the columns shown, and stay put at the edges or on a disabled card.
- The grid has `columns` columns while each card is at least `--cy-radio-group-card-min-width` (8rem) wide, and wraps to fewer below that.

## Tokens

- `--cy-radio-group-gap`, `--cy-radio-group-card-min-width` (narrowest card before the grid wraps, default 8rem), plus `--cy-checkbox-border` for the ring and `--cy-checkbox-size{,-sm,-lg}` for its size, so radios line up with checkboxes
- Each option is a [Choice](../Choice/README.md) row: `--cy-choice-gap` is the space before its label
