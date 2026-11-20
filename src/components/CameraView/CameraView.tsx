import {
  type CSSProperties,
  forwardRef,
  type Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { RootAttributes } from "../../foundations/attributes.js";
import { useControllableState } from "../../foundations/controllable.js";
import { VideoBase } from "../../foundations/VideoBase/VideoBase.js";
import { camera } from "../../icons/camera.js";
import { stop } from "../../icons/stop.js";
import { Button } from "../Button/Button.js";
import { CanvasStage } from "../CanvasStage/CanvasStage.js";
import { Notice } from "../Notice/Notice.js";
import { Select } from "../Select/Select.js";
import { Switch } from "../Switch/Switch.js";
import { Text } from "../Text/Text.js";

export interface CameraViewTokens {
  /** Space between the picture, a message and the controls. */
  gap: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    cameraView: CameraViewTokens;
  }
}

/** Why the camera could not start, or (`lost`) why it stopped on its own. */
export type CameraErrorKind = "denied" | "not-found" | "in-use" | "unsupported" | "failed" | "lost";

export interface CameraError {
  kind: CameraErrorKind;
  /** What the browser threw, when it threw. */
  cause?: unknown;
}

export interface CameraViewLabels {
  /** The Start button. Default "Start camera". */
  start: string;
  /** The Stop button. Default "Stop camera". */
  stop: string;
  /** Shown where the picture goes while the camera is off. Default "The camera is off." */
  off: string;
  /** The camera choice. Default "Camera". */
  camera: string;
  /** A camera without a name of its own (before permission). Default "Camera 2". */
  unnamed: (index: number) => string;
  /** The torch switch. Default "Torch". */
  torch: string;
  /** Access refused. */
  denied: string;
  /** No camera. */
  notFound: string;
  /** Another app holds the camera. */
  inUse: string;
  /** No camera support here (an old browser, or a page not served over HTTPS). */
  unsupported: string;
  /** Anything else. */
  failed: string;
  /** The camera stopped while running (unplugged, or access taken back). */
  lost: string;
}

export interface CameraViewHandle {
  /** The picture now as an image file (PNG unless `type` says otherwise), or null while the camera is off. */
  capture: (type?: string, quality?: number) => Promise<Blob | null>;
  /** The picture now as pixels (for a QR decoder), or null while the camera is off. */
  frame: () => ImageData | null;
  /** The video element itself, for a library that reads it. */
  video: () => HTMLVideoElement | null;
}

