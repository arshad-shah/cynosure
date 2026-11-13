# HotkeyField

Records a keyboard shortcut, for a keybindings settings page. It shows the shortcut as `Kbd` key caps with a record toggle and a clear button; while recording, it takes the next chord on its own element (capture phase, propagation stopped, so the app's own shortcuts do not fire) and writes it as `useHotkey` reads it: `"mod+shift+p"`.

```tsx
import { HotkeyField, useHotkey } from "@arshad-shah/cynosure";

const [keys, setKeys] = useState("mod+shift+p");
useHotkey(keys, openPalette);

<HotkeyField label="Command palette" value={keys} onChange={setKeys} />;
```

One row recording at a time on a settings page: control `recording`.

```tsx
<HotkeyField
  label={binding.label}
  labelHidden
  value={binding.keys}
  onChange={(keys) => save(binding.id, keys)}
  recording={editing === binding.id}
  onRecordingChange={(on) => setEditing(on ? binding.id : null)}
/>;
```

| Prop                                                   | Default     | Notes                                                                                     |
| ------------------------------------------------------ | ----------- | ----------------------------------------------------------------------------------------- |
| `layout` / `width`                                     | `stack` / – | `split` settings row and the control width, as on `Field`                                 |
| `label`                                                | –           | Names the group (fieldset); `labelHidden` keeps it for screen readers only                |
| `description`, `error`                                 | –           | As Field                                                                                  |
| `value` / `defaultValue` / `onChange`                  | `""`        | The shortcut string (`mod` is Command on Apple platforms, Control elsewhere); `""` = none |
| `recording` / `defaultRecording` / `onRecordingChange` | `false`     | Controlled or not; reports every start and stop                                           |
| `allowBare`                                            | `false`     | Accept keys without Control, Command or Alt (`"k"`, `"shift+/"`); F1–F24 always count     |
| `name`, `form`                                         | –           | The form receives the shortcut string; a form reset restores `defaultValue`               |
| `disabled`                                             | `false`     | Nothing records or clears; not submitted                                                  |
| `size`                                                 | `md`        | `sm` · `md` · `lg`                                                                        |
| `labels`                                               | English     | `record`, `clear`, `none`, `prompt`, `recording`, `recorded`, `cancelled`, `cleared`      |
| `className` / `style`                                  | –           | Layout only                                                                               |

## Recording

- Starts from the record toggle (`aria-pressed`), a press on the shortcut's box, or `recording` turning true; focus moves to the toggle so the keys arrive.
- Modifiers alone wait for the key. Keys without Control, Command or Alt are ignored unless `allowBare` (function keys always count).
- The key is the character typed or, when that is not a letter or digit (Option+K types "˚", Shift+1 types "!", a dead key, another alphabet), the letter or digit on the physical key, as `matchesHotkey` reads it. The mapping is `hotkeyFromEvent`, exported for your own recorders.
- **Escape** alone cancels; with a modifier (`mod+escape`) it is recorded. Plain **Tab** is not taken: focus moves on, and focus leaving the field cancels.
- Announced through the field's own `role="status"`: "Recording, press a shortcut", "Shortcut set to Control plus Shift plus P", "Recording cancelled", "Shortcut cleared".

## Tokens

- `--cy-hotkey-field-recording-color`: colour of the recording prompt and its pulsing light
- `--cy-hotkey-field-recording-border`: border colour of the box while recording
- `--cy-hotkey-field-radius`: corner radius of the shortcut's box
- `--cy-hotkey-field-border`: border colour of the shortcut's box
- `--cy-hotkey-field-bg`: background of the shortcut's box
- `--cy-hotkey-field-gap`: space between the box and the buttons
