# site/

The documentation site at https://cynosure.arshadshah.com: Astro (static output) with Cynosure's React components as islands. The plan and the rest of the work are in issue #152.

- **Cynosure from npm.** `@arshad-shah/cynosure` is a normal dependency on the published version, never a link to `../src`: the site shows what users get. To use a change, release it first. (`minimumReleaseAgeExclude` in `pnpm-workspace.yaml` lets our own packages install the day they publish.)
- **Only Cynosure for interface.** No other UI library, no hand-made buttons, inputs or menus, no glyphs or emoji as icons (Facet icons and brand marks only). Something awkward to build here is a gap in Cynosure: fix it there, with a story and a test, then use it.
- **Every colour and size is a token** (`--cy-*`). `src/site.css` holds page layout only.
- **Content is not copied.** Pages come from the component READMEs, docs pages and `docs/*.md`; a correction is made in the source file.
- **Navigation lists only pages that exist** (`src/site.ts`; the phone tab bar is `TABS`).
- **How content arrives:** `src/content.config.ts` reads the root `README.md` (Getting started), `CHANGELOG.md`, the guides in `docs/` (the list in `src/routes.ts`) and every component and foundation README. `src/remark-repo-links.mjs` rewrites their links: a document with a page links to that page (`routeOf` in `src/routes.ts`), anything else to the file on GitHub. The component catalogue's groups come from the root README's "Components" section.
- **Props tables** (`src/props.ts`) are generated at build time with the TypeScript compiler from the installed package's `dist/index.d.ts`: `<Name>Props`, only the props Cynosure declares (not inherited DOM attributes), required first, with each doc comment and its stated default. They render with Cynosure's Table, without sorting (no script on the page).
- **Code colours:** Markdown code is highlighted by Shiki's CSS-variables theme and coloured by Cynosure's `styles/syntax.css`, so it follows light, dark and contrast.
- **Build:** `pnpm build:site` at the root builds the site into `site/dist`, then Storybook into `site/dist/storybook`. Cloudflare Pages runs it for `main` and for every branch preview; CI runs it in the `site` job. Types: `pnpm --filter @arshad-shah/cynosure-site check`.
- **Local:** `pnpm --filter @arshad-shah/cynosure-site dev`.
