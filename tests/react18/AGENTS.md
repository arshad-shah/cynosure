# tests/react18

Smoke tests of the library source on React 18, the oldest peer in `peerDependencies`.

- Its own package and lockfile (`react@18.3.1`), installed with `pnpm --dir tests/react18 install`; `pnpm test:react18` installs and runs it.
- `vitest.config.ts` aliases every `react`/`react-dom` import, the library's included, to this folder's React 18. The first test asserts the version so a broken alias cannot pass silently.
- Keep it small: one behaviour per core component (Button, TextField, Select). Behaviour across browsers belongs in stories.
- React 18 differences to watch: no `inert` prop (set the property), `act` from `react`, `IS_REACT_ACT_ENVIRONMENT`.
