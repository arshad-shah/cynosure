# Choice

The row a choice control sits in: the control, its label and an optional description, with the whole row as the click and touch target. Checkbox, Switch and each RadioGroup option are Choice rows; each draws its own control. Use Choice directly only to build a new kind of choice control; for a labelled checkbox, switch or radio use those components.

```tsx
import { Choice, ChoiceBase } from "@arshad-shah/cynosure";

<Choice
  label="Show hidden files"
  description="Dotfiles and system folders."
  onChange={setShown}
  control={(input) => (
    <span className="my-star">
      <ChoiceBase {...input} type="checkbox" />
    </span>
  )}
/>;
```

| Prop                                               | Default | Notes                                                                                  |
| -------------------------------------------------- | ------- | -------------------------------------------------------------------------------------- |
| `control(input)`                                   | –       | Draws the control. Spread `input` onto `ChoiceBase`, a direct child of what you return |
| `label` / `description`                            | –       | The label names the input; the description is linked with `aria-describedby`           |
| `checked` / `defaultChecked` / `onChange(checked)` | –       | Controlled or uncontrolled; passed to the input through `input`                        |
| `strikeWhenChecked`                                | `false` | While the input is checked (not mixed), the label is struck through and muted          |
| `size`                                             | `md`    | Text size: `sm` · `md` · `lg`                                                          |
| `name`, `value`, `required`, `disabled`, `id`      | –       | Passed to the input; `disabled` also dims the row                                      |
| `className` / `style`                              | –       | Layout only, on the root `<label>`                                                     |

`ChoiceControlProps` is the prop set Checkbox and Switch share (Choice's props plus `tone`, without `control`).

## Accessibility and touch

The root is a `<label>` for the input, so pressing the label or description toggles it; the label element names the input (`aria-labelledby`). The row is at least `--cy-hit-min` (24px) tall, and `--cy-hit-coarse` (44px) on coarse pointers, where the control is centred on the text.

## Tokens

- `--cy-choice-gap`: space between the control and the text (default `--cy-space-4`)
- `--cy-choice-done-color`: label and description colour of a checked `strikeWhenChecked` row (default `--cy-color-muted`; keep it at 4.5:1 or more). Checkbox sets it from `--cy-checkbox-done-color`.
- `--cy-choice-strike-width`: thickness of the strike (default: the border width, or 1/16 of the text size when that is larger). Checkbox sets it from `--cy-checkbox-strike-width`.
