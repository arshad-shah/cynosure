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

Items: `value`, `label`, `icon`, `shortcut` (shown with Kbd, exposed as `aria-keyshortcuts`), `disabled`, `tone` (`neutral` or `danger`), `kind` (`checkbox` or `radio`) with `checked`. Sections (`{ label, items }`) render as a named group after a separator.

- Enter, Space, click or Down open on the first item; Up opens on the last.
- Up, Down, Home and End move (wrapping, skipping disabled items); typing jumps to the next matching item.
- Enter, Space or click selects and closes; checkable items stay open.
- Escape closes and returns focus to the trigger (only this layer when nested); Tab closes and moves on.
- Rows are 44px on coarse pointers.

Tokens: `--cy-menu-min-width`, `--cy-menu-max-width`, `--cy-menu-radius`, `--cy-menu-row-height`.

## Used by

Prism (node actions), Aperture (panel menus), extension popups.
