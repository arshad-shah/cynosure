---
"@arshad-shah/cynosure": minor
---

TimeField can have a picker, and shows the time the way the person's region writes it.

- `picker` adds a clock button at the end of the field that opens columns rolling under one lens, with a strip of the whole day to jump along (`dayTrack={false}` hides it) and the hours outside `min` and `max` hatched. It is off by default: fields that do not ask for it look as they did.
- `hourCycle` is `"auto"` by default: `9:30 PM` where AM and PM are used, `21:30` elsewhere, from the browser or from `locale`. `hourCycle={24}` keeps the form every TimeField had before; `hourCycle={12}` fixes the 12-hour form and adds an AM/PM switch to the picker. The value, the limits and what a form receives stay 24-hour `HH:MM`.
- New labels (`open`, `hours`, `minutes`, `seconds`, `am`, `pm`, `period`, `dayTrack`, `now`) and tokens (`--cy-time-field-row-height`, `-column-width`, `-lens-background`, `-night`, `-day`).
