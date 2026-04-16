# Lumen UI — Project Specification

> A gorgeous, tiny, customisable, accessible React UI framework designed for production use across all of Arshad's projects.

This folder contains the complete build specification for **Lumen UI**, broken into detailed phase documents. Feed these to Claude Code one phase at a time, and use `PROGRESS.md` as the central tracker.

---

## The one-paragraph pitch

Lumen is a headless-at-the-core, themed-on-top React component library. Every component is built on a tiny set of **layout primitives** (`Box`, `Stack`, `Inline`, `Grid`, `Center`, `Flex`) that are the only things that render raw HTML. Styling happens through **CSS custom properties driven by a W3C DTCG token pipeline**, variants are **typed via `cva` (Class Variance Authority)**, behaviour and accessibility come from **Radix Primitives + React Aria** where appropriate, and the build ships **per-component ESM bundles with per-component CSS** so consumers only pay for what they import. Storybook 9/10 drives development, documentation, interaction tests, accessibility tests, and visual tests — all powered by Vitest in browser mode.

---

## Non-negotiable principles

1. **Tiny by default.** Tree-shakeable ESM. Per-component entry points. Per-component CSS files. `sideEffects: false` except for bare CSS imports. Zero runtime styling cost.
2. **Props-only styling for consumers.** Consumers should never need to write CSS to use Lumen. Every visual concern is a prop, a variant, or a token override.
3. **Raw HTML lives in one place.** Only the six layout primitives touch `div`, `span`, `ul`, etc. directly. Every other component is composed from primitives + Radix/React-Aria.
4. **Accessibility is not optional.** WCAG 2.2 AA is the floor. Keyboard, focus, screen-reader, reduced-motion, and RTL are all first-class.
5. **Themes are data.** All design decisions live in W3C DTCG JSON tokens. CSS variables are generated. Consumers can swap themes with a single prop or `data-theme` attribute.
6. **Every component is tested.** Interaction tests via Storybook play functions, a11y tests via `@storybook/addon-a11y`, visual tests via Chromatic (optional), and Vitest browser-mode unit tests.
7. **No wasted code.** Biome enforces no unused exports, no dead code. `publint` and `@arethetypeswrong/cli` validate the published package.
8. **Self-documenting.** Every component ships with MDX docs, interactive Storybook, TypeScript JSDoc, and a generated API reference.

---

## Tech stack (final decisions, ranked by confidence)

| Concern                | Choice                                     | Why                                                                 |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------------- |
| Language               | TypeScript 5.6+ (strict)                   | Type safety, autocomplete, first-class in every tool.              |
| Framework              | React 19                                   | Current stable, `use` API, transitions, ref-as-prop.                |
| Monorepo manager       | pnpm workspaces                            | Fastest, strictest, content-addressable.                           |
| Build orchestrator     | Turborepo                                  | Caching, affected-only builds, remote cache-ready.                 |
| Versioning/publishing  | Changesets                                 | PR-driven changelogs, monorepo-aware.                              |
| Library bundler        | **tsup** (esbuild) — per-component entries | Fastest, simplest, preserves ESM modules for tree-shaking.         |
| CSS strategy           | **Vanilla-Extract** + CSS custom properties | Zero-runtime, type-safe, per-component CSS chunks via Vite.        |
| Variants API           | `cva` v1 (Class Variance Authority)        | Typed, tiny, works with any class-emitting system.                 |
| Accessibility base     | Radix Primitives + React Aria (hybrid)     | Radix for composable UI, React Aria for complex behaviour (Date, Combobox, Table). |
| Token pipeline         | Style Dictionary v4 + DTCG format          | W3C standard, multi-platform, future-proof.                        |
| Component variants     | `cva` → class names → vanilla-extract recipes | Typed compile-time variants with extractable CSS.                 |
| Icons                  | Lucide React (peer dep)                    | Tiny, consistent, tree-shakeable.                                  |
| Animation              | `motion` (Framer Motion v12+, lighter fork) | Standards-track API, 18kb vs 50kb.                                 |
| Dev/docs environment   | Storybook 10 + `@storybook/react-vite`     | Stories = docs = tests in one place.                               |
| Unit tests             | Vitest 3 (browser mode + Playwright-Chromium) | Same runner as Storybook, true browser semantics.                 |
| Interaction tests      | `@storybook/addon-vitest`                  | Runs play functions as real Vitest tests.                          |
| A11y tests             | `@storybook/addon-a11y` (axe-core)         | Catches violations per story.                                      |
| Visual regression      | Chromatic (optional, recommended)          | Zero-infra visual tests tied to Storybook.                         |
| Linting                | Biome                                      | 10–100x faster than ESLint+Prettier, single tool.                  |
| Commit hooks           | `simple-git-hooks` + `lint-staged`         | Tiny, no daemon.                                                   |
| Package validation     | `publint` + `@arethetypeswrong/cli`        | Catches broken exports before publish.                             |
| Documentation site     | Storybook's built static output + Docusaurus **OR** just Storybook | Start with Storybook-only; Docusaurus is Phase 10 if needed.       |

