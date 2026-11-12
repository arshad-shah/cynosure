# Testing

- **Stories are tests.** `pnpm test:stories` runs every story's play function in Vitest browser mode on Chromium, Firefox and WebKit (`stories` project), plus touch-tagged stories on a touch + mobile Chromium (`touch` project). Every story is also axe-checked (`a11y.test: "error"`).
- **Behaviour only.** Each test names a behaviour and fails if it breaks. Typical set per component: pointer, keyboard, touch, focus, values, disabled, labels, RTL, hostile host, shadow root.
- **Hostile host:** `computeUnderHostileHost(root, selector, props)` compares computed styles with and without aggressive host CSS (Tailwind preflight + globals).
- **Touch stories** are tagged `["touch", "!dev"]`: they run in the `touch` project and stay off the published Storybook, where a desktop pointer would fail them (`cy check` rule `touch-hidden`). Hit areas are checked on the invisible `::before`, and the visible control must not move.
- **Visual:** stories tagged `visual` get screenshot comparison in CI (`VITE_CY_VISUAL=1`, Chromium on Linux, baselines in `__screenshots__/`): light, dark, and dark with more contrast. Baselines are refreshed by the `visual-baselines` workflow: run it manually, or push a commit to `next` whose message contains `[baselines]` (do this whenever a change moves pixels in a `visual` story).
- **Media features:** `emulateMedia({ reducedMotion, contrast })` (`src/test/media.ts`) emulates `prefers-reduced-motion` and `prefers-contrast` through a Playwright command of the Vitest run; tag such stories `"!dev"` (it resolves false in the published Storybook) and put the features back with `null` in a `finally`.
- **Overlays:** after opening, call `shownFully(el)` (`src/test/settle.ts`): open is not the same as visible. Entrances use `@keyframes`, never `@starting-style`.
- **Transitions:** never read a colour, opacity or position mid-transition. Wait for it to settle (`waitFor`, up to 3 seconds on CI), and compare colours as painted RGBA with alpha, since engines serialise colours differently.
- **Unit:** `pnpm test` for pure logic (tokens, CLI, Preact compat).
- **React 18:** `pnpm test:react18` runs a few core components on React 18 (`tests/react18`, its own install), the oldest supported peer.
- **Published Storybook:** before telling Arshad the site is fine, build it (`pnpm build-storybook`) and load every story under `/cynosure/`; play functions run there too and show as errors when they fail.
- Never weaken a test to pass. Write the failing test first.
