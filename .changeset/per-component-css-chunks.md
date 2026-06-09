---
'@arshad-shah/cynosure-react': patch
---

Slim per-component CSS for subpath imports. Previously every subpath import
(`@arshad-shah/cynosure-react/badge`) pulled the entire shared `core.css`
baseline (~20 kB brotli), even though a single component used only ~40% of it
— the rest was rules shared by *other* components (e.g. the Select/Combobox
listbox or DatePicker/DateRangePicker calendar styles).

Shared rules are now split into per-owner-set chunks under `dist/shared/`, and
each component imports only the chunks it actually shares. `core.css` is now
just the universal scaffolding (`@property` layout-var declarations + body
reset, ~0.7 kB brotli). A single-component CSS payload drops from ~20 kB to
~1.5–3 kB brotli (6–10× smaller); importing several components still dedupes to
one copy of each shared chunk.

No API or markup change. The monolithic `styles.css` / `all.css` single-import
paths are byte-identical, and category-barrel imports (`…/forms`) load the same
total CSS as before. Empty per-component stylesheets (whose rules were entirely
shared) are no longer emitted or imported.
