import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { check } from "../../icons/index.js";
import { textContrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Badge } from "./Badge.js";

const TONES = ["accent", "neutral", "danger", "success", "warning", "info"] as const;
const VARIANTS = ["soft", "solid", "outline"] as const;

const meta = {
  title: "Components/Badge",
  component: Badge,
  args: { children: "Object", tone: "accent", variant: "soft", size: "md" },
  argTypes: {
    tone: { control: "select", options: TONES },
    variant: { control: "inline-radio", options: VARIANTS },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    children: { control: "text" },
  },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const EveryToneAndVariantIsReadable: Story = {
  tags: ["visual"],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, max-content)", gap: 10 }}>
      {TONES.flatMap((tone) =>
        VARIANTS.map((variant) => (
          <Badge
            key={`${tone}-${variant}`}
            tone={tone}
            variant={variant}
            icon={tone === "success" ? check : undefined}
          >
            {tone}
          </Badge>
        )),
      )}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const badges = [...canvasElement.querySelectorAll(".cy-badge")];
    await expect(badges).toHaveLength(18);
    for (const badge of badges)
      await expect({ text: badge.textContent, readable: textContrast(badge) >= 4.5 }).toEqual({
        text: badge.textContent,
        readable: true,
      });
  },
};

export const CategoryColours: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <Badge color="rgb(47 125 74)">GET</Badge>
      <Badge color="rgb(194 65 12)" variant="solid">
        DELETE
      </Badge>
      <Badge color="rgb(47 102 176)" variant="outline">
        PUT
      </Badge>
    </div>
  ),
  play: async ({ canvas }) => {
    const get = canvas.getByText("GET");
    const put = canvas.getByText("PUT");
    // Each takes its own colour; text stays readable (darker than the raw colour on the tinted background).
    await expect(getComputedStyle(get).backgroundColor).not.toBe(getComputedStyle(put).backgroundColor);
    await expect(getComputedStyle(canvas.getByText("DELETE")).backgroundColor).toBe("rgb(194, 65, 12)");
    await expect(get).not.toHaveAttribute("data-tone");
  },
};

export const LiveAndSteadyDots: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <Badge tone="danger" dot="live">
        Recording
      </Badge>
      <Badge tone="success" dot>
        Connected
      </Badge>
    </div>
  ),
  play: async ({ canvas }) => {
    const live = canvas.getByText("Recording").querySelector(".cy-badge-dot") as HTMLElement;
    const steady = canvas.getByText("Connected").querySelector(".cy-badge-dot") as HTMLElement;
    // The dot is decoration: the text says the state.
    await expect(live).toHaveAttribute("aria-hidden", "true");
    await expect(getComputedStyle(live).animationName).toBe("cy-badge-live");
    await expect(getComputedStyle(steady).animationName).toBe("none");
    await expect(getComputedStyle(live).backgroundColor).toBe(
      getComputedStyle(canvas.getByText("Recording")).color,
    );
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-badge", [
      "font-size",
      "font-weight",
      "text-transform",
      "letter-spacing",
      "padding-top",
      "border-radius",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
