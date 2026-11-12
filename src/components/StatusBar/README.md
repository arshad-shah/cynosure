# StatusBar

The bar along the bottom of a desktop app or editor: short status segments in a `start` and an `end` cluster. It is an APG toolbar, so its clickable segments are one Tab stop and the arrow keys move between them. A segment is text with an icon or a status dot; with `onClick` or `popover` it is a [Button](../Button/README.md) of size `xs`, and `popover` opens a [Popover](../Popover/README.md) above it.

```tsx
import { StatusBar, StatusBarSegment } from "@arshad-shah/cynosure";

<StatusBar
  label="Status"
  start={
    <>
      <StatusBarSegment
        variant="solid"
        tone="accent"
        dot
        dotTone="success"
        dotLabel="Connected"
        popover={<ConnectionList />}
        popoverLabel="Connections"
      >
        main-db
      </StatusBarSegment>
      <StatusBarSegment icon={gitBranch} mono>
        feature/login
      </StatusBarSegment>
    </>
  }
  end={<StatusBarSegment mono>Ln 12, Col 4</StatusBarSegment>}
/>;
```

### StatusBar

| Prop                  | Default | Notes                                     |
| --------------------- | ------- | ----------------------------------------- |
| `label`               | –       | Accessible name of the toolbar (required) |
| `start` / `end`       | –       | Segments at the start and at the end edge |
| `className` / `style` | –       | Layout only                               |

### StatusBarSegment

| Prop                                    | Default   | Notes                                                                                |
| --------------------------------------- | --------- | ------------------------------------------------------------------------------------ |
| `children`                              | –         | The text; cut short with an ellipsis, and then shown in full in a tooltip            |
| `tone`                                  | `neutral` | Colours the text and icon (`plain`) or the fill (`soft`, `solid`)                    |
| `variant`                               | `plain`   | `plain` · `soft` · `solid`                                                           |
| `icon`                                  | –         | Facet icon before the text                                                           |
| `dot`                                   | –         | `true` or `"live"`: a Badge status dot before the text                               |
| `dotTone`                               | `tone`    | The dot's colour                                                                     |
| `dotLabel`                              | –         | Names the dot when the text does not say the state; without it the dot is decoration |
| `mono`                                  | `false`   | Monospace text                                                                       |
| `onClick`                               | –         | Makes it a Button (size `xs`)                                                        |
| `label`                                 | –         | Accessible name of a clickable segment; start it with the visible text               |
| `popover` / `popoverLabel`              | –         | Popover content opened above the segment, and the panel's name                       |
| `placement`                             | `top`     | Side the popover opens on (it flips when it does not fit)                            |
| `open` / `defaultOpen` / `onOpenChange` | –         | Controlled or uncontrolled popover state                                             |
| `disabled`                              | `false`   | A clickable segment that cannot be used; it leaves the arrow-key order               |

## Accessibility

- `role="toolbar"` named by `label`, horizontal. Not `role="status"`: a live region would read out every change in the bar (cursor positions, counters). Announce what matters with [Announcer](../Announcer/README.md).
- One Tab stop over the clickable segments (the one last used); Left and Right move between them across both clusters, wrapping, and skip status-only and disabled segments; Home and End jump. RTL swaps Left and Right.
- A popover segment has `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls`; focus moves into the panel, and Escape or a click outside closes it and returns focus to the segment. Arrow keys inside the panel are the panel's.
- Truncated text keeps its full text as the accessible name; the tooltip (no `title`) shows it on hover and, for a clickable segment, on keyboard focus. It never opens on touch.
- Clickable segments' hit area is at least 24px, 44px on coarse pointers, while the bar stays dense.

## Tokens

- `--cy-status-bar-height`: the bar's height (segments fill it)
- `--cy-status-bar-background`: the bar's fill
- `--cy-status-bar-border`: colour of the line along the bar's top edge
- `--cy-status-bar-font-size`: text size of the bar and its segments
- `--cy-status-bar-padding-inline`: space inside each segment, on both sides of its content
- `--cy-status-bar-segment-max-width`: widest a segment grows before its text ends in an ellipsis
- `--cy-status-bar-gap`: space between segments, and between the two clusters
