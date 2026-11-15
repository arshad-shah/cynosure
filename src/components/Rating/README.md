# Rating

Stars for a score. Read-only, it draws any value exactly (4.3 fills 30% of the fifth star) and reads as one image ("Rated 4.3 out of 5"). Interactive, it is a slider: arrows by `step`, Page Up/Down by a whole star, Home and End; a hover previews the value under the pointer and a press or tap sets it.

```tsx
<Rating value={4.3} showValue />
<Rating label="Your rating" value={stars} onChange={setStars} step={0.5} />
<Rating label="Rate this" name="stars" defaultValue={4} />
```

| Prop                                  | Default  | Notes                                                                                         |
| ------------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| `value` / `defaultValue` / `onChange` | – / `0`  | Controlled or uncontrolled; 0 to `max`                                                        |
| `readOnly`                            | –        | Draw only (one image, no focus stop). Default: true when `value` is given without `onChange`  |
| `label`                               | `Rating` | Names an interactive rating (the slider)                                                      |
| `max`                                 | `5`      | Number of stars                                                                               |
| `step`                                | `1`      | What keys, hover and taps move by (`0.5` for halves); the least a person can give is one step |
| `size`                                | `md`     | Star size: `sm` 16 · `md` 20 · `lg` 28 px                                                     |
| `color`                               | –        | Colour of the filled stars (any CSS colour)                                                   |
| `showValue`                           | `false`  | The number after the stars                                                                    |
| `disabled`                            | `false`  | No focus stop and no change                                                                   |
| `name`                                | –        | Submit the value with a form                                                                  |
| `labels`                              | –        | `value(value, max)` ("4.3 out of 5"), `rated(value, max)` ("Rated 4.3 out of 5")              |
- Each star is Facet's `star`: the outline, with a filled copy above it clipped to the filled part. The part is measured across the star's drawn shape, so 0.3 looks like 30%.
- The hover is precise: it reads the star under the pointer (the nearest one in a gap) and how far across that star's shape the pointer is, stepped by `step`. Past the last star it stays at `max`; the value text never counts.
- Right to left: the stars run from the right and fill from the right; the arrows follow the reading direction.
- The row of stars is at least `--cy-hit-min` (24px) tall, and `--cy-hit-coarse` (44px) on touch screens.

## Tokens

- `--cy-rating-gap`: space between the stars (default `--cy-space-1`)
- `--cy-rating-filled`: colour of the filled part (default `--cy-color-warning`; `color` sets it for one rating)
- `--cy-rating-empty`: colour of an empty star's outline (default `--cy-color-muted`)
