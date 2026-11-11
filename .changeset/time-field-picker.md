---
"@arshad-shah/cynosure": minor
---

TimeField has a picker. The clock is now a button at the end of the field that opens columns rolling under one lens, with a strip of the whole day to jump along and the hours outside `min` and `max` hatched. `hourCycle={12}` shows `9:30 PM` and adds an AM/PM switch; the value, the limits and what a form receives stay 24-hour `HH:MM`. `picker={false}` keeps the plain typed field and `dayTrack={false}` hides the strip. New labels (`open`, `hours`, `minutes`, `seconds`, `am`, `pm`, `period`, `dayTrack`, `now`) and tokens (`--cy-time-field-row-height`, `-column-width`, `-lens-background`, `-night`, `-day`).
