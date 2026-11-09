# Inline

Horizontal layout with token gaps (`gap="1"` … `"10"` map to `--cy-space-*`), alignment and an `as` prop for neutral elements (`div`, `section`, `ul`, `ol`, `nav`, `aside`, `header`, `footer`, `span`).

```tsx
<Inline gap="4" align="center">
  …
</Inline>;
```

| Prop                | Default | Notes               |
| ------------------- | ------- | ------------------- |
| `gap`               | `3`     | Space token         |
| `align` / `justify` | –       | Cross / main axis   |
| `wrap`              | `false` | Wrap onto new lines |     | `as` | `div` | Neutral element only |

## Used by

Every product layout (toolbars, forms, settings panels, cards).