export interface CameraViewProps extends RootAttributes {
  /** Names the picture ("Camera", "Scanner"). */
  label: string;
  /** Whether the camera runs, when you control it. */
  active?: boolean | undefined;
  /** Whether it starts running, when uncontrolled. Default false: people press Start. */
  defaultActive?: boolean;
  /** Called when Start or Stop is pressed, and with false when the camera fails to start. */
  onActiveChange?: ((active: boolean) => void) | undefined;
  /** The camera in use (a `deviceId`), when you control it. */
  deviceId?: string | undefined;
  /** Called when another camera is chosen. */
  onDeviceChange?: ((deviceId: string) => void) | undefined;
  /** Which camera to ask for when none is chosen: `environment` (the back one) or `user` (the selfie one). */
  facingMode?: "environment" | "user";
  /** Show the picture as a mirror. Default: true for `facingMode="user"`. */
  mirror?: boolean | undefined;
  /** Whether the torch is on, when you control it. */
  torch?: boolean | undefined;
  /** Called when the torch switch is flipped. */
  onTorchChange?: ((on: boolean) => void) | undefined;
  /** Called with the video element for every new frame while the camera runs (a QR scanner reads it). */
  onFrame?: ((video: HTMLVideoElement) => void) | undefined;
  /**
   * Called when the camera fails to start, or with `lost` when it stops on its own (unplugged, access taken back),
   * with why. The reason is also shown, and the camera is turned off.
   */
  onError?: ((error: CameraError) => void) | undefined;
  /** Width divided by height of the picture. Default 4 / 3. */
  ratio?: number | string;
  /** `capture()`, `frame()` and `video()`, for taking stills. */
  handle?: Ref<CameraViewHandle>;
  /** Replace the built-in English text: the buttons, the camera choice, the torch and the error messages. */
  labels?: Partial<CameraViewLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-camera-view-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: CameraViewLabels = {
  start: "Start camera",
  stop: "Stop camera",
  off: "The camera is off.",
  camera: "Camera",
  unnamed: (index) => `Camera ${index}`,
  torch: "Torch",
  denied: "Camera access was refused. Allow it in your browser's site settings, then try again.",
  notFound: "No camera was found.",
  inUse: "The camera is in use by another app.",
  unsupported: "This browser cannot use a camera here.",
  failed: "The camera could not start.",
  lost: "The camera stopped. Check that it is connected, then try again.",
};
const MESSAGES: Record<CameraErrorKind, keyof CameraViewLabels> = {
  denied: "denied",
  "not-found": "notFound",
  "in-use": "inUse",
  unsupported: "unsupported",
  failed: "failed",
  lost: "lost",
};

/** Sorts what getUserMedia threw into a reason people can act on. */
function kindOf(error: unknown): CameraErrorKind {
  const name = (error as { name?: string } | null)?.name;
  if (name === "NotAllowedError" || name === "SecurityError" || name === "PermissionDeniedError")
    return "denied";
  if (name === "NotFoundError" || name === "OverconstrainedError" || name === "DevicesNotFoundError")
    return "not-found";
  if (name === "NotReadableError" || name === "TrackStartError" || name === "AbortError") return "in-use";
  return "failed";
}

const supported = () => typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

interface Device {
  deviceId: string;
  label: string;
}

/**
 * A live camera: Start and Stop, a choice of camera, a torch switch where the camera has one, every frame offered to
 * `onFrame`, and stills through `handle`. Failures (refused, missing, in use, unsupported) are explained in words.
 * The stream is stopped whenever the camera is turned off or the view leaves the page.
 */
export const CameraView = forwardRef<HTMLDivElement, CameraViewProps>(function CameraView(
  {
    label,
    active,
    defaultActive = false,
    onActiveChange,
    deviceId,
    onDeviceChange,
    facingMode = "environment",
    mirror,
    torch,
    onTorchChange,
    onFrame,
    onError,
    ratio = 4 / 3,
    handle,
    labels,
    className,
    style,
    ...rest
  },
  ref,
) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [on, setOn] = useControllableState(active, defaultActive, onActiveChange);
  const [chosen, setChosen] = useControllableState(deviceId, undefined as string | undefined, onDeviceChange);
  const [lit, setLit] = useControllableState(torch, false, onTorchChange);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState<CameraErrorKind | null>(null);
  const [canTorch, setCanTorch] = useState(false);
  const [usable, setUsable] = useState(true);
  const video = useRef<HTMLVideoElement>(null);
  const latest = useRef({ onError, onFrame, setOn });
  latest.current = { onError, onFrame, setOn };

  // Support is known only in the browser: decide after mount, so the server and the first render agree.
  useEffect(() => setUsable(supported()), []);

  // The stream follows `on` and the camera chosen; each change stops the stream before.
  useEffect(() => {
    if (!on) return;
    if (!supported()) {
      setError("unsupported");
      latest.current.onError?.({ kind: "unsupported" });
      latest.current.setOn(false);
      return;
    }
    let live: MediaStream | null = null;
    let gone = false;
    const video: MediaTrackConstraints = chosen
      ? { deviceId: { exact: chosen } }
      : { facingMode: { ideal: facingMode } };
    navigator.mediaDevices.getUserMedia({ video, audio: false }).then(
      async (got) => {
        if (gone) {
          for (const t of got.getTracks()) t.stop();
          return;
        }
        live = got;
        setError(null);
        setStream(got);
        const track = got.getVideoTracks()[0];
        // A camera unplugged, or access taken back, ends the track: say so and turn off, not a black picture.
        // Through the handler property: Firefox ran it but not an `addEventListener` listener on the same track.
        if (track)
          track.onended = () => {
            if (gone) return;
            setError("lost");
            latest.current.onError?.({ kind: "lost" });
            latest.current.setOn(false);
          };
        setCanTorch(!!(track?.getCapabilities?.() as { torch?: boolean } | undefined)?.torch);
        // Names are only given once access is allowed, so list the cameras now.
        const list = (await navigator.mediaDevices.enumerateDevices?.()) ?? [];
        if (gone) return;
        setDevices(
          list
            .filter((d) => d.kind === "videoinput")
            .map((d, i) => ({ deviceId: d.deviceId, label: d.label || text.unnamed(i + 1) })),
        );
      },
      (cause: unknown) => {
        if (gone) return;
        const kind = kindOf(cause);
        setError(kind);
        latest.current.onError?.({ kind, cause });
        latest.current.setOn(false);
      },
    );
    return () => {
      gone = true;
      for (const t of live?.getTracks() ?? []) {
        t.onended = null;
        t.stop();
      }
      setStream(null);
      setCanTorch(false);
    };
    // `text.unnamed` is read once per stream; a new labels object should not restart the camera.
  }, [on, chosen, facingMode]);

  // A torch setting is applied to each new stream that can take it.
  useEffect(() => {
    const track = stream?.getVideoTracks()[0];
    if (!track || !canTorch) return;
    track.applyConstraints({ advanced: [{ torch: lit } as MediaTrackConstraintSet] }).catch(() => {});
  }, [stream, canTorch, lit]);

  // Frames, while running: once per new video frame where the browser says so, else once per animation frame.
  useEffect(() => {
    const el = video.current;
    if (!stream || !el || !onFrame) return;
    let stopped = false;
    let id = 0;
    const byVideo = !!el.requestVideoFrameCallback;
    const each = byVideo
      ? (fn: () => void) => {
          id = el.requestVideoFrameCallback(fn);
        }
      : (fn: () => void) => {
          id = requestAnimationFrame(fn);
        };
    const tick = () => {
      if (stopped) return;
      if (el.readyState >= 2) latest.current.onFrame?.(el);
      each(tick);
    };
    each(tick);
    return () => {
      stopped = true;
      // Each kind of handle is cancelled by its own function: the number may also be another script's frame.
      if (byVideo) el.cancelVideoFrameCallback(id);
      else cancelAnimationFrame(id);
    };
  }, [stream, onFrame !== undefined]);

  useImperativeHandle(handle, () => {
    const draw = () => {
      const el = video.current;
      if (!el || !stream || !el.videoWidth) return null;
      const canvas = document.createElement("canvas");
      canvas.width = el.videoWidth;
      canvas.height = el.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx?.drawImage(el, 0, 0);
      return ctx ? { canvas, ctx } : null;
    };
    return {
      capture: (type = "image/png", quality) => {
        const drawn = draw();
        return drawn
          ? new Promise<Blob | null>((resolve) => drawn.canvas.toBlob(resolve, type, quality))
          : Promise.resolve(null);
      },
      frame: () => {
        const drawn = draw();
        return drawn ? drawn.ctx.getImageData(0, 0, drawn.canvas.width, drawn.canvas.height) : null;
      },
      video: () => video.current,
    };
  }, [stream]);

  const inUse = stream?.getVideoTracks()[0]?.getSettings().deviceId ?? chosen;
  const problem = !usable ? "unsupported" : error;
  return (
    <div
      ref={ref}
      {...rest}
      className={className ? `cy-camera-view ${className}` : "cy-camera-view"}
      data-mirror={(mirror ?? facingMode === "user") ? "" : undefined}
      style={style}
    >
      <CanvasStage
        label={label}
        ratio={ratio}
        overlay={
          stream ? undefined : (
            <Text tone="muted" align="center">
              {text.off}
            </Text>
          )
        }
      >
        <VideoBase ref={video} label={label} stream={stream} className="cy-camera-view-video" />
      </CanvasStage>
      {problem && (
        <Notice tone={problem === "unsupported" ? "warning" : "danger"} size="sm">
          {text[MESSAGES[problem]] as string}
        </Notice>
      )}
      <div className="cy-camera-view-controls cy-reset">
        <Button
          variant={on ? "outline" : "solid"}
          icon={on ? stop : camera}
          disabled={!usable}
          onClick={() => {
            setError(null);
            setOn(!on);
          }}
        >
          {on ? text.stop : text.start}
        </Button>
        {devices.length > 1 && (
          <Select
            label={text.camera}
            labelHidden
            options={devices.map((d) => ({ value: d.deviceId, label: d.label }))}
            {...(inUse !== undefined && { value: inUse })}
            onChange={(id) => setChosen(id)}
            className="cy-camera-view-choice"
          />
        )}
        {canTorch && <Switch label={text.torch} checked={lit} onChange={(next) => setLit(next)} />}
      </div>
    </div>
  );
});
