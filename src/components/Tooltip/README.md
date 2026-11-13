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
| `delay`         | `300`   | Hover delay in ms; keyboard focus opens immediately                                                                                 |
| `className`     | –       | Added to the anchor around the trigger (the box its parent lays out), for layout only                                               |
| `disabled`      | `false` | Off without remounting the trigger: no tip, no description (e.g. a label shown in full)                                             |
| `describe`      | `true`  | `false`: the tip repeats the trigger's name (a label cut short), so it is hidden from assistive tech and describes nothing          |
| `whenTruncated` | –       | Shown only while text is cut short: `true` measures the trigger, a function picks the element inside it; implies `describe={false}` |

Behaviour (WCAG 1.4.13): hoverable, dismissible with Escape, stays while hovered or focused, never opens on touch. Follows its trigger on scroll and resize.

## Tokens

- `--cy-tooltip-{bg,ink,radius,max-width}`
