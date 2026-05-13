---
'@arshad-shah/cynosure-react': minor
---

Add `@arshad-shah/cynosure-react/fonts.css` — a one-line, opt-in webfont
loader that registers Geist Variable (sans) and JetBrains Mono Variable
(mono), the families the default token font stacks resolve to.

```ts
import '@arshad-shah/cynosure-react/all.css';
import '@arshad-shah/cynosure-react/fonts.css'; // optional
```

Kept separate from `all.css` so consumers with their own font pipeline
(`next/font`, self-hosted, CDN) don't pay the ~400 KB woff2 cost. The
token font stacks still fall through to system fonts when the import is
omitted.
