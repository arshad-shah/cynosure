# src/icons (Facet icons)

One file per icon exporting typed `IconData`. Add icons only with `pnpm cy new icon <name> --from file.svg --category <category>`.

**Entries:** `facet.ts` lists every icon (one `export { name } from "./file.js"` each, written by the generator, no comments: the generator re-sorts it). `index.ts` (`@arshad-shah/cynosure/icons`) re-exports it with the helpers, so each icon stays its own import. `by-name.ts` (`@arshad-shah/cynosure/icons/by-name`) builds the `icons` record and `iconByName` from `facet.ts`; nothing else may import it, since it brings every icon along (`tests/unit/icons-by-name.test.ts`).

**Facet grammar:** 24×24 grid, stroke only (1.75 round caps and joins, set by CSS), softened-square geometry (rounded rects over circles where it reads well), stroke only: no fills and no accent dot (dots that belong to a glyph, like the "i" in info, are zero-length round-capped strokes such as `M12 7.75h.01`). Every icon has a `category` from `ICON_CATEGORIES`. Mark the moving part with `animate: true` and pick one shared `motion` (`tilt rotate flip draw lift drop spin pop nudge slide`).

**Optimized:** every icon is stored as small as it draws identically. `cy new icon` runs svgo's path-data pass (`tools/icon-optimize.ts`: shortest commands, numbers to 3 decimals, the real round-capped stroke so dots survive). `pnpm icons:optimize` does the same for every icon and writes a change only when the icon renders to the same pixels in Chromium at 16, 24 and 96px; `pnpm icons:optimize --check` (part of `pnpm verify`) fails while any icon could still be made smaller. Hand-edited path data goes through it too.

**Search words:** every icon has an entry in `keywords.ts` (`ICON_KEYWORDS`, keyed by the icon's name): what it is used for, what it shows and what other sets call it, in lower case. The documentation site's gallery searches them. They are kept out of the icon's own file so that importing an icon never ships its search words. A unit test fails when an icon has none, so add them with each new icon.

`validateIcon` (run by tests and the generator) rejects text, any fill, unknown categories, off-grid geometry and bad names. The gallery story `Foundations/Icon → Gallery` shows every icon.
