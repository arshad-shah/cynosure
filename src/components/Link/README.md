# Link

Inline text link built on `LinkBase` (safe schemes only). Tone colours use each tone's readable text role.

```tsx
<Link href="/docs">Read the docs</Link>
<Link href="https://example.com" external>Example</Link>   // new tab, icon, "(opens in new tab)"
```

| Prop       | Default   | Notes                                                                            |
| ---------- | --------- | -------------------------------------------------------------------------------- |
| `href`     | –         | Relative, `http(s)`, `mailto` or `tel`                                           |
| `tone`     | `accent`  | `accent` · `neutral` · `danger` · `success` · `warning` · `info`                 |
| `size`     | `inherit` | `inherit` · `sm` · `md` · `lg`                                                   |
| `external` | `false`   | `target="_blank"`, safe `rel`, external icon, announced text (`labels.external`) |

## Tokens

- `--cy-link-underline-offset`, `--cy-link-underline-thickness`

## Used by

Every product (docs links, settings help, portfolio, nimaz-web, extension popups).
