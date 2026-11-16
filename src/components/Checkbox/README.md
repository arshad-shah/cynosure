# Checkbox

A native checkbox under a drawn Facet box: forms (`FormData`, reset, `required`), keyboard (Space) and label clicks come for free. The whole row is the click and touch target.

```tsx
<Checkbox label="Email me updates" name="updates" value="yes" />
<Checkbox label="Select all" checked={all} indeterminate={some} onChange={toggleAll} />
<Checkbox label="Buy oat milk" strikeWhenChecked checked={done} onChange={setDone} />
<Checkbox variant="card" media={<Image src={thumb} alt="" />} label="Page 3" onChange={(on, e) => pick(3, on, e.nativeEvent.shiftKey)} />
```

| Prop                                                      | Default  | Notes                                                                                         |
| --------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| `label` / `description`                                   | –        | Description linked via `aria-describedby`                                                     |
| `labelHidden`                                             | `false`  | The label stays for assistive tech but takes no space (a selection column)                    |
| `aria-labelledby` / `aria-describedby`                    | –        | Named by other elements instead of the label; your describing ids come before the description |
| `tabIndex`                                                | –        | On the input: `-1` for a roving grid                                                          |
| `checked` / `defaultChecked` / `onChange(checked, event)` | –        | Controlled or uncontrolled                                                                    |
| `indeterminate`                                           | `false`  | Announced as mixed                                                                            |
| `strikeWhenChecked`                                       | `false`  | Checklist style: a checked label is struck through and muted                                  |
| `variant`                                                 | `row`    | `row` · `card`: a bordered card with `media` above the label, for ticking by picture          |
| `media`                                                   | –        | The card's picture (a page thumbnail); the box is drawn in its top end corner                 |
| `size`                                                    | `md`     | box 14 · 16 · 20 px                                                                           |
| `tone`                                                    | `accent` | Fill colour when checked                                                                      |
| `name`, `value`, `required`, `disabled`                   | –        | Native                                                                                        |
- `strikeWhenChecked` is for lists of tasks: while the box is checked (not while `indeterminate`), the label is struck through and takes the muted colour, and the description is muted with it. The muted label keeps 4.5:1 contrast on the surface in light and dark; in forced colours the strike stays, in the system text colour. The colour change is a transition and stops under reduced motion. The checked state is still what assistive technology announces: the strike is only its visual echo. The row is a [Choice](../Choice/README.md) (its `strikeWhenChecked`); Switch and RadioGroup use the same row but do not offer the prop.
- `variant="card"` is for a grid of pictures to tick (pages of a PDF, photos): the whole card, picture included, is the click and touch target, and a ticked card takes the accent border and soft background of a [Choice](../Choice/README.md) card. The box stays drawn, over the picture's top end corner (the top left in right-to-left pages); without `media` it sits above the label. The label, not the picture, names the checkbox, so give pictures `alt=""` or a short alt. `onChange(checked, event)` works as in a row: a Shift+click on the picture still has `event.nativeEvent.shiftKey`, for range selection. Lay the cards out with [Grid](../Grid/README.md).

## Tokens

- `--cy-checkbox-{size,radius,border}`
- `--cy-checkbox-done-color`: label and description colour of a checked `strikeWhenChecked` row (default `--cy-color-muted`; keep it at 4.5:1 or more)
- `--cy-checkbox-strike-width`: thickness of the strike (default: the border width, or 1/16 of the text size when that is larger)
- The two done tokens feed the row's `--cy-choice-done-color` and `--cy-choice-strike-width`; the space between box and label is `--cy-choice-gap`.
