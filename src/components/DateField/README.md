# DateField

A date in a form: type it as `YYYY-MM-DD`, step it with the arrow keys, or pick it from a [Calendar](../Calendar/README.md) in a popover. Built from TextField, IconButton, Popover and Calendar. The value is a plain date string, with no time or time zone, and is reported only once it is a real, available date.

```tsx
import { DateField } from "@arshad-shah/cynosure";

<DateField label="Due date" name="due" value={due} onChange={setDue} min="2026-01-01" />;
```

| Prop                                  | Default     | Notes                                                                                                                                                                    |
| ------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `layout` / `width`                    | `stack` / – | `split` settings row and the control width, as on `Field`                                                                                                                |
| `label`, `labelHidden`, `description` | –           | As TextField                                                                                                                                                             |
| `value` / `defaultValue` / `onChange` | `null`      | `YYYY-MM-DD` or `null`; `onChange` when typing is finished or a day is picked                                                                                            |
| `min`, `max`, `isDateDisabled`        | –           | Dates outside these are explained and not reported                                                                                                                       |
| `locale`, `weekStartsOn`, `today`     | –           | Passed to the Calendar                                                                                                                                                   |
| `error`                               | –           | Your own message; replaces the field's own                                                                                                                               |
| `name`, `form`, `required`            | –           | Forms submit the date (`YYYY-MM-DD`), never half-typed text; a form will not submit while the text is not an available date, and a form reset brings back `defaultValue` |
| `disabled`, `readOnly`, `size`        | –, `md`     | Read-only fields have no picker                                                                                                                                          |
| `labels`                              | –           | `open`, `invalid`, `unavailable`, `previous`, `next`                                                                                                                     |
- Typing: `2026/1/5`, `2026.1.5` and `2026-1-5` are all read as `2026-01-05` when the field loses focus or Enter is pressed. Text that is not a date stays as typed, with "Enter a date as YYYY-MM-DD" shown and announced as the field's error; a date outside the limits, or unavailable, says so.
- Up and Down step the date a day (Shift: a month), from what is typed if it is a date; the limits stop them.
- The calendar button opens the picker with focus on the chosen day (or today). Choosing a day closes it and returns focus to the field; Escape closes it without choosing.
- Dates are written `YYYY-MM-DD` whatever the locale: one unambiguous form for tools and forms. The calendar's month and day names follow `locale`.

## Tokens

None of its own: it follows TextField, Popover and Calendar.
