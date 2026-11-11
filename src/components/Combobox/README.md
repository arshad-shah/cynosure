# Combobox

A text input with a list of suggestions (WAI-ARIA APG editable combobox). Type to filter, choose with arrows and Enter or a click, load options as people type, and submit with native forms.

```tsx
<Combobox label="Fruit" options={fruits} name="fruit" />
<Combobox label="Tag" options={tags} allowCustom />
<Combobox label="User" options={results} inputValue={query} onInputChange={setQuery} filter={false} loading={fetching} />
```

| Prop                                           | Default  | Notes                                                                                |
| ---------------------------------------------- | -------- | ------------------------------------------------------------------------------------ |
| `label`, `labelHidden`, `description`, `error` | –        | As TextField                                                                         |
| `options`                                      | –        | `{ value, label, description?, disabled?, icon? }[]`                                 |
| `value` / `defaultValue` / `onChange`          | `""`     | The chosen option's value (or the typed text with `allowCustom`)                     |
| `inputValue` / `onInputChange`                 | –        | The typed text; control it to fetch options                                          |
| `filter`                                       | contains | `(option, text) => boolean`, or `false` to show `options` as given (server-filtered) |
| `allowCustom`                                  | `false`  | Text that matches no option becomes the value                                        |
| `loading`                                      | `false`  | The list shows `labels.loading` and is `aria-busy`                                   |
| `name`, `required`, `disabled`                 | –        | Native form behaviour through a hidden value                                         |
| `labels`                                       | –        | `empty`, `loading`, `required`                                                       |
- Focus stays in the input; the active option is `aria-activedescendant`, so late results never interrupt typing.
- Leaving with text that matches nothing restores the last choice (unless `allowCustom`); leaving it empty clears the value.
- Escape: closes the list, then clears the text, then (with nothing to undo) reaches an enclosing Dialog.

Tokens: `--cy-combobox-list-max-height`, `--cy-combobox-list-bg`, `--cy-combobox-option-active-bg` (and TextField's for the input).

## Used by

aperture-css (property and font pickers), algo-visual (algorithm picker), verql (table and column pickers with server results).
