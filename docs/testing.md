# Testing

- **Stories are tests.** `pnpm test:stories` runs every story's play function in Vitest browser mode on Chromium, Firefox and WebKit (`stories` project), plus touch-tagged stories on a touch + mobile Chromium (`touch` project). Every story is also axe-checked (`a11y.test: "error"`).
- **Behaviour only.** Each test names a behaviour and fails if it breaks. Typical set per component: pointer, keyboard, touch, focus, values, disabled, labels, RTL, hostile host, shadow root.
- **Hostile host:** `computeUnderHostileHost(root, selector, props)` compares computed styles with and without aggressive host CSS (Tailwind preflight + globals).
- **Visual:** stories tagged `visual` get screenshot comparison in CI (`VITE_CY_VISUAL=1`, Chromium on Linux, baselines in `__screenshots__/`, refreshed by the `visual-baselines` workflow).
- **Unit:** `pnpm test` for pure logic (tokens, CLI, Preact compat).
- Never weaken a test to pass. Write the failing test first.
