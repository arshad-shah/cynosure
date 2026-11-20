# Switch

An on/off switch (`role="switch"`) on a native checkbox. Same props (`labelHidden`, `aria-labelledby`, `aria-describedby`, `tabIndex`, `onChange(checked, event)` included), forms and keyboard behaviour as `Checkbox` (without `indeterminate` and `strikeWhenChecked`: a switch that is on is a setting, not a finished task, so its label is never struck through; and without the picture card, `variant` and `media`). The thumb slides with `--cy-motion-base` and stops under reduced motion.

```tsx
<Switch label="Auto-expand" checked={auto} onChange={setAuto} />;
```

## Tokens

- `--cy-switch-{width,height,thumb-size,off-bg}`; `--cy-switch-height-{sm,lg}` for the other sizes (`height` is the `md` size)
- The row around the switch is a [Choice](../Choice/README.md): `--cy-choice-gap` is the space before the label
