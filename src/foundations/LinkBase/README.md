# LinkBase (foundation)

The only module that renders a native `<a>`. Adds `rel="noopener noreferrer"` for `target="_blank"`. Only relative URLs and `http`, `https`, `mailto` and `tel` are linked (`safeHref` parses like a browser, so obfuscated script URLs are dropped).

No visual opinions: composites style it.

## Used by

Link, and any composite that navigates.
