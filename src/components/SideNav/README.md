# SideNav

Vertical navigation for an app or docs site: links in titled sections, groups that expand, the current page marked, and an icon-only rail. Works with any router through `renderLink`.

```tsx
import { SideNav } from "@arshad-shah/cynosure";

<SideNav
  label="Main"
  current={route.id}
  items={[
    { id: "home", label: "Home", href: "/", icon: home },
    {
      label: "Workspace",
      items: [
        {
          id: "team",
          label: "Team",
          icon: users,
          items: [{ id: "members", label: "Members", href: "/members" }],
        },
      ],
    },
  ]}
  renderLink={(props) => <RouterLink to={props.href} {...props} />}
/>;
```

| Prop              | Default    | Notes                                                                                                       |
| ----------------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| `label`           | –          | Name of the navigation landmark ("Main")                                                                    |
| `items`           | –          | `NavItem` (`id`, `label`, `href?`, `icon?`, `badge?`, `items?`, `disabled?`) or `{ label, items }` sections |
|                   |            | or one `NavAction` (`kind: "action"`, `id`, `label`, `icon`, `onClick`, `disabled?`): a primary button      |
| `current`         | –          | `id` of the page shown: `aria-current="page"`; groups on the way to it open                                 |
| `onNavigate`      | –          | `(id, event)` on every choice; `event.preventDefault()` to route on the client                              |
| `renderLink`      | plain link | Render links with your router; spread the props it receives                                                 |
| `collapsed`       | `false`    | Icon rail: labels in tooltips (still the accessible names); groups call `onCollapsedChange(false)`          |
| `defaultExpanded` | `[]`       | Group ids open at first                                                                                     |
| `layout`          | `column`   | `bar`: one row of top-level items, icon over label, for AppShell's phone `tabs`                             |
| `size`            | `md`       | `sm` · `md` · `lg`                                                                                          |
| `footer`          | –          | Entries pinned to the bottom (Settings, notifications); the nav then fills its container's height           |
| `placement`       | `start`    | `end` for a rail on the inline end: the current indicator faces the content, tooltips open towards it       |
- A `<nav>` landmark; each section is a list named by its heading. Items without `href` are buttons.
- Keyboard: Tab moves between items (then the footer's), Enter follows a link or toggles a group (Space too for buttons).
- In the collapsed rail an item's `badge` sits on its icon's top inline-end corner, still part of its name.

## An activity bar

A collapsed SideNav works on its own, without AppShell, as an editor's activity bar:

```tsx
<SideNav
  label="Views"
  collapsed
  current={view}
  onNavigate={setView}
  items={[{ id: "explorer", label: "Explorer", icon: database }]}
  footer={[
    { kind: "action", id: "notify", label: "Notifications", icon: bell, onClick: openNotifications },
    { id: "settings", label: "Settings", icon: settings },
  ]}
/>;
```

Footer entries are ordinary items, sections and actions. In `layout="bar"` they end the row.
- Rows are at least 24px tall, 44px on touch screens.

## A primary action

One top-level entry may be an action instead of a destination, for example the "Add" button in the middle of a phone's tab bar:

```tsx
<SideNav
  label="Sections"
  layout="bar"
  current={route.id}
  items={[
    { id: "today", label: "Today", icon: home },
    { kind: "action", id: "add", label: "Add", icon: plus, onClick: openNewTask },
    { id: "inbox", label: "Inbox", icon: inbox },
  ]}
/>;
```

- It is a Cynosure button named by `label`: not a link, never `aria-current` (even when its `id` equals `current`), and it calls its own `onClick`, not `onNavigate`.
- It sits where it is placed in `items`: put it in the middle of an odd number of entries to centre it.
- `layout="bar"`: a round accent IconButton, raised above the row with a shadow. The label is its accessible name and tooltip.
- `layout="column"`: a full-width accent Button showing the icon and the label. In the collapsed rail: an accent IconButton.
- Keyboard: it is one Tab stop in its place among the items; Enter or Space presses it. The bar has no arrow-key movement.
- Touch: the button is 48px across by default and its hit area is never under 44px on touch screens.
- Give a navigation one action at most, and keep it at the top level (not inside a section or a group).

## Tokens

- `--cy-side-nav-width`: expanded width (240px)
- `--cy-side-nav-rail-width`: collapsed width
- `--cy-side-nav-radius`: item highlight corners
- `--cy-side-nav-action-size`: diameter of the round action button in the bar (48px)
- `--cy-side-nav-action-lift`: how far the action button rises above the bar's row (8px)
