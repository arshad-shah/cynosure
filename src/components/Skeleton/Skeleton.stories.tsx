import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, waitFor } from "storybook/test";
import { contrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CynosureTheme } from "../../theme/CynosureTheme.js";
import { createTheme } from "../../tokens/index.js";
import { Button } from "../Button/Button.js";
import { Stack } from "../Stack/Stack.js";
import { Skeleton } from "./Skeleton.js";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  args: { shape: "text", lines: 3, size: "md" },
  argTypes: {
    shape: { control: "inline-radio", options: ["text", "block", "circle"] },
    lines: { control: { type: "number", min: 1, max: 8 } },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    width: { control: "text" },
    height: { control: "text" },
  },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}>{Story()}</div>],
} satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

const bones = (el: Element) => [...el.querySelectorAll(".cy-skeleton-bone")] as HTMLElement[];
const box = (el: Element) => el.getBoundingClientRect();

export const HiddenFromAssistiveTechnology: Story = {
  tags: ["visual"],
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector(".cy-skeleton") as HTMLElement;
    await expect(root).toHaveAttribute("aria-hidden", "true");
    // Nothing to read or to tab to: placeholders only.
    await expect(root.textContent).toBe("");
    await expect(bones(root)).toHaveLength(3);
  },
};

export const TextTakesTheHeightOfItsText: Story = {
  render: () => (
    <Stack gap="6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} style={{ display: "flex", gap: 16, alignItems: "flex-start" }} data-size={size}>
          <Skeleton lines={3} size={size} width="50%" />
          <p
            className="sample"
            style={{
              margin: 0,
              inlineSize: "50%",
              fontSize: `var(--cy-font-size-${size})`,
              lineHeight: "var(--cy-font-line-height)",
            }}
          >
            One
            <br />
            Two
            <br />
            Three
          </p>
        </div>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const heights: number[] = [];
    for (const row of canvasElement.querySelectorAll("[data-size]:not(.cy-skeleton)")) {
      const skeleton = box(row.querySelector(".cy-skeleton") as Element).height;
      const text = box(row.querySelector(".sample") as Element).height;
      // Swapping the skeleton for the real text does not move the layout.
      await expect(Math.abs(skeleton - text)).toBeLessThan(1);
      heights.push(skeleton);
    }
    await expect(heights[0]).toBeLessThan(heights[1] as number);
    await expect(heights[1]).toBeLessThan(heights[2] as number);
  },
};

export const LastLineIsShorter: Story = {
  render: () => (
    <Stack gap="6">
      <Skeleton lines={3} className="para" />
      <Skeleton lines={1} className="single" />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const [first, second, last] = bones(canvasElement.querySelector(".para") as Element).map(box);
    await expect(first?.width).toBe(second?.width);
    await expect(last?.width).toBeLessThan((first?.width as number) * 0.7);
    // A single line keeps the full width.
    const single = bones(canvasElement.querySelector(".single") as Element).map(box)[0];
    await expect(single?.width).toBe(first?.width);
  },
};

export const ShapesAndSizes: Story = {
  tags: ["visual"],
  render: () => (
    <Stack gap="6">
      <Skeleton shape="block" width="200px" height="120px" className="card" lines={4} />
      <Skeleton shape="circle" className="avatar" />
      <Skeleton shape="circle" height="64px" className="big-avatar" />
      <Skeleton shape="block" className="line-block" />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector(".card") as Element;
    // `lines` only applies to text.
    await expect(bones(card)).toHaveLength(1);
    await expect(box(card).width).toBeCloseTo(200, 0);
    await expect(box(card).height).toBeCloseTo(120, 0);
    for (const name of [".avatar", ".big-avatar"]) {
      const bone = bones(canvasElement.querySelector(name) as Element)[0] as HTMLElement;
      // Round, and as wide as it is tall.
      await expect(box(bone).width).toBeCloseTo(box(bone).height, 0);
      await expect(getComputedStyle(bone).borderTopLeftRadius).not.toBe("0px");
    }
    await expect(box(canvasElement.querySelector(".big-avatar") as Element).height).toBeCloseTo(64, 0);
    // A block without a height is one line tall.
    const line = Number.parseFloat(
      getComputedStyle(canvasElement.querySelector(".line-block") as Element).fontSize,
    );
    await expect(box(canvasElement.querySelector(".line-block") as Element).height).toBeCloseTo(
      line * 1.5,
      0,
    );
  },
};

