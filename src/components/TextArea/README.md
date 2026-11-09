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

Works in native forms (`FormData`, reset restores value, count and height, `required`).

## Tokens

- `--cy-text-area-{radius,padding-inline,padding-block,bg,border,soft-bg}`

## Used by

Planr (task notes), Aperture (CSS editor notes), Verql (query notes), Stepframe (problem input), session-recorder (annotations).
