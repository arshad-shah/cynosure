# Combobox

A text input with a list of suggestions (WAI-ARIA APG editable combobox). Type to filter, choose with arrows and Enter or a click, load options as people type, and submit with native forms.

```tsx
<Combobox label="Fruit" options={fruits} name="fruit" />
<Combobox label="Tag" options={tags} allowCustom />
<Combobox label="User" options={results} inputValue={query} onInputChange={setQuery} filter={false} loading={fetching} />
```

| Prop                                           | Default          | Notes                                                                                         |
| ---------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------- |
| `layout` / `width`                             | `stack` / –      | `split` settings row and the control width, as on `Field`                                     |
| `label`, `labelHidden`, `description`, `error` | –                | As TextField                                                                                  |
| `options`                                      | –                | `{ value, label, description?, disabled?, icon?, iconTone?, iconColor? }[]`                   |
| `value` / `defaultValue` / `onChange`          | `""`             | The chosen option's value (or the typed text with `allowCustom`)                              |
| `inputValue` / `onInputChange`                 | –                | The typed text; control it to fetch options (a controlled `value` shows its label without it) |
| `filter`                                       | contains         | `(option, text) => boolean`, or `false` to show `options` as given (server-filtered)          |
| `options[].trailing` / `options[].dimmed`      | –                | Row-end text (a shortcut, a count); muted but still choosable                                 |
| `footer`                                       | –                | `{ label, icon?, onSelect }`: an action pinned under the options, the arrows' last stop       |
| `allowCustom`                                  | `false`          | Text that matches no option becomes the value                                                 |
| `loading`                                      | `false`          | The list shows `labels.loading` and is `aria-busy`                                            |
| `placeholder`                                  | –                | Hint shown in the input while it is empty                                                     |
| `size` / `variant`                             | `md` / `outline` | `sm` · `md` · `lg`; `outline` · `soft` (tinted, borderless until focus)                       |
| `name`, `required`, `disabled`                 | –                | Native form behaviour through a hidden value                                                  |
| `iconStart`                                    | –                | Icon at the start of the input                                                                |
| `labels`                                       | –                | `empty` ("No matches"), `loading` ("Loading…"), `required` ("Please choose a value.")         |
| `className` / `style`                          | –                | Layout only                                                                                   |
- Focus stays in the input; the active option is `aria-activedescendant`, so late results never interrupt typing.
- While typing, the text is marked where it appears in each option's label (HighlightedText).
- Leaving with text that matches nothing restores the last choice (unless `allowCustom`); leaving it empty clears the value.
- Escape: closes the list, then clears the text and the value, then (with nothing to undo) reaches an enclosing Dialog.
- A controlled `value` shows its option's label in the input from the first render, and a value set from outside replaces the text (or clears it) unless the person is typing.
- `iconTone` and `iconColor` on an option colour its `icon` in the list, with the meaning of Icon's `tone` and `color` (`iconColor` is any CSS colour and overrides `iconTone`), the same two fields as Select and Menu options. The active and the selected option keep the colour; a disabled option shows the icon without it, muted with its row. The input shows text only (`iconStart` is the field's own icon).

## Tokens

- `--cy-combobox-list-max-height`: tallest the option list gets before it scrolls (default `min(320px, 60vh)`)
- `--cy-combobox-list-max-width`: widest the option list may grow (default 480px)
- `--cy-combobox-list-bg`: background of the option list
- `--cy-combobox-option-active-bg`: background of the active option

The input uses TextField's tokens. The list is an [OptionList](../OptionList/README.md); these tokens set its `--cy-option-list-*` tokens.
