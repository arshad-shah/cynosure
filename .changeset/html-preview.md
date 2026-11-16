---
"@arshad-shah/cynosure": minor
---

HtmlPreview (new): untrusted HTML (an email, an HTTP response) in a frame with every sandbox restriction and a content security policy (`htmlPolicy`), so no script runs and nothing loads but embedded pictures. Remote images are an opt-in (`remoteImages`, `onRemoteImagesChange`), offered by a Notice when the HTML refers to one. FrameBase (new foundation) is the one place an `<iframe>` is rendered, sandboxed by default; `cy check` now keeps `<iframe>` and `<video>` to foundations.
