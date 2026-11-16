import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, waitFor } from "storybook/test";
import { VideoBase } from "./VideoBase.js";

/** A live stream that needs no camera: a canvas painted red, captured. */
function redStream() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 48;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const paint = () => {
    ctx.fillStyle = "rgb(255, 0, 0)";
    ctx.fillRect(0, 0, 64, 48);
  };
  paint();
  const stream = canvas.captureStream(10);
  const timer = setInterval(paint, 50);
  return { stream, stop: () => clearInterval(timer) };
}

const meta = {
  title: "Foundations/VideoBase",
  component: VideoBase,
  args: { label: "Camera", stream: null },
} satisfies Meta<typeof VideoBase>;
export default meta;
type Story = StoryObj<typeof meta>;

export const PlaysAStreamMutedAndInline: Story = {
  render: () => {
    function Player() {
      const [live, setLive] = useState<ReturnType<typeof redStream> | null>(null);
      return (
        <>
          <button type="button" onClick={() => setLive(live ? null : redStream())}>
            Toggle
          </button>
          <VideoBase label="Camera" stream={live?.stream ?? null} style={{ width: 64, height: 48 }} />
        </>
      );
    }
    return <Player />;
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const video = canvasElement.querySelector("video") as HTMLVideoElement;
    await expect(video).toHaveAccessibleName("Camera");
    await expect(video.muted).toBe(true);
    await expect(video).toHaveAttribute("playsinline");
    await expect(video).not.toHaveAttribute("controls");
    await expect(video.srcObject).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Toggle" }));
    // The stream is set and plays: frames arrive.
    await waitFor(() => expect(video.srcObject).toBeInstanceOf(MediaStream));
    await waitFor(() => expect(video.videoWidth).toBe(64), { timeout: 3000 });
    await waitFor(() => expect(video.paused).toBe(false));
    await userEvent.click(canvas.getByRole("button", { name: "Toggle" }));
    await waitFor(() => expect(video.srcObject).toBeNull());
  },
};
