# TagInput

Several short values in one field: topics, labels, recipients, keywords. Type and press Enter (or a comma), pick a suggestion, or paste a list. Tags show under the field and can be removed with their buttons, Backspace or the arrow keys.

```tsx
import { TagInput } from "@arshad-shah/cynosure";

<TagInput label="Topics" name="topic" defaultValue={["design"]} suggestions={allTopics} maxTags={5} />;
```

| Prop                                   | Default  | Notes                                                                                          |
| -------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `value` / `defaultValue`               | – / `[]` | The tags                                                                                       |
| `onChange`                             | –        | Called with the new list after each add or remove                                              |
| `suggestions`                          | –        | Offered while typing (matches anywhere); free text is still allowed                            |
| `separators`                           | `[","]`  | Keys that add the typed text; pasted text is split on them and on new lines                    |
| `allowDuplicates`                      | `false`  | Duplicates are compared without case                                                           |
| `maxTags`                              | –        | Most tags                                                                                      |
| `validate`                             | –        | `(tag, tags) => message or null`; a message refuses the tag and shows as the error             |
| `name`, `form`, `required`, `disabled` | –        | Each tag is submitted under `name`; `required` needs at least one tag                          |
| `labels`                               | –        | `tags`, `remove(tag)`, `added(tag)`, `removed(tag)`, `duplicate(tag)`, `tooMany(max)`, `empty` |

Also takes TextField's `label`, `labelHidden`, `description`, `error`, `placeholder`, `size` and `variant`.

- With `suggestions` the input is an APG combobox with a listbox (Arrow Up/Down, Enter, Escape); without, a plain text box.
- Keyboard: Backspace in an empty field removes the last tag; Arrow Left at the start of the field moves into the tags, Arrow Left/Right move between them, Delete or Backspace removes one, Arrow Right past the last or Escape returns to the field. Tags are not tab stops.
- Leaving the field adds what was typed. Additions and removals are announced.
- Refusals (duplicate, too many, `validate`) keep the text so it can be fixed.

## Tokens

- `--cy-tag-input-tag-background`, `--cy-tag-input-tag-radius`
- The suggestion list is an [OptionList](../OptionList/README.md): restyle it with `--cy-option-list-*`.
