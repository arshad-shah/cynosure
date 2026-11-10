# KeyValueEditor

Editable key and value pairs: HTTP headers, query parameters, environment variables, metadata. Built from SortableList rows (each with an on/off Checkbox, key and value TextFields and a remove IconButton), an Add Button, and a TextArea for editing every pair at once as text.

```tsx
import { KeyValueEditor, type KeyValuePair } from "@arshad-shah/cynosure";

const [headers, setHeaders] = useState<KeyValuePair[]>([
  { id: "1", key: "Accept", value: "application/json" },
]);
<KeyValueEditor label="Headers" pairs={headers} onChange={setHeaders} />;
```

| Prop                                  | Default | Notes                                                                                       |
| ------------------------------------- | ------- | ------------------------------------------------------------------------------------------- |
| `label`                               | –       | What the pairs are; names the list and the text view                                        |
| `pairs` / `defaultPairs` / `onChange` | `[]`    | `{ id, key, value, enabled?, secret? }`; `secret` masks the value                           |
| `toggleable`                          | `true`  | A checkbox per row switches it off without deleting it (`enabled: false`)                   |
| `bulkEdit`                            | `true`  | "Edit as text": one `key: value` per line, `# ` in front of a pair that is off              |
| `disabled`, `size`                    | –, `md` |                                                                                             |
| `labels`                              | –       | `key`, `value`, `row(n)`, `add`, `remove(name)`, `enable(name)`, `bulk`, `bulkField(label)` |
- Rows reorder like SortableList: drag the grip, or Space then arrows on it.
- Every field is named for its row ("Value (Authorization)"); an unnamed row is "Row 3".
- Add focuses the new row's key; removing a row focuses the row that took its place (or Add when none is left).
- Keys that were secret when the text view opened stay masked, however the text is retyped.

## Tokens

- `--cy-key-value-editor-gap`

## Used by

The tools app's request builders (headers, query parameters, form fields) and settings screens with environment variables or metadata.
