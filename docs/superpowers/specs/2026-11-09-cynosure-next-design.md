# Cynosure (next): design

Date: 2026-11-09 · Branch: `next` in `arshad-shah/cynosure` · Status: awaiting approval

## 1. Intent

Arshad builds many products: browser extensions, web apps and Astro sites. Every one of them
has rebuilt its own buttons, selects, icons and theme, and they drift apart. The previous
Cynosure (`@arshad-shah/cynosure-react` and friends) tried to fix this but was bulky (9 MB,
103 components, 16 exact-pinned heavy dependencies). Its styles broke when installed in
other apps, because it assumed it owned `:root`, `<html>`, `<body>` and the host's CSS
pipeline. Updating it was hard, because a 600-line custom CSS post-processor produced output
that drifted from the source.

Cynosure (next) replaces it with **one small, fast, tree-shaken package** that every
product uses. Its job is code reuse: a product never builds a new UI component. It imports
Cynosure and adjusts tokens. The audience is Arshad's own products. Outside users are
welcome but never drive decisions.

**What stays common:** the feel, the layout behaviour, the components themselves, icons,
motion and accessibility. **What a product changes:** its accent colour, its scale, and any
other token it wants. Every visual property is a token a product can control.

## 2. Goals

1. A single npm package, `@arshad-shah/cynosure` (the name is free on npm), that installs
   with one command and works with no build plugin.
2. Small and tree-shaken: unused components, icons and their CSS never reach a product
   bundle. Size budgets are enforced in CI.
3. It looks identical in every host: a Vite app, an Astro page, an extension popup or side
   panel, an iframe, or a shadow root inside a third-party page.
4. Theming by one typed call. Every property can be customised per product and per
   subtree. Light, dark and high-contrast modes, following the OS by default.
5. Components do the work: animation, accessibility, keyboard, touch, responsive layout and
   focus management are built in. Product code stays minimal.
6. **Native interactive elements appear only in foundation components.** Once a component
   exists (e.g. `Button`), every other component that needs it uses it.
7. Touch and mobile friendly. Responsive, using container queries where layout depends on
   space.
8. Storybook is the workbench and the test suite: every component has stories covering
   every state, with play tests (behaviour), accessibility tests, touch tests and visual
   tests. It is published to GitHub Pages on every push.
9. Agents can work on it without guessing: agent files and docs at every level, plus
   generator and checker CLIs built on `@arshad-shah/clif`.
10. Perfect resumption: a progress document tracks the whole project, so work continues
    on any machine or in the cloud.

## 3. Non-goals

- A component for every possible UI need. Components exist because products use them
  (Section 8).
- Supporting old browsers. The targets are the current evergreen Chrome, Edge, Firefox and
  Safari, desktop and mobile.
- A Vue, Svelte or Solid binding (not used by any product).
- Migrating products. That comes later; each product gets a GitHub issue (Section 14).
- Charts, data tables, carousels, code highlighting and date pickers in v1. Products that
  need them keep their current solution until a real shared need appears.

## 4. Anti-goals (failure even if it "works")

- Styles that change when the host app adds CSS (resets, Tailwind preflight, global
  `button {}` rules), or Cynosure styles leaking into the host.
- Anything written to `document.documentElement`, `document.head` or `document.body` by
  default, inline `<script>` theme init, or runtime CSS injection that MV3 CSP forbids.
- JS modules that `import './x.css'` and so require a CSS-aware bundler.
- A build pipeline whose output can drift from the source (no hand-written CSS rewriters).
- Heavy or exact-pinned runtime dependencies. Each dependency must be justified, and the
  target is zero.
- Tests that only raise coverage ("renders without crashing", snapshot-only) without
  exercising behaviour.
- Native `<select>`, `<details>`, `title` tooltips, native checkbox/radio/range/colour
  inputs, or text and emoji glyphs used as icons.

## 5. Decisions made by Arshad

- Name, logo and brand assets carry over from old Cynosure (`brand/`). Nothing else
  carries over unless this design says so.
- It lives in `arshad-shah/cynosure` on a new branch, `next`, and becomes the main package.
  The old `cynosure-*` packages are removed from the repo. Deprecating them on npm is a
  separate step that needs Arshad's confirmation at the time.
