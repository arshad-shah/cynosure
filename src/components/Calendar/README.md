# Calendar

A month of days, to pick one from or to lay out a month's plans on. It is the WAI-ARIA APG date grid: one Tab stop on the focused day, arrows by day and week, Page Up and Down by month. Dates are plain `YYYY-MM-DD` strings, with no time or time zone, so a date picked in one place is the same date everywhere. For a date in a form, use [DateField](../DateField/README.md), which opens this in a popover.

```tsx
import { Calendar } from "@arshad-shah/cynosure";

<Calendar value={date} onChange={setDate} min="2026-01-01" isDateDisabled={isFullyBooked} />;

// A planner's month: your content under each day's number.
<Calendar
  onMonthChange={loadMonth}
  renderDay={(date) => events[date]?.map((e) => <Badge key={e.id}>{e.title}</Badge>)}
/>;
```

| Prop                                  | Default           | Notes                                                                |
| ------------------------------------- | ----------------- | -------------------------------------------------------------------- |
| `value` / `defaultValue` / `onChange` | `null`            | `YYYY-MM-DD`; `onChange` when a day is chosen                        |
| `defaultFocusedDate`                  | today             | Where focus starts when nothing is selected                          |
| `onMonthChange`                       | –                 | The first day of the month now shown (load its events)               |
| `min`, `max`                          | –                 | Limits: focus and the month buttons stop there                       |
| `isDateDisabled`                      | –                 | Days that can be focused but not chosen                              |
| `locale`                              | the browser's     | Month and day names, through `Intl`                                  |
| `weekStartsOn`                        | the locale's      | 0 Sunday to 6 Saturday; Monday when the browser does not know        |
| `today`                               | the device's date | What counts as today                                                 |
| `renderDay`                           | –                 | `(date, { selected, today, outside, disabled })`: content in the day |
| `labels`                              | –                 | `previous`, `next` (the month buttons)                               |
| `size`                                | `md`              | `sm` · `md` · `lg`                                                   |
- Keys: arrows move a day (left and right follow the reading direction) or a week; Home and End go to the ends of the week; Page Up and Down move a month, with Shift a year (31 January plus a month is the end of February); Enter or Space chooses.
- Each day is named by its full date ("Tuesday 10 November 2026", in the locale's words) followed by any `renderDay` content; today has `aria-current="date"`. The month title is announced as it changes.
- Days of the previous and next months fill the first and last weeks, muted; choosing one moves there.
- Days are at least 24px, and 44px on touch screens. With `renderDay` the grid fills its container and the days grow taller.
- The date helpers it uses are exported: `toISODate`, `fromISODate`, `isISODate`, `addDays`, `addMonths`.

## Tokens

- `--cy-calendar-cell-size`: a day's size (never below the hit area)
- `--cy-calendar-selected-background`

## Used by

Planr (the month view) and, through DateField, the tools app's date inputs and Verql's query filters.
