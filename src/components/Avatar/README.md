# Avatar

A person, team or thing as a picture, falling back to initials and then to an icon. `AvatarGroup` overlaps several and sums up the rest as "+3". Neither is interactive: to make one pressable, put it inside a Button or Link.

```tsx
import { Avatar, AvatarGroup } from "@arshad-shah/cynosure";
import { folder } from "@arshad-shah/cynosure/icons";

<Avatar name="Ada Lovelace" />                                  // "AL"
<Avatar name="Ada Lovelace" src={ada.photo} status="online" />  // spoken "Ada Lovelace, online"
<Avatar name="Design files" icon={folder} shape="square" />
<Avatar name={person.name} tone="auto" decorative /> {person.name}

<AvatarGroup label="Reviewers" max={3} size="sm">
  {reviewers.map((r) => <Avatar key={r.id} name={r.name} src={r.photo} />)}
</AvatarGroup>
```

## Avatar

| Prop                  | Default   | Notes                                                                                                                                                                    |
| --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`                | required  | The accessible name and the source of the initials. An empty name is not announced                                                                                       |
| `initials`            | from name | Replaces the initials worked out from `name`                                                                                                                             |
| `src`                 | –         | The picture. The fallback shows while it loads; a picture that fails is removed. In server HTML that is never hydrated it shows as the browser has it, over the fallback |
| `icon`                | –         | Shown instead of worked-out initials, for things that are not people                                                                                                     |
| `size`                | `md`      | `xs` 20, `sm` 26, `md` 32, `lg` 40, `xl` 56 px at comfortable scale. A group's `size` replaces it                                                                        |
| `shape`               | `circle`  | `circle` · `square` (rounded like a control of its size)                                                                                                                 |
| `tone`                | `neutral` | `accent` · `neutral` · `danger` · `success` · `warning` · `info` · `auto` (picked from the name)                                                                         |
| `color`               | –         | Any CSS colour for the fallback; overrides `tone`                                                                                                                        |
| `status`              | –         | `online` · `away` · `busy` · `offline`: a dot at the bottom end corner, spoken after the name                                                                            |
| `labels`              | English   | `{ online, away, busy, offline }`: the spoken status names                                                                                                               |
| `decorative`          | `false`   | Hides the avatar from assistive technology, for when the name is written beside it                                                                                       |
| `className` / `style` | –         | Layout only                                                                                                                                                              |

## AvatarGroup

| Prop                  | Default  | Notes                                                            |
| --------------------- | -------- | ---------------------------------------------------------------- |
| `children`            | required | The Avatars, in order                                            |
| `label`               | required | Names the group (`role="group"`)                                 |
| `max`                 | –        | Show this many, then one "+N" avatar for the rest                |
| `size`                | `md`     | The size of every avatar in the group                            |
| `labels`              | English  | `{ more(count, names) }`: the accessible name of the "+N" avatar |
| `className` / `style` | –        | Layout only                                                      |

## Behaviour

- **Initials:** the first letters of the first and last word, upper-cased ("Gabriel García Márquez" gives "GM"); one word gives one letter. Whole emoji and non-Latin letters are kept, and punctuation before a word is skipped. A name without letters, numbers or emoji shows the `user` icon.
- **What shows:** the picture once it has loaded; otherwise `initials`, then `icon`, then the initials from `name`, then the `user` icon.
- **Picture:** waited for with `decode()`, so a picture that loaded or failed before React attached (server rendering) is handled too. A new `src` is tried again from the fallback.
- **`tone="auto"`:** one of accent, info, success, warning or danger, worked out from the name alone, so it is the same on every render and on the server. It is decoration: always show or speak the name as well.
- **Group:** avatars overlap by a quarter of their width along the reading direction (towards the left in right-to-left text) and each has a ring in the surface colour. The "+N" avatar is named "3 more: " followed by the hidden names.

## Accessibility

- The root is `role="img"` named by `name`; with a `status`, "Ada Lovelace, online". The status never relies on colour alone: it is in the name, and offline is drawn hollow.
- The inner picture has `alt=""`, so the name is read once.
- `decorative` (or an empty name) sets `aria-hidden` and drops the role.
- Fallback initials keep 4.5:1 contrast in every tone (tested).
- Forced colours: an outline keeps the shape and the dot draws in the text colour.
- Nothing to focus or touch.

## Tokens

- `--cy-avatar-size-xs`, `--cy-avatar-size-sm`, `--cy-avatar-size-md`, `--cy-avatar-size-lg`, `--cy-avatar-size-xl`: width and height at each size (`sm`, `md` and `lg` default to the control heights)
- `--cy-avatar-radius`: corner radius of the square shape
- `--cy-avatar-font-weight`: weight of the initials
- `--cy-avatar-soft-mix`: tint strength of the fallback (percentage of the tone mixed into the surface)
- `--cy-avatar-status-size`: diameter of the status dot
- `--cy-avatar-ring-color`: colour of the ring around grouped avatars and the status dot
- `--cy-avatar-ring-width`: width of that ring
- `--cy-avatar-overlap`: how far each avatar in a group slides over the one before it

## Used by

Planr (people assigned to a task, shared calendars), Verql (workspace members and who ran a query), the tools app (account menu), the docs site (contributors).
