# DocumentViewport

A scrolling, zoomable document: pages one under another (a PDF, scanned pages, a slide deck), only those near the view rendered. Zoom by setting, by Ctrl/Cmd+wheel or a pinch around the pointer, or Ctrl/Cmd and = - 0; pan with Space+drag. It reports the pages in view and the current page, scrolls to a page or a spot on it, and announces zoom changes.

```tsx
import { DocumentViewport, ZoomControls, type ZoomSetting } from "@arshad-shah/cynosure";

const [zoom, setZoom] = useState<ZoomSetting>({ kind: "fit-width" });
const [scale, setScale] = useState(1);

<ZoomControls zoom={zoom} percent={scale * 100} onZoomChange={setZoom} />
<DocumentViewport
  label="Contract.pdf"
  pages={pages} // { id, width, height } at 100%
  zoom={zoom}
  onZoomChange={setZoom}
  onScaleChange={setScale}
  renderPage={({ id, scale, visibleRect }) => <PageCanvas id={id} scale={scale} only={visibleRect} />}
/>;
```

| Prop                                                           | Default   | Notes                                                                                                       |
| -------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------- |
| `label`                                                        | –         | Names the viewport                                                                                          |
| `pages`                                                        | –         | `{ id, width, height }` in CSS pixels at 100% (a PDF point is one); sizes may differ                        |
| `zoom` / `defaultZoom` / `onZoomChange`                        | fit-width | `{ kind: "fit-width" \| "fit-page", max? }` or `{ kind: "percent", value }` (25–800)                        |
| `renderPage`                                                   | –         | `({ id, index, scale, visible, visibleRect })`: draw the page at `scale`; `visibleRect` is the part in view |
| `onVisiblePagesChange`, `onCurrentPageChange`, `onScaleChange` | –         | The pages in view, the one most in view, and the scale the zoom came to                                     |
| `scrollTo`                                                     | –         | `{ id, nonce, rect?, focus? }`: a new `nonce` scrolls to the page, or centres `rect` on it                  |
| `labels`                                                       | –         | `page(n, total)`, `zoom(percent)`                                                                           |
- The viewport is a named region and a tab stop; each page is a group named "Page 3 of 12", focusable for go-to-page.
- Zooming keeps the point under the pointer (or the centre, from keys and buttons) in place.
- One finger scrolls; two fingers pinch. Give it a height: it fills its container, and its width never comes from the pages.
- The layout is left to right whatever the page's direction; page content sets its own.

## Tokens

- `--cy-document-viewport-background`, `--cy-document-viewport-gap`, `--cy-document-viewport-page-shadow`
