import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Badge } from "../Badge/Badge.js";
import { Inline } from "../Inline/Inline.js";
import { Stack } from "./Stack.js";

const meta = {
  title: "Components/Stack",
  component: Stack,
  args: { gap: "4", align: "stretch", as: "div" },
  argTypes: {
    gap: { control: "select", options: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] },
    align: { control: "inline-radio", options: ["start", "center", "end", "stretch"] },
    justify: { control: "inline-radio", options: ["start", "center", "end", "between"] },
    as: { control: "select", options: ["div", "section", "ul", "ol", "nav", "aside", "header", "footer"] },
  },
} satisfies Meta<typeof Stack>;
export default meta;
type Story = StoryObj<typeof meta>;

export const GapsUseSpaceTokens: Story = {
  tags: ["visual"],
  render: (args) => (
    <Stack {...args} data-testid="stack">
      <Badge>One</Badge>
      <Badge>Two</Badge>
      <Badge>Three</Badge>
    </Stack>
  ),
  play: async ({ canvas }) => {
    const stack = canvas.getByTestId("stack");
    await expect(getComputedStyle(stack).rowGap).toBe("8px");
    await expect(getComputedStyle(stack).flexDirection).toBe("column");
  },
};

export const RendersTheRequestedElement: Story = {
  args: { as: "ul", gap: "2" },
  render: (args) => (
    <Stack {...args} data-testid="stack">
      <li>First</li>
      <li>Second</li>
    </Stack>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId("stack").tagName).toBe("UL");
    await expect(canvas.getAllByRole("listitem")).toHaveLength(2);
  },
};

export const InlineWrapsAndFlipsInRtl: Story = {
  render: () => (
    <div dir="rtl" style={{ width: 160 }}>
      <Inline gap="3" wrap data-testid="inline">
        <Badge>First</Badge>
        <Badge>Second</Badge>
        <Badge>Third</Badge>
      </Inline>
    </div>
  ),
  play: async ({ canvas }) => {
    const inline = canvas.getByTestId("inline");
    await expect(getComputedStyle(inline).columnGap).toBe("6px");
    await expect(getComputedStyle(inline).flexWrap).toBe("wrap");
    const [first, second] = [canvas.getByText("First"), canvas.getByText("Second")];
    await expect(first.getBoundingClientRect().left).toBeGreaterThan(second.getBoundingClientRect().left);
  },
};

export const InlineAlignsAndJustifies: Story = {
  render: () => (
    <Inline gap="2" align="center" justify="between" data-testid="inline" style={{ width: 400 }}>
      <Badge>Left</Badge>
      <Badge size="lg">Right</Badge>
    </Inline>
  ),
  play: async ({ canvas }) => {
    const style = getComputedStyle(canvas.getByTestId("inline"));
    await expect([style.alignItems, style.justifyContent]).toEqual(["center", "space-between"]);
  },
};
