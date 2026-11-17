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

| Prop                                    | Default          | Notes                                                                               |
| --------------------------------------- | ---------------- | ----------------------------------------------------------------------------------- |
| `commands`                              | –                | `{ id, label, group?, shortcut?, icon?, keywords?, disabled?, disabledReason? }[]`  |
| `onRun`                                 | –                | Called with the chosen id; the palette then closes                                  |
| `open` / `defaultOpen` / `onOpenChange` | `false`          | Controlled or uncontrolled                                                          |
| `shortcut`                              | `mod+k`          | Toggles the palette; `mod` is Command on Apple, Control elsewhere; `false` for none |
| `filter`                                | –                | `(command, query) => { score?, positions? } \| boolean \| null`: your own search    |
| `onQueryChange`                         | –                | Every change of the query (and `""` on opening): build commands from it             |
| `recentLimit`                           | `5`              | Recently run commands listed first before you type; `0` for none                    |
| `recent` / `onRecentChange`             | –                | Controlled list of recent ids, newest first                                         |
| `recentKey` / `recentStorage`           | – / localStorage | Keep recent commands between visits under a key; any sync or async `{ get, set }`   |
| `labels`                                | –                | `title`, `placeholder`, `empty`, `recent`, `unavailable(label, reason)`             |
| `className` / `style`                   | –                | Layout only, on the panel                                                           |
- Every typed word must appear in the label or keywords; label prefix matches rank first. Typed words are marked in the labels (HighlightedText).
- `filter` replaces that search (a fuzzy matcher of your own). It is called for each command while there is a query: return `{ score, positions }` (lower scores first, ties in `commands`' order; `positions` are the label's matched characters, marked), `true` to keep the command unmarked, or `null`/`false` to drop it.
- Browsing (nothing typed), commands are listed under their `group` headings. Search results are one flat list in rank order, and each row shows its group as a small Badge; so do the recent commands.
- A `disabled` command with a `disabledReason` shows the reason (its description), is reached by the arrows and announces the reason when chosen; one without a reason is skipped.
- Arrows wrap; Enter or a click runs; Escape, the backdrop or the shortcut close. Focus returns to where it was.
- A command's `shortcut` (`["Ctrl", "S"]`, or `"mod+s"` for this platform's key names) is display only, so bind those keys with `useHotkey`.
- Works in shadow roots (extension content scripts): the shortcut is heard from inside them.

`useHotkey(combo, handler)` is exported too: shortcuts with Ctrl, Command or Alt work everywhere; plain keys ("/") are ignored while typing in a field; `data-cy-hotkeys="off"` opts a subtree out.

Tokens: `--cy-command-palette-width`, `--cy-command-palette-offset`, `--cy-command-palette-list-max-height`.