---

## Package layout

```
lumen/                                    # repo root
├── apps/
│   └── playground/                       # Vite + React sandbox for local dev
├── packages/
│   ├── tokens/                           # @lumen/tokens — DTCG JSON + generated outputs
│   ├── themes/                           # @lumen/themes — prebuilt themes (default, dark, terminal, etc.)
│   ├── core/                             # @lumen/core — primitives, utilities, hooks (framework-free where possible)
│   ├── react/                            # @lumen/react — the main component library
│   ├── icons/                            # @lumen/icons — re-exports of Lucide with tree-shaken bundle
│   └── config/                           # internal — shared tsconfig, biome config, tsup presets
├── docs/                                 # Storybook lives here (or .storybook at root)
├── .changeset/
├── turbo.json
├── pnpm-workspace.yaml
├── biome.json
├── tsconfig.base.json
└── package.json
```

---

## Component inventory (what "every single component" means)

### Layout primitives (the only HTML)
`Box`, `Stack`, `Inline`, `Flex`, `Grid`, `Center`, `Spacer`, `Divider`, `AspectRatio`, `Container`, `Section`

### Typography
`Text`, `Heading`, `Code`, `Kbd`, `Link`, `Blockquote`, `List` (ordered, unordered, description)

### Forms & input
`Button`, `IconButton`, `ButtonGroup`, `Input`, `Textarea`, `NumberInput`, `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup`, `Switch`, `Select`, `Combobox`, `MultiSelect`, `Slider`, `RangeSlider`, `DatePicker`, `DateRangePicker`, `TimePicker`, `ColorPicker`, `FileUpload`, `SearchInput`, `PinInput`, `TagsInput`, `Rating`, `Form`, `FormField`, `Fieldset`, `Label`, `HelperText`, `ErrorText`

### Navigation
`Tabs`, `Breadcrumb`, `Pagination`, `Menu`, `MenuBar`, `NavigationMenu`, `Sidebar`, `Stepper`, `Anchor`, `BackToTop`

### Overlay & feedback
`Dialog`, `AlertDialog`, `Drawer`, `Sheet`, `Popover`, `Tooltip`, `HoverCard`, `Toast` (`toaster` API), `Banner`, `Alert`, `Notification`, `ContextMenu`, `DropdownMenu`, `Modal`

### Data display
`Card`, `Badge`, `Tag`, `Chip`, `Avatar`, `AvatarGroup`, `Table`, `DataTable`, `Tree`, `Timeline`, `Stat`, `Progress`, `ProgressCircle`, `Skeleton`, `Spinner`, `Accordion`, `Collapsible`, `Disclosure`, `EmptyState`, `Callout`, `CodeBlock`

### Utility
`VisuallyHidden`, `FocusTrap`, `Portal`, `Presence`, `ScrollArea`, `Resizable`, `Splitter`, `Toggle`, `ToggleGroup`, `ThemeProvider`, `DirectionProvider`, `Slot`

### Hooks
`useDisclosure`, `useMediaQuery`, `useBreakpoint`, `useTheme`, `useControllableState`, `useId`, `usePrevious`, `useDebouncedValue`, `useThrottledCallback`, `useInterval`, `useTimeout`, `useHotkeys`, `useClipboard`, `useLocalStorage`, `useSessionStorage`, `useIsomorphicLayoutEffect`, `useIntersection`, `useResizeObserver`, `useMutationObserver`, `useFocusTrap`, `useFocusReturn`, `useReducedMotion`, `useDirection`

---

## Key reference documents (read these first)

