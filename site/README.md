# The documentation site

The site at https://cynosure.arshadshah.com, and a template for the documentation of any other product. It is built entirely from Cynosure components, and it is data-driven: you write Markdown and the site works out the pages, the navigation, the version, the changelog and search from the repository. There is no framework underneath, only Vite and a small engine in `engine/`.

## Everyday tasks

| To do this                | Do this                                                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add a guide               | Add a `.md` file to `docs/`. Its first heading is the page title and its first paragraph the lead. It appears in the navigation on the next build                                                 |
| Group guides              | Put them in a folder inside `docs/`. The folder's name becomes a section in the navigation                                                                                                        |
| Order the guides          | List their file names in `order` in `docs.config.ts`. Unlisted ones follow, A to Z                                                                                                                |
| Rename a navigation entry | Add it to `labels` in `docs.config.ts`. By default the entry is the file name ("code-editors" is "Code editors")                                                                                  |
| Keep a file off the site  | Add its name to `exclude` in `docs.config.ts`. Table rows and list items that only point at it are dropped from other pages too                                                                   |
| Link between pages        | Write a normal relative link to the other file (`./theming.md`, `../src/components/Button/README.md`). The site turns it into a link to that file's page; a file with no page is linked on GitHub |
| Add a callout             | Write a GitHub alert: a quote starting `> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` or `[!CAUTION]`                                                                                        |
| Show a key                | Write `<kbd>Enter</kbd>`                                                                                                                                                                          |
| Document a component      | Nothing to do here: every folder in `src/components` and `src/foundations` with a docs page (`<Name>.mdx`) or a README gets a page                                                                |
| Show a live example       | In the component's docs page, write `<Canvas of={Stories.Name} />`. Canvases on neighbouring lines become one canvas with tabs                                                                    |
| Record a release          | Nothing to do here: the changelog page is `CHANGELOG.md`, which Changesets writes                                                                                                                 |
| Change the version shown  | Nothing to do here: it is the installed version of the package (see "Following a release")                                                                                                        |
| Correct some wording      | Edit the source file (the footer's "Edit this page" leads to it). Nothing is copied into `site/`                                                                                                  |

## Commands

Run from the repository root.

| Command                                            | What it does                                                                                                                                                                                 |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm --filter @arshad-shah/cynosure-site dev`     | The site at http://localhost:5173, reloading as you edit Markdown or the engine                                                                                                              |
| `pnpm build:site`                                  | The site into `site/dist`, then Storybook into `site/dist/storybook` (what Cloudflare Pages runs)                                                                                            |
| `pnpm --filter @arshad-shah/cynosure-site build`   | The site alone                                                                                                                                                                               |
| `pnpm --filter @arshad-shah/cynosure-site preview` | Serves the built site at http://localhost:4321                                                                                                                                               |
| `pnpm --filter @arshad-shah/cynosure-site check`   | Types                                                                                                                                                                                        |
| `pnpm --filter @arshad-shah/cynosure-site links`   | Every internal link and heading anchor in the built site resolves                                                                                                                            |
| `pnpm --filter @arshad-shah/cynosure-site sweep`   | Opens every built page in a browser at 1440 and 390 points; fails on a console error, sideways scrolling, a second scrollbar or an example that opens over the page. Needs `preview` running |

Before pushing: `check`, `build:site`, `links`, `sweep`, and `pnpm lint`.

## Following a release

The site installs Cynosure from npm, so it shows what users get. After a release:

1. Raise `@arshad-shah/cynosure` in `site/package.json` and run `pnpm install`.
2. Build. The header badge, the home page, the props tables and the changelog now show the new version.
3. Delete any stand-in the release made unnecessary (search `site/` for "Until Cynosure").

Live examples are the exception: they run the library's source at the commit being built, so they can be ahead of the published package. Each component page says which commit and which version.

## How it works

```
docs/*.md, README.md, CHANGELOG.md, src/**/<Name>.mdx
        |
        v
engine/build/scan.ts      reads the repository: pages, navigation, props, examples, search
        |
        v
engine/build/plugin.ts    hands that to the app as modules (one small file per page)
        |
        v
engine/app/               renders it with Cynosure: Shell, Page, Markdown, Canvas
        |
        v
engine/build/build.ts     writes every page as HTML into dist/, plus 404.html and sitemap.xml
```

- **Pages are data.** `scan.ts` produces a `PageData` for each page (`engine/types.ts`): its title, lead, body as a parsed Markdown tree, headings, and for a component its props and examples. The app never reads files.
- **Markdown is drawn with Cynosure.** `Markdown.tsx` maps the tree to components: text in Prose, code in CodeBlock (coloured at build time by Shiki, in Cynosure's syntax colours), tables in Table, links as Link, callouts as Notice, keys as Kbd.
- **Component pages** come from the hand-written docs page (`<Name>.mdx`, also Storybook's Docs tab), or the README when there is none. `<Canvas>` becomes a live canvas and `<ArgTypes>` the props table, which is generated from the published type declarations.
- **The canvas** (`Canvas.tsx`) renders the component's own stories from the library's source. The code under an example is written from what the example renders (`jsx.ts`), so it reads as usage, not as test scaffolding. An example that opens over the page (a dialog) waits behind a button.
- **Navigation** between pages swaps the content without a reload (`router.tsx`); every page is also a real HTML file, so links, search engines and a visitor without JavaScript get the content.
- **Search** is Cynosure's CommandPalette (Ctrl or Command+K) over every page and heading.

## Making it another product's site

Copy `site/` into the product's repository, then:

1. **`docs.config.ts`:** the name, tagline, description, npm package, repository and site address. Point `docs` at the folder of guides. Remove `components` if the product has none.
2. **`theme.css`:** the product's fonts and token overrides (an accent colour restyles everything).
3. **`package.json`:** the package name, and the product's own package in `dependencies` if its version should be shown.
4. **The repository's `pnpm-workspace.yaml`:** add `site` to `packages`.

Nothing in `engine/` names Cynosure-the-product; it only uses Cynosure-the-library. Do not edit `engine/` per product: a need the engine cannot meet is a change to the template, made here first.

## Rules

See `AGENTS.md` in this folder. In short: only Cynosure components for interface, every colour and size a token, content never copied, and a gap in Cynosure is fixed in Cynosure.
