# Slider

Picks a number, or a range with two thumbs, by dragging or with the keyboard (WAI-ARIA APG slider). Works with pointer, touch and native forms.

```tsx
<Slider label="Volume" defaultValue={40} showValue />
<Slider label="Price" defaultValue={[20, 60]} name="price" />
<Slider label="Opacity" min={0} max={1} step={0.05} defaultValue={0.5} />
```

| Prop                                  | Default      | Notes                                                                     |
| ------------------------------------- | ------------ | ------------------------------------------------------------------------- |
| `label` / `labelHidden`               | –            | Accessible name, shown above unless hidden                                |
| `value` / `defaultValue` / `onChange` | `min`        | A number, or `[from, to]` for a range. `onChange` follows every change    |
| `onCommit`                            | –            | When a change is finished: pointer released, or each key press            |
| `min` / `max` / `step`                | 0 / 100 / 1  | Values snap to `step` with no floating-point drift                        |
| `largeStep`                           | a tenth      | Page Up and Page Down                                                     |
| `orientation`                         | `horizontal` | `vertical` runs bottom to top (length: `--cy-slider-length`)              |
| `marks`                               | –            | `{ value, label? }[]`: ticks, with optional text under the track          |
| `showValue`                           | `false`      | Shows the value (or "from – to") at the end of the label row              |
| `name`                                | –            | Form field; a range submits two values under the same name                |
| `disabled`                            | `false`      | Not focusable, not submitted                                              |
| `size`                                | `md`         | Track and thumb size                                                      |
| `labels`                              | –            | `minimum`, `maximum` (range thumb names), `value(v)` for `aria-valuetext` |
- Keys: arrows by `step`, Page Up/Down by `largeStep`, Home, End. In right-to-left text, Right lowers the value.
- A press on the track moves the nearest thumb and keeps dragging; range thumbs stop at each other.
- Touch: the thumb's hit area is 44px (invisibly); horizontal drags belong to the slider while vertical swipes still scroll the page.

Tokens: `--cy-slider-track-{sm,md,lg}`, `--cy-slider-thumb-{sm,md,lg}`, `--cy-slider-track`, `--cy-slider-length`.

## Used by

aperture-css (spacing, size and opacity controls), algo-visual and algosnap (playback speed and step scrubbing), verql (limits and ranges), whetstone (session settings).
