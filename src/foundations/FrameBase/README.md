# FrameBase (foundation)

The only module that renders a native `<iframe>`: a document from `srcDoc`, sandboxed with every restriction (`sandbox=""`: no scripts, forms, popups, same origin or top navigation) unless `sandbox` lists tokens, sent with no referrer, and named with `aria-label` (never a `title` tooltip).

```tsx
<FrameBase label="Response preview" srcDoc={html} />;
```

| Prop                  | Default | Notes                                                      |
| --------------------- | ------- | ---------------------------------------------------------- |
| `label`               | –       | The frame's accessible name                                |
| `srcDoc`              | –       | The document, as HTML                                      |
| `sandbox`             | `""`    | Sandbox tokens to allow; add them only for trusted content |
| `loading`             | `eager` | `lazy` waits until the frame is near the screen            |
| `className` / `style` | –       | Layout only                                                |

No visual opinions: composites style it. Used by HtmlPreview.
