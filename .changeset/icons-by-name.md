---
"@arshad-shah/cynosure": minor
---

Icons: a new entry, `@arshad-shah/cynosure/icons/by-name`, exports `iconByName(name)` and the `icons` record of every Facet icon by its name, for names that arrive as strings (plugin manifests). It brings every icon with it, so the main entry and `@arshad-shah/cynosure/icons` never import it and stay tree-shaken.
