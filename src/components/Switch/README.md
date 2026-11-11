# Switch

An on/off switch (`role="switch"`) on a native checkbox. Same props, forms and keyboard behaviour as `Checkbox` (without `indeterminate`). The thumb slides with `--cy-motion-base` and stops under reduced motion.

```tsx
<Switch label="Auto-expand" checked={auto} onChange={setAuto} />;
```

## Tokens

- `--cy-switch-{width,height,thumb-size,off-bg}`

## Used by

Aperture (feature toggles), SonicTap (capture options), Prism (settings), request-interceptor (enable rules), Planr.
