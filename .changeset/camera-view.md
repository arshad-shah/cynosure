---
"@arshad-shah/cynosure": minor
---

CameraView (new): a live camera with Start and Stop, a choice of camera, a torch switch where the camera has one, `onFrame` for every frame (a scanner) and `handle.capture()` / `handle.frame()` for stills. Refused, missing, busy and unsupported cameras are explained through typed `labels` and reported to `onError`. VideoBase (new foundation) is the one place a `<video>` is rendered: a MediaStream, muted and inline.
