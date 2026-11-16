import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { CameraView, type CameraViewHandle } from "./CameraView.js";

/** A pretend camera: a canvas painted one colour, captured, with the track methods a real camera has. */
function fakeStream(deviceId: string, torch: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 48;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const paint = () => {
    ctx.fillStyle = deviceId === "back" ? "rgb(255, 0, 0)" : "rgb(0, 0, 255)";
    ctx.fillRect(0, 0, 64, 48);
  };
  paint();
  const timer = setInterval(paint, 50);
  const stream = canvas.captureStream(10);
  const track = stream.getVideoTracks()[0] as MediaStreamTrack & Record<string, unknown>;
  const stop = track.stop.bind(track);
  track.stop = () => {
    clearInterval(timer);
    stop();
  };
  track.getSettings = () => ({ deviceId }) as MediaTrackSettings;
  track.getCapabilities = () => (torch ? { torch: true } : {}) as MediaTrackCapabilities;
  track.applyConstraints = fakes.applyConstraints;
  return stream;
}

const fakes = {
  getUserMedia: fn(),
  applyConstraints: fn(async () => {}),
  streams: [] as MediaStream[],
};

/** Replaces `navigator.mediaDevices` for one story: two cameras by default, the back one with a torch. */
function withCameras({
  devices = [
    { deviceId: "back", label: "Back camera" },
    { deviceId: "front", label: "Front camera" },
  ],
  fail,
  missing = false,
}: {
  devices?: { deviceId: string; label: string }[];
  fail?: string;
  missing?: boolean;
} = {}) {
  return () => {
    const original = Object.getOwnPropertyDescriptor(navigator, "mediaDevices");
    fakes.getUserMedia = fn(async (constraints: MediaStreamConstraints) => {
      if (fail) throw new DOMException("No", fail);
      const video = constraints.video as MediaTrackConstraints;
      const exact = (video.deviceId as { exact?: string } | undefined)?.exact;
      const id = exact ?? (devices[0]?.deviceId as string);
      const stream = fakeStream(id, id === "back");
      fakes.streams.push(stream);
      return stream;
    });
    fakes.applyConstraints = fn(async () => {});
    fakes.streams = [];
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: missing
        ? undefined
        : {
            getUserMedia: fakes.getUserMedia,
            enumerateDevices: async () =>
              devices.map((d) => ({ ...d, kind: "videoinput", groupId: "" })) as MediaDeviceInfo[],
            addEventListener: () => {},
            removeEventListener: () => {},
          },
    });
    return () => {
      for (const s of fakes.streams) for (const t of s.getTracks()) t.stop();
      if (original) Object.defineProperty(navigator, "mediaDevices", original);
      else delete (navigator as unknown as Record<string, unknown>).mediaDevices;
    };
  };
}

const meta = {
  title: "Components/Controls/CameraView",
  component: CameraView,
  args: { label: "Camera", onActiveChange: fn(), onError: fn(), onDeviceChange: fn() },
  argTypes: {
    facingMode: { control: "inline-radio", options: ["environment", "user"] },
    ratio: { control: "number" },
    mirror: { control: "boolean" },
  },
  beforeEach: withCameras(),
  decorators: [(Story) => <div style={{ inlineSize: 360 }}>{Story()}</div>],
} satisfies Meta<typeof CameraView>;
export default meta;
type Story = StoryObj<typeof meta>;

const videoOf = (el: Element) => el.querySelector("video") as HTMLVideoElement;

