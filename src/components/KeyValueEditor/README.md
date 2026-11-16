# KeyValueEditor

Editable key and value pairs: HTTP headers, query parameters, environment variables, metadata. Built from SortableList rows (each with an on/off Checkbox, key and value TextFields and a remove IconButton), an Add Button, and a TextArea for editing every pair at once as text.

```tsx
import { KeyValueEditor, type KeyValuePair } from "@arshad-shah/cynosure";

const [headers, setHeaders] = useState<KeyValuePair[]>([
  { id: "1", key: "Accept", value: "application/json" },
]);
<KeyValueEditor label="Headers" pairs={headers} onChange={setHeaders} />;
```

| Prop                                  | Default       | Notes                                                                                                                                                                     |
| ------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`                               | –             | What the pairs are; names the list and the text view                                                                                                                      |
| `pairs` / `defaultPairs` / `onChange` | `[]`          | `{ id, key, value, enabled?, secret?, file? }`; `secret` masks the value                                                                                                  |
| `toggleable`                          | `true`        | A checkbox per row switches it off without deleting it (`enabled: false`)                                                                                                 |
| `bulkEdit`                            | `true`        | "Edit as text": one `key: value` per line, `# ` in front of a pair that is off                                                                                            |
| `rowTypes`                            | `false`       | A Type select per row: Text, Secret (masked, `secret: true`) and, with `allowFiles`, File (opens the picker)                                                              |
| `allowFiles`, `accept`                | `false`       | A button per row makes its value a file (multipart form fields); `accept` limits the types                                                                                |
| `disabled`, `size`                    | `false`, `md` |                                                                                                                                                                           |
| `labels`                              | –             | `key`, `value`, `row(n)`, `add`, `remove(name)`, `enable(name)`, `attach(name)`, `detach(name)`, `type`, `typeText`, `typeSecret`, `typeFile`, `bulk`, `bulkField(label)` |
- Rows reorder like SortableList: drag the grip, or Space then arrows on it.
- Every field is named for its row ("Value (Authorization)"); an unnamed row is "Row 3".
- Add focuses the new row's key; removing a row focuses the row that took its place (or Add when none is left).
- A file row shows the file's name in a read-only value field, with a button to take the file away. In the text view it reads `avatar: @photo.png`; the file is kept while that line is left as it is, and retyping the line makes it text again.
- With `rowTypes`, each row's Type select ("Type (token)") lets the user mark a pair Secret, masking its value, or Text again; with `allowFiles`, choosing File opens the file picker and Text takes the file away.
- Keys that were secret when the text view opened stay masked, however the text is retyped.

## Tokens

- `--cy-key-value-editor-gap`
- `--cy-key-value-editor-type-width`: width of the Type select of each row with `rowTypes` (default 8rem)
