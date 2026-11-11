# site/

The documentation site at https://cynosure.arshadshah.com: Astro (static output) with Cynosure's React components as islands. The plan and the rest of the work are in issue #152.

- **Cynosure from npm.** `@arshad-shah/cynosure` is a normal dependency on the published version, never a link to `../src`: the site shows what users get. To use a change, release it first. (`minimumReleaseAgeExclude` in `pnpm-workspace.yaml` lets our own packages install the day they publish.)
- **Only Cynosure for interface.** No other UI library, no hand-made buttons, inputs or menus, no glyphs or emoji as icons (Facet icons and brand marks only). Something awkward to build here is a gap in Cynosure: fix it there, with a story and a test, then use it.
- **Every colour and size is a token** (`--cy-*`). `src/site.css` holds page layout only.
- **Content is not copied.** Pages come from the component READMEs, docs pages and `docs/*.md`; a correction is made in the source file.
- **Navigation lists only pages that exist** (`src/site.ts`).
- **Build:** `pnpm build:site` at the root builds the site into `site/dist`, then Storybook into `site/dist/storybook`. Cloudflare Pages runs it for `main` and for every branch preview; CI runs it in the `site` job. Types: `pnpm --filter @arshad-shah/cynosure-site check`.
- **Local:** `pnpm --filter @arshad-shah/cynosure-site dev`.
