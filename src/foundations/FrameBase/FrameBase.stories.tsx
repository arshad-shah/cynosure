import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { FrameBase } from "./FrameBase.js";

const meta = {
  title: "Foundations/FrameBase",
  component: FrameBase,
  args: { label: "Preview", srcDoc: "<p>Hello</p>" },
} satisfies Meta<typeof FrameBase>;
export default meta;
type Story = StoryObj<typeof meta>;

const frameOf = (el: Element) => el.querySelector("iframe") as HTMLIFrameElement;

export const SandboxedByDefault: Story = {
  play: async ({ canvasElement }) => {
    const frame = frameOf(canvasElement);
    // Named without a tooltip, with every sandbox restriction and no referrer.
    await expect(frame).toHaveAccessibleName("Preview");
    await expect(frame).not.toHaveAttribute("title");
    await expect(frame.getAttribute("sandbox")).toBe("");
    await expect(frame).toHaveAttribute("referrerpolicy", "no-referrer");
    // A sandboxed document is another origin: the page cannot reach into it.
    await waitFor(() => expect(frame.contentDocument).toBeNull());
  },
};

export const ScriptsDoNotRun: Story = {
  args: { srcDoc: `<script>parent.postMessage("ran", "*")</script>` },
  play: async () => {
    let ran = false;
    const listen = (e: MessageEvent) => {
      if (e.data === "ran") ran = true;
    };
    window.addEventListener("message", listen);
    await new Promise((r) => setTimeout(r, 300));
    window.removeEventListener("message", listen);
    await expect(ran).toBe(false);
  },
};

export const TokensWhenAsked: Story = {
  args: { srcDoc: `<script>parent.postMessage("allowed", "*")</script>`, sandbox: "allow-scripts" },
  play: async () => {
    const got = await new Promise<string>((resolve) => {
      const listen = (e: MessageEvent) => {
        window.removeEventListener("message", listen);
        resolve(String(e.data));
      };
      window.addEventListener("message", listen);
      setTimeout(() => resolve("nothing"), 2000);
    });
    await expect(got).toBe("allowed");
  },
};
