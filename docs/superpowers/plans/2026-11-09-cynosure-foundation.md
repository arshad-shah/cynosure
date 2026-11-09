# Cynosure Foundation Implementation Plan (Plan 1 of 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old Cynosure monorepo on branch `next` with the single-package foundation. It delivers tokens and theming, base CSS isolation, the Facet Icon set, Button, the `cy` CLI, agent docs and the progress doc, CI, and Storybook live on GitHub Pages.

**Architecture:** One ESM package at the repo root. TS token schema → `createTheme` → `themeToCss`. Components are plain `.css` (prefixed `cy-` classes, `--cy-*` tokens, data-attribute variants) plus React function components. Native interactive elements live only in `src/foundations`. Storybook stories are the browser test suite (play, a11y, touch, visual, hostile host).

**Tech Stack:** Node 24, pnpm 10, TypeScript 5.9 strict, React 19 (peer `>=18 <20`), Vite 7 library mode + Lightning CSS, Storybook 10.6 (`@storybook/react-vite`, addon-vitest, addon-a11y), Vitest 4 browser mode (Playwright chromium/firefox/webkit), Biome, changesets, publint, @arethetypeswrong/cli, size-limit, `@arshad-shah/clif` 1.4.

**Spec:** `docs/superpowers/specs/2026-11-09-cynosure-next-design.md`

**Later plans:** 2 = Milestone 1 controls, 3 = Milestone 2 structure and overlays, 4 = Milestone 3 plus product migration issues.

## Global Constraints

