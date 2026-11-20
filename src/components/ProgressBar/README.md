# ProgressBar

How far a task has got: uploads, exports, multi-step setups. A labelled `role="progressbar"`, determinate or indeterminate. With `meter` it is a measurement instead (password strength, entropy), and with `steps` a row of pills.

```tsx
<ProgressBar label="Uploading 3 files" value={40} showValue />
<ProgressBar label="Preparing export" indeterminate />
<ProgressBar label="Steps completed" labelHidden value={3} max={12} labels={{ value: (v, m) => `${v} of ${m} steps` }} />
<ProgressBar label="Password strength" meter steps={4} max={4} value={3} valueText="Good" tone="success" showValue />
```

| Prop                     | Default  | Notes                                                                                                     |
| ------------------------ | -------- | --------------------------------------------------------------------------------------------------------- |
| `label`                  | –        | Accessible name, shown above the bar                                                                      |
| `labelHidden`            | `false`  | Keep the name for screen readers only                                                                     |
| `value` / `max`          | – / 100  | Clamped to 0…`max`. Leave `value` out when the amount is unknown                                          |
| `indeterminate`          | `false`  | Unknown amount: a sweeping segment, `aria-busy`, no `aria-valuenow`                                       |
| `showValue`              | `false`  | Shows the value text at the end of the label row                                                          |
| `tone`                   | `accent` | `accent` · `success` · `warning` · `danger` · `info` · `neutral`                                          |
| `size`                   | `md`     | Thickness: `xs` 2 · `sm` 4 · `md` 8 · `lg` 12 px (`xs` also sets smaller text)                            |
| `labels`                 | –        | `value(value, max)` for the value text and `aria-valuetext` (default "40%")                               |
| `meter`                  | `false`  | `role="meter"`: a measurement, never indeterminate (a missing value reads 0)                              |
| `valueText`              | –        | The value in words ("Strong", "Step 2 of 5"), shown and read instead of the percentage                    |
| `steps`                  | –        | Draw N separate pills, lit up to round(value / max times N); not with `segments`                          |
| `segments` / `offset`    | – / 0    | Parts drawn end to end from `offset` (in `max` units), each `{ value, label, tone?, color? }` (see below) |
| `marker` / `markerLabel` | –        | A thin mark at a value, read with the value (default "marker at 75%")                                     |
| `className` / `style`    | –        | Layout only                                                                                               |
- The fill uses the tone's text colour, which stays at 3:1 or more against the track in light and dark modes.
- Fills from the inline start (right in right-to-left text). The indeterminate segment stands still in the middle under reduced motion.

Tokens: `--cy-progress-bar-height-{xs,sm,md,lg}`, `--cy-progress-bar-radius`, `--cy-progress-bar-track`, `--cy-progress-bar-step-gap`.

- `segments` (with `offset`): parts drawn end to end, such as a request's timing or a waterfall row. Each has a `label` (read out: "DNS 12, Connect 30") and a `tone` or category `color`.
- `marker` (with `markerLabel`): a thin mark at a value, such as a budget or target.
- `meter` with `steps` and `valueText`: a stepped gauge such as password strength. Pick the `tone` from the value (weak `danger`, fair `warning`, good `success`); the lit pills take it and the rest stay the track colour. `steps` also works on a progress bar ("Step 2 of 5").
- A slim bar in a row of text (a query plan's cost): `labelHidden` without `showValue` leaves only the track, still named by `label`; give it `style={{ flex: 1 }}` and a `size` of `xs` or `sm`.

## Tokens

- `--cy-progress-bar-step-gap`: space between the pills of a stepped bar

- `--cy-progress-bar-height-xs`: Track thickness at size `xs`. Default 2px.
