# Badge

Small status or category label in Cynosure's mono "eyebrow" style. Every tone × variant keeps text ≥ 4.5:1 (tested).

```tsx
<Badge tone="success" icon={check}>Saved</Badge>
<Badge tone="danger" variant="solid">Failed</Badge>
<Badge color="#2f7d4a">GET</Badge>
<Badge tone="danger" dot="live">Recording</Badge>
```

| Prop      | Default   | Notes                                                                                                  |
| --------- | --------- | ------------------------------------------------------------------------------------------------------ |
| `tone`    | `neutral` | `accent` · `neutral` · `danger` · `success` · `warning` · `info`                                       |
| `variant` | `soft`    | `soft` · `solid` · `outline`                                                                           |
| `size`    | `md`      | `sm` · `md` · `lg`                                                                                     |
| `icon`    | –         | Facet icon                                                                                             |
| `color`   | –         | A category colour (any CSS colour), e.g. HTTP methods or calendar categories; overrides `tone`         |
| `dot`     | –         | `true` for a steady dot, `"live"` for a pulsing one (recording, connected); still under reduced motion |
| `label`   | –         | Required without `children`: the name of a status dot alone                                            |

## Status dot

Leave out the text for a dot alone, in the tone's own colour: `<Badge tone="success" dot label="Connected" />`. It is an image named by `label` (required then), since colour alone says nothing. Inside a component that already says the state in text, hide it with an `aria-hidden` wrapper.

## Tokens

- `--cy-badge-{radius,tracking,soft-mix}`