- **Icon style: Facet.** Icons are drawn from the Cynosure mark: a 24 grid, a 1.75 round
  stroke, softened-square geometry, and usually one small accent "star" square
  (3×3, radius 0.8) that takes the product accent. Each icon has an optional CSS
  micro-animation on hover or activation. Icons must be modular and trivially easy to add.
- **Component look: Facet.** Softened-square corners whose radius scales with the control
  height, a subtly lit primary button, an optional accent star on cards, and mono uppercase
  "eyebrow" labels. The reference mockups are in `.superpowers/brainstorm/` (local, not
  committed). Their key values are captured in Section 7.
- Every visual property can be customised by a product.
- A custom textarea is required (auto-grow and a character counter, as in old Cynosure).
- Every component is touch friendly, with that tested. Accessibility is built in and tested
  in Storybook.
- Testing uses Storybook play tests, visual tests, accessibility tests and touch tests,
  with complete coverage, and every test must be behavioural.
- Generator and convention CLIs are built on `@arshad-shah/clif` (currently 1.4.0, zero
  dependencies).
- Agent files and documentation at every level of the repo.
- Build systems: start from Vite and be able to bolt on others (esbuild/extforge, Astro,
  anything future) in a modular way.
- Storybook runs locally during development and deploys to GitHub Pages on every push.
- A progress document keeps the whole project resumable from anywhere. The branch is pushed
  to the remote.
- UI first. Product migration is tracked later as one issue per product repo.

## 6. Architecture (builder's choices, made by Claude, open to correction)

### 6.1 Package shape

Single-package repo (no monorepo, no Turbo). The root is the published package. The
repo-only tooling (CLI, Storybook config, scripts) lives beside it and is not published.

```
cynosure/
  brand/                      kept from old Cynosure
  src/
    tokens/                   token schema, defaults, createTheme, themeToCss, contrast
    foundations/              the ONLY components allowed to render native interactive elements
    components/               composites built only from foundations and other components
    icons/                    one file per icon + Icon renderer (Icon is a foundation)
    styles/                   base.css (scoped reset, modes), generated cynosure.css
    adapters/vite/            optional Vite plugin (first adapter)
    index.ts                  barrel of components, tree-shakeable
  tools/cli/                  `cy` CLI on @arshad-shah/clif (repo-only)
  .storybook/
  docs/                       architecture, conventions, guides, PROGRESS.md
  AGENTS.md (+ CLAUDE.md -> AGENTS.md) at root and in every top-level folder
```

**Exports (subpath map):**
- `@arshad-shah/cynosure`: components and `createTheme`, ESM, `sideEffects: ["*.css"]`.
  No JS file imports CSS.
- `@arshad-shah/cynosure/icons`: icon data, one named export per icon.
- `@arshad-shah/cynosure/styles.css`: all component CSS plus base.
- `@arshad-shah/cynosure/styles/<component>.css`: per-component CSS, for hosts that want
  only what they use.
- `@arshad-shah/cynosure/styles.inline`: the same CSS as a JS string export and a
  `CSSStyleSheet` factory, for shadow roots (`adoptedStyleSheets`) and extforge
  `getStyle()`.
- `@arshad-shah/cynosure/vite`: the optional Vite adapter.
- Types for everything, ESM only (all consumers are ESM bundlers or Astro).

### 6.2 Framework

Components are React function components with hooks, a peer dependency of
`react >=18 <20`. They are tested on React 19 and smoke-tested on React 18. They work in
Preact (Prism, Aperture) through `preact/compat` aliasing, also verified in CI with a
Preact smoke test. They avoid APIs that `preact/compat` lacks. They are React Server
Component safe where it matters (`"use client"` on interactive modules) and render
statically in Astro islands.

Web components were rejected: content scripts in Chrome have no `customElements` registry,
which would break Aperture's in-page UI.

### 6.3 Styling and isolation

- Plain `.css` files authored with modern CSS: nesting, `light-dark()`, `color-mix()`,
  OKLCH, container queries, `@starting-style`, `transition-behavior: allow-discrete`, and
  `:has()`. They are built with Lightning CSS for latest-evergreen targets: minified, no
  down-levelling hacks. There is no CSS-in-JS and nothing is injected at runtime.
