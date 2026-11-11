# Stack

Vertical layout with token gaps (`gap="1"` … `"10"` map to `--cy-space-*`), alignment and an `as` prop for neutral elements (`div`, `section`, `ul`, `ol`, `nav`, `aside`, `header`, `footer`, `span`).

```tsx
<Stack gap="4" align="center">
  …
</Stack>;
```

| Prop                | Default | Notes                |
| ------------------- | ------- | -------------------- |
| `gap`               | `4`     | Space token          |
| `align` / `justify` | –       | Cross / main axis    |
| `as`                | `div`   | Neutral element only |

## Used by

Every product layout (toolbars, forms, settings panels, cards).
