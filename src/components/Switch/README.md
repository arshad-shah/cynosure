# Switch

An on/off switch (`role="switch"`) on a native checkbox. Same props, forms and keyboard behaviour as `Checkbox` (without `indeterminate` and `strikeWhenChecked`: a switch that is on is a setting, not a finished task, so its label is never struck through). The thumb slides with `--cy-motion-base` and stops under reduced motion.

```tsx
<Switch label="Auto-expand" checked={auto} onChange={setAuto} />;
```

## Tokens

- `--cy-switch-{width,height,thumb-size,off-bg}`
