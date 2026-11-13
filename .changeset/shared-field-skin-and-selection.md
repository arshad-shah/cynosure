---
"@arshad-shah/cynosure": minor
---

One vocabulary and one look across lists and fields:

- Select and TextArea now read the field skin (`--cy-field-control-border`, `--cy-field-control-bg`, `--cy-field-control-radius`, and for a read-only TextArea `--cy-field-control-sunken-bg`), so restyling fields once restyles every field's box.
- VirtualList takes `selected` / `defaultSelected`, like Tree, Table and DataGrid. `selectedKeys` / `defaultSelectedKeys` still work but are deprecated.
- Tabs reveals the selected tab with the shared `alignedScroll`. A padded tab wider than the strip now shows its start, as `scrollIntoView` does.
