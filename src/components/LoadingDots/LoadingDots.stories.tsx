import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CynosureTheme } from "../../theme/index.js";
import { createTheme } from "../../tokens/index.js";
import { LoadingDots } from "./LoadingDots.js";

const meta = {
  title: "Components/LoadingDots",
  component: LoadingDots,
  args: { size: "md", tone: "inherit", speed: "normal" },
  argTypes: {
    size: { control: "inline-radio", options: ["inherit", "sm", "md", "lg"] },
    tone: {
      control: "select",
      options: ["inherit", "accent", "neutral", "muted", "danger", "success", "warning", "info"],
    },
    speed: { control: "inline-radio", options: ["slow", "normal", "fast"] },
    color: { control: "color" },
    label: { control: "text" },
  },
} satisfies Meta<typeof LoadingDots>;
export default meta;
type Story = StoryObj<typeof meta>;

const dots = (root: HTMLElement) => [...root.querySelectorAll(".cy-loading-dots-dot")] as HTMLElement[];

export const Default: Story = {
  tags: ["visual"],
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector(".cy-loading-dots") as HTMLElement;
    await expect(root).toHaveAttribute("aria-hidden", "true");
    await expect(root).not.toHaveAttribute("role");
    await expect(dots(canvasElement)).toHaveLength(3);
  },
};

export const Labelled: Story = {
  args: { label: "Saving document" },
  play: async ({ canvas }) => {
    const status = canvas.getByRole("status", { name: "Saving document" });
    await expect(status).not.toHaveAttribute("aria-hidden");
  },
};

export const PulsesInSequence: Story = {
  play: async ({ canvasElement }) => {
    const styles = dots(canvasElement).map((d) => getComputedStyle(d));
    for (const s of styles) await expect(s.animationName).toBe("cy-loading-dots-pulse");
    const delays = styles.map((s) => Number.parseFloat(s.animationDelay));
    await expect(delays[0]).toBeLessThan(delays[1] as number);
    await expect(delays[1]).toBeLessThan(delays[2] as number);
  },
};

export const ReducedMotion: Story = {
  render: () => (
    <CynosureTheme theme={createTheme({ motion: "reduced" })}>
      <LoadingDots size="lg" />
    </CynosureTheme>
  ),
  play: async ({ canvasElement }) => {
    await expect(dots(canvasElement)).toHaveLength(3);
    for (const d of dots(canvasElement)) {
      // Static, fully visible dots: reduced motion must never hide the indicator.
      await expect(getComputedStyle(d).opacity).toBe("1");
      await expect(d.getBoundingClientRect().width).toBeGreaterThan(4);
    }
  },
};

export const Sizes: Story = {
  tags: ["visual"],
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <LoadingDots key={size} size={size} data-testid={size} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const width = (id: string) => (dots(canvas.getByTestId(id))[0] as Element).getBoundingClientRect().width;
    await expect(width("sm")).toBeLessThan(width("md"));
    await expect(width("md")).toBeLessThan(width("lg"));
  },
};

export const Tones: Story = {
  tags: ["visual"],
  render: () => (
    <div style={{ display: "flex", gap: 24 }}>
      {(["accent", "neutral", "danger", "success"] as const).map((tone) => (
        <LoadingDots key={tone} tone={tone} size="lg" data-testid={tone} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const colour = (id: string) =>
      getComputedStyle(dots(canvas.getByTestId(id))[0] as Element).backgroundColor;
    const probe = document.createElement("span");
    canvas.getByTestId("accent").append(probe);
    probe.style.color = "var(--cy-color-accent)";
    await expect(colour("accent")).toBe(getComputedStyle(probe).color);
    probe.remove();
    await expect(new Set(["accent", "neutral", "danger", "success"].map(colour)).size).toBe(4);
  },
};

export const CustomColourAndSpeed: Story = {
  args: { color: "rgb(0, 128, 0)", speed: "slow", size: "lg" },
  play: async ({ canvasElement }) => {
    const [first] = dots(canvasElement);
    await expect(getComputedStyle(first as Element).backgroundColor).toBe("rgb(0, 128, 0)");
    const slow = Number.parseFloat(getComputedStyle(first as Element).animationDuration);
    await expect(slow).toBeGreaterThan(1.2);
  },
};

export const InheritsColourAndSize: Story = {
  render: () => (
    <div>
      <span data-testid="small" style={{ color: "rgb(255, 0, 0)", fontSize: 10 }}>
        <LoadingDots />
      </span>
      <span data-testid="large" style={{ fontSize: 30 }}>
        <LoadingDots />
      </span>
    </div>
  ),
  play: async ({ canvas }) => {
    const [small] = dots(canvas.getByTestId("small"));
    const [large] = dots(canvas.getByTestId("large"));
    await expect(getComputedStyle(small as Element).backgroundColor).toBe("rgb(255, 0, 0)");
    await expect((large as Element).getBoundingClientRect().width).toBeGreaterThan(
      (small as Element).getBoundingClientRect().width * 2.5,
    );
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-loading-dots-dot", [
      "width",
      "height",
      "border-radius",
      "display",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
