# Calendar

A month of days, to pick one from or to lay out a month's plans on. It is the WAI-ARIA APG date grid: one Tab stop on the focused day, arrows by day and week, Page Up and Down by month. Dates are plain `YYYY-MM-DD` strings, with no time or time zone, so a date picked in one place is the same date everywhere. For a date in a form, use [DateField](../DateField/README.md), which opens this in a popover.

```tsx
import { Calendar } from "@arshad-shah/cynosure";

<Calendar value={date} onChange={setDate} min="2026-01-01" isDateDisabled={isFullyBooked} />;

// A planner's month: your content under each day's number, weekends tinted, a dot per category.
<Calendar
  month={month}
  onMonthChange={setMonth}
  monthPicker
  renderDay={(date) => events[date]?.map((e) => <Badge key={e.id}>{e.title}</Badge>)}
  markDay={(date, day) => ({
    tone: day.weekend ? "neutral" : undefined,
    dots: tasks[date]?.map((t) => t.categoryColour),
    label: tasks[date] ? `${tasks[date].length} tasks` : undefined,
  })}
/>;
```

| Prop                                  | Default           | Notes                                                                 |
| ------------------------------------- | ----------------- | --------------------------------------------------------------------- |
| `value` / `defaultValue` / `onChange` | `null`            | `YYYY-MM-DD`; `onChange` when a day is chosen                         |
| `defaultFocusedDate`                  | today             | Where focus starts when nothing is selected                           |
| `month`                               | –                 | The month shown, controlled: `YYYY-MM`, or any `YYYY-MM-DD` of it     |
| `defaultMonth`                        | the value's month | The month shown at first, when uncontrolled                           |
| `onMonthChange`                       | –                 | The first day (`YYYY-MM-01`) of the month now shown, or asked for     |
| `monthPicker`                         | `false`           | The heading becomes a button that opens a panel of months and years   |
| `min`, `max`                          | –                 | Limits: focus and the month buttons stop there                        |
| `isDateDisabled`                      | –                 | Days that can be focused but not chosen                               |
| `locale`                              | the browser's     | Month and day names, through `Intl`                                   |
| `weekStartsOn`                        | the locale's      | 0 Sunday to 6 Saturday; Monday when the browser does not know         |
| `today`                               | the device's date | What counts as today                                                  |
| `renderDay`                           | –                 | `(date, state)`: content in the day, under its number                 |
| `markDay`                             | –                 | `(date, state)` returns `{ tone?, dots?, label? }`: marks, not markup |
| `labels`                              | –                 | `previous`, `next`, `monthPicker`, `previousYear`, `nextYear`         |
| `size`                                | `md`              | `sm` · `md` · `lg`                                                    |
- Keys: arrows move a day (left and right follow the reading direction) or a week; Home and End go to the ends of the week; Page Up and Down move a month, with Shift a year (31 January plus a month is the end of February); Enter or Space chooses.
- Each day is named by its full date ("Tuesday 10 November 2026", in the locale's words) followed by any `renderDay` content; today has `aria-current="date"`. The month title is announced as it changes.
- Days of the previous and next months fill the first and last weeks, muted; choosing one moves there.
- Days are at least 24px, and 44px on touch screens. With `renderDay` the grid fills its container and the days grow taller: at least `--cy-calendar-content-size` (2.5 times the cell size by default; on touch screens 1.5 times the 44px target, 66px, so a six-week month is under 520px tall in a 390px-wide container). The token can be set to anything; a day never drops below the touch target, and a container narrower than seven targets scrolls.
- `state` (for `renderDay`, `markDay`) is `{ selected, today, outside, disabled, weekend }`. `weekend` follows the `locale` where the browser knows its weekend (`Intl.Locale` week info: Friday and Saturday in Egypt), else Saturday and Sunday.
- **The month.** Uncontrolled, the calendar starts on `defaultMonth`, or the month of the value or focused date, moves itself, and follows an outside change of `value` to another month. With `month` the parent owns it: the month buttons, the month picker, keys that leave the month and choosing a day of another month call `onMonthChange` and the grid waits for the new `month`. If the parent does not move, focus stays on the day it was on. A new `value` in another month does not move a controlled month and asks for nothing: set `month` too. The focused day is always a day of the month shown: the same day number, or the month's last day, kept within `min` and `max` where the month has such a day.
- **The month picker** (`monthPicker`, off by default). The heading becomes a button ("November 2026 Choose month and year") that opens a Popover: the previous and next year buttons around the year, then the year's twelve months as buttons, named in full ("March 2027"), the month shown marked `aria-current`. Choosing a month shows it, closes the panel and puts focus back on the heading. Months and years outside `min` and `max` are disabled. Month names come from `locale`. Escape or a press outside closes it and changes nothing.
- **Marks** (`markDay`). `tone` tints a day of the month shown with `--cy-calendar-tone-mix` (12%) of that tone; days of other months are not tinted, the selected day keeps its fill, and today keeps its ring. `dots` draws one dot per entry under the number, a tone or any CSS colour, three at most: further entries are dropped, so put the count in `label`. `label` is added to the day's name after the date ("Tuesday 10 November 2026, 3 tasks"); give one whenever a tint or a dot means something. In forced colours a tinted day has a dashed outline and dots take the text colour.
- The date helpers it uses are exported: `toISODate`, `fromISODate`, `isISODate`, `addDays`, `addMonths`.

## Tokens

- `--cy-calendar-cell-size`: a day's size (never below the hit area)
- `--cy-calendar-selected-background`
- `--cy-calendar-content-size`: with `renderDay`, the least height of a day (never below the hit area)
- `--cy-calendar-tone-mix`: how much of a marked day's tone is mixed into its background (12%)
- `--cy-calendar-dot-size`: the size of a day's dots

## Used by

Planr (the month view) and, through DateField, the tools app's date inputs and Verql's query filters.
