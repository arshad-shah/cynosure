# TimeField

A time of day in a form. Type it, step it with the arrow keys or, with `picker`, pick it from a popup: columns that roll under one lens, an AM/PM switch for 12-hour display, and a strip of the whole day to jump along. Built on TextField, Popover, Slider and SegmentedControl. It reads loosely (`930`, `9:30 pm`, `12am`), shows the time the way the person's own region writes it, and always reports 24-hour `HH:MM`.

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
  picker
/>;
```

| Prop                                  | Default  | Notes                                                                                                                                                                                               |
| ------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`, `labelHidden`, `description` | –        | As TextField                                                                                                                                                                                        |
| `value` / `defaultValue` / `onChange` | `null`   | `HH:MM` (or `HH:MM:SS`), 24-hour, or `null`; `onChange` when typing is finished, an arrow steps it or the picker chooses it                                                                         |
| `min`, `max`                          | –        | Same form; times outside are explained and not reported; the arrows and the picker stop there                                                                                                       |
| `step`                                | `1`      | Minutes between the picker's minute rows, and what the arrows move the minutes by (Shift: ten steps)                                                                                                |
| `seconds`                             | `false`  | Include seconds (a third column in the picker)                                                                                                                                                      |
| `hourCycle`                           | `"auto"` | `"auto"` follows the person's language and region; `12` always shows `9:30 PM`, `24` always `21:30`. The value stays 24-hour                                                                        |
| `locale`                              | –        | The language and region `"auto"` follows (default: the browser's)                                                                                                                                   |
| `picker`                              | `false`  | Adds the clock button and the popup. Without it the field is only typed in (clock icon at the start)                                                                                                |
| `dayTrack`                            | `true`   | With `picker`: `false` leaves the popup as columns only                                                                                                                                             |
| `error`                               | –        | Your own message; replaces the field's own                                                                                                                                                          |
| `name`, `form`, `required`            | –        | Forms receive the `HH:MM` value, also when it is shown as 12-hour, never half-typed text; a form will not submit while the text is not an allowed time, and a form reset brings back `defaultValue` |
| `disabled`, `readOnly`, `size`        | –, `md`  | A read-only field has no picker button                                                                                                                                                              |
| `labels`                              | –        | `invalid`, `unavailable`, `open`, `hours`, `minutes`, `seconds`, `am`, `pm`, `period`, `dayTrack`, `now`                                                                                            |

## Typing

- Typing is read when the field loses focus or Enter is pressed: `9` is 09:00, `930` and `0930` are 09:30, `9:30 pm` is 21:30, `12am` is 00:00, whatever `hourCycle` is. Text that is not a time stays as typed, with the expected form shown and announced as the field's error.
- Up and Down step the hours when the caret is before the first colon, the minutes (by `step`) after it, and the seconds after the second; in `AM` or `PM` they change the half of the day. Shift moves ten times as far. Times wrap past midnight unless `min` or `max` stop them, and the caret stays in the same part.
- By default the time is shown the way the person's own region writes it: `9:30 PM` where AM and PM are used, `21:30` elsewhere. `locale` names the region instead of the browser, and `hourCycle={12}` or `{24}` fixes the form for everyone (a tool or a schedule that needs one unambiguous form). On a server it is rendered 24-hour and settles in the browser before the first paint.
- The 12-hour form writes `AM` and `PM` in English, because that is what the field reads back; `labels.am` and `labels.pm` name the switch and the day track's marks.

## The picker

Off unless you pass `picker`.

- The clock button at the end of the field opens a Popover (a dialog named by `labels.open`). It opens on the field's time, or on the earliest allowed time with nothing chosen when the field is empty or not a time.
- **Columns.** Hours, minutes and (with `seconds`) seconds are listboxes. The chosen row of each sits in one lens, so the lens reads as the time. A choice applies at once; there is no confirm button.
  - Click a row, or scroll the column (wheel, finger): it chooses the row it comes to rest on. Rows the limits rule out are struck through and cannot be chosen; a column stopped on one goes to the nearest allowed time.
  - Up and Down roll the focused column, Home and End go to its first and last allowed row, digits seek (`1` then `4` is 14), Left and Right change column, Enter closes the picker and returns focus to the field, Escape closes it.
  - Hours and minutes read left to right in every language.
- **AM/PM** (when the time is shown as 12-hour): a SegmentedControl beside the lens; `A` and `P` from any column do the same. A half the limits leave nothing in is disabled.
- **Day track.** A Slider drawn as the 24 hours, night to midday to night, with the hours outside `min` and `max` hatched. Click or drag to jump (it snaps to `step`); arrows move by `step`, Page Up and Page Down by an hour. Screen readers hear the time, not a number.
- **Now** sets the current time rounded to `step`. It is not offered when the current time is outside the limits.
- Touch: rows are at least 44px tall on coarse pointers.
- `parseTime(text)` (seconds since midnight, or null) and `formatTime(seconds, withSeconds?)` are exported.

## Tokens

- `--cy-time-field-row-height`: Height of a row in the picker's columns (never below the touch hit area).
- `--cy-time-field-column-width`: Width of one column of the picker.
- `--cy-time-field-lens-background`: Background of the band the chosen time sits in.
- `--cy-time-field-night`: Colour of the day track at midnight.
- `--cy-time-field-day`: Colour of the day track at midday.

The field itself follows TextField; the popup follows Popover, the day track Slider and the AM/PM switch SegmentedControl.
