---
"@arshad-shah/cynosure": minor
---

Field and every control built on it (TextField, Select, Combobox, TagInput, PathField, NumberField, DateField, TimeField, ColorField, TextArea, HotkeyField; the `FieldLayoutProps` type): `layout="split"` puts the label and description at the start and the control at the end of one row (a settings row), moving the control under the text when narrow, and `width` (`sm`, `md`, `lg`, `full`) lines the controls of a column up. New tokens `--cy-field-control-width-sm`, `-md`, `-lg` and `--cy-field-split-text-min`.
