# ContextMenu

A menu of commands for one thing (a file row, a card, a canvas object), opened where the person points: right-click, a long press on touch screens, or Shift+F10 / the context menu key on the focused target. The menu itself is the same as `Menu`: arrow keys, type-ahead, sections (labelled, or set apart by separator lines only), submenus, checkable items, shortcuts.

```tsx
import { ContextMenu } from "@arshad-shah/cynosure";

<ContextMenu label="File actions" items={items} onSelect={run}>
  {(props) => (
    <div {...props} tabIndex={0} className="file-row">
      report.pdf
    </div>
  )}
</ContextMenu>;
```

| Prop                  | Default | Notes                                                                                                    |
| --------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `children`            | –       | `(props) => element`: spread `props` (ref and handlers) onto one focusable element; optional with `open` |
| `label`               | –       | Accessible name of the menu                                                                              |
| `items` / `onSelect`  | –       | Same entries as `Menu` (`MenuItem` or `MenuSection`)                                                     |
| `onOpenChange`        | –       | Called with `true` / `false`, e.g. to highlight the row the menu belongs to                              |
| `open`                | –       | Controlled: the app opens it itself (a canvas object with no element of its own)                         |
| `anchor`              | –       | Where the app opens it: `{ x, y }` in client coordinates, or any element or virtual anchor               |
| `disabled`            | `false` | The browser's own menu shows instead                                                                     |
| `className` / `style` | –       | Layout only, applied to the panel                                                                        |
- Right-click opens the menu with its corner at the pointer; the keyboard opens it under the target. It stays on screen near edges.
- Touch: a 500ms press opens it (iOS sends no `contextmenu` event); a tap or a scroll does not. Add `-webkit-touch-callout: none` and `user-select: none` to the target so the system's own callout does not appear.
- Focus moves to the first item and returns to the target when the menu closes.
- Items are Menu's `MenuItem`, so `iconTone` and `iconColor` colour an item's icon here too (see [Menu](../Menu/README.md)); a disabled item shows its icon muted.
- Every command must also be reachable another way (a Menu button or toolbar): a context menu is a shortcut, not the only path.

## Many targets

For the rows of a list or the tabs of a tab list, use one ContextMenu for all of them: spread `targetFor(key)` (the render prop's second argument) onto each, with a key such as the row's item. `label` and `items` may then be functions of that key, and `onSelect` and `onOpenChange` receive it after the value. The menu sits beside the list, not in it, so a list that may hold only its own items (a tablist, a tree) stays valid, and focus returns to the target that opened it. Tabs and Tree host their context menus this way.

```tsx
<ContextMenu<File>
  label={(file) => `${file.name} actions`}
  items={(file) => commandsFor(file)}
  onSelect={(command, file) => run(command, file)}
>
  {(_, targetFor) =>
    files.map((file) => (
      <li key={file.id} {...targetFor(file)} tabIndex={0}>
        {file.name}
      </li>
    ))
  }
</ContextMenu>;
```

## Opened by the app, at a point

Objects drawn on a canvas have no element of their own. Find the object yourself (under a right-click, or the selected one for Shift+F10) and open the menu for it with `open` and `anchor`:

```tsx
<ContextMenu
  open={menu !== null}
  anchor={menu ?? undefined} // { x, y } in client coordinates
  onOpenChange={(open) => !open && setMenu(null)}
  label={menu ? `${menu.shape.name} actions` : ""}
  items={shapeCommands}
  onSelect={(command) => run(command, menu?.shape)}
/>;
```

`onOpenChange(false)` reports Escape, a choice, Tab or an outside press; focus returns to what had it when the menu opened. With a target as well, a menu the app opens without `anchor` sits under the target, and a right-click asks to open through `onOpenChange(true)`.

## Tokens

Shared with Menu: `--cy-menu-min-width`, `--cy-menu-max-width`, `--cy-menu-radius` and `--cy-menu-row-height`. `--cy-menu-offset` does not apply: a context menu opens 2px from the pointer.
