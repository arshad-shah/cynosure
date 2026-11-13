# OptionList

The drop-down list of options under a field: a top-layer `listbox` of options, with an optional icon and description line per option, group headings, and a note in place of options ("No matches", "Loading…"). Select, Combobox, TagInput and TextArea's mentions draw their lists with it; it holds no state and handles no keys. The field that owns the list keeps focus, moves the active option with `aria-activedescendant`, and shows, places and dismisses the list with `useListboxLayer` (`src/overlay/listbox-layer.ts`).

```tsx
import { OptionList, OptionListItem, OptionListNote } from "@arshad-shah/cynosure";

useListboxLayer({ anchor: field, list, open, onClose: () => setOpen(false) });

<OptionList ref={list} id={listId} label="Fruit">
  {matches.length === 0 && <OptionListNote>No matches</OptionListNote>}
  {matches.map((fruit, index) => (
    <OptionListItem
      key={fruit.value}
      id={`${listId}-${index}`}
      label={fruit.label}
      description={fruit.description}
      selected={fruit.value === value}
      active={index === active}
      disabled={fruit.disabled}
      onPointerMove={() => setActive(index)}
      onClick={() => choose(fruit)}
    />
  ))}
</OptionList>;
```

| Part / prop                                       | Default | Notes                                                                        |
| ------------------------------------------------- | ------- | ---------------------------------------------------------------------------- |
| `OptionList` `id`                                 | –       | The field's `aria-controls`; options' ids start with it                      |
| `OptionList` `label` / `aria-labelledby`          | –       | Accessible name: a string, or the id of the visible label                    |
| `OptionList` `busy`                               | `false` | `aria-busy` while options load                                               |
| `OptionList` `footer`                             | –       | An action option pinned under the options (see below)                        |
| `OptionListItem` `id`, `label`                    | –       | The `aria-activedescendant` target and its text                              |
| `OptionListItem` `description`, `icon`            | –       | A muted second line; a node drawn before the text                            |
| `OptionListItem` `selected`, `active`, `disabled` | `false` | `aria-selected` (accent, bolder), highlighted, `aria-disabled` (faded)       |
| `OptionListItem` `trailing`                       | –       | At the row's end, smaller and muted: a shortcut, a count                     |
| `OptionListItem` `dimmed`                         | `false` | Muted but still choosable (a saved, unconnected connection)                  |
| `OptionListItem` other attributes                 | –       | `onClick`, `onPointerMove`, `data-*` pass through; a press never moves focus |
| `OptionListNote` `children`                       | –       | A line in place of options: an option that cannot be chosen                  |
| `OptionListGroup` `id`, `label`, `children`       | –       | A `role="group"` named by its heading; the heading is not an option          |
| `className` / `style`                             | –       | Layout only                                                                  |

Options are at least 24px tall, and 44px on coarse pointers. In forced-colors mode the active option is outlined.

**Footer.** `footer` takes `{ action, id, active, onActive, onRun }`: the list draws the action (`{ label, icon?, onSelect }`, "Manage connections…") as its last option, with the id the field points at, highlighted while `active`; the pointer moving over it calls `onActive` and a press `onRun`. It stays in view under the options while they scroll, set off by a line. It is an option rather than a button: the field keeps focus and moves through options with `aria-activedescendant`, and a listbox may only hold options, so a button would be out of the arrow keys' reach and a Tab to it would close the list. The owning field makes it the arrow keys' last stop and runs it on Enter (Select and Combobox take a `footer` action).

## Tokens

- `--cy-option-list-bg`: the list's background
- `--cy-option-list-shadow`: the list's shadow
- `--cy-option-list-max-height`: the height after which the list scrolls (default `min(320px, 60vh)`)
- `--cy-option-list-max-width`: the widest the list grows (default `480px`, never wider than the viewport)
- `--cy-option-list-active-bg`: the highlight of the active option

Select and Combobox set these from their own `--cy-select-*` and `--cy-combobox-*` list tokens.
