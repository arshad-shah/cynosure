# TextArea

Multi-line input that grows with its content from `rows` up to `maxRows`, then scrolls. Optional live counter.

```tsx
<TextArea label="Notes" name="notes" rows={3} maxRows={10} maxLength={500} showCount />;
```

| Prop                                         | Default          | Notes                                                                                                                                   |
| -------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `layout` / `width`                           | `stack` / –      | `split` settings row and the control width, as on `Field`                                                                               |
| `label` / `description` / `error`            | –                | Through `Field`                                                                                                                         |
| `labelHidden`                                | `false`          | Visually hides the label; it still names the control. Prefer visible labels                                                             |
| `aria-labelledby` / `aria-describedby`       | –                | Named by other elements instead of the label (pair with `labelHidden`); your describing ids come before the field's own and the counter |
| `value` / `defaultValue` / `onChange(value)` | –                | Controlled or uncontrolled                                                                                                              |
| `rows` / `maxRows`                           | `3` / `12`       | Minimum rows and auto-grow cap                                                                                                          |
| `maxLength` / `showCount`                    | – / `false`      | Counter is `aria-live="polite"` and linked via `aria-describedby`                                                                       |
| `labels.count(n, max)`                       | `"n / max"`      | Override the counter text                                                                                                               |
| `size` / `variant`                           | `md` / `outline` | `sm` · `md` · `lg`; `outline` · `soft`                                                                                                  |
| `resizable`                                  | `true`           | Shows the corner grip for setting a height (see below)                                                                                  |
| `monospace`                                  | `false`          | Types in the mono font (`--cy-font-mono`): code, JSON, tokens                                                                           |
| `trigger` / `suggestions` / `onMention`      | –                | Mentions: see below                                                                                                                     |
| `onFiles` / `accept`                         | –                | Files dropped on the field (those `accept` allows); the text is not changed, read a file with `file.text()`                             |
| `labels.loading`                             | `"Loading…"`     | The suggestion list's loading note (the field's label names it)                                                                         |

Mentions: with `trigger` (such as `"@"`) and `suggestions` (a list filtered by the query, or a function of the query returning items or a promise), typing the trigger at the start of a word opens the shared drop-down list (`OptionList` on `useListboxLayer`) below the box. Arrows move, Enter or Tab inserts the item's `value` and a space in place of the trigger and query (a native edit: `onChange` hears it and Undo reverts it), Escape closes it for that mention, and `onMention(item)` is called. While open, the textarea carries `aria-controls` and `aria-activedescendant` (it keeps `aria-autocomplete="list"` and `aria-haspopup="listbox"`; a textarea may not take `aria-expanded`). Keys the list uses are not passed to `onKeyDown`. IME-safe: the query is read when a composition ends.

```tsx
<TextArea label="Message" trigger="@" suggestions={(q) => api.people(q)} onMention={(p) => track(p.value)} />;
```

Dropped files: with `onFiles`, files dragged over the field give it the accent border and fill, and a drop hands over the ones `accept` allows (nothing is called when none are). The drop never changes the text, so the caller decides: `onFiles={async ([f]) => setValue(await f.text())}`. Dragged text still drops natively, and without `onFiles` files are left to the browser.

Works in native forms (`FormData`, reset restores value, count and height, `required`).

## Tokens

- `--cy-text-area-{radius,padding-inline,padding-block,bg,border,soft-bg,readonly-bg}` (`readonly-bg` is the fill of a read-only area)
- `--cy-text-area-mono-font`: the font of a `monospace` area. Default `--cy-font-mono`.

Drag the corner grip (pointer or touch) to set a height; the box keeps it and still grows with content up to `maxRows` (or the chosen height, if taller). `resizable={false}` removes the grip; disabled areas have none. The grip is a hand-made, `aria-hidden` pointer affordance: keyboard users get content growth instead. The grip stays a small square in the corner on every device; on touch screens only its invisible tap area grows to 44px, and the text keeps a bottom margin so it never runs under the grip.
