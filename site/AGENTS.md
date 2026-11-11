# site/

The documentation site at https://cynosure.arshadshah.com, and the template every other product's documentation is made from. Read `README.md` in this folder first: it says how the site is managed and how it works. The plan and the remaining work are in issue #152.

- **No framework.** Vite, React and the engine in `engine/`. `engine/build` runs in Node at build time (reads the repository, writes HTML); `engine/app` is the React app. Astro is gone; do not bring a site framework back.
- **Data-driven.** The app renders `PageData` (`engine/types.ts`) and never reads files; `engine/build/scan.ts` is the only place that knows where content lives. A new kind of page is a new `kind` with data, not a hand-written route.
- **Nothing product-specific in `engine/`.** What differs per product lives in `docs.config.ts` (settings) and `theme.css` (fonts and tokens). If a change only makes sense for Cynosure, it belongs in one of those two files.
- **One commit, one version.** The site uses the library beside it (`workspace:*`, built by `pnpm build:site`), so its pages, examples, props, styles and version always come from the same commit. What is live is decided by the release, not by the dependency: https://cynosure.arshadshah.com is built from the `docs-live` branch, which `tools/publish.sh` moves to the published commit. Builds of `main` and of pull requests are previews and say "Unreleased" while a changeset is pending. Never pin the site to an npm version of Cynosure, and never push to `docs-live` by hand. (In another product's repository the template installs Cynosure from npm as any app does.)
- **Only Cynosure for interface.** No other UI library, no hand-made buttons, links, inputs or menus, no glyphs or emoji as icons (Facet icons and brand marks only). Headings, paragraphs and lists inside Prose are plain elements; everything interactive is a Cynosure component. Something awkward to build here is a gap in Cynosure: fix it there, with a story and a test, and use it in the same pull request. No stand-ins.
- **Every colour and size is a token** (`--cy-*`). `engine/app/site.css` holds page layout only; column widths may be in `rem` or `ch`. Cynosure components reset their own margins, so space around one goes on a wrapper (`.docs-block`), never on the component's class.
- **Content is not copied.** Pages come from `docs/*.md`, the root README, `CHANGELOG.md` and each component's docs page; a correction is made in the source file.
- **The site is public.** Notes for people working on Cynosure or its products (plans, progress, migration, conventions) stay in the repository: list them in `exclude`.
- **Navigation lists only pages that exist:** it is built from the scanned pages, never typed.
- **Examples** are the stories a docs page shows in `<Canvas>`. Their code is written from what they render (`engine/app/jsx.ts`); never print a story's source, which is test scaffolding.
- **Node runs the build's TypeScript directly:** files in `engine/build` import each other with the `.ts` extension and use only erasable syntax (no enums, no parameter properties).

## Checks before every push

`pnpm --filter @arshad-shah/cynosure-site check`, `pnpm build:site`, `... links`, `... sweep` (with `... preview` running), `pnpm lint`. Then look at it in a real browser: desktop and a 390-point phone, light and dark, console clean, no sideways scrolling.