- Prefixed classes (`cy-button`) with variants as data attributes
  (`data-size`, `data-tone`, `data-state`). Tokens are custom properties (`--cy-*`).
- **Isolation requirement:** host CSS must not change Cynosure rendering, and Cynosure
  must not touch host elements. Cascade layers alone are insufficient, because unlayered
  host CSS beats layered CSS. The builder chooses the mechanism (likely: component rules
  unlayered at low but class-level specificity, a scoped component-local reset that
  neutralises inherited and UA styles, and an opt-in `@layer` order for hosts that want
  it), and it must pass the **hostile-host test suite**. That suite renders each component
  under aggressive global CSS: a Tailwind v3 and v4 preflight, `* {}` and `button {}`
  rules, odd `font-size` and `line-height`, and `box-sizing: content-box`. It asserts the
  computed styles and screenshots are unchanged.
- Tokens are declared on `:where(:root, :host, .cy-theme)`, so they resolve on a page, in
  a shadow root, or on any themed subtree.

### 6.4 Theming

- `createTheme(input: ThemeInput): Theme`. `ThemeInput` is a deep-partial of the full
  token schema plus shorthands:
  - `accent` (any CSS colour)
  - `scale` (`compact` | `comfortable` | `spacious` | a number)
  - `radius` (a multiplier, or a full scale)
  - `font` (`sans`, `mono`, `display`)
  - `star` (on/off/size)
  - `motion` (durations and easing, or `"reduced"`)
- `createTheme` derives the accent ramp (hover, active, soft, ring) in OKLCH, and picks
  on-accent text by WCAG contrast (≥ 4.5:1 for text). It throws in development if no
  compliant pair exists.
- `themeToCss(theme, selector?)` returns a CSS string, usable at build time, by the Vite
  adapter, in a `<style>`, or in an adopted sheet. `<CynosureTheme theme mode>` applies the
  theme to **its own wrapper element** (`class="cy-theme"` plus inline custom properties on
  that element only). It never touches `<html>`, `<head>` or `<body>`. It nests, so a
  subtree can be re-themed.
- Modes: `light`, `dark`, `contrast`, `system` (default). `system` uses
  `prefers-color-scheme` and `prefers-contrast`. `forced-colors` is respected.
- **Token schema (every property tokenised):**
  - colour roles: `bg`, `surface`, `surface-raised`, `soft`, `ink`, `muted`, `line`,
    `accent`, `on-accent`, `accent-soft`, `ring`, `success`, `warning`, `danger`, `info`
    and their `on-*` and soft variants
  - control heights per size
  - spacing scale
  - radius scale, with radius derived from height by a factor (the Facet rule)
  - border widths
  - focus-ring width and offset
  - shadows, including the lit primary inset
  - font families, sizes, weights and line heights, plus eyebrow letter-spacing
  - motion durations and easings
  - z-layers
  - star size and visibility
  - hit-target minimum

  The builder may refine the names, but each name is defined once in TS and generated to
  CSS, never duplicated by hand.
