# Checkbox

A native checkbox under a drawn Facet box: forms (`FormData`, reset, `required`), keyboard (Space) and label clicks come for free. The whole row is the click and touch target.

```tsx
<Checkbox label="Email me updates" name="updates" value="yes" />
<Checkbox label="Select all" checked={all} indeterminate={some} onChange={toggleAll} />
<Checkbox label="Buy oat milk" strikeWhenChecked checked={done} onChange={setDone} />
```

| Prop                                               | Default  | Notes                                                        |
| -------------------------------------------------- | -------- | ------------------------------------------------------------ |
| `label` / `description`                            | –        | Description linked via `aria-describedby`                    |
| `checked` / `defaultChecked` / `onChange(checked)` | –        | Controlled or uncontrolled                                   |
| `indeterminate`                                    | `false`  | Announced as mixed                                           |
| `strikeWhenChecked`                                | `false`  | Checklist style: a checked label is struck through and muted |
| `size`                                             | `md`     | box 14 · 16 · 20 px                                          |
| `tone`                                             | `accent` | Fill colour when checked                                     |
| `name`, `value`, `required`, `disabled`            | –        | Native                                                       |
- `strikeWhenChecked` is for lists of tasks: while the box is checked (not while `indeterminate`), the label is struck through and takes the muted colour, and the description is muted with it. The muted label keeps 4.5:1 contrast on the surface in light and dark; in forced colours the strike stays, in the system text colour. The colour change is a transition and stops under reduced motion. The checked state is still what assistive technology announces: the strike is only its visual echo. The row is a [Choice](../Choice/README.md) (its `strikeWhenChecked`); Switch and RadioGroup use the same row but do not offer the prop.

## Tokens

- `--cy-checkbox-{size,radius,border}`
- `--cy-checkbox-done-color`: label and description colour of a checked `strikeWhenChecked` row (default `--cy-color-muted`; keep it at 4.5:1 or more)
- `--cy-checkbox-strike-width`: thickness of the strike (default: the border width, or 1/16 of the text size when that is larger)
- The two done tokens feed the row's `--cy-choice-done-color` and `--cy-choice-strike-width`; the space between box and label is `--cy-choice-gap`.
