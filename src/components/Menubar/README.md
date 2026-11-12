# Menubar

APG menubar: a desktop application's row of menu titles (File, Edit, View), each opening a [Menu](../Menu/README.md) of commands.

```tsx
import { Menubar } from "@arshad-shah/cynosure";

<Menubar
  label="Application"
  menus={[
    {
      label: "File",
      items: [{ value: "open", label: "Open", icon: folder, shortcut: "mod+o" }],
    },
    {
      label: "Edit",
      items: [{ value: "copy", label: "Copy", icon: copy, shortcut: "mod+c" }],
    },
  ]}
  onSelect={run}
/>;
```

| Prop                  | Default | Notes                                                                          |
| --------------------- | ------- | ------------------------------------------------------------------------------ |
| `label`               | –       | Accessible name of the bar (required)                                          |
| `menus`               | –       | `{ label, items }[]`; `items` exactly as Menu takes them (shortcuts, sections) |
| `onSelect`            | –       | Called with the chosen item's `value`, from any menu                           |
| `size`                | `md`    | `sm` · `md` · `lg`: the titles' height and text                                |
| `className` / `style` | –       | Layout only                                                                    |
- One Tab stop (the title last used). Left and Right move between titles, wrapping; Home and End jump.
- Down, Enter, Space or click open a menu on its first item; Up on its last.
- In an open menu, Left and Right open the neighbouring menu instead; Up, Down, Home, End and type-ahead are Menu's.
- Hovering (or tapping) another title while a menu is open switches to it; at rest hovering opens nothing.
- Escape closes and returns focus to the title; Tab and Shift+Tab close and leave the bar; a click outside closes.
- Only one menu is open at a time. RTL swaps Left and Right. Works in shadow roots.
- Titles' hit area is at least 24px, 44px on coarse pointers.

## Tokens

- `--cy-menubar-active-bg`: Background of a hovered title and of the title whose menu is open
- `--cy-menubar-radius`: Corner radius of a menu title's highlight
- `--cy-menubar-padding-inline`: Inline padding of a menu title
- `--cy-menubar-height`: Height of a menu title (default: the control height for the size)
- `--cy-menubar-gap`: Space between titles

The menus are Menu's panels, themed with `--cy-menu-*`.
