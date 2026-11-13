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

| Prop                                   | Default | Notes                                                                                                                        |
| -------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `onFiles`                              | –       | The files that passed the checks                                                                                             |
| `onReject`                             | –       | `{ file, reason }[]`; reasons `type`, `size`, `count`. Also listed in the zone                                               |
| `accept`                               | –       | As `<input accept>`: extensions, MIME types, `type/*`                                                                        |
| `multiple`                             | `false` | More than one file; `maxFiles` caps how many                                                                                 |
| `maxSize`                              | –       | Largest file, in bytes                                                                                                       |
| `hint`                                 | –       | Shown under the button and read as its description                                                                           |
| `target`                               | `zone`  | `window`: files dropped anywhere in the window are taken (see below)                                                         |
| `name`, `form`, `required`, `disabled` | –       | Forms submit the accepted files, dropped or picked                                                                           |
| `onPick` / `onPaths`                   | –       | `() => Promise<(File \| string)[] \| null>`, your picker in place of the browser's; chosen paths arrive in `onPaths`         |
| `value` / `onRemove(item, index)`      | –       | Chosen files or paths listed in the zone, each with a remove button                                                          |
| `labels`                               | –       | `prompt`, `choose`, `chooseOne`, `dragging`, `added(count)`, `rejected(rejection)`, `files`, `remove(name)`, `removed(name)` |
- The button is the accessible way in (keyboard, touch, screen readers); dropping is a shortcut.
- `onPick` replaces the browser's file dialog with your own (Electron's `dialog.showOpenDialog` over IPC), as PathField's `onPick`: the button calls it and is busy (`aria-busy`) until it settles. It resolves with the chosen files or paths, or `null` when cancelled; a cancel or a rejected promise changes nothing. Chosen files are checked like dropped ones and arrive in `onFiles` (and the form); chosen paths arrive in `onPaths`. Show them with `value`.
- `value` lists chosen files (by `name`) or paths (as given) in the zone, a list named "Chosen files". With `onRemove`, each has a remove button: a press calls `onRemove(item, index)`, announces "report.pdf removed", and once `value` changes, focus moves to the next remove button (or the previous one, or the main button). `value` is display only: the native input holds only files picked or dropped here.
- After files are added, a status message is announced ("2 files added"); refusals are announced as an alert.
- `target="window"` makes the whole page the drop target, for an app that opens whatever is dropped on it. While files are dragged in, an overlay (in the top layer, so nothing is added to `<body>`) covers the page with the `dragging` label. Text and links dragged over the page are left alone. The zone and its button stay where you put them.
- `acceptsFile(file, accept)` is exported: the same check browsers apply to `accept`.

## Tokens

- `--cy-file-drop-radius`
- `--cy-file-drop-active-background`: while files are dragged over
- `--cy-file-drop-overlay-background`: the whole-window overlay
- `--cy-file-drop-file-background`: a chosen file's row (`value`)
