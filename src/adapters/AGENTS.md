# src/adapters

Optional build-tool adapters. The package works without any of them (plain ESM + `.css` + `styles.inline`). Each adapter lives in `src/adapters/<tool>/`, exports one factory, has a contract test, and is documented in `docs/adapters.md`. `vite` is first (implemented in a later plan); esbuild/extforge and Astro follow the same contract.
