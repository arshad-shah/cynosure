---
"@arshad-shah/cynosure": patch
---

Theming: `themeToCss(theme, ":host")` writes `:host([data-cy-mode="dark"])`, which matches (`:host[…]` never did), and a custom selector without a contrast attribute follows the OS contrast setting as the default one does. Theme values with an unclosed quote or bracket, `url(`, `image(`, `image-set(` or `@` are rejected, so a plugin theme cannot break the stylesheet or fetch a URL. `hsl()` reads negative hues, hue units (`deg`, `grad`, `rad`, `turn`) and modern syntax without `%`, and an unknown unit is an error instead of another colour. `iconToSvg` escapes every attribute. `cy check` also catches native elements created with `createElement` or `jsx`, through a constant tag name, and `title` in spread props.
