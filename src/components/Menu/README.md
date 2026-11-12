# Menu

APG menu button: a list of commands in the top layer.

```tsx
<Menu
  label="File actions"
  trigger={(props) => <IconButton {...props} icon={moreHorizontal} label="More" />}
  items={[
    { value: "edit", label: "Edit", icon: edit, shortcut: ["Ctrl", "E"] },
    { label: "Danger zone", items: [{ value: "delete", label: "Delete", icon: trash, tone: "danger" }] },
  ]}
  onSelect={run}
/>;
```

Items: `value`, `label`, `icon`, `iconTone` and `iconColor`, `shortcut` (shown with Kbd, exposed as `aria-keyshortcuts`), `disabled`, `tone` (`neutral` or `danger`), `kind` (`checkbox` or `radio`) with `checked`, and `keepOpen` (checkable items keep the menu open by default, for several toggles in a row; `keepOpen: false` closes it, as for a zoom choice). Sections (`{ label, items }`) render as a named group after a separator; a section without a `label` (`{ items }`) is set apart by separator lines only, with no group.

An item with `items` opens a **submenu** beside it (end side, flipping at the viewport edge), nested to any depth. Its entries are plain data like the rest, so they can come from plugins. The parent item is a `menuitem` with `aria-haspopup="menu"`, `aria-expanded` and a chevron; its own `value` is never selected. `onSelect` receives the value chosen at any level, and a choice closes the whole tree.

`open`, `defaultOpen` and `onOpenChange` make the menu controllable, to open it from a keyboard shortcut.

- Enter, Space, click or Down open on the first item; Up opens on the last.
- Up, Down, Home and End move (wrapping, skipping disabled items); typing jumps to the next matching item (within the focused menu).
- Enter, Space or click selects and closes; checkable items stay open.
- Submenus: Right (Left in right-to-left text), Enter, Space or a click on the parent opens it on its first item; Left (Right in RTL) or Escape closes it back to its parent. Resting the pointer on a parent opens it after 150 ms without moving focus; while one is open, another item must hold the pointer 300 ms to close or switch it, so moving diagonally towards the submenu across other items keeps it open, and leaving the menu cancels a pending switch. On touch, a tap on the parent opens it.
- Escape closes one level and returns focus to its trigger or parent item (only this layer when nested in a Popover); Tab closes the whole tree and moves on.
- Rows are 44px on coarse pointers.
- Icons are muted by default (and take a danger item's colour). `iconTone` and `iconColor` colour one item's icon, with the meaning of Icon's `tone` and `color` (`iconColor` is any CSS colour and overrides `iconTone`), the same two fields as Select and Combobox options. The highlighted item keeps the colour; a disabled item shows the icon muted. Keep the label meaningful without the colour.

Tokens: `--cy-menu-min-width`, `--cy-menu-max-width`, `--cy-menu-radius`, `--cy-menu-row-height`.