export const StartAndStop: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    // Off at first: a message where the picture will be, and a Start button.
    await expect(canvas.getByText("The camera is off.")).toBeVisible();
    await expect(fakes.getUserMedia).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "Start camera" }));
    // It asks for the back camera, video only, and shows it.
    await expect(fakes.getUserMedia).toHaveBeenCalledWith({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
    await expect(args.onActiveChange).toHaveBeenLastCalledWith(true);
    const video = videoOf(canvasElement);
    await waitFor(() => expect(video.srcObject).toBe(fakes.streams[0]));
    await expect(video).toHaveAccessibleName("Camera");
    await expect(canvas.queryByText("The camera is off.")).toBeNull();
    // Stop ends the stream (the camera light goes out).
    await userEvent.click(canvas.getByRole("button", { name: "Stop camera" }));
    await expect(args.onActiveChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(fakes.streams[0]?.getVideoTracks()[0]?.readyState).toBe("ended"));
    await expect(video.srcObject).toBeNull();
    await expect(canvas.getByRole("button", { name: "Start camera" })).toHaveFocus();
  },
};

export const ChooseACamera: Story = {
  args: { defaultActive: true },
  play: async ({ args, canvas, userEvent }) => {
    // Once the camera is on, the cameras are listed by name, the one in use chosen.
    const select = await canvas.findByRole("combobox", { name: "Camera" });
    await waitFor(() => expect(select).toHaveTextContent("Back camera"));
    await userEvent.click(select);
    await userEvent.click(await canvas.findByRole("option", { name: "Front camera" }));
    await expect(args.onDeviceChange).toHaveBeenLastCalledWith("front");
    // The new camera is asked for by id, and the old one is stopped.
    await waitFor(() =>
      expect(fakes.getUserMedia).toHaveBeenLastCalledWith({
        video: { deviceId: { exact: "front" } },
        audio: false,
      }),
    );
    await waitFor(() => expect(fakes.streams[0]?.getVideoTracks()[0]?.readyState).toBe("ended"));
    await waitFor(() => expect(select).toHaveTextContent("Front camera"));
  },
};

export const OneCameraNoChoice: Story = {
  args: { defaultActive: true },
  beforeEach: withCameras({ devices: [{ deviceId: "back", label: "Back camera" }] }),
  play: async ({ canvas, canvasElement }) => {
    await waitFor(() => expect(videoOf(canvasElement).srcObject).not.toBeNull());
    await expect(canvas.queryByRole("combobox", { name: "Camera" })).toBeNull();
  },
};

export const TorchWhereTheCameraHasOne: Story = {
  args: { defaultActive: true, onTorchChange: fn() },
  play: async ({ args, canvas, userEvent }) => {
    // The back camera has a torch: a switch turns it on and off.
    const torch = await canvas.findByRole("switch", { name: "Torch" });
    await expect(torch).not.toBeChecked();
    await userEvent.click(torch);
    await expect(fakes.applyConstraints).toHaveBeenLastCalledWith({ advanced: [{ torch: true }] });
    await expect(args.onTorchChange).toHaveBeenLastCalledWith(true);
    await expect(torch).toBeChecked();
    // The front camera has none: the switch goes.
    await userEvent.click(canvas.getByRole("combobox", { name: "Camera" }));
    await userEvent.click(await canvas.findByRole("option", { name: "Front camera" }));
    await waitFor(() => expect(canvas.queryByRole("switch", { name: "Torch" })).toBeNull());
  },
};

export const PermissionRefused: Story = {
  beforeEach: withCameras({ fail: "NotAllowedError" }),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Start camera" }));
    // The reason is shown and announced, and Start is back to try again.
    const alert = await canvas.findByRole("alert");
    await expect(alert).toHaveTextContent(
      "Camera access was refused. Allow it in your browser's site settings, then try again.",
    );
    await expect(args.onError).toHaveBeenLastCalledWith(expect.objectContaining({ kind: "denied" }));
    await expect(args.onActiveChange).toHaveBeenLastCalledWith(false);
    await expect(canvas.getByRole("button", { name: "Start camera" })).toBeEnabled();
  },
};

export const EveryFailureHasItsWords: Story = {
  render: (args) => <CameraView {...args} />,
  beforeEach: withCameras({ fail: "NotReadableError" }),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Start camera" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent("The camera is in use by another app.");
    await expect(args.onError).toHaveBeenLastCalledWith(expect.objectContaining({ kind: "in-use" }));
  },
};

