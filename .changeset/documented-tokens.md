---
"@arshad-shah/cynosure": patch
---

Six CSS variables the docs listed as tokens are now real theme tokens that `createTheme({ components })` can set: `textField.readonlyBg`, `textArea.readonlyBg`, `combobox.listMaxWidth`, `slider.length`, `colorField.pickerWidth` and `radioGroup.gap` (new `RadioGroupTokens`, exported). RadioGroup's documented `createTheme({ components: { radioGroup: { gap } } })` now type-checks. The CSS and its defaults are unchanged.
