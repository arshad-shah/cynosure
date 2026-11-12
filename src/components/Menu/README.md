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

Items: `value`, `label`, `icon`, `iconTone` and `iconColor`, `shortcut` (shown with Kbd, exposed as `aria-keyshortcuts`), `disabled`, `tone` (`neutral` or `danger`), `kind` (`checkbox` or `radio`) with `checked`, and `keepOpen` (checkable items keep the menu open by default, for several toggles in a row; `keepOpen: false` closes it, as for a zoom choice). Sections (`{ label, items }`) render as a named group after a separator.

- Enter, Space, click or Down open on the first item; Up opens on the last.
- Up, Down, Home and End move (wrapping, skipping disabled items); typing jumps to the next matching item.
- Enter, Space or click selects and closes; checkable items stay open.
- Escape closes and returns focus to the trigger (only this layer when nested); Tab closes and moves on.
- Rows are 44px on coarse pointers.
- Icons are muted by default (and take a danger item's colour). `iconTone` and `iconColor` colour one item's icon, with the meaning of Icon's `tone` and `color` (`iconColor` is any CSS colour and overrides `iconTone`), the same two fields as Select and Combobox options. The highlighted item keeps the colour; a disabled item shows the icon muted. Keep the label meaningful without the colour.

Tokens: `--cy-menu-min-width`, `--cy-menu-max-width`, `--cy-menu-radius`, `--cy-menu-row-height`.

## Used by

Prism (node actions), Aperture (panel menus), extension popups, Planr (priority and category menus with coloured icons).
