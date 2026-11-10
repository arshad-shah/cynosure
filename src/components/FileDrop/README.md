# FileDrop

A place to add files: drop them on it, or press its button to pick them. Checks type, size and count, explains what it turned away, and keeps a native file input in step so forms submit the accepted files.

```tsx
import { FileDrop } from "@arshad-shah/cynosure";

<FileDrop
  name="attachments"
  multiple
  accept=".pdf,image/*"
  maxSize={5 * 1024 * 1024}
  hint="PDF or images, up to 5 MB"
  onFiles={(files) => upload(files)}
/>;
```

| Prop                                   | Default | Notes                                                                              |
| -------------------------------------- | ------- | ---------------------------------------------------------------------------------- |
| `onFiles`                              | –       | The files that passed the checks                                                   |
| `onReject`                             | –       | `{ file, reason }[]`; reasons `type`, `size`, `count`. Also listed in the zone     |
| `accept`                               | –       | As `<input accept>`: extensions, MIME types, `type/*`                              |
| `multiple`                             | `false` | More than one file; `maxFiles` caps how many                                       |
| `maxSize`                              | –       | Largest file, in bytes                                                             |
| `hint`                                 | –       | Shown under the button and read as its description                                 |
| `name`, `form`, `required`, `disabled` | –       | Forms submit the accepted files, dropped or picked                                 |
| `labels`                               | –       | `prompt`, `choose`, `chooseOne`, `dragging`, `added(count)`, `rejected(rejection)` |
- The button is the accessible way in (keyboard, touch, screen readers); dropping is a shortcut.
- After files are added, a status message is announced ("2 files added"); refusals are announced as an alert.
- `acceptsFile(file, accept)` is exported: the same check browsers apply to `accept`.

## Tokens

- `--cy-file-drop-radius`
- `--cy-file-drop-active-background`: while files are dragged over

## Used by

Imports, attachments and uploads in the web apps and extensions (cross-product audit, 2026-11-10).
