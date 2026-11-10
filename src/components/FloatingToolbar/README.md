# FloatingToolbar

Contextual toolbars for the thing being worked on: a compact bar that floats beside a box or a text selection (like the mini toolbars of document editors), and its phone form docked above the on-screen keyboard.

```tsx
import { DockedToolbar, FloatingToolbar, useSelectionAnchor } from "@arshad-shah/cynosure";

// Beside a box being edited (a ref or any { getBoundingClientRect } anchor):
<FloatingToolbar label="Field tools" anchor={fieldRef} onEscape={stopEditing}>…</FloatingToolbar>

// A formatting bubble over the selected text:
const anchor = useSelectionAnchor(editorRef);
<FloatingToolbar label="Format" anchor={anchor}>…</FloatingToolbar>

// On phones: one row above the keyboard, keeping the box in view.
<DockedToolbar label="Text style" keepVisible={fieldRef} trailing={<Button>Done</Button>}>…</DockedToolbar>;
```

| Prop (FloatingToolbar) | Default        | Notes                                                                                  |
| ---------------------- | -------------- | -------------------------------------------------------------------------------------- |
| `label`                | –              | Toolbar name                                                                           |
| `anchor`               | –              | A ref, or a virtual anchor (`useSelectionAnchor`, a pointer position); `null` hides it |
| `open`                 | while anchored | Show or hide                                                                           |
| `side`                 | `top`          | Preferred side; flips when there is no room                                            |
| `onEscape`             | –              | Escape inside the bar; focus then returns to where it came from                        |
| `hotkey`               | `alt+f10`      | Moves focus into the bar while it is open; `false` for none                            |

`DockedToolbar` takes `label`, `open`, `onEscape`, `hotkey`, `keepVisible` (a ref kept in view above the bar by scrolling the page) and `trailing` (pinned after the row).

- Both live in the top layer through the Popover API where they are rendered (nothing is added to `<body>`) and use Toolbar inside: one tab stop, arrow keys between controls.
- They never take focus by themselves; Alt+F10 moves in, Escape returns.
- The floating bar stays on screen and moves with its anchor (scrolls, resizes, layout changes). The docked bar never wraps (it scrolls sideways) and leaves room at the end of the page so the last content can scroll above it.

## Tokens

- `--cy-floating-toolbar-background`, `--cy-floating-toolbar-radius`, `--cy-floating-toolbar-offset`

## Used by

The PDF fill-and-sign editor's field and text-style bars in the tools app, and selection formatting in editors.
