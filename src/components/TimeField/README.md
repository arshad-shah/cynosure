# TimeField

A time of day in a form, typed in 24-hour `HH:MM` (or `HH:MM:SS` with `seconds`). Built on TextField. It reads loosely (`930`, `9:30 pm`, `12am`) and reports strictly, and the arrow keys step whichever part the caret is in.

```tsx
import { TimeField } from "@arshad-shah/cynosure";

<TimeField
  label="Start time"
  name="start"
  value={start}
  onChange={setStart}
  min="09:00"
  max="17:30"
  step={15}
/>;
```

| Prop                                  | Default | Notes                                                                            |
| ------------------------------------- | ------- | -------------------------------------------------------------------------------- |
| `label`, `labelHidden`, `description` | –       | As TextField                                                                     |
| `value` / `defaultValue` / `onChange` | `null`  | `HH:MM` (or `HH:MM:SS`) or `null`; `onChange` when typing is finished or stepped |
| `min`, `max`                          | –       | Same form; times outside are explained and not reported; the arrows stop there   |
| `step`                                | `1`     | Minutes the arrows move the minutes by (Shift: ten steps)                        |
| `seconds`                             | `false` | Include seconds                                                                  |
| `error`                               | –       | Your own message; replaces the field's own                                       |
| `name`, `form`, `required`            | –       | Forms submit the text, `HH:MM` once valid                                        |
| `disabled`, `readOnly`, `size`        | –, `md` |                                                                                  |
| `labels`                              | –       | `invalid`, `unavailable`                                                         |
- Typing is read when the field loses focus or Enter is pressed: `9` is 09:00, `930` and `0930` are 09:30, `9:30 pm` is 21:30, `12am` is 00:00. Text that is not a time stays as typed, with the expected form shown and announced as the field's error.
- Up and Down step the hours when the caret is before the first colon, the minutes (by `step`) after it, and the seconds after the second; Shift moves ten times as far. Times wrap past midnight unless `min` or `max` stop them, and the caret stays in the same part.
- Times are shown in 24-hour form whatever the locale: one unambiguous form for tools and schedules.
- `parseTime(text)` (seconds since midnight, or null) and `formatTime(seconds, withSeconds?)` are exported.

## Tokens

None of its own: it follows TextField.

## Used by

The tools app's time inputs (cron and time-zone tools), Verql's query filters and Planr's task times.