- **Customisation depth (Arshad: "all of its properties can be controlled by a
  product").** There are two token tiers. Global semantic tokens (above) sit at the
  bottom. On top of them, **per-component tokens** cover every visual property of every
  component (`--cy-button-radius`, `--cy-button-height`, `--cy-card-padding`,
  `--cy-select-list-shadow`, …). Each one defaults to a global token. `createTheme`
  accepts a `components` section that is typed per component. Component CSS may read only
  its own component tokens. `className` and `style` pass through to the root element for
  layout only (margin, grid placement, width). The docs say plainly that restyling goes
  through tokens. *(Claude's call.)*
- **Page-level mode and persistence.** `<CynosureTheme>` themes its own wrapper by
  default. `target="document"` is an explicit opt-in that applies the theme and mode to
  `<html>`, for apps that own the page; it is never used in content scripts. `ThemeToggle`
  is controlled (`value`/`onChange`). `useColorMode({ storage })` persists through a
  pluggable storage (`localStorage` by default, or extension storage). To avoid a flash on
  static sites, the Vite and Astro adapters emit a tiny **external** init script file,
  never inline, so it stays CSP-safe. *(Claude's call.)*
- **Contrast is a modifier, not a palette.** There are four palettes: light, dark,
  light-contrast and dark-contrast. `mode` is `light | dark | system`, and
  `contrast` is `normal | more | system`. Visual baselines cover light, dark and
  dark-contrast. *(Claude's call.)*
- Fonts: the default is the system stack (zero bytes, extension-safe). Hanken Grotesk
  (variable, woff2, OFL) ships in the package as an **optional** stylesheet,
  `@arshad-shah/cynosure/fonts/hanken.css`, and is never fetched from a CDN.

### 6.5 Overlays and motion

- Popovers, menus, selects and tooltips use the **Popover API** (top layer, so no portals
  to `document.body`, and they work inside shadow roots) plus **CSS anchor positioning**.
  Where a target browser lacks anchor positioning, a tiny built-in positioning fallback is
  used. It is feature-detected and adds zero cost where it isn't needed. Dialogs use
  `<dialog>` inside the Dialog foundation.
- Motion is pure CSS: transitions, `@starting-style` entry and exit animations, and
  icon micro-animations. Everything collapses under `prefers-reduced-motion` or
  `motion: "reduced"`.

### 6.6 Foundations rule

Foundations are the only modules that render native interactive or form elements
(`button`, `a`, `input`, `textarea`, `dialog`, `svg`). The proposed foundations:
`ButtonBase`, `LinkBase`, `InputBase`, `TextAreaBase`, `ChoiceBase` (a native
checkbox or radio input, visually hidden under a Cynosure skin), `HiddenValue` (a hidden
input that lets custom widgets such as Select and SegmentedControl submit), `DialogBase`
and `Icon`. **Forms:** every form control works in a native `<form>`: it submits through
`FormData`, responds to form reset, and supports `required` and constraint validation.
Interactive components need hydration; tokens, CSS and icons also work statically on
non-hydrated Astro pages. *(Claude's call.)* Public
components such as `Button`, `IconButton`, `TextField`, `TextArea`, `Link` and `Dialog`
wrap them. Composite components may use only other Cynosure components plus neutral
layout elements (`div`, `span`, lists). This is enforced by a lint rule in `cy check`
(AST-based, modelled on Aperture's dom-lint and glyph-lint). It fails on native
interactive elements outside `src/foundations`, on text or emoji glyphs used as icons, on
`title=` attributes, and on hard-coded colours or lengths outside `src/tokens`.

### 6.7 Icons (Facet)

- One file per icon in `src/icons/<name>.ts`, exporting typed data:
  `{ name, paths, star?, motion? }`. `motion` names one of a small set of shared CSS
  micro-animations (`tilt`, `rotate`, `flip`, `draw`, `lift`, `drop`, `spin`, `pop`,
  `nudge`, `slide`).
- `<Icon icon={search} />` renders it (`aria-hidden`, or labelled when given a label).
  Importing an icon by name is what tree-shakes it.
- `cy new icon <name> --from file.svg` normalises an SVG to the grid and validates it:
  viewBox, stroke-only body, star size and position, no text, no fills except the star.
  It then writes the file, the export, a gallery entry and a test.
- The starting set covers every icon the current products use (Prism's registry,
  Aperture's Lucide subset, Stepframe and Planr usage). The builder compiles that list
  from the repos.

### 6.8 Build-system modularity

- The package itself needs no plugin: plain ESM plus `.css` plus the inline string export.
- Adapters live in `src/adapters/<tool>/`, each small and optional. `vite` is first:
  - inject a product's `themeToCss` at build time
  - optionally include only the CSS for the components the product imports
  - provide the `styles.inline` path for extension shadow roots

  Future adapters (esbuild/extforge, Astro) follow the same contract, documented in
  `docs/adapters.md`. Cynosure's own build is a thin Vite library build plus Lightning CSS.
  Swapping Vite later means replacing one config, not the architecture.

### 6.9 Touch, responsive, accessibility

- Every interactive component meets a 24×24 CSS px minimum target (WCAG 2.2 AA) at every
  scale, and 44×44 on `(pointer: coarse)`. The hit area may extend beyond the visual size.
- Responsive behaviour uses container queries. For example, a Dialog becomes a bottom
  sheet in narrow containers, and Select uses a sheet-style list on coarse pointers.
- **Built-in strings (Arshad's decision):** they are English by default, and every
  user-visible or announced string can be overridden through a typed `labels` prop on the
  component that owns it (e.g. `<CopyButton labels={{ copied: "Kopiert" }} />`). There is
  no locale provider in v1. Layout stays RTL-safe, so a locale layer can be added later
  without breaking APIs.
- Components follow the WAI-ARIA Authoring Practices patterns, with full keyboard support,
  visible focus, labelling enforced by types (an icon-only button requires `label`), and
  RTL-safe logical properties.

## 7. Facet look: reference values from the approved mockups

- Control height at `comfortable`: 32px. `compact` is ×0.875 and `spacious` ×1.2. Text
  is 13px at comfortable, and everything scales with `--cy-scale`.
- Control radius is about 0.3 × control height. Segment radius is about 0.22 × height.
  Cards have a 14px radius.
- Light palette: bg `#f4f1ea`, surface `#fbf9f5`, ink `#1d1b18`, muted `#6b665e`,
  line `#dcd6cb`, soft `#ebe6dc`.
- Dark palette: bg `#14120f`, surface `#1d1a16`, ink `#ece8e1`, muted `#a39d93`,
  line `#34302a`, soft `#28241f`.
- Focus is shown with an accent border plus a 3px ring of accent at 28%.
- The primary button uses the accent fill, a 1px inset highlight and a 1px drop shadow.
  Its star rotates 45° and scales to 1.3 on hover (`cubic-bezier(.2,.9,.2,1)`, 350ms).
- The card star is a 6px square with radius 2, inset 10px top-right.
- Eyebrows are mono 600, about 10.5px, uppercase, letter-spacing .08em.
- The default accent is open (Section 15). Product accents seen: Aperture `#e8462e`,
  Prism `#b9420b`/`#d0612a`, Planr `#d4a843`, Stepframe `#1d3a6b`, Nimaz `#14b8a6`.

## 8. Component scope (product-driven)

Each component must be used by at least two products, or be essential to one. The builder
verifies usage from the repos and records it in each component's README ("Used by").

- **Foundations:** ButtonBase, LinkBase, InputBase, TextAreaBase, ChoiceBase,
  HiddenValue, DialogBase, Icon.
- **Milestone 1, core controls:** Button, IconButton, Link, TextField, SearchField,
  TextArea (auto-grow, counter, max length), Select, SegmentedControl, Switch, Checkbox,
  RadioGroup, Tooltip, Badge, Kbd, Spinner, CynosureTheme, ThemeToggle.
- **Milestone 2, structure and overlays:** Card, Toolbar, Tabs, Disclosure and Accordion,
  Popover, Menu, Dialog and Sheet, Toast, Notice/Alert, EmptyState, Stack and Inline
  (minimal layout), CopyButton.
- **Milestone 3, from product evidence:** Slider/range (Aperture, SonicTap),
  ColorField (Aperture), Combobox (if two products need it), Tree (Prism and Aperture),
  CommandPalette (Aperture), ProgressBar (Planr).

## 9. Testing

- Storybook 10 (`@storybook/react-vite`) plus `@storybook/addon-vitest`: stories are the
  tests. They run in Vitest browser mode on Playwright Chromium, Firefox and WebKit.
- Every component has stories for each state, size, tone, mode (light, dark, contrast) and
  scale. Play functions exercise the real behaviour: keyboard, pointer, **touch**
  (pointer type touch, coarse viewport), focus management, controlled and uncontrolled
  values, and disabled/read-only states.
- Accessibility runs on every story through `@storybook/addon-a11y` with
  `test: "error"`, plus explicit role/name/keyboard assertions in the play functions.
- Visual tests use Vitest browser screenshot comparison. Baselines are generated in Linux
  CI and committed, covering each story × light/dark × one scale. They are viewable as an
  artifact on failure.
- Hostile-host suite (Section 6.3). Extension-context tests: render inside a shadow root
  with adopted styles, and under a strict CSP page (no inline script, no eval).
- Unit tests (plain Vitest) only for pure logic: `createTheme`, contrast and ramp maths,
  icon validation, CLI generators.
- **Behavioural rule:** every test must fail if the behaviour it names breaks. No
  "renders without crashing", no snapshot-only tests. Coverage (Istanbul, browser) is
  reported, with a CI floor of 95% lines/branches for `src/`. Coverage gaps are filled
  with behaviour tests, never filler.

## 10. CLI (`cy`, on `@arshad-shah/clif`, repo-only)

- `cy new component <Name> --foundation|--composite` scaffolds `Name.tsx`, `name.css`,
  `Name.stories.tsx` (with play-test skeletons for keyboard, touch and a11y),
  `README.md` (docs template including "Used by") and `index.ts`. It then registers the
  barrel, exports, the CSS entry and the size budget.
- `cy new icon <name> [--from svg]` (Section 6.7).
- `cy new token <path>`: adds a token to the schema with docs and regenerates CSS and types.
- `cy new adapter <tool>`: scaffolds an adapter with its contract test.
- `cy check`: every convention rule (foundations rule, glyphs, titles, literals, story,
  README, play test, budgets, exports, AGENTS links). Run in CI and in the pre-commit hook.
- `cy progress`: prints current status from `docs/PROGRESS.md` and validates its structure.

The commands write deterministic output, so re-running one on a clean tree changes
nothing. Each generator has tests.

## 11. Documentation and agent files

- Root `AGENTS.md` holds the canonical rules (conventions, commands, gates, branch and
  publishing policy, where everything lives). `CLAUDE.md` contains one line pointing to it.
- An `AGENTS.md` in every top-level source folder (`src/tokens`, `src/foundations`,
  `src/components`, `src/icons`, `src/adapters`, `tools/cli`, `.storybook`, `docs`)
  states that folder's rules and exact recipes.
- `docs/`: `architecture.md`, `conventions.md`, `theming.md`, `icons.md`,
  `testing.md`, `adapters.md`, `release.md`, `migration.md`, and `PROGRESS.md`.
- Each component's README is rendered in Storybook (autodocs/MDX). It covers usage, props,
  tokens used, a11y notes and "Used by".
- Storybook gets an Introduction page and Foundations pages (tokens, icons gallery,
  motion, modes).

## 12. Progress and resumption

`docs/PROGRESS.md` is the single source of truth for status:
- phases and milestones with checkboxes
- the current task
- the next concrete step
- blockers
- a decision log (date, decision, why)
- the verification state
- "how to resume" (exact commands)

Every working session ends by updating it and pushing. `cy progress` validates it. The
branch is pushed to `origin/next` after each meaningful step.

## 13. CI and delivery

- GitHub Actions on every push and PR:
  - install (pnpm, Node 24)
  - `cy check`, Biome, typecheck
  - Vitest unit and Storybook browser tests on three engines, with a11y and visual checks
  - build, publint and arethetypeswrong
  - size-limit budgets
- Storybook is deployed to **GitHub Pages** from Actions on every push to `next` (later
  `main`), so cloud work is visible at the Pages URL.
- npm publishing goes through changesets but stays **disabled until Arshad authorises the
  first publish**. Deprecating the old `cynosure-*` npm packages also needs explicit
  authorisation.
- Package version starts at `0.1.0` and goes to 1.0.0 when the first product (Prism)
  ships on it. This is the builder's call.

## 14. Later: product migration issues

When Milestone 2 is done (or when Arshad asks), open one issue per product repo describing
the migration scope:
- full: prism, aperture-css, smart-audio-capture, request-interceptor, session-recorder,
  snapforge, algo-visual (Stepframe), algosnap, whetstone, planr, exposure-map
- adopt at start: verql
- partial: brothers-arcade (overlays), portfolio-v6, nimaz-web (tokens, icons, islands),
  the detent and swiftchart docs (tokens and theme), for-spogmay (tokens and icons)
- archive: `ui-library`

## 15. Left to the builder

- Exact token names (within the schema rules) and the default Cynosure accent, likely
  derived from the mark's palette. The builder proposes it in Storybook for Arshad's
  sign-off.
- The precise isolation mechanism, provided it passes the hostile-host suite.
- Size budget numbers (targets: Button JS + CSS ≤ 3 kB gzip; full CSS ≤ 30 kB gzip;
  `createTheme` ≤ 2 kB).
- The anchor-positioning fallback implementation.
- The starting icon list compiled from the product repos.
- Storybook visual polish (Cynosure-branded manager theme).
