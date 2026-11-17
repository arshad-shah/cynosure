# Form

A group of fields that submits as one. Enter in any text field submits it (even with several fields and no submit button, where a browser would not), after the fields' own validation; `onSubmit` gets the values as `FormData` and the page does not navigate.

```tsx
import { Button, Form, TextField } from "@arshad-shah/cynosure";

<Form label="Unlock the document" onSubmit={(values) => unlock(values.get("password") as string)}>
  <TextField label="Password" name="password" type="password" required />
  <Button type="submit">Unlock</Button>
</Form>;
```

| Prop                  | Default         | Notes                                                                                         |
| --------------------- | --------------- | --------------------------------------------------------------------------------------------- |
| `onSubmit`            | –               | `(values: FormData, event)`, on a valid submit; without it, a native form posting to `action` |
| `label`               | –               | Names the form (a `form` landmark); or `aria-labelledby`                                      |
| `gap`                 | `--cy-form-gap` | Space token between the fields, stacked in a column                                           |
| `noValidate`, …       | –               | Native form attributes pass through; the ref is the form element                              |
| `className` / `style` | –               | Layout only                                                                                   |
- Enter in a text field submits through `requestSubmit()`, so validation runs and a `required` field left empty stops it. Enter in a text area is a new line; a field that handles Enter itself (TagInput, Combobox) prevents it and keeps it; an IME's Enter is ignored; Enter with a modifier key is left alone. A field that commits its text on Enter (NumberField, DateField, TimeField, ColorField) is rendered first, so the form submits the value just committed.
- A `type="submit"` Button submits; `type="reset"` restores the fields.

## Tokens

- `--cy-form-gap`: space between the fields when `gap` is not given. Default `--cy-space-4`.
