import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { emulateMedia } from "../../test/media.js";
import { CynosureTheme } from "../../theme/index.js";
import { createTheme } from "../../tokens/index.js";
import { Button } from "../Button/Button.js";
import { LoadingDots } from "./LoadingDots.js";

const meta = {
  tags: ["serial"],
  title: "Components/LoadingDots",
  component: LoadingDots,
  args: { size: "md", tone: "inherit", speed: "normal", variant: "dots" },
  argTypes: {
    variant: { control: "inline-radio", options: ["dots", "spinner"] },
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

const spinner = (root: Element) => root.querySelector(".cy-loading-dots-spinner") as SVGSVGElement | null;
/** The spinner's current rotation in degrees, read from its computed transform matrix. */
const angle = (el: Element) => {
  const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
  return Math.round((Math.atan2(m.b, m.a) * 180) / Math.PI);
};
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const Spinner: Story = {
  tags: ["visual"],
  args: { variant: "spinner" },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector(".cy-loading-dots") as HTMLElement;
    const svg = spinner(canvasElement);
    // The loader icon instead of the three dots, decorative like the dots.
    await expect(svg).not.toBeNull();
    await expect(dots(canvasElement)).toHaveLength(0);
    await expect(root).toHaveAttribute("aria-hidden", "true");
    await expect(root).toHaveAttribute("data-variant", "spinner");
    // It turns, continuously.
    const style = getComputedStyle(svg as Element);
    await expect(style.animationName).toBe("cy-loading-dots-spin");
    await expect(style.animationIterationCount).toBe("infinite");
    const first = angle(svg as Element);
    await waitFor(() => expect(angle(svg as Element)).not.toBe(first));
  },
};

export const SpinnerLabelled: Story = {
  args: { variant: "spinner", label: "Running query" },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("status", { name: "Running query" })).toBeInTheDocument();
    // The icon itself stays decorative: the status carries the name.
    await expect(spinner(canvasElement)).toHaveAttribute("aria-hidden", "true");
  },
};

export const SpinnerSizesAndColour: Story = {
  tags: ["visual"],
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <LoadingDots key={size} variant="spinner" size={size} data-testid={size} />
      ))}
      <LoadingDots variant="spinner" size="lg" tone="danger" data-testid="danger" />
      <LoadingDots variant="spinner" size="lg" color="rgb(0, 128, 0)" data-testid="green" />
      <span data-testid="text" style={{ color: "rgb(255, 0, 0)", fontSize: 30 }}>
        <LoadingDots variant="spinner" />
      </span>
    </div>
  ),
  play: async ({ canvas }) => {
    const svg = (id: string) => spinner(canvas.getByTestId(id)) as SVGSVGElement;
    // Laid-out width, not the on-screen box, which widens as the square turns.
    const width = (id: string) => Number.parseFloat(getComputedStyle(svg(id)).width);
    // Icon-sized: one em of its size.
    await expect(width("sm")).toBeCloseTo(12, 0);
    await expect(width("md")).toBeCloseTo(16, 0);
    await expect(width("lg")).toBeCloseTo(24, 0);
    await expect(width("text")).toBeCloseTo(30, 0);
    // The stroke is the current colour: inherited, a tone, or a one-off colour.
    await expect(getComputedStyle(svg("text")).stroke).toBe("rgb(255, 0, 0)");
    await expect(getComputedStyle(svg("green")).stroke).toBe("rgb(0, 128, 0)");
    const probe = document.createElement("span");
    canvas.getByTestId("danger").append(probe);
    probe.style.color = "var(--cy-color-danger)";
    await expect(getComputedStyle(svg("danger")).stroke).toBe(getComputedStyle(probe).color);
    probe.remove();
  },
};

export const SpinnerSpeed: Story = {
  render: () => (
    <div>
      <LoadingDots variant="spinner" speed="slow" data-testid="slow" />
      <LoadingDots variant="spinner" data-testid="normal" />
      <LoadingDots variant="spinner" speed="fast" data-testid="fast" />
    </div>
  ),
  play: async ({ canvas }) => {
    const time = (id: string) =>
      Number.parseFloat(getComputedStyle(spinner(canvas.getByTestId(id)) as Element).animationDuration);
    await expect(time("slow")).toBeGreaterThan(time("normal"));
    await expect(time("normal")).toBeGreaterThan(time("fast"));
  },
};

export const SpinnerInButton: Story = {
  render: () => (
    <Button data-testid="button">
      <LoadingDots variant="spinner" className="connect-spinner" /> Connecting
    </Button>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByTestId("button");
    const svg = spinner(button) as SVGSVGElement;
    // className lands on the root, for layout.
    await expect(svg.parentElement).toHaveClass("cy-loading-dots", "connect-spinner");
    // Sits on the text's line, sized like its text and coloured like it.
    const size = Number.parseFloat(getComputedStyle(button).fontSize);
    // Its laid-out width: the on-screen box of a square mid-turn is wider than the square.
    await expect(Number.parseFloat(getComputedStyle(svg).width)).toBeCloseTo(size, 0);
    await expect(getComputedStyle(svg).stroke).toBe(getComputedStyle(button).color);
    // A Button plays its icons' hover motion; the spinner has none to add to its turning.
    await expect(svg).not.toHaveAttribute("data-motion");
  },
};

export const SpinnerReducedMotionTheme: Story = {
  render: () => (
    <CynosureTheme theme={createTheme({ motion: "reduced" })}>
      <LoadingDots variant="spinner" size="lg" />
    </CynosureTheme>
  ),
  play: async ({ canvasElement }) => {
    const svg = spinner(canvasElement) as SVGSVGElement;
    // Still and visible: the indicator stays, the motion stops.
    await expect(Number.parseFloat(getComputedStyle(svg).animationDuration)).toBe(0);
    const first = angle(svg);
    await pause(150);
    await expect(angle(svg)).toBe(first);
    await expect(svg.getBoundingClientRect().width).toBeGreaterThan(20);
  },
};

export const SpinnerReducedMotion: Story = {
  tags: ["!dev"],
  args: { variant: "spinner", size: "lg" },
  play: async ({ canvasElement }) => {
    const svg = spinner(canvasElement) as SVGSVGElement;
    await expect(Number.parseFloat(getComputedStyle(svg).animationDuration)).toBeGreaterThan(0);
    if (!(await emulateMedia({ reducedMotion: "reduce" }))) return;
    try {
      await waitFor(() => expect(getComputedStyle(svg).animationDuration).toBe("0s"));
      const first = angle(svg);
      await pause(150);
      await expect(angle(svg)).toBe(first);
      await expect(getComputedStyle(svg).opacity).toBe("1");
    } finally {
      await emulateMedia({ reducedMotion: null });
    }
  },
};

export const SpinnerStableUnderHostileHost: Story = {
  args: { variant: "spinner" },
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-loading-dots-spinner", [
      "width",
      "height",
      "display",
      "animation-name",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
