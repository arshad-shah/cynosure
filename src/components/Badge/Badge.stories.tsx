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