- **`ARCHITECTURE.md`** — the seven laws, the styling pipeline, the standard component anatomy, the props-naming conventions, the perf budgets. Every phase defers to this.
- **`PROGRESS.md`** — central tracker. Status of every phase, decisions log, open questions, commit trail.

---

## Phase overview

Each phase is a standalone markdown document. Work through them in order. After each phase, update `PROGRESS.md` and write a changeset. **Do not start a phase until the previous one's exit criteria are met.**

| Phase | Document                                                      | Focus                                                             |
| ----- | ------------------------------------------------------------- | ----------------------------------------------------------------- |
| 00    | `PROGRESS.md`                                                 | Central tracker — updated after every commit                      |
| 01    | `phases/01-foundation.md`                                     | Monorepo, tooling, CI, publishing pipeline                       |
| 02    | `phases/02-design-tokens.md`                                  | DTCG tokens, Style Dictionary pipeline, CSS custom properties    |
| 03    | `phases/03-theming-system.md`                                 | ThemeProvider, theme switching, dark mode, custom themes         |
| 04    | `phases/04-core-utilities.md`                                 | Hooks, `Slot`, `Portal`, `VisuallyHidden`, `cn`, variant helpers |
| 05    | `phases/05-layout-primitives.md`                              | The 11 layout primitives (the only raw-HTML components)          |
| 06    | `phases/06-typography.md`                                     | Text, Heading, Code, Kbd, Link, Blockquote, List                 |
| 07    | `phases/07-forms-basic.md`                                    | Button, Input, Textarea, Checkbox, Radio, Switch, Label          |
| 08    | `phases/08-forms-advanced.md`                                 | Select, Combobox, DatePicker, Slider, File, Color, Pin, Tags     |
| 09    | `phases/09-overlays.md`                                       | Dialog, Drawer, Popover, Tooltip, Toast, Menu family             |
| 10    | `phases/10-navigation.md`                                     | Tabs, Breadcrumb, Pagination, NavigationMenu, Sidebar, Stepper   |
| 11    | `phases/11-data-display.md`                                   | Card, Table, DataTable, Tree, Timeline, Accordion, Progress      |
| 12    | `phases/12-feedback.md`                                       | Alert, Banner, Badge, Tag, Chip, Avatar, Skeleton, EmptyState    |
| 13    | `phases/13-form-composition.md`                               | `Form`, `FormField`, react-hook-form integration recipe          |
| 14    | `phases/14-testing-and-quality.md`                            | Hardening: a11y audit, visual regression, bundle-size budgets    |
| 15    | `phases/15-documentation-site.md`                             | Public docs site, usage recipes, design guidelines               |
| 16    | `phases/16-release.md`                                        | v1.0.0 release, npm publishing, adoption in Arshad's projects   |

---

## Working rules for Claude Code

When you (Claude Code) pick up a phase:

1. **Read the phase doc in full before writing a line of code.** Each phase has exit criteria — you are not done until all are checked.
2. **Read `PROGRESS.md`** to see where we are and what was last completed.
3. **Work inside the phase boundary.** Do not implement components that belong to a later phase. If you find a missing dependency in a completed phase, raise it as a note in `PROGRESS.md`, fix it minimally, and move on.
4. **Commit in small, atomic chunks.** Each commit should pass type-check, lint, and test. Prefix with the phase number: `feat(phase-05): add Stack primitive`.
5. **Write a changeset for every user-facing change.** `pnpm changeset` before committing. Use the package scope (`@lumen/react`, etc.) and pick the right bump level.
6. **After every commit, append to `PROGRESS.md`** under "Change log" — one line per commit with the commit hash, scope, and a one-sentence summary. This is the audit trail.
7. **When a phase is complete**, check all exit criteria, update the phase status table at the top of `PROGRESS.md`, and move on.
8. **If something is ambiguous**, err toward the simplest thing that satisfies the principle. Document the decision in `PROGRESS.md` under "Decisions".
9. **Never skip tests.** Every new component gets stories + a play function + at least one a11y story. Hooks get Vitest unit tests.
10. **Never ship dead code.** If a file isn't imported by something that ends up in a published entry point, it shouldn't exist.

---

## Getting started

1. Read this README.
2. Read `PROGRESS.md` for current state.
3. Open the next unblocked phase doc.
4. Build. Test. Document. Commit. Changeset. Update progress.
5. Repeat.
