# ScrollArea

A box that fills its parent and scrolls what does not fit: the scrolling middle of an app shell, a side panel, a log, a chat. It can follow the end while content arrives, report when the view leaves the end, and hold an overlay (a "3 new" pill) that stays put while the content scrolls.

```tsx
import { ScrollArea, type ScrollAreaHandle } from "@arshad-shah/cynosure";

const area = useRef<ScrollAreaHandle>(null);
<ScrollArea
  label="Activity"
  follow
  handle={area}
  onAtBottomChange={setAtBottom}
  overlay={
    !atBottom && unseen > 0 && <Button onClick={() => area.current?.scrollToEnd()}>{`${unseen} new`}</Button>
  }
>
  {messages}
</ScrollArea>;
```

| Prop                  | Default    | Notes                                                                                                                    |
| --------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| `label`               | –          | Names the area as a region; it is then a tab stop whenever there is something to scroll                                  |
| `direction`           | `vertical` | `vertical` · `horizontal` · `both`; the other axis is clipped                                                            |
| `follow`              | `false`    | Keep the end in view while content is added; scrolling up lets go, scrolling back to the end follows again               |
| `onScroll`            | –          | Every scroll, with the scrolling element's event                                                                         |
| `onAtBottomChange`    | –          | `false` when the view leaves the end, `true` when it is back (by scrolling or by content growing past it). Starts `true` |
| `overlay`             | –          | Pinned at the bottom centre over the area, outside the region; it does not scroll                                        |
| `handle`              | –          | `scrollToEnd()` (resumes `follow`) and `scrollIntoView(element, { align })`, `align` `nearest` · `start` · `center`      |
| `className` / `style` | –          | Layout only                                                                                                              |
- **Filling:** the area is `flex: 1 1 0%` and 100% of its parent both ways, with a minimum size of 0, so in a flex column it takes what the header and footer leave and scrolls instead of making the page longer. In a parent with no height of its own it is as tall as its content (give it `style={{ maxBlockSize: … }}`).
- **Following** is shared with VirtualList (`useFollow` in `src/foundations/use-follow.ts`): only a move up releases it, so a fast stream never drops out on its own.
- **`scrollIntoView`** scrolls only the area, never the page around it, and works in right-to-left text.

## Accessibility

- With `label`, the scrolling element is a region with that name, and a tab stop (`tabindex="0"`) while its content is bigger than it, so keyboard users can scroll it (Page Up/Down, Home, End and the arrows: the browser's own keys). With nothing to scroll it is not a tab stop.
- Without `label` it is neither: use that only when the content has its own focusable elements (links, buttons, a list), since focusing them scrolls the area.
- The overlay is outside the region and in the tab order after it.

## Touch

A finger pans the area with the browser's own scrolling; nothing intercepts it. Controls in the overlay keep their own hit areas.

## Tokens

- `--cy-scroll-area-overlay-offset`: space between the bottom edge and the overlay (default `--cy-space-4`)
