# HtmlPreview

Untrusted HTML shown safely: an email body, an HTTP response, a template. It is drawn in a sandboxed frame (FrameBase, `sandbox=""`) whose document starts with a content security policy, so no script runs, forms go nowhere, and nothing loads except inline styles and pictures, fonts and media embedded in the HTML. Remote images are an opt-in: while they are blocked and the HTML refers to one, a Notice offers to show them.

```tsx
import { HtmlPreview } from "@arshad-shah/cynosure";

<HtmlPreview label="Response preview" html={body} />
<HtmlPreview label="Email" html={email} remoteImages={trusted} onRemoteImagesChange={setTrusted} ratio={4 / 3} />
```

| Prop                                                            | Default | Notes                                                                                       |
| --------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------- |
| `label`                                                         | –       | Names the frame                                                                             |
| `html`                                                          | –       | A whole document or a fragment; never trusted                                               |
| `remoteImages` / `defaultRemoteImages` / `onRemoteImagesChange` | `false` | Let `https:` pictures load                                                                  |
| `notice`                                                        | `true`  | While remote images are blocked and the HTML refers to one, a Notice with a button to allow |
| `ratio`                                                         | –       | Width divided by height of the frame; default height `--cy-html-preview-height`             |
| `labels`                                                        | –       | `blocked`, `allow`                                                                          |
| `className` / `style`                                           | –       | Layout only                                                                                 |
| `id`, `data-*`, `role`, `aria-*`, `ref`                         | –       | Set on the root element                                                                     |

## Behaviour

- **Sandbox.** The frame has every restriction (`sandbox=""`): scripts never run (tested, inline and in event attributes), forms do not submit, popups do not open, and the document is an origin of its own the page cannot reach. No referrer is sent.
- **Policy.** `htmlPolicy(remoteImages)` (exported) is written into the document before the HTML: `default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:; form-action 'none'; base-uri 'none'`, with `https:` added to `img-src` when remote images are on. Only pictures are ever let through; plain `http:` pictures stay blocked.
- **The notice.** Shown while remote images are blocked and the HTML refers to a remote picture (`src`, `srcset`, `poster`, `background` or a CSS `url()` or `@import`); links are not a reason. Its button turns remote images on (`onRemoteImagesChange(true)`).
- **Links.** A link pressed in the preview cannot open a window or leave the page; it can load inside the frame (still sandboxed).
- **Page.** HTML is written for a light page, so the frame's background is `--cy-html-preview-background` (white) in every theme.

## Tokens

- `--cy-html-preview-height`: height of the frame without `ratio` (default eight times `--cy-space-10`)
- `--cy-html-preview-background`: behind the document (default white)
- `--cy-html-preview-radius`: corner radius of the frame (default `--cy-radius-md`)
- `--cy-html-preview-gap`: space between the notice and the frame (default `--cy-space-3`)
