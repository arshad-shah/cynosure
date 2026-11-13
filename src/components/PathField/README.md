# PathField

A file or folder path: a TextField with a Browse button inside its end that asks your app's picker for a path, and a clear button. The path can also be typed. For apps with their own file dialog (Electron), where a browser file input gives no path.

```tsx
import { PathField } from "@arshad-shah/cynosure";

<PathField
  label="Database file"
  name="db"
  value={path}
  onChange={setPath}
  onPick={() => window.api.pickFile()} // Promise<string | null>
/>;
```

| Prop                                           | Default          | Notes                                                                            |
| ---------------------------------------------- | ---------------- | -------------------------------------------------------------------------------- |
| `layout` / `width`                             | `stack` / –      | `split` settings row and the control width, as on `Field`                        |
| `onPick`                                       | –                | `() => Promise<string \| null>`: the chosen path, or `null` when cancelled       |
| `value` / `defaultValue` / `onChange`          | – / `""`         | The path; `onChange` is called when it is typed, picked or cleared               |
| `label`, `labelHidden`, `description`, `error` | –                | As TextField                                                                     |
| `name`, `form`, `required`, `disabled`         | –                | The path is submitted under `name`; `required` blocks the form while it is empty |
| `placeholder`, `iconStart`                     | –                | Hint while empty; an icon leading the field                                      |
| `size` / `variant`                             | `md` / `outline` | `xs`–`lg`; the Browse button is one step smaller so it fits inside the field     |
| `labels`                                       | –                | `browse` ("Browse…"), `clear` ("Clear")                                          |
- Browse is busy (`aria-busy`) and cannot be pressed again until `onPick` settles; `null`, or a rejected promise, leaves the path as it was.
- The clear button shows while there is a path; it empties the field and focuses it. Tab order: input, clear, Browse.
- Disabled: the field and Browse are disabled and there is no clear button. Touch: 44px hit areas.

## Tokens

- `--cy-path-field-browse-inset`: space between the Browse button and the field's end (default `--cy-space-1`).
- TextField's and Button's tokens restyle the field and the button.
