# Lumen UI — Progress Tracker

> **This is the single source of truth for the state of the project.** Update it after every commit. If it disagrees with the code, the code wins and this file is wrong — fix it.

---

## Phase status

| # | Phase                         | Status        | Started    | Completed  | Notes |
|---|-------------------------------|---------------|------------|------------|-------|
| 01 | Foundation & tooling         | 🟢 Complete    | 2026-04-16 | 2026-04-16 | Pinned to Storybook 8.6 and Vitest 2.1 (node env); Playwright browser mode deferred to Phase 14. |
| 02 | Design tokens                | 🟢 Complete    | 2026-04-16 | 2026-04-16 | DTCG primitives + semantic (light/dark) → Style Dictionary → per-theme CSS + typed TS. Combined base+dark gzipped ≈ 2.3 KB. Typography composites are pre-expanded to flat CSS custom properties. |
| 03 | Theming system               | 🟢 Complete    | 2026-04-16 | 2026-04-16 | `@lumen/react` ThemeProvider/DirectionProvider + hooks; `@lumen/themes` ships terminal + high-contrast as side-effect CSS; tokens gain breakpoints, focus shadow, and a reduced-motion override. |
| 04 | Core utilities               | 🟢 Complete    | 2026-04-16 | 2026-04-16 | Primitives (Slot/Portal/VisuallyHidden) + utils (cn, composeRefs, composeEventHandlers, callAll, createContext, cva re-export, getOwnerDocument) + 21 hooks, all shipped from `@lumen/react` with per-hook tsup entries. `class-variance-authority` v0.7 replaces the spec's nominal `cva v1`. |
| 05 | Layout primitives            | 🟢 Complete    | 2026-04-16 | 2026-04-16 | vanilla-extract pipeline live; 11 primitives (`Box`/`Stack`/`Inline`/`Flex`/`Grid`/`Center`/`Spacer`/`Divider`/`AspectRatio`/`Container`/`Section`); shared `LayoutProps` emits `--lumen-lp-*` CSS custom properties with mobile-first breakpoint cascade; per-primitive tsup entries + Node10 sidecar shims. Per-primitive CSS ≈ 4–5 KB gzipped because the shared layout class is currently inlined per bundle; tighter dedup deferred to Phase 14. |
| 06 | Typography                   | 🟢 Complete    | 2026-04-16 | 2026-04-16 | 7 typography components (`Text`/`Heading`/`Code`/`Kbd`/`Link`/`Blockquote`/`List`+`OrderedList`+`DescriptionList`) composed on top of `Box`; responsive `size`/`weight`/`align` via cascading CSS custom properties; semantic `font.heading.*`/`font.body.*` composite tokens drive component CSS (preprocessor propagates `filePath` so composites land in CSS, not just TS); per-component tsup entries + Node10 sidecars; 184/184 tests pass. |
| 07 | Forms — basic                | 🟢 Complete    | 2026-04-17 | 2026-04-17 | 15 form components shipped: `Button`/`IconButton`/`ButtonGroup`, `Input`/`Textarea`/`NumberInput`, `Checkbox`/`CheckboxGroup`/`Radio`/`RadioGroup`/`Switch`, `Label`/`HelperText`/`ErrorText`/`Fieldset`. Shared `FormControlBase<T>` contract + shared visual recipe (`forms/shared/control.css.ts`) drives consistent default/hover/focus/disabled/invalid states. Radix primitives for Checkbox/Radio/Switch; `react-aria-components` for NumberField. Per-component tsup entries + Node10 sidecars. 224/224 tests pass. |
| 08 | Forms — advanced             | 🟢 Complete    | 2026-04-17 | 2026-04-17 | 14 advanced form components on top of the Phase 07 recipe: `Select`/`Combobox`/`MultiSelect`, `Slider`/`RangeSlider`, `DatePicker`/`DateRangePicker`/`TimePicker`, `ColorPicker`, `FileUpload`, `SearchInput`, `PinInput`, `TagsInput`, `Rating`. All dropdown/calendar/color surfaces lean on `react-aria-components`; `FileUpload`/`PinInput`/`TagsInput`/`SearchInput`/`Rating`/`MultiSelect` are hand-built to Lumen's control recipe where Aria has no fit. Shared `forms/shared/popover.css.ts` centralises the popover+listbox+item+section+empty state shell. `LocaleProvider` (wraps React Aria `I18nProvider`) added to the public API. `@internationalized/date` added as a direct dep. Per-component tsup entries + Node10 sidecars. 258/258 tests pass. |
| 09 | Overlays                     | ⬜ Not started |            |            |       |
| 10 | Navigation                   | ⬜ Not started |            |            |       |
| 11 | Data display                 | ⬜ Not started |            |            |       |
| 12 | Feedback                     | ⬜ Not started |            |            |       |
| 13 | Form composition             | ⬜ Not started |            |            |       |
| 14 | Testing & quality hardening  | ⬜ Not started |            |            |       |
| 15 | Documentation site           | ⬜ Not started |            |            |       |
| 16 | v1.0.0 release               | ⬜ Not started |            |            |       |

