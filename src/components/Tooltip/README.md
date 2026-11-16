# Tooltip

Short supplementary text for a control, rendered in the top layer (Popover API) so it is never clipped and works inside shadow roots. It becomes the trigger's accessible description.

```tsx
<Tooltip content="Download as JSON">
  <Button icon={download}>Export</Button>
</Tooltip>;
```

| Prop            | Default | Notes                                                                                                                               |
| --------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `content`       | –       | Short text (not interactive content)                                                                                                |
| `children`      | –       | One focusable element                                                                                                               |
| `placement`     | `top`   | `top` · `bottom` · `start` · `end`; flips and shifts to stay visible                                                                |
| `delay`         | `300`   | Hover delay in ms (`0`: at once); keyboard focus opens at once                                                                      |
| `className`     | –       | Added to the anchor around the trigger (the box its parent lays out), for layout only                                               |
| `disabled`      | `false` | Off without remounting the trigger: no tip, no description (e.g. a label shown in full)                                             |
| `describe`      | `true`  | `false`: the tip repeats the trigger's name (a label cut short), so it is hidden from assistive tech and describes nothing          |
| `whenTruncated` | –       | Shown only while text is cut short: `true` measures the trigger, a function picks the element inside it; implies `describe={false}` |

Warm-up: while a tooltip is shown, and for 300 ms after it closes, a hovered neighbour opens without its delay (moving along a toolbar).

Behaviour (WCAG 1.4.13): hoverable, dismissible with Escape, stays while hovered or focused, never opens on touch. Focus opens it only when a navigation key (Tab, the arrows, Home, End, Page Up/Down) moved focus to the trigger and it still has focus on the next frame: focus a script moves (a Dialog or Popover focusing a control as it opens, focus returned after Escape) opens nothing. It closes as soon as focus leaves the trigger, by any route, unless the pointer rests on it. Follows its trigger on scroll and resize.

## Tokens

- `--cy-tooltip-{bg,ink,radius,max-width}`
