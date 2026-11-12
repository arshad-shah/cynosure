# Switch

An on/off switch (`role="switch"`) on a native checkbox. Same props, forms and keyboard behaviour as `Checkbox` (without `indeterminate` and `strikeWhenChecked`: a switch that is on is a setting, not a finished task, so its label is never struck through). The thumb slides with `--cy-motion-base` and stops under reduced motion.

```tsx
<Switch label="Auto-expand" checked={auto} onChange={setAuto} />;
```

## Tokens

- `--cy-switch-{width,height,thumb-size,off-bg}`; `--cy-switch-height-{sm,lg}` for the other sizes
- The row around the switch is a [Choice](../Choice/README.md): `--cy-choice-gap` is the space before the label

## Used by

Aperture (feature toggles), SonicTap (capture options), Prism (settings), request-interceptor (enable rules), Planr.
