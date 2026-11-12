---
"@arshad-shah/cynosure": minor
---

Every component now says which stylesheets it needs. `@arshad-shah/cynosure/styles/manifest.json` maps each component to its files, base first, worked out from the source imports at build time (Inline → `stack.css`, Sheet → `dialog.css`, Accordion → `disclosure.css`, IconButton → `tooltip.css`, Button → `loading-dots.css`). The Vite and Astro adapters take `styles: "imports"` to add exactly those stylesheets for the components each module imports. `.cy-visually-hidden` moved from `link.css` to `base.css`, so Steps, Tabs, Calendar, Stat and the others no longer need `link.css`. ColorField now lists `text-field.css` and TagInput `combobox.css`, whose classes they use.