export const NoCameraFound: Story = {
  beforeEach: withCameras({ fail: "NotFoundError" }),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Start camera" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent("No camera was found.");
  },
};

export const NoCameraSupport: Story = {
  beforeEach: withCameras({ missing: true }),
  play: async ({ canvas }) => {
    // Without camera support (or on an insecure page) Start is disabled and the reason shown.
    await expect(await canvas.findByText("This browser cannot use a camera here.")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Start camera" })).toBeDisabled();
  },
};

export const FramesAndCapture: Story = {
  render: (args) => {
    function Scanner() {
      const camera = useRef<CameraViewHandle>(null);
      return (
        <>
          <CameraView {...args} handle={camera} defaultActive />
          <Button
            onClick={async () => {
              const blob = await camera.current?.capture();
              const pixels = camera.current?.frame();
              const out = document.querySelector('[data-testid="shot"]') as HTMLElement;
              out.textContent = JSON.stringify({
                type: blob?.type,
                big: (blob?.size ?? 0) > 0,
                width: pixels?.width,
                red: pixels?.data[0],
              });
            }}
          >
            Take a photo
          </Button>
          <output data-testid="shot" />
        </>
      );
    }
    return <Scanner />;
  },
  args: { onFrame: fn() },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const video = videoOf(canvasElement);
    await waitFor(() => expect(video.videoWidth).toBe(64), { timeout: 3000 });
    // Each frame is offered while the camera runs (a QR scanner reads it).
    await waitFor(() => expect(args.onFrame).toHaveBeenCalledWith(video));
    // The handle takes a still: a PNG, and the pixels.
    await userEvent.click(canvas.getByRole("button", { name: "Take a photo" }));
    await waitFor(() =>
      expect(JSON.parse(canvas.getByTestId("shot").textContent || "{}")).toEqual({
        type: "image/png",
        big: true,
        width: 64,
        red: 255,
      }),
    );
    // Stopped, no more frames.
    await userEvent.click(canvas.getByRole("button", { name: "Stop camera" }));
    const count = (args.onFrame as ReturnType<typeof fn>).mock.calls.length;
    await new Promise((r) => setTimeout(r, 300));
    await expect((args.onFrame as ReturnType<typeof fn>).mock.calls.length).toBe(count);
  },
};

export const MirroredForAFrontCamera: Story = {
  args: { defaultActive: true, facingMode: "user" },
  play: async ({ canvasElement }) => {
    await expect(fakes.getUserMedia).toHaveBeenCalledWith({
      video: { facingMode: { ideal: "user" } },
      audio: false,
    });
    // A selfie camera is shown as a mirror, as people expect.
    await expect(getComputedStyle(videoOf(canvasElement)).scale).toBe("-1 1");
  },
};

export const Labels: Story = {
  args: {
    labels: {
      start: "Kamera starten",
      stop: "Kamera stoppen",
      off: "Die Kamera ist aus.",
      camera: "Kamera",
      torch: "Licht",
    },
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText("Die Kamera ist aus.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Kamera starten" }));
    await expect(await canvas.findByRole("combobox", { name: "Kamera" })).toBeVisible();
    await expect(await canvas.findByRole("switch", { name: "Licht" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Kamera stoppen" })).toBeVisible();
  },
};

export const TouchTargets: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas }) => {
    const start = canvas.getByRole("button", { name: "Start camera" });
    await expect(Number.parseFloat(getComputedStyle(start, "::before").height)).toBeGreaterThanOrEqual(44);
  },
};

export const StableUnderHostileHost: Story = {
  args: { defaultActive: true },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(videoOf(canvasElement).srcObject).not.toBeNull());
    for (const selector of [".cy-camera-view", ".cy-camera-view-video"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [
        "display",
        "width",
        "height",
        "box-sizing",
        "object-fit",
        "font-size",
      ]);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
