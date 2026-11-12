# CommandPalette

A search-and-run list of commands in a modal dialog, opened from anywhere with Ctrl+K (Command+K on Apple platforms).

```tsx
<CommandPalette
  commands={[
    { id: "save", label: "Save file", group: "File", shortcut: ["Ctrl", "S"], keywords: ["write"] },
    { id: "preview", label: "Toggle preview", group: "View" },
  ]}
  onRun={(id) => actions[id]()}
/>;
```

| Prop                                    | Default | Notes                                                                               |
| --------------------------------------- | ------- | ----------------------------------------------------------------------------------- |
| `commands`                              | –       | `{ id, label, group?, shortcut?, icon?, keywords?, disabled? }[]`                   |
| `onRun`                                 | –       | Called with the chosen id; the palette then closes                                  |
| `open` / `defaultOpen` / `onOpenChange` | `false` | Controlled or uncontrolled                                                          |
| `shortcut`                              | `mod+k` | Toggles the palette; `mod` is Command on Apple, Control elsewhere; `false` for none |
| `filter`                                | –       | `(command, query) => { score?, positions? } \| boolean \| null`: your own search    |
| `recentLimit`                           | `5`     | Recently run commands listed first before you type; `0` for none                    |
| `labels`                                | –       | `title`, `placeholder`, `empty`, `recent`                                           |
- Every typed word must appear in the label or keywords; label prefix matches rank first. Typed words are marked in the labels (HighlightedText).
- `filter` replaces that search (a fuzzy matcher of your own). It is called for each command while there is a query: return `{ score, positions }` (lower scores first, ties in `commands`' order; `positions` are the label's matched characters, marked), `true` to keep the command unmarked, or `null`/`false` to drop it.
- Browsing (nothing typed), commands are listed under their `group` headings. Search results are one flat list in rank order, and each row shows its group as a small Badge; so do the recent commands.
- Arrows wrap; Enter or a click runs; Escape, the backdrop or the shortcut close. Focus returns to where it was.
- `shortcut` shows nothing by itself: a command's `shortcut` is display only, so bind those keys with `useHotkey`.
- Works in shadow roots (extension content scripts): the shortcut is heard from inside them.

`useHotkey(combo, handler)` is exported too: shortcuts with Ctrl, Command or Alt work everywhere; plain keys ("/") are ignored while typing in a field; `data-cy-hotkeys="off"` opts a subtree out.

Tokens: `--cy-command-palette-width`, `--cy-command-palette-offset`, `--cy-command-palette-list-max-height`.
