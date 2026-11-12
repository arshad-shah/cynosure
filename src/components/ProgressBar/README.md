# ProgressBar

How far a task has got: uploads, exports, multi-step setups. A labelled `role="progressbar"`, determinate or indeterminate.

```tsx
<ProgressBar label="Uploading 3 files" value={40} showValue />
<ProgressBar label="Preparing export" indeterminate />
<ProgressBar label="Steps completed" labelHidden value={3} max={12} labels={{ value: (v, m) => `${v} of ${m} steps` }} />
```

| Prop            | Default  | Notes                                                                          |
| --------------- | -------- | ------------------------------------------------------------------------------ |
| `label`         | –        | Accessible name, shown above the bar                                           |
| `labelHidden`   | `false`  | Keep the name for screen readers only                                          |
| `value` / `max` | – / 100  | Clamped to 0…`max`. Leave `value` out when the amount is unknown               |
| `indeterminate` | `false`  | Unknown amount: a sweeping segment, `aria-busy`, no `aria-valuenow`            |
| `showValue`     | `false`  | Shows the value text at the end of the label row                               |
| `tone`          | `accent` | `accent` · `success` · `warning` · `danger` · `info` · `neutral`               |
| `size`          | `md`     | Thickness: `xs` 2 · `sm` 4 · `md` 8 · `lg` 12 px (`xs` also sets smaller text) |
| `labels`        | –        | `value(value, max)` for the value text and `aria-valuetext` (default "40%")    |
- The fill uses the tone's text colour, which stays at 3:1 or more against the track in light and dark modes.
- Fills from the inline start (right in right-to-left text). The indeterminate segment stands still in the middle under reduced motion.

Tokens: `--cy-progress-bar-height-{sm,md,lg}`, `--cy-progress-bar-radius`, `--cy-progress-bar-track`.

- `segments` (with `offset`): parts drawn end to end, such as a request's timing or a waterfall row. Each has a `label` (read out: "DNS 12, Connect 30") and a `tone` or category `color`.
- `marker` (with `markerLabel`): a thin mark at a value, such as a budget or target.

## Tokens

- `--cy-progress-bar-height-xs`: Track thickness at size `xs`. Default 2px.
