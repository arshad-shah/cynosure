import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Badge } from "../Badge/Badge.js";
import { Inline } from "./Inline.js";

const meta = {
  title: "Components/Inline",
  component: Inline,
  args: { gap: "3", wrap: true },
  argTypes: {
    gap: { control: "select", options: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] },
    align: { control: "inline-radio", options: ["start", "center", "end", "baseline", "stretch"] },
    justify: { control: "inline-radio", options: ["start", "center", "end", "between"] },
    wrap: { control: "boolean" },
  },
} satisfies Meta<typeof Inline>;
export default meta;
type Story = StoryObj<typeof meta>;

export const RowWithTokenGap: Story = {
  tags: ["visual"],
  render: (args) => (
    <Inline {...args} data-testid="inline">
      <Badge tone="accent">Accent</Badge>
      <Badge tone="success">Success</Badge>
      <Badge tone="danger">Danger</Badge>
    </Inline>
  ),
  play: async ({ canvas }) => {
    const style = getComputedStyle(canvas.getByTestId("inline"));
    await expect([style.flexDirection, style.columnGap]).toEqual(["row", "6px"]);
  },
};

export const DefaultsAndLayoutProps: Story = {
  render: () => (
    <Inline className="host-row" style={{ maxWidth: 200 }} data-testid="row">
      <span>A</span>
      <span>B</span>
    </Inline>
  ),
  play: async ({ canvas }) => {
    const row = canvas.getByTestId("row");
    await expect(row).toHaveClass("cy-inline", "host-row");
    await expect(getComputedStyle(row).columnGap).toBe("6px");
    await expect(getComputedStyle(row).flexWrap).toBe("nowrap");
    await expect(getComputedStyle(row).alignItems).toBe("center");
    await expect(getComputedStyle(row).maxWidth).toBe("200px");
  },
};
