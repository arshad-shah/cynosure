# Badge

Small status or category label in Cynosure's mono "eyebrow" style. Every tone × variant keeps text ≥ 4.5:1 (tested).

```tsx
<Badge tone="success" icon={check}>Saved</Badge>
<Badge tone="danger" variant="solid">Failed</Badge>
```

| Prop      | Default   | Notes                                                            |
| --------- | --------- | ---------------------------------------------------------------- |
| `tone`    | `neutral` | `accent` · `neutral` · `danger` · `success` · `warning` · `info` |
| `variant` | `soft`    | `soft` · `solid` · `outline`                                     |
| `size`    | `md`      | `sm` · `md` · `lg`                                               |
| `icon`    | –         | Facet icon                                                       |

## Tokens

- `--cy-badge-{radius,tracking,soft-mix}`

## Used by

Prism (node kinds), Aperture (property states), Planr (categories), Verql (column types), extension popups (status).