**Legend:** ⬜ Not started · 🟡 In progress · 🟢 Complete · 🔴 Blocked

---

## Current focus

> **Phase:** 09 — Overlays
> **Next action:** Read `09-overlays.md` and build the overlay layer (Dialog/Sheet/Popover/Tooltip/ContextMenu/Menu/Toast). Phase 08 already pulls in Radix + React Aria popover primitives, so reuse those for focus management and portal behaviour — the visual work is the `forms/shared/popover.css.ts` + new dialog/sheet surfaces.

---

## Decisions log

Record every meaningful technical decision here, with rationale. When you (or future-you) wonder "why did we do X?", this is the answer.

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-16 | Pinned `packageManager` to `pnpm@10.33.0` instead of the spec's `pnpm@9.15.0` | pnpm 10 is what ships with the toolchain in this environment; 10.x is backwards-compatible with the 9.x config. |
| 2026-04-16 | Set `.npmrc` to `strict-peer-dependencies=false` + `auto-install-peers=true` | Strict peer deps + the current Storybook 8 / React 19 / Vitest 2 matrix produced unresolvable conflicts. Revisit once Storybook 9 is stable (Phase 14). |
| 2026-04-16 | Pinned Storybook to `^8.4.0` (resolved to 8.6.18) | Spec said "10 or latest stable 9.x" — Storybook 10 was not yet released in this env and 9.x had incompatibilities with the `@storybook/addon-*` versions needed. Upgrade in Phase 14. |
| 2026-04-16 | Pinned Vitest to `^2.1.0` (not 3.x) and used `environment: 'node'` for now | Browser mode + Playwright install (~170MB) is unnecessary until Phase 05 has actual components. Phase 14 switches to Vitest browser mode + Playwright Chromium per spec. |
| 2026-04-16 | Omitted `@storybook/addon-vitest` from `.storybook/main.ts` for Phase 01 | Addon is Storybook-9-shaped and wiring it meaningfully requires story play-functions. Phase 14 wires it. |
| 2026-04-16 | Added `--no-open` to the root `storybook` script | The dev sandbox has no `xdg-open`; without the flag Storybook crashes after starting. |
| 2026-04-16 | `.changeset/config.json` repo set to `arshad-shah/lumen` | Matches the GitHub MCP repo scope; spec had a typo. |
| 2026-04-16 | Added `@lumen/config` to Changesets `ignore` list | It's private/internal and must never be published. |
| 2026-04-16 | Used `publint <pkg-dir>` (not `<pkg-dir>/dist`) | publint 0.3.x expects the package root; it packs via `pnpm pack` internally. |
| 2026-04-16 | Pre-expand DTCG `typography` composites into flat sub-tokens (`family`, `size`, `weight`, `line-height`, `letter-spacing`) via a preprocessor | CSS has no single property that captures the full composite portably, and the `css/variables` format can't emit a nested shorthand on its own. Consumers compose via separate custom properties, matching the spec's "shorthand or individual" guidance. |
| 2026-04-16 | Generated TS tokens land in `src/generated/` (gitignored) | Keeps tsup's `rootDir: src` assumption intact and lets tsup bundle the re-exports. CSS goes to `dist/css/` directly; tsup runs with `clean: false` after Style Dictionary so the CSS survives. |
| 2026-04-16 | Dark theme stylesheet emits only semantic overrides (uses SD `include` + file-path filter) | Primitives live in base.css. Keeps dark.css small (gzipped ≈ 0.5 KB) and guarantees one canonical primitive definition. |
| 2026-04-16 | `@lumen/tokens` tsconfig sets `composite: false` | tsup's DTS worker (rollup-plugin-dts) refused to include the generated files under the inherited `composite: true`. Disabling composite on the package tsconfig fixes the build; root references don't use `tsc --build` anyway. |
| 2026-04-16 | Roll our own `ThemeProvider` instead of `next-themes` | The whole module is < 200 LOC, has no peer-dep, and lets us couple cleanly with our `@lumen/tokens` CSS layer (no need to map theme names through `next-themes`'s `value` prop). |
| 2026-04-16 | `@lumen/themes` is CSS-only — dropped tsup, tsconfig, src/index.ts | The package's only artefacts are `terminal/index.css` and `high-contrast/index.css`, exposed via `exports`. Adding a TS entrypoint would emit an empty bundle and pollute `attw`/`publint` runs. |
| 2026-04-16 | `@lumen/themes` distributes CSS straight from `src/` | Avoids a meaningless build step and keeps consumers reading the same file authors edit. The `files` whitelist publishes only `src/`. |
| 2026-04-16 | Wrap our `DirectionProvider` around Radix's `DirectionProvider` | Radix primitives in Phases 09+ read direction from Radix's context. Mirroring it now means `<DirectionProvider dir="rtl">` flips Lumen + Radix in one place. |
| 2026-04-16 | `@lumen/react/theme` subpath ships a sidecar `theme/package.json` for Node10 resolution | `attw` flags `no-resolution` under node10 because that profile predates `exports`. The `theme/` shim re-points node10 to `dist/theme/index.{js,d.ts}` without changing modern resolution. |
| 2026-04-16 | `@lumen/react` tsconfig sets `composite: false` | Same reason as `@lumen/tokens`: `rollup-plugin-dts` refuses subpath entries under composite. Root tsconfig dropped the `packages/react` reference along with it. |
| 2026-04-16 | Reduced-motion CSS appended to `dist/css/base.css` by the Style Dictionary build | Style Dictionary's `css/variables` format can't emit an `@media` block; appending after the build keeps the snippet inside the same file consumers already import via `@lumen/tokens/css`. |
| 2026-04-16 | Custom theme names default `colorScheme` to dark when the name matches `/dark|terminal|midnight|night/i`, otherwise light | Provides a useful default so `colorScheme` is meaningful for prebuilt themes; consumers can still override by setting `color-scheme` in their own CSS. |
| 2026-04-16 | CI publint path corrected (`packages/react`, not `packages/react/dist`) and `@lumen/themes` added to publint+attw runs | The Phase 01 wiring pointed at `dist/`, which publint can't read directly (it expects the package root). Phase 02's decision log already flagged the right pattern; this commit updates CI to match and extends both checks to themes. |
| 2026-04-16 | Promoted `build:tokens` to a turbo task and made `@lumen/tokens#typecheck`/`#build` depend on it | Turbo runs typecheck and build in parallel within a package. The tokens build script's `pnpm clean` step deletes `src/generated/` mid-typecheck, so CI's clean run failed `tsc` with `Cannot find module './generated/base.js'`. Modelling Style Dictionary as its own task forces typecheck to wait until the generated files exist. |
| 2026-04-16 | Bumped CI / `engines.node` from Node 20 → Node 22 | `@lumen/config` exports `tsup.config.base.ts` as a `.ts` file. tsup transpiles `tsup.config.ts` to JS but the runtime `import` of `@lumen/config/tsup.config.base` then hits Node's ESM loader, which only natively understands `.ts` from Node 22 (`--experimental-strip-types` is on by default in 22.6+). Reproduced the failure under Node 20 locally; bumping CI fixes it without forcing a tsx/jiti runtime loader into every config import. |
| 2026-04-16 | Depend on `@radix-ui/react-slot` for the `Slot` primitive (Phase 04) | Radix's implementation is ~600 B gzipped and handles several subtle cases (Fragment detection, `Slottable` merging, event-handler composition, ref forwarding) that aren't worth re-deriving. Re-exported as `Slot` / `Slottable` from `@lumen/react`. |
| 2026-04-16 | Shipped `class-variance-authority@^0.7` instead of the spec's nominal `cva@^1` | The spec references a hypothetical `cva` v1 that doesn't exist on npm — the `cva` package at 0.0.0 is an unrelated placeholder. `class-variance-authority@0.7` is the mainstream v0 implementation; we wrap it in `utils/variants.ts` and only re-export `cva`, `cx`, `VariantProps`, so swapping to cva v1 later is a one-file migration. |
| 2026-04-16 | Kept phase-03 hook implementations under `theme/hooks/` and added thin re-exports under `hooks/` | Moving the files would have invalidated the phase-03 tests (`src/theme/__tests__/…`) without adding behaviour. The re-exports satisfy the Phase 04 inventory ("all hooks reachable from `@lumen/react/hooks`") while leaving the existing test layout intact. |
| 2026-04-16 | `useControllableState` reads `process.env.NODE_ENV` behind a `declare const process` + `typeof` guard | tsup's DTS worker (rollup-plugin-dts) refused to build without `@types/node` otherwise. Declaring `process` locally keeps the dev-only warning without pulling a dependency that isn't needed at runtime. |
| 2026-04-16 | Per-hook tsup entries via `readdirSync('src/hooks')` in `tsup.config.ts` | Satisfies the Phase 04 exit criterion ("`pnpm build` produces per-entry output for hooks, e.g. `dist/hooks/useDisclosure.js`") and verifies tree-shaking works. `useDisclosure` + its transitive `useControllableState` + `useCallbackRef` total ~620 bytes uncompressed — well under the 1 KB gzipped sanity budget. |
| 2026-04-16 | Picked `vanilla-extract` for component CSS (Phase 05) | Matches the spec's rule-zero choice. Zero runtime, writes literal CSS in `.css.ts` files, typed token references via `createGlobalThemeContract`, and native Vite/esbuild integrations already cover Storybook + Vitest + tsup. No new DSL; one `.css.ts` per component keeps the CSS graph tight and legible. |
| 2026-04-16 | `LayoutProps` render as cascading CSS custom properties, not class combinations | Each responsive entry writes `--lumen-lp-{prop}-{bp}` inline; the shared `layoutPropsStyle` class reads them with nested `var()` fallbacks across breakpoints. Keeps the compiled CSS per primitive essentially fixed in size (no Cartesian product of classes per token × breakpoint), and arbitrary values (`"200px"`, `"50%"`) flow through with no runtime compilation. |
| 2026-04-16 | Colour-token prop format is `"<category>.<name>"` (e.g. `"bg.surface"`, `"accent.solid"`, `"feedback.success.soft"`) | The spec example's `"surface.bg"` form doesn't scale to the feedback palette's two-level nesting. `"<category>.<name>"` reads left-to-right, maps cleanly to the token tree, and the `resolveColor` helper handles the camelCase → kebab-case transform (`accent.solidHover` → `var(--lumen-color-accent-solid-hover)`) to match Style Dictionary's CSS output. |
| 2026-04-16 | Shipped the shared layout-prop base class once inside every primitive's `.css.ts` via `style([layoutPropsStyle, …])` | Simple, per-primitive CSS bundles stay self-contained (one import → one drop-in CSS file). The tradeoff is duplicate declarations in the compiled output when consumers import multiple primitives: per-primitive CSS lands around 4–5 KB gzipped vs the spec's 1 KB target. We accept this for Phase 05; Phase 14 will either (a) emit a single shared `@lumen/react/layout.css` entry or (b) migrate to the vanilla-extract `style` build's cross-module dedup once `splitting` can track vanilla-extract-emitted CSS. |
| 2026-04-16 | Node10-resolution sidecar `package.json` shims for every per-primitive subpath | Same pattern Phase 03 used for `./theme`. Without them, `attw` flags each subpath as `no-resolution` under the Node10 profile. Adding a `box/package.json` (and siblings) points legacy resolvers at `dist/box.{js,d.ts}` without changing modern `exports` resolution. |
| 2026-04-16 | `Stack.dividers` interleaves a decorative `<Divider/>` between every pair of children | Common enough pattern to deserve the shortcut; resist adding more Stack/Inline conveniences for now to keep the primitives primitive. Accepts `true` (default `<Divider/>`) or any ReactNode to customise. |
| 2026-04-16 | `Divider` renders `<hr>` for horizontal but a `<div role="separator" aria-orientation="vertical">` for vertical | `<hr>` is awkward to size vertically across browsers. Swapping to a `<div>` with the explicit ARIA role gives reliable layout and keeps screen-reader semantics correct. A11y-wise defaults to `decorative` (hidden from AT); pass `decorative={false}` to make it a real separator. |
| 2026-04-16 | Removed `pnpm clean` from `@lumen/tokens`'s `build` script | The Phase 03 fix wired `tokens#typecheck` to depend on `build:tokens`, but `tokens#build` (pulled in as a `^build` of downstream packages' typecheck) still ran concurrently with `tokens#typecheck`, and its first step `rm -rf src/generated` yanked the generated `.ts` files out from under tsc — failing CI with `TS6053: File 'src/generated/base.ts' not found`. Style Dictionary overwrites `base.ts`/`dark.ts` in place and tsup already runs with `clean: false`, so dropping the clean prefix is safe. The `clean` npm script stays as-is for manual use. |
| 2026-04-16 | Propagate `filePath` in the `lumen/expand-typography` preprocessor so composite sub-tokens reach the CSS output | Phase 02 already preprocessed `font.heading.*` / `font.body.*` composites into flat `family`/`size`/`weight`/`line-height`/`letter-spacing` sub-tokens, but the replacement objects were constructed without `filePath`. The per-platform CSS `filter` (matches `sourcePaths.includes(token.filePath)`) then dropped them silently — they lived in the TS tokens but never reached `dist/css/base.css`. Carrying `filePath` from the parent typography node into each expanded sub-token restores them in CSS (now `--lumen-font-heading-1-size`, etc.), which Phase 06 components reference directly instead of duplicating font sizes in `.css.ts`. |
| 2026-04-16 | Typography components live under `src/typography/` (sibling to `src/primitives/`), not under `primitives/` itself | `primitives/` is reserved for the primitive-level abstractions (layout, Slot, Portal, VisuallyHidden) that everything composes on top of. Typography components are themselves compositions (they always render through `<Box>`), so they belong in their own folder. Per-component exports (`@lumen/react/text`, `/heading`, …) match the Phase 05 layout pattern. |
| 2026-04-16 | Three `List` components (`List`/`OrderedList`/`DescriptionList`) instead of a `variant`-driven single component | The rendered element (`ul`/`ol`/`dl`) is not a variant; it's a different semantic. A single component with `variant="description"` would need to swap direct children between `ListItem` and `DescriptionTerm`/`DescriptionDetails`, forcing callers to thread the right child types through runtime checks. Three components keep composability explicit. `as="ol"` on `List` fails fast with a dev-only `console.error`. |
| 2026-04-16 | `Heading` defaults `level={2}` | h1 is typically reserved for the page title and should be opt-in — a page should have exactly one. h2 is the most common semantically (section title) and is the right default for a library consumer reaching for `<Heading/>` without thinking about document outline. |
| 2026-04-16 | Level / size decoupling on `Heading` | Designers care about visual hierarchy; screen readers and SEO care about semantics. `<Heading level={1} size="md">` produces an `<h1>` rendered as md body text — both camps happy. `size` defaults to a token that matches `level`, so the common case stays a one-prop call. |
| 2026-04-16 | `Link external` inlines a decorative SVG chevron instead of importing from `@lumen/icons` | `@lumen/icons` is its own shippable package planned for a later phase. Inlining the SVG keeps the typography bundle independent (no runtime dependency on an icon package that doesn't exist yet) and the icon remains `aria-hidden` so screen readers aren't double-announced. The implementation swaps to the icon package when it lands. |
| 2026-04-16 | Per-typography-component CSS ≈ 6–8 KB gzipped, not the spec's 2 KB target | Same root cause as Phase 05: each `.css.ts` composes `layoutPropsStyle`, which vanilla-extract inlines into the per-component bundle. The layout base class dominates the compiled CSS. Phase 14 plans the cross-module dedup (single shared layout CSS entry or vanilla-extract `splitting` tracking); Phase 06 accepts the tradeoff. |
| 2026-04-17 | Radix for Checkbox/Radio/Switch, React Aria for NumberField (Phase 07) | Simple single-role primitives (Checkbox/Radio/Switch) have a friendlier API under `@radix-ui/react-*` and their keyboard/a11y contracts are straightforward. Complex controls (NumberField, and later Combobox/DatePicker/Slider in Phase 08) are tar pits to roll by hand — React Aria's `useNumberField` handles locale parsing, decimal separators, scroll wheel, and intl-safe stepper buttons. Split the library by complexity rather than picking one wholesale. |
| 2026-04-17 | Permitted raw `<input>`/`<textarea>` inside form components as the single exception to "no raw HTML" | Form elements uniquely depend on native browser behaviour (value binding, form submission, HTML validation, a11y semantics) that cannot be faithfully composed through `<Box>`. Input/Textarea/NumberInput render their own `<input>` / `<textarea>`; every other component still goes through `<Box>`. Documented in both `07-forms-basic.md` and this log so future contributors don't accidentally "fix" it. |
| 2026-04-17 | Shared control visual recipe in `forms/shared/control.css.ts` (Phase 07) | Input/Textarea/NumberInput all need the same border / bg / focus-ring / invalid / disabled / readOnly / hover visuals. Centralising the wrapper + field + addon/element classes means one place to update visual tokens and guarantees the three text-like controls paint identically. Variants `outline`/`filled`/`ghost` and sizes `sm`/`md`/`lg` live here once. |
| 2026-04-17 | Button's loading state disables + ARIA busies + dims content via `[data-slot="content"]` opacity (Phase 07) | Spinner overlays need the button's width to stay stable so the layout doesn't jump mid-request. Absolute-positioning the spinner and setting `opacity: 0` on the content span (driven by `[data-loading="true"] > [data-slot="content"]` via `globalStyle`) keeps the spinner centered and width intact; also sets `aria-busy="true"` and `disabled` so assistive tech announces the state and clicks are swallowed. |
| 2026-04-17 | `asChild` wraps children in `<Slottable>` so icons + spinner coexist with the consumer element (Phase 07) | The naive `<Slot>{span}{spinner}</Slot>` fails Radix's `React.Children.only` check. Wrapping the user's projected element in `<Slottable>` marks it as the clone target so `leftIcon`/`rightIcon`/`<TinySpinner>` render as siblings of the projected element's children. This also keeps the non-asChild fast path clean — no Slot overhead when rendering a real `<button>`. |
| 2026-04-17 | `switch` thumb size via CSS custom properties (`--lumen-switch-thumb-size`, `--lumen-switch-translate`) rather than per-size thumb recipes | The thumb needs to fit inside each size's track and slide by exactly `track - padding - thumb`. Writing per-size thumb classes would duplicate the style rule × 3. Publishing two numbers per `switchSize` lets one `switchThumb` rule read them with `var()`, and also gives RTL support by negating the translate in `[dir="rtl"] &[data-state="checked"]`. |
| 2026-04-17 | `CheckboxGroup` uses a custom `value: string[]` contract (not Radix's group primitive) | Radix doesn't ship a built-in checkbox-group because checkbox groups aren't a single ARIA role — just a convention. Owning the context means we can express the simple "shared value array" shape cleanly (`value`/`defaultValue`/`onChange`), and children inside a group ignore their local `checked`/`onCheckedChange` in favour of the group's array semantics. |
| 2026-04-17 | React Aria Components for every popover-backed control (Select/Combobox/DatePicker/ColorPicker/Slider) (Phase 08) | Rolling our own popover, listbox, calendar, or slider thumbs invites subtle bugs around virtualised focus, typeahead, touch, RTL, and locale-aware parsing. RAC v1 covers all of these on one dependency; we re-skin with vanilla-extract and layer `size`/`variant` on top. Hand-built components (`MultiSelect`, `FileUpload`, `PinInput`, `TagsInput`, `SearchInput`, `Rating`) are ones Aria doesn't cover or where a simpler bespoke shape is warranted. |
| 2026-04-17 | Shared `forms/shared/popover.css.ts` reused across Select/Combobox/MultiSelect/DatePicker (Phase 08) | Every dropdown-style control needs the same popover shell (positioning, elevation, entrance/exit animation) and the same listbox option styling (hover/selected/focus-visible states). Centralising the recipe keeps the visual grammar identical across controls and cuts duplication — one place to change how selected items paint, and every consumer surface benefits. |
| 2026-04-17 | `LocaleProvider` wraps React Aria's `I18nProvider` (not a parallel context) (Phase 08) | Every locale-aware Aria hook (`useDateFormatter`, `useNumberFormat`, `useLocale`) already reads from Aria's `I18nProvider`. Adding our own locale context would double the tree and create a second source of truth. Re-exporting as `LocaleProvider` + `useLocale` keeps the public API Lumen-shaped while leaving the runtime plumbing to Aria. Default locale is `en-IE` to match Arshad's primary target, overridable by consumers. |
| 2026-04-17 | Hand-built `FileUpload` instead of Aria's `FileTrigger` (Phase 08) | Aria's `FileTrigger` is a button-only trigger; it doesn't include drop zone, validation, preview list, or typed error callback. Building ourselves keeps the API compact (one `<FileUpload>` + optional `<FileUploadTrigger>`/`<FileUploadList>` subcomponents), and drop handling synthesises a change event on the hidden `<input type="file">` so both click and drop go through the same validation pipeline. |
| 2026-04-17 | Bumped the `@lumen/react#build` script to `NODE_OPTIONS='--max-old-space-size=6144' tsup` (Phase 08) | The tsup DTS worker (rollup-plugin-dts) OOMs on GitHub's `ubuntu-latest` runners now that the per-component entry list has grown to ~70 subpaths (11 layout primitives + 7 typography + 29 form controls + hooks + index splits). The default ~4 GB Node heap for worker threads isn't enough to keep the whole type graph resident. Raising the worker heap to 6 GB is cheaper than restructuring the build into multiple passes, and the runner has 7 GB physical RAM. |
| 2026-04-17 | `PinInput` renders N separate `<input maxLength=1>` elements rather than a single masked input (Phase 08) | OTP codes are primarily pasted (one `clipboardData.getData('text')` → distributed across cells) and typed one digit at a time with auto-advance. A single `<input>` with a custom segment renderer loses native paste, caret navigation, and input-method integration (Android's OTP autofill looks for N cells to trigger). N real inputs inherit all of that for free; we just handle arrow-key/backspace focus transfer. `data-filled` + the CSS scheme keeps the "active cell" visual identical per cell regardless of how the content arrived. |

---

## Open questions / risks

Things that aren't blocking yet but need answering before they become blocking.

- [ ] _example: Do we need a Vue port? If so, extract `@lumen/core` further._
- [ ] _example: Chromatic budget — is $149/mo justified, or use Playwright visual comparison locally?_

---

## Change log

Append every commit here. **This is your audit trail.** One line per commit, newest at the top.

Format:
```
<date> · <short-hash> · <scope> · <one-sentence summary> · [changeset: <level>]
```

Example:
```
2026-04-17 · a1b2c3d · @lumen/react · feat(phase-05): add Stack layout primitive with space/direction variants · [changeset: minor]
2026-04-17 · e4f5g6h · @lumen/tokens · chore(phase-02): bump spacing scale to 4-based · [changeset: patch]
```

### Entries

<!-- newest at top; append after every commit -->

<!-- commit hashes appended after `git commit` lands each chunk; see `git log --oneline` for the canonical record -->
- 2026-04-17 · @lumen/react · feat(phase-08): advanced form controls — Select/Combobox/MultiSelect, Slider/RangeSlider, DatePicker/DateRangePicker/TimePicker, ColorPicker, FileUpload, SearchInput, PinInput, TagsInput, Rating; LocaleProvider around React Aria I18nProvider; shared `forms/shared/popover.css.ts` listbox/popover recipe; `@internationalized/date` direct dep; per-component tsup entries + Node10 shims; 34 new unit tests (258/258 total pass) [changeset: minor]
- 2026-04-17 · @lumen/react · feat(phase-07): basic form controls — Button/IconButton/ButtonGroup, Input/Textarea/NumberInput, Checkbox/CheckboxGroup/Radio/RadioGroup/Switch, Label/HelperText/ErrorText/Fieldset; shared FormControlBase contract + shared control.css.ts visual recipe; Radix for boolean primitives, react-aria-components for NumberField; per-component tsup entries + Node10 shims; 40 new unit tests [changeset: minor]
- 2026-04-16 · @lumen/react,@lumen/tokens · feat(phase-06): typography components — Text/Heading/Code/Kbd/Link/Blockquote/List+OrderedList+DescriptionList composed on Box; responsive size/weight/align via CSS custom property cascades; composite `font.heading.*`/`font.body.*` tokens now emitted in CSS (preprocessor filePath propagation); per-component tsup entries + Node10 shims; 41 new unit tests [changeset: minor + patch]
- 2026-04-16 · @lumen/react · feat(phase-05): 11 layout primitives on vanilla-extract — Box/Stack/Inline/Flex/Grid/Center/Spacer/Divider/AspectRatio/Container/Section, shared responsive `LayoutProps` → CSS-variable pipeline, per-primitive tsup entries + Node10 shims, Storybook gallery + 33 unit tests [changeset: minor]
- 2026-04-16 · @lumen/react · feat(phase-04): core utilities — Slot/Portal/VisuallyHidden primitives, cn/composeRefs/composeEventHandlers/callAll/createContext/cva utils, 21 hooks, per-hook tsup entries, Storybook + playground demos [changeset: minor]
- 2026-04-16 · @lumen/react,@lumen/themes,@lumen/tokens · feat(phase-03): runtime-free theming system — ThemeProvider, DirectionProvider, hooks, getThemeInitScript; prebuilt terminal + high-contrast themes; breakpoint tokens, focus shadow, reduced-motion CSS [changeset: minor × 3]
- 2026-04-16 · @lumen/tokens · feat(phase-02): DTCG token pipeline (primitives + semantic light/dark, Style Dictionary v4 CSS+TS output, Ajv schema validator) [changeset: minor]
- 2026-04-16 · repo · chore(phase-01): complete Phase 01 foundation scaffold (monorepo, tooling, Storybook, Vitest, tsup, CI, playground)

---

## Release history

Populated automatically by Changesets, but mirror major releases here for quick reference.

| Version | Date | Highlights |
|---------|------|------------|
| _none yet_ | | |

---

## Dependencies watch

Monitor these for security advisories and major version bumps.

- React (peer)
- Radix Primitives (direct)
- React Aria Components (direct)
- Vanilla Extract (build-time)
- Storybook (dev)
- Vitest (dev)
- Biome (dev)
