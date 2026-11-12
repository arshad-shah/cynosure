---
"@arshad-shah/cynosure": minor
---

TextField: new `addonStart` prop (controls inside the start of the field, before the input) and `--cy-text-field-numeric` token (the typed text's `font-variant-numeric`). With `type="search"` TextField hides the browser's own search decorations itself. DateField, NumberField and TimeField set `--cy-text-field-numeric: tabular-nums` instead of restyling the input, and SearchField no longer has a stylesheet of its own: `dist/styles/search-field.css` is gone (its rule is in `text-field.css`). ColorField is now a TextField with the swatch button in `addonStart`, and draws its hue and opacity strips through Slider's `trackContent` instead of restyling the slider; it looks and behaves as before.
