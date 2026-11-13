# TextArea

Multi-line input that grows with its content from `rows` up to `maxRows`, then scrolls. Optional live counter.

```tsx
<TextArea label="Notes" name="notes" rows={3} maxRows={10} maxLength={500} showCount />;
```

| Prop                                         | Default          | Notes                                                             |
| -------------------------------------------- | ---------------- | ----------------------------------------------------------------- |
| `label` / `description` / `error`            | –                | Through `Field`                                                   |
| `value` / `defaultValue` / `onChange(value)` | –                | Controlled or uncontrolled                                        |
| `rows` / `maxRows`                           | `3` / `12`       | Minimum rows and auto-grow cap                                    |
| `maxLength` / `showCount`                    | – / `false`      | Counter is `aria-live="polite"` and linked via `aria-describedby` |
| `labels.count(n, max)`                       | `"n / max"`      | Override the counter text                                         |
| `size` / `variant`                           | `md` / `outline` | `sm` · `md` · `lg`; `outline` · `soft`                            |
| `trigger` / `suggestions` / `onMention`      | –                | Mentions: see below                                               |
| `labels.loading`                             | `"Loading…"`     | The suggestion list's loading note (the field's label names it)   |

Mentions: with `trigger` (such as `"@"`) and `suggestions` (a list filtered by the query, or a function of the query returning items or a promise), typing the trigger at the start of a word opens the shared drop-down list (`OptionList` on `useListboxLayer`) below the box. Arrows move, Enter or Tab inserts the item's `value` and a space in place of the trigger and query (a native edit: `onChange` hears it and Undo reverts it), Escape closes it for that mention, and `onMention(item)` is called. While open, the textarea carries `aria-controls` and `aria-activedescendant` (it keeps `aria-autocomplete="list"` and `aria-haspopup="listbox"`; a textarea may not take `aria-expanded`). Keys the list uses are not passed to `onKeyDown`. IME-safe: the query is read when a composition ends.

```tsx
<TextArea label="Message" trigger="@" suggestions={(q) => api.people(q)} onMention={(p) => track(p.value)} />;
```

Works in native forms (`FormData`, reset restores value, count and height, `required`).

## Tokens

- `--cy-text-area-{radius,padding-inline,padding-block,bg,border,soft-bg}`

Drag the corner grip (pointer or touch) to set a height; the box keeps it and still grows with content up to `maxRows` (or the chosen height, if taller). `resizable={false}` removes the grip; disabled areas have none. The grip is a hand-made, `aria-hidden` pointer affordance: keyboard users get content growth instead. The grip stays a small square in the corner on every device; on touch screens only its invisible tap area grows to 44px, and the text keeps a bottom margin so it never runs under the grip.
