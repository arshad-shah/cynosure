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
| `current`         | –          | `id` of the page shown: `aria-current="page"`; groups on the way to it open                                 |
| `onNavigate`      | –          | `(id, event)` on every choice; `event.preventDefault()` to route on the client                              |
| `renderLink`      | plain link | Render links with your router; spread the props it receives                                                 |
| `collapsed`       | `false`    | Icon rail: labels in tooltips (still the accessible names); groups call `onCollapsedChange(false)`          |
| `defaultExpanded` | `[]`       | Group ids open at first                                                                                     |
| `layout`          | `column`   | `bar`: one row of top-level items, icon over label, for AppShell's phone `tabs`                             |
| `size`            | `md`       | `sm` · `md` · `lg`                                                                                          |
- A `<nav>` landmark; each section is a list named by its heading. Items without `href` are buttons.
- Keyboard: Tab moves between items, Enter follows a link or toggles a group (Space too for buttons).
- Rows are at least 24px tall, 44px on touch screens.

## Tokens

- `--cy-side-nav-width`: expanded width (240px)
- `--cy-side-nav-rail-width`: collapsed width
- `--cy-side-nav-radius`: item highlight corners

## Used by

App sidebars, docs navigation and settings sections in the web apps, extensions' options pages and sites (cross-product audit, 2026-11-10).