- Package `@arshad-shah/cynosure`, version `0.1.0`, `"type": "module"`, ESM only, **zero runtime dependencies**. Peer deps: `react >=18 <20`, `react-dom >=18 <20`.
- No JS module imports CSS. `sideEffects: ["*.css"]`.
- Class prefix `cy-`. Token prefix `--cy-`. Variants are `data-*` attributes.
- Tokens are declared on `:where(:root, :host, .cy-theme)`. Nothing writes to `<html>/<head>/<body>` unless `target="document"` is passed. No inline `<script>`. No runtime style injection.
- Native interactive elements (`button a input textarea select dialog details`) appear only under `src/foundations/`. No `title=`. No text or emoji glyphs as icons.
- Hit target ≥ 24×24 CSS px always, and ≥ 44×44 under `(pointer: coarse)`.
- Built-in strings are English, overridable through a typed `labels` prop.
- Tests are behavioural only: no "renders without crashing" and no snapshot-only tests. Coverage floor 95% lines and branches for `src/`.
- Targets are current evergreen Chrome, Edge, Firefox and Safari.
- Never publish to npm or deprecate the old packages (needs Arshad's authorisation).
- Commits, PRs and issues carry no AI attribution (no Co-Authored-By or "Generated with" lines). Pushing uses the `arshad-shah` gh account: `gh auth switch -h github.com -u arshad-shah`, push, then switch back to `ShahA_hmh`.

## Review Focus

1. Invalid or extreme accents (`"nope"`, `#ffffff`, `#000000`, `oklch(.7 .3 90)`). Expected: an invalid one throws `CynosureThemeError` naming the input; the extreme ones still produce an on-accent colour with ≥ 4.5:1 contrast. (Task 2)
2. Nested `CynosureTheme` with different mode, accent and scale. Expected: the inner subtree uses the inner values and the outer subtree is unaffected. (Task 3)
3. Theme inside a shadow root with adopted `styles.inline`. Expected: tokens resolve via `:host` and Button computed styles match the page render. (Tasks 3 and 6)
4. `localStorage` throws (privacy mode or extension sandbox). Expected: `useColorMode` falls back to `system` and doesn't crash. (Task 3)
5. A very long Button label and `dir="rtl"`. Expected: the label truncates with an ellipsis inside the max width, the icon sits on the inline-start side in RTL, and the hit target is unchanged. (Task 6)

---

### Task 1: Reset repo to the single-package skeleton

**Files:**
- Delete: `packages/`, `apps/`, `turbo.json`, `pnpm-workspace.yaml`, old `.storybook/`, `.size-limit.cjs`, `scripts/`, `wrangler.toml`, `storybook-static/`, `docs/specs/`, old files in `docs/superpowers/{specs,plans}` (keep the two 2026-11-09 files), `.changeset/*.md`.
- Keep: `brand/`, `LICENSE`, `.gitignore` (add `.superpowers/`, `dist/`, `storybook-static/`, `coverage/`, `__screenshots__/__diff__/`).
- Create: `package.json`, `tsconfig.json`, `biome.json`, `vite.config.ts`, `src/index.ts`, `.changeset/config.json`, `.size-limit.json`, `.npmrc` (`engine-strict=true`), `.nvmrc` (`24`).
- Test: `tests/unit/package.test.ts`

**Interfaces:**
- Produces scripts: `build`, `typecheck`, `lint`, `test` (unit), `test:stories` (browser), `test:visual`, `storybook`, `build-storybook`, `size`, `check` (= `cy check`), `cy` (= `node --import tsx tools/cli/index.ts`), `verify` (all gates in order).
- Produces `exports`: `"."`, `"./icons"`, `"./styles.css"`, `"./styles/*.css"`, `"./styles.inline"`, `"./vite"` (stub until Plan 2), `"./package.json"`.

- [ ] **Step 1:** Delete the old tree and remove the old `simple-git-hooks` entry from `.git/hooks` (`rm .git/hooks/pre-commit` in the main repo's git dir, since worktrees share hooks). Add the new hook through `simple-git-hooks` config: `"pre-commit": "pnpm check && pnpm lint"`.
- [ ] **Step 2:** Write the failing test `tests/unit/package.test.ts`: `"package manifest is ESM-only, dependency-free and exposes the documented subpaths"`. Read `package.json` and assert `type === "module"`, `dependencies` is undefined or empty, the `exports` keys equal the list above, and `peerDependencies.react === ">=18 <20"`.
- [ ] **Step 3:** Run `pnpm vitest run tests/unit/package.test.ts`. Expected: FAIL (manifest missing).
- [ ] **Step 4:** Create the manifest and configs. `vite.config.ts` uses library mode with entries `src/index.ts`, `src/icons/index.ts`, `src/styles/inline.ts`, `src/adapters/vite/index.ts`, and `preserveModules` for tree-shaking. It externalises `react`, `react-dom` and `react/jsx-runtime`. CSS is built separately by `tools/build-css.ts` (Lightning CSS, targets from `browserslist: "last 2 Chrome versions, last 2 Firefox versions, last 2 Safari versions, last 2 Edge versions"`) into `dist/styles.css` and `dist/styles/<name>.css`. Types come from `tsc -p tsconfig.build.json --emitDeclarationOnly`.
- [ ] **Step 5:** Run `pnpm install && pnpm vitest run tests/unit/package.test.ts && pnpm typecheck`. Expected: PASS.
- [ ] **Step 6:** Commit: `chore: reset to single-package Cynosure next skeleton`.

### Task 2: Token schema, `createTheme`, `themeToCss`

**Files:**
- Create: `src/tokens/schema.ts`, `src/tokens/defaults.ts`, `src/tokens/color.ts` (OKLCH parse, convert, contrast), `src/tokens/create-theme.ts`, `src/tokens/to-css.ts`, `src/tokens/index.ts`
- Test: `tests/unit/tokens.test.ts`

**Interfaces:**
- Produces:
  - `type Scale = "compact" | "comfortable" | "spacious" | number`
  - `interface ThemeInput { accent?: string; scale?: Scale; radius?: number; font?: Partial<Record<"sans"|"mono"|"display", string>>; star?: boolean | { size: number }; motion?: "reduced" | Partial<MotionTokens>; tokens?: DeepPartial<GlobalTokens>; components?: DeepPartial<ComponentTokens> }`
  - `interface Theme { global: GlobalTokens; palettes: Record<"light"|"dark"|"light-contrast"|"dark-contrast", ColorTokens>; components: ComponentTokens }`
  - `createTheme(input?: ThemeInput): Theme`
  - `themeToCss(theme: Theme, selector?: string): string` (default selector `:where(:root, :host, .cy-theme)`)
  - `class CynosureThemeError extends Error`
  - `contrastRatio(a: string, b: string): number`
  - `ComponentTokens` is an interface **augmented per component** through declaration merging (`declare module "../tokens/schema" { interface ComponentTokens { button: {...} } }`), so each component task adds its own entry.
- CSS variable naming: `--cy-<group>-<name>` for global tokens (`--cy-color-accent`, `--cy-space-2`, `--cy-control-height-md`) and `--cy-<component>-<prop>` for component tokens.

- [ ] **Step 1: Write failing tests** in `tests/unit/tokens.test.ts`:
  - `"default light palette matches the approved Facet values"`: `bg #f4f1ea, surface #fbf9f5, ink #1d1b18, muted #6b665e, line #dcd6cb, soft #ebe6dc`.
  - `"default dark palette matches"`: `#14120f #1d1a16 #ece8e1 #a39d93 #34302a #28241f`.
  - `"scale multiplies control height"`: comfortable md height `32px`, compact `28px`, spacious `38.4px`, numeric `1.5` gives `48px`.
  - `"control radius is 0.3 x height"`: md radius `9.6px` at comfortable.
  - `"on-accent text meets 4.5:1"` for `#e8462e`, `#d4a843`, `#4f7bd9`, `#14b8a6`, `#ffffff`, `#000000`.
  - `"invalid accent throws CynosureThemeError naming the input"`: `createTheme({accent:"nope"})` throws `/nope/`.
  - `"themeToCss emits every token once under the selector"`: parse the output and assert no duplicate custom-property names, presence of `--cy-color-accent`, and the four palette blocks keyed by `[data-cy-mode]` / `[data-cy-contrast]` plus `@media (prefers-color-scheme: dark)` and `@media (prefers-contrast: more)` fallbacks using `light-dark()` where possible.
  - `"motion reduced zeroes durations"`.
- [ ] **Step 2:** Run `pnpm vitest run tests/unit/tokens.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement. Accent ramp in OKLCH: hover = L −0.05, active = L −0.10, soft = 18% mix with surface, ring = 28% alpha. On-accent picks palette ink or `#ffffff`/`#16120f`, whichever passes 4.5:1. If neither passes, step L until one does. Default accent is a placeholder `#d0612a` (the final value is signed off in Storybook, spec §15). Contrast palettes darken `line`/`muted` until `muted` vs `bg` ≥ 7:1.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(tokens): token schema, createTheme and themeToCss`.

### Task 3: Base CSS, `CynosureTheme`, `useColorMode`

**Files:**
- Create: `src/styles/base.css` (scoped reset for `.cy-*`, focus ring, reduced motion, hit-target utility `.cy-hit`), `src/styles/inline.ts` (`export const css: string; export function createStyleSheet(): CSSStyleSheet`), `src/theme/CynosureTheme.tsx`, `src/theme/use-color-mode.ts`, `src/theme/theme.css`, `src/theme/CynosureTheme.stories.tsx`, `src/theme/README.md`
- Test: `tests/unit/color-mode.test.ts`, plus story play tests

**Interfaces:**
- Consumes: `createTheme`, `themeToCss`, `Theme` (Task 2).
- Produces:
  - `<CynosureTheme theme?: Theme mode?: "light"|"dark"|"system" contrast?: "normal"|"more"|"system" target?: "self"|"document" as?: "div"|"span" className? style? children />`. It renders `<div class="cy-theme" data-cy-mode data-cy-contrast>` with the theme's custom properties inline on itself. `target="document"` sets attributes and properties on `document.documentElement` in an effect and cleans up on unmount.
  - `useColorMode(opts?: { storage?: { get(k:string): string|null|Promise<string|null>; set(k:string,v:string): void|Promise<void> }; key?: string }): { mode: "light"|"dark"|"system"; setMode(m): void; resolved: "light"|"dark" }`

- [ ] **Step 1: Write failing tests**:
  - Unit `"useColorMode falls back to system when storage throws"`: storage `get` throws, so the result is `mode === "system"` and no exception.
  - Unit `"useColorMode persists through the provided storage"`.
  - Story play `"theme applies only to its own wrapper"`: assert `document.documentElement.style.cssText === ""` and no `data-cy-mode` on `<html>`.
  - Story play `"nested themes override inner subtree only"`: the outer accent is `#e8462e`, the inner is `#14b8a6`, and the computed `--cy-color-accent` differs per subtree.
  - Story play `"target=document applies to html and cleans up on unmount"`.
  - Story play `"tokens resolve inside a shadow root with adopted styles"`: render into an open shadow root and adopt `createStyleSheet()`. Assert the computed `--cy-color-bg` equals `#f4f1ea` in light.
  - Story play `"system mode follows prefers-color-scheme"`: use `page.emulateMedia` through the Vitest browser `commands` API.
- [ ] **Step 2:** Run `pnpm vitest run tests/unit/color-mode.test.ts` and `pnpm test:stories -- CynosureTheme`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(theme): CynosureTheme wrapper, color mode and base CSS`.

### Task 4: Storybook workbench and the browser test harness

**Files:**
- Create: `.storybook/main.ts`, `.storybook/preview.tsx`, `.storybook/manager.ts`, `.storybook/cynosure-theme.ts` (branded manager using `brand/cynosure-lockup.svg`), `.storybook/decorators/hostile-host.tsx`, `vitest.config.ts` (projects: `unit` on node, `stories` on browser with Playwright `chromium`, `firefox`, `webkit`), `src/docs/Introduction.mdx`, `src/docs/Foundations.mdx` (tokens table generated from `createTheme()`, modes, motion).

**Interfaces:**
- Produces toolbar globals:
  - `mode` (light/dark/system)
  - `contrast` (normal/more)
  - `scale` (compact/comfortable/spacious)
  - `accent` (Default, Aperture `#e8462e`, Prism `#d0612a`, Planr `#d4a843`, Stepframe `#4f7bd9`, Nimaz `#14b8a6`)
  - `host` (clean/hostile)
- Every story is wrapped in `<CynosureTheme>` built from the globals.
- Produces `hostileHostCss: string` (Tailwind v4 preflight and v3 preflight copied verbatim under MIT with attribution, plus `*{box-sizing:content-box;font-size:19px;line-height:3;letter-spacing:.2em} button{background:red;border:5px solid lime;padding:20px} svg{width:100px}`) and the helper `expectStableUnderHostileHost(canvas, selector, props: string[])` in `src/test/hostile.ts`. It renders both ways and compares `getComputedStyle` values.
- Visual tests: `toMatchScreenshot` from `vitest/browser`, enabled only when `process.env.CY_VISUAL === "1"`. Baselines live in `__screenshots__/` and are committed by CI (Task 9).

- [ ] **Step 1:** Configure Storybook and Vitest. `parameters.a11y.test = "error"`. `tags: ["autodocs"]`.
- [ ] **Step 2:** Run `pnpm test:stories`. Expected: the Task 3 stories PASS on all three engines.
- [ ] **Step 3:** Run `pnpm storybook` in the background and confirm `http://localhost:6006` serves the Introduction page.
- [ ] **Step 4:** Commit: `feat(storybook): branded workbench, theme toolbar and browser test harness`.

### Task 5: Icon foundation and the Facet icon set

**Files:**
- Create:
  - `src/icons/types.ts` (`interface IconData { name: string; body: IconNode[]; star?: { x: number; y: number; size?: number }; motion?: IconMotion }`, where `IconNode = ["path", {d:string}] | ["rect", {...}] | ["circle", {...}]` and `IconMotion = "tilt"|"rotate"|"flip"|"draw"|"lift"|"drop"|"spin"|"pop"|"nudge"|"slide"`)
  - `src/icons/<name>.ts` for: search, close, check, copy, chevron-down, chevron-right, plus, sliders, trash, download, menu, moon, sun, info, warning, external, folder, code, tree, expand, collapse, retry, arrow-up, arrow-down. Paths come from the approved mockup at `.superpowers/brainstorm/74991-1794227541/content/icon-style.html` (Facet set `F`); for icons not in the mockup, draw in the same grammar.
  - `src/icons/index.ts`
  - `src/foundations/Icon/Icon.tsx`, `icon.css` (motion keyframes, triggered by `.cy-motion-trigger:hover/[data-active]` on an ancestor), `Icon.stories.tsx` (gallery + motion demo), `README.md`
  - `src/icons/validate.ts` (`validateIcon(data: IconData): string[]`: errors for viewBox ≠ 24, fill other than the star, a star ≠ 3×3 r0.8, coordinates outside 0–24)
- Test: `tests/unit/icons.test.ts`, plus Icon story play tests

**Interfaces:**
- Produces `<Icon icon={IconData} label?: string size?: "sm"|"md"|"lg"|number />`. Without `label` it is `aria-hidden="true"`; with `label` it gets `role="img"` and `aria-label`. The star fills with `var(--cy-icon-star, var(--cy-color-accent))`. The stroke width comes from token `--cy-icon-stroke` (default 1.75).
- Component tokens: `icon: { size-sm: 14px; size-md: 16px; size-lg: 20px; stroke: 1.75; star: accent }`.

- [ ] **Step 1: Write failing tests**:
  - Unit `"every shipped icon passes validateIcon"`.
  - Unit `"validateIcon rejects text, extra fills and off-grid stars"`, with three fixtures.
  - Story play `"decorative icon is hidden from assistive tech"`.
  - Story play `"labelled icon exposes role img and name"`.
  - Story play `"star takes the product accent"`: set accent `#14b8a6` and assert the star rect's computed fill is `rgb(20, 184, 166)`.
  - Story play `"motion is disabled under reduced motion"`: emulate reduce, hover, and assert the computed `animation-name` is `none`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(icons): Facet icon set and Icon foundation`.

### Task 6: ButtonBase, Button and IconButton (the reference component)

**Files:**
- Create: `src/foundations/ButtonBase/{ButtonBase.tsx,README.md}`, `src/components/Button/{Button.tsx,button.css,Button.stories.tsx,README.md,index.ts}`, `src/components/IconButton/{IconButton.tsx,IconButton.stories.tsx,README.md,index.ts}`.
- Modify: `src/index.ts` (exports) and `.size-limit.json` (budget: Button JS + CSS ≤ 3 kB gzip).

**Interfaces:**
- Consumes: Icon (Task 5) and tokens (Task 2).
- Produces:
  - `ButtonBase`: a `<button>` with `type` defaulting to `"button"`, ref forwarding, and a `data-pressed` mirror of `aria-pressed`.
  - `<Button variant?: "primary"|"secondary"|"ghost"|"danger" size?: "sm"|"md"|"lg" icon?: IconData iconEnd?: IconData loading?: boolean pressed?: boolean fullWidth?: boolean type? disabled? onClick? className? style? children />`
  - `<IconButton icon: IconData label: string (required) …same as Button minus children/iconEnd />`. The label is shown in a CSS tooltip until the real Tooltip lands in Plan 2. There is no `title`.
  - Component tokens: `button: { height-sm/md/lg, radius (= height × var(--cy-radius-factor)), padding-inline, gap, font-weight: 550, primary-bg, primary-ink, primary-highlight (inset 0 1px 0 #fff4), primary-shadow (0 1px 0 #0002), secondary-bg, secondary-border, ghost-bg, hover-bg, press-scale: .97, star-hover-rotate: 45deg, star-hover-scale: 1.3, max-width: 32ch }`.

- [ ] **Step 1: Write failing story play tests** in `Button.stories.tsx`:
  - `"click fires onClick once"`.
  - `"Enter and Space activate"`.
  - `"disabled blocks pointer, keyboard and touch"`: assert `onClick` is never called.
  - `"touch tap activates and target is >=44px under coarse pointer"`: emulate `pointer: coarse` and assert the hit box ≥ 44 via `getBoundingClientRect` of the `::before` hit layer, through `.cy-hit` sizing.
  - `"hit target is >=24px at compact scale"`.
  - `"loading sets aria-busy, keeps width and blocks clicks"`.
  - `"pressed toggles aria-pressed"`.
  - `"default type is button so it never submits a form"`, with a `<form onSubmit>` spy.
  - `"type=submit submits the enclosing form"`.
  - `"primary star spins on hover"`: the computed transform on the star contains `rotate`.
  - `"long label truncates with ellipsis within max width"` (Review Focus 5).
  - `"RTL places leading icon on the inline-start side"` (Review Focus 5).
  - `"renders identically under hostile host"`, using `expectStableUnderHostileHost(... ["height","padding-inline-start","border-radius","background-color","font-size"])`.
  - `"renders identically inside a shadow root"` (Review Focus 3).
  - IconButton `"requires label and exposes it as accessible name"`, plus `"label tooltip shows on hover and focus-visible, hides on Escape"`.
  - Unit `tests/unit/preact-compat.test.tsx`: `"Button works under preact/compat"`. Render through `preact/compat` aliases in jsdom, click, and assert `onClick` fires and `aria-pressed` toggles. Add `preact` as a devDependency.
  - Visual: `Primary`, `Secondary`, `Ghost`, `Danger`, `Sizes`, `WithIcons`, `Loading` × light/dark/dark-contrast (CI only).
- [ ] **Step 2:** Run `pnpm test:stories -- Button`. Expected: FAIL.
- [ ] **Step 3:** Implement, following spec §7 (Facet values).
- [ ] **Step 4:** Run `pnpm test:stories -- Button && pnpm size`. Expected: PASS and within budget.
- [ ] **Step 5:** Commit: `feat(button): ButtonBase, Button and IconButton`.

### Task 7: `cy` CLI (generators and convention checker)

**Files:**
- Create:
  - `tools/cli/index.ts` (`createCLI({ name: "cy", commands: [newCmd, check, progress] })`)
  - `tools/cli/commands/{new-component.ts,new-icon.ts,new-token.ts,check.ts,progress.ts}`
  - `tools/cli/templates/component/*` (tsx, css, stories with keyboard/touch/a11y/hostile play skeletons, README with "Used by", index)
  - `tools/cli/rules/{native-elements.ts,glyphs.ts,title-attr.ts,literals.ts,structure.ts,agents.ts}`
- Test: `tests/unit/cli/*.test.ts` (each runs in a temp copy of fixture trees)

**Interfaces:**
- Consumes: `defineCommand` and `createCLI` from `@arshad-shah/clif` (devDependency); `validateIcon` (Task 5).
- Produces commands:
  - `cy new component <Name> --kind foundation|composite`: creates the files and adds exports to `src/index.ts`, the CSS entry list in `tools/build-css.ts`, and a size-limit entry. It is idempotent: it refuses if the component exists.
  - `cy new icon <name> [--from file.svg]`: normalises, validates, writes and exports.
  - `cy new token <group.name> --value <v> --doc "<text>"`.
  - `cy check [--json]`: exits 1 on any violation and prints `file:line rule message`.
  - `cy progress`: prints the current task and next step from `docs/PROGRESS.md` and fails if the required sections are missing.
- Rule (`native-elements`): a TSX AST visit flags intrinsic `button,a,input,textarea,select,dialog,details,summary,option` outside `src/foundations/**`.
- Rule (`literals`): flags hex colours or `\d+px` in `src/components/**/*.{tsx,css}` except inside `var()` fallbacks of component tokens.
- Rule (`structure`): every `src/components/*` and `src/foundations/*` folder has a stories file containing at least one `play:`, plus a README containing `## Used by`.

- [ ] **Step 1: Write failing tests**:
  - `"new component scaffolds files that pass cy check and typecheck"`.
  - `"new component refuses an existing name"`.
  - `"check flags a native button in a composite with file:line"`.
  - `"check flags an emoji used as an icon"`.
  - `"check flags title= attributes"`.
  - `"check flags a hex literal in component CSS"`.
  - `"check passes on the real repo"`.
  - `"new icon rejects an SVG with text"`.
  - `"progress fails when Next step section is missing"`.
- [ ] **Step 2:** Run `pnpm vitest run tests/unit/cli`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run. Expected: PASS. `pnpm check` exits 0.
- [ ] **Step 5:** Commit: `feat(cli): cy generators and convention checker on clif`.

### Task 8: Agent files, docs and the progress doc

**Files:**
- Create:
  - `AGENTS.md` (root rules: commands, gates, conventions, publishing and branch policy, account switching for pushes, "update PROGRESS.md and push at the end of every session")
  - `CLAUDE.md` (single line `@AGENTS.md`)
  - `AGENTS.md` in each of `src/tokens`, `src/foundations`, `src/components`, `src/icons`, `src/theme`, `src/adapters`, `tools/cli`, `.storybook`, `docs`
  - `docs/{architecture,conventions,theming,icons,testing,adapters,release,migration}.md`
  - `docs/PROGRESS.md` (sections: `## Status`, `## Current task`, `## Next step`, `## Plans` (links and checkboxes for Plans 1–4), `## Blockers`, `## Decision log`, `## Verification`, `## How to resume`)
  - `README.md` (install, quick start, link to Storybook Pages)
- Modify: `tools/cli/rules/agents.ts`, which fails if any listed folder lacks an `AGENTS.md`.

- [ ] **Step 1:** Write the docs. Each folder's `AGENTS.md` includes the exact `cy` command for creating things there, and the rules `cy check` enforces there.
- [ ] **Step 2:** Run `pnpm check && pnpm cy progress`. Expected: PASS, printing the current task.
- [ ] **Step 3:** Commit: `docs: agent files at every level, guides and progress tracker`.

### Task 9: CI, visual baselines, GitHub Pages, push

**Files:**
- Create:
  - `.github/workflows/ci.yml` (push and PR: pnpm install with cache, `pnpm exec playwright install --with-deps`, then `check`, `lint`, `typecheck`, `test`, `test:stories` with `CY_VISUAL=1`, `build`, `publint`, `attw --pack . --profile esm-only`, `size`; it uploads `__screenshots__/__diff__` on failure)
  - `.github/workflows/pages.yml` (push to `next` and `main`: `build-storybook`, then `actions/upload-pages-artifact`, then `actions/deploy-pages`)
  - `.github/workflows/visual-baselines.yml` (`workflow_dispatch`: runs `test:stories --update` with `CY_VISUAL=1` on Linux and commits `__screenshots__` to the branch)
- Modify: `docs/PROGRESS.md` (mark Plan 1 done, add the Pages URL), `README.md`.

- [ ] **Step 1:** Run `pnpm verify` locally (all gates without visual). Expected: all PASS.
- [ ] **Step 2:** Push `next` using the arshad-shah account. Enable Pages with the workflow build type: `gh api -X POST repos/arshad-shah/cynosure/pages -f build_type=workflow` (or `PUT` if it already exists). Switch the account back.
- [ ] **Step 3:** Trigger `visual-baselines.yml` on `next` and wait for its commit, then confirm `ci.yml` is green on `next`.
- [ ] **Step 4:** Confirm `https://arshad-shah.github.io/cynosure/` returns 200 and shows the Introduction page.
- [ ] **Step 5:** Update `docs/PROGRESS.md` (Plan 1 complete, next step: write Plan 2). Commit and push.
