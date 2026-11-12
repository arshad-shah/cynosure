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

| Prop                                         | Default          | Notes                                                                               |
| -------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------- |
| `label` / `description` / `error`            | –                | Through `Field`                                                                     |
| `options`                                    | –                | `{ value, label, description?, icon?, iconTone?, iconColor?, disabled?, group? }[]` |
| `options[].trailing` / `options[].dimmed`    | –                | Row-end text in the list (a shortcut, a count); muted but still choosable           |
| `footer`                                     | –                | `{ label, icon?, onSelect }`: an action pinned under the options (see below)        |
| `value` / `defaultValue` / `onChange(value)` | –                | Controlled or uncontrolled                                                          |
| `placeholder`                                | `"Select…"`      | Also `labels.placeholder`; `labels.empty` for no options                            |
| `size` / `variant`                           | `md` / `outline` | Shared vocabulary; `size` also takes `xs` (20px, dense chrome)                      |
| `name`, `required`, `disabled`               | –                | `required` participates in form validation                                          |

**Keyboard:** ArrowDown/Up, Enter or Space open; arrows, Home, End, PageUp, PageDown move (disabled skipped); Enter, Space or Tab select; Escape closes without change; typing jumps (ignored during IME composition). Coarse pointers get 44px rows.

- `footer` is the arrow keys' last option (End and PageDown reach it); Enter, Space or a press closes the list, returns focus to the trigger and calls `onSelect`. The value does not change, and Tab passes over it.

- Options with the same `group`, next to each other, are listed under that heading (`role="group"`); arrow keys move straight across headings.

- `iconTone` and `iconColor` on an option colour its `icon`, with the meaning of Icon's `tone` and `color` (`iconColor` is any CSS colour and overrides `iconTone`; `brand` draws a brand mark in its owner's colour). The colour shows in the list, on the highlighted and the selected option, and in the trigger once the option is chosen. A disabled option, and the trigger of a disabled Select, show the icon without its colour, muted with the rest. Menu, ContextMenu and Combobox options take the same two fields. Tone colours keep 3:1 against the highlight; check your own colours in light and dark, and keep the label meaningful without the colour.

## Tokens

- `--cy-select-font-size-xs`: Text size of an `xs` trigger. Default `--cy-font-size-xs`.
- `--cy-select-padding-inline-xs`: Inline padding of an `xs` trigger. Default `--cy-space-4`.
- `--cy-select-height-xs`: Height of an `xs` trigger. Default the `--cy-space-7` step (20px at comfortable scale).

- `--cy-select-{radius,bg,border,list-bg,list-shadow,list-max-height,option-active-bg}`; the list is an [OptionList](../OptionList/README.md), and the `list-*` and `option-*` tokens set its `--cy-option-list-*` tokens.
