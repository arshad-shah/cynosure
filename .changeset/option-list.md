---
"@arshad-shah/cynosure": minor
---

New `OptionList` (with `OptionListItem`, `OptionListNote` and `OptionListGroup`): the drop-down list of options under a field, which Select, Combobox and TagInput now all draw with, so their lists are one component instead of three copies. Restyle it with `--cy-option-list-{bg,shadow,max-height,max-width,active-bg}`; Select's `--cy-select-list-*` and `--cy-select-option-active-bg` and Combobox's `--cy-combobox-list-*` and `--cy-combobox-option-active-bg` keep working and set them. TagInput's suggestion list follows `--cy-option-list-*` (it used to read Combobox's tokens). The lists look as before; Select's list now also drops its fade under reduced motion and outlines the active option in forced-colors mode, as Combobox's did. The list classes changed (`cy-select-list`, `cy-select-option…`, `cy-combobox-list`, `cy-combobox-option…` are now `cy-option-list…`).
