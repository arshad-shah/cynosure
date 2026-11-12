---
"@arshad-shah/cynosure": minor
---

New `@arshad-shah/cynosure/astro` adapter, an Astro integration that themes the page on the server: `cynosure({ theme })` adds the product theme as CSS on `:root` and Cynosure's stylesheet to every page, and the saved-mode script inline in `<head>` (`initScript`, default on); `htmlAttributes({ mode, contrast })` gives `<html>` its mode and contrast attributes. See `docs/adapters.md`.
