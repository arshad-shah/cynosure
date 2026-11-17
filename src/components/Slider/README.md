# Slider

Picks a number, a range with two thumbs, or several values (gradient stops), by dragging or with the keyboard (WAI-ARIA APG slider). Works with pointer, touch and native forms.

```tsx
<Slider label="Volume" defaultValue={40} showValue />
<Slider label="Price" defaultValue={[20, 60]} name="price" />
<Slider label="Opacity" min={0} max={1} step={0.05} defaultValue={0.5} />
```

| Prop                                          | Default      | Notes                                                                                                                                              |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label` / `labelHidden`                       | –            | Accessible name, shown above unless hidden                                                                                                         |
| `id` / `aria-labelledby` / `aria-describedby` | –            | The slider's id (a range's group); named by other elements instead of the label (a range's thumbs keep "label, minimum"); described on every thumb |
| `value` / `defaultValue` / `onChange`         | `min`        | A number, `[from, to]` for a range, or more numbers for more thumbs. `onChange` follows every change                                               |
| `trackContent`                                | –            | Your own drawing of the track (gradient, histogram) in place of the fill                                                                           |
| `onCommit`                                    | –            | When a change is finished: pointer released, or the key let go (a held arrow commits once); not for a key that changes nothing                     |
| `commitDelay`                                 | `0`          | Ms without a key press before a keyboard change commits, so arrow, arrow, arrow commits once; leaving the slider commits at once                   |
| `min` / `max` / `step`                        | 0 / 100 / 1  | Values snap to `step` with no floating-point drift                                                                                                 |
| `largeStep`                                   | a tenth      | Shift+arrows, Page Up and Page Down                                                                                                                |
| `orientation`                                 | `horizontal` | `vertical` runs bottom to top (length: `--cy-slider-length`)                                                                                       |
| `marks`                                       | –            | `{ value, label? }[]`: ticks, with optional text under the track                                                                                   |
| `showValue`                                   | `false`      | Shows the value (or "from – to") at the end of the label row                                                                                       |
| `name`                                        | –            | Form field; a range submits two values under the same name                                                                                         |
| `disabled`                                    | `false`      | Not focusable, not submitted                                                                                                                       |
| `size`                                        | `md`         | Track and thumb size                                                                                                                               |
| `labels`                                      | –            | `minimum`, `maximum` (range thumb names), `thumb(index, count)` (names with three or more), `value(v)` for `aria-valuetext`                        |

## Behaviour and accessibility

- Keys: arrows by `step`, Shift+arrows and Page Up/Down by `largeStep`, Home, End. In right-to-left text, Right lowers the value. Escape during a drag cancels it and restores the value from before the press.
- A press on the track moves the nearest thumb and keeps dragging; thumbs stop at their neighbours. Among thumbs on one spot, the press takes the one that can move that way.
- Touch: the thumb's hit area is 44px (invisibly); horizontal drags belong to the slider while vertical swipes still scroll the page.

## Tokens

- `--cy-slider-track-{sm,md,lg}`: track thickness per size (2px, 4px, 6px)
- `--cy-slider-thumb-{sm,md,lg}`: thumb diameter per size (12px, 16px, 20px)
- `--cy-slider-track`: the empty bar colour
- `--cy-slider-length`: length of a vertical slider's track (160px)
