# CameraView

A live camera: Start and Stop, a choice of camera, a torch switch where the camera has one, every frame offered to `onFrame` (a QR scanner reads it), and stills through `handle`. Failures (refused, missing, in use, unsupported) are explained in words. The stream is stopped whenever the camera is turned off, another camera is chosen, or the view leaves the page.

```tsx
import { CameraView, type CameraViewHandle } from "@arshad-shah/cynosure";

const camera = useRef<CameraViewHandle>(null);

<CameraView label="Scanner" onFrame={(video) => scan(video)} />
<CameraView label="Signature photo" handle={camera} />
const photo = await camera.current?.capture("image/jpeg", 0.9);
```

| Prop                                          | Default       | Notes                                                                                                           |
| --------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------- |
| `label`                                       | –             | Names the picture (and its stage)                                                                               |
| `active` / `defaultActive` / `onActiveChange` | `false`       | Whether the camera runs; `onActiveChange(false)` also when it fails to start                                    |
| `deviceId` / `onDeviceChange`                 | –             | The camera in use, chosen from the list (shown when there is more than one)                                     |
| `facingMode`                                  | `environment` | Which camera to ask for when none is chosen: `environment` (back) or `user` (selfie)                            |
| `mirror`                                      | for `user`    | Show the picture as a mirror                                                                                    |
| `torch` / `onTorchChange`                     | `false`       | The torch switch, shown when the camera has a torch                                                             |
| `onFrame`                                     | –             | Called with the video element for every new frame while running                                                 |
| `onError`                                     | –             | `{ kind, cause }`: `denied`, `not-found`, `in-use`, `unsupported` or `failed`                                   |
| `ratio`                                       | `4 / 3`       | Width divided by height of the picture                                                                          |
| `handle`                                      | –             | `capture(type?, quality?)` (a Blob), `frame()` (ImageData), `video()`                                           |
| `labels`                                      | –             | `start`, `stop`, `off`, `camera`, `unnamed(i)`, `torch`, `denied`, `notFound`, `inUse`, `unsupported`, `failed` |
| `className` / `style`                         | –             | Layout only                                                                                                     |

## Behaviour

- **Start and Stop.** Off at first: nothing is asked of the browser until Start is pressed (or `defaultActive`). Start asks for video only (`facingMode` as an ideal, or the chosen camera exactly). Stop ends every track, so the camera light goes out; the same button becomes Start again and keeps focus.
- **Cameras.** Once access is allowed, the cameras are listed by name in a Select (only when there are two or more), the one in use chosen. Choosing another stops the first stream before asking for the new one.
- **Torch.** Shown when the camera's track reports a torch; the switch applies `{ advanced: [{ torch }] }` and is applied again to each new stream that can take it.
- **Frames.** `onFrame(video)` runs once per new video frame (`requestVideoFrameCallback`, or each animation frame where it is missing) while the camera runs, and stops with it. `handle.capture()` and `handle.frame()` take the picture as it is now, at the camera's own size, or give null while it is off.
- **Failures.** A refusal, no camera, a camera held by another app or any other failure is shown in a danger Notice (`role="alert"`, so it is announced), reported to `onError`, and the camera is off again with Start ready to retry. Without camera support (an old browser, a page not on HTTPS) Start is disabled and a warning says so.
- **Mirror.** A selfie camera (`facingMode="user"`) is shown as a mirror; `capture()` and `frame()` are never mirrored.

## Tokens

- `--cy-camera-view-gap`: space between the picture, a message and the controls (default `--cy-space-4`)

The picture's stage uses the CanvasStage tokens.