export const SweepsWhileLoading: Story = {
  play: async ({ canvasElement }) => {
    for (const bone of bones(canvasElement)) {
      await expect(bone.getAnimations().length).toBeGreaterThan(0);
    }
  },
};

export const StaysStillUnderReducedMotion: Story = {
  render: (args) => (
    <CynosureTheme theme={createTheme({ motion: "reduced" })}>
      <Skeleton {...args} />
    </CynosureTheme>
  ),
  play: async ({ canvasElement }) => {
    for (const bone of bones(canvasElement)) {
      await expect(Number.parseFloat(getComputedStyle(bone).animationDuration)).toBe(0);
    }
  },
};

export const SweepsWithTheTextDirection: Story = {
  render: (args) => (
    <Stack gap="4">
      <div dir="ltr" className="ltr">
        <Skeleton {...args} lines={1} />
      </div>
      <div dir="rtl" className="rtl">
        <Skeleton {...args} lines={1} />
      </div>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const direction = (name: string) =>
      getComputedStyle(bones(canvasElement.querySelector(name) as Element)[0] as Element).animationDirection;
    await expect(direction(".ltr")).toBe("normal");
    await expect(direction(".rtl")).toBe("reverse");
  },
};

export const VisibleInLightAndDark: Story = {
  render: (args) => (
    <Stack gap="4">
      {(["light", "dark"] as const).map((mode) => (
        <CynosureTheme key={mode} mode={mode}>
          <div className="surface" style={{ background: "var(--cy-color-surface)", padding: 8 }}>
            <Skeleton {...args} />
          </div>
        </CynosureTheme>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    for (const surface of canvasElement.querySelectorAll(".surface")) {
      const fill = getComputedStyle(bones(surface)[0] as Element).backgroundColor;
      const page = getComputedStyle(surface).backgroundColor;
      // A placeholder, not content: it only needs to be seen, not to meet text contrast.
      await expect(contrast(fill, page)).toBeGreaterThan(1.1);
    }
  },
};

export const ReplacedWhenLoaded: Story = {
  render: () => {
    function Profile() {
      const [loaded, setLoaded] = useState(false);
      return (
        <Stack gap="4">
          <section aria-label="Profile" aria-busy={!loaded}>
            {loaded ? <p style={{ margin: 0 }}>Ada Lovelace</p> : <Skeleton width="12em" />}
          </section>
          <Button onClick={() => setLoaded(true)}>Load</Button>
        </Stack>
      );
    }
    return <Profile />;
  },
  play: async ({ canvas, userEvent }) => {
    const region = canvas.getByRole("region", { name: "Profile" });
    await expect(region).toHaveAttribute("aria-busy", "true");
    // The region is empty to assistive technology while it loads.
    await expect(region.textContent).toBe("");
    await userEvent.click(canvas.getByRole("button", { name: "Load" }));
    await waitFor(() => expect(region).toHaveAttribute("aria-busy", "false"));
    await expect(canvas.getByText("Ada Lovelace")).toBeVisible();
  },
};

export const DefaultsAndBadInput: Story = {
  render: () => (
    <Stack gap="4">
      <Skeleton className="plain" />
      <Skeleton className="zero" lines={0} />
      <Skeleton className="nan" lines={Number.NaN} />
      <Skeleton className="fraction" lines={2.7} />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const plain = canvasElement.querySelector(".plain") as HTMLElement;
    await expect(plain).toHaveAttribute("data-shape", "text");
    await expect(plain).toHaveAttribute("data-size", "md");
    await expect(bones(plain)).toHaveLength(1);
    // Full width by default.
    await expect(box(plain).width).toBeCloseTo(box(plain.parentElement as Element).width, 0);
    await expect(bones(canvasElement.querySelector(".zero") as Element)).toHaveLength(1);
    await expect(bones(canvasElement.querySelector(".nan") as Element)).toHaveLength(1);
    await expect(bones(canvasElement.querySelector(".fraction") as Element)).toHaveLength(2);
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    for (const selector of [".cy-skeleton", ".cy-skeleton-bone"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [
        "display",
        "height",
        "width",
        "font-size",
        "box-sizing",
        "background-color",
        "border-top-left-radius",
      ]);
      await expect(hostile).toEqual(clean);
    }
  },
};
