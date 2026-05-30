---
'@arshad-shah/cynosure-react': patch
---

**Fix duplicated component CSS when importing from the package barrel.** The
per-component CSS auto-link added in the last release was also being prepended
to the root barrel (`dist/index.js`), so `import … from '@arshad-shah/cynosure-react'`
silently injected `core.css` + `index.css` — the entire component stylesheet.
For the documented setup (barrel import **plus** a manual
`@arshad-shah/cynosure-react/all.css` or `/styles.css`, which is required
anyway since design tokens ship in a separate package), every rule loaded
twice. Worse, the re-injected `core.css` landed *after* the component-specific
rules from the manual stylesheet, so equal-specificity shared rules
(`layoutPropsStyle`, typography base, focus ring) clobbered the component
overrides that should win — causing subtle visual regressions.

The root barrel is the monolithic-path entry and no longer auto-injects CSS;
consumers bring the stylesheet themselves (as the docs already instruct).
Per-component subpath imports (`@arshad-shah/cynosure-react/button`) and
category barrels (`/forms`, `/overlay`, …) still wire up their CSS
automatically. The now-orphaned `dist/index.css` is no longer emitted.
