import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { expect } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Badge } from "../Badge/Badge.js";
import { Inline } from "../Inline/Inline.js";
import { Stack } from "./Stack.js";

const SPACES = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
/** The four padding values of an element, in px, as [block-start, inline-end, block-end, inline-start]. */
const paddingOf = (el: Element) => {
  const style = getComputedStyle(el);
  return [style.paddingBlockStart, style.paddingInlineEnd, style.paddingBlockEnd, style.paddingInlineStart];
};

const meta = {
  title: "Components/Stack",
  component: Stack,
  args: { gap: "4", align: "stretch", as: "div" },
  argTypes: {
    gap: { control: "select", options: SPACES },
    padding: { control: "select", options: SPACES },
    paddingInline: { control: "select", options: SPACES },
    paddingBlock: { control: "select", options: SPACES },
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

export const DefaultsAndLayoutProps: Story = {
  render: () => (
    <Stack className="host-layout" style={{ maxWidth: 200 }} data-testid="stack">
      <span>A</span>
      <span>B</span>
    </Stack>
  ),
  play: async ({ canvas }) => {
    const stack = canvas.getByTestId("stack");
    await expect(stack.tagName).toBe("DIV");
    await expect(stack).toHaveClass("cy-stack", "host-layout");
    await expect(getComputedStyle(stack).rowGap).toBe("8px");
    await expect(getComputedStyle(stack).maxWidth).toBe("200px");
  },
};

export const PaddingUsesSpaceTokens: Story = {
  args: { padding: "6" },
  render: (args) => (
    <div style={{ inlineSize: 300 }}>
      <Stack {...args} data-testid="stack">
        <Badge>One</Badge>
        <Badge>Two</Badge>
      </Stack>
    </div>
  ),
  play: async ({ canvas }) => {
    const stack = canvas.getByTestId("stack");
    // Space 6 is 16px, on all four sides; the content sits inside it.
    await expect(paddingOf(stack)).toEqual(["16px", "16px", "16px", "16px"]);
    const [outer, first] = [stack.getBoundingClientRect(), canvas.getByText("One").getBoundingClientRect()];
    await expect(first.top - outer.top).toBeCloseTo(16, 0);
    await expect(first.left - outer.left).toBeCloseTo(16, 0);
    // Padding is inside the stack's width: it never makes the stack wider than its parent.
    await expect(outer.width).toBeCloseTo(
      (stack.parentElement as HTMLElement).getBoundingClientRect().width,
      0,
    );
  },
};

export const InlineAndBlockPaddingWinOverPadding: Story = {
  render: () => (
    <>
      <Stack padding="4" paddingInline="8" data-testid="inline-wins">
        <span>A</span>
      </Stack>
      <Stack padding="4" paddingBlock="2" data-testid="block-wins">
        <span>B</span>
      </Stack>
      <Stack paddingBlock="5" data-testid="block-only">
        <span>C</span>
      </Stack>
      <Stack padding="4" paddingInline="0" data-testid="zero-wins">
        <span>D</span>
      </Stack>
    </>
  ),
  play: async ({ canvas }) => {
    await expect(paddingOf(canvas.getByTestId("inline-wins"))).toEqual(["8px", "24px", "8px", "24px"]);
    await expect(paddingOf(canvas.getByTestId("block-wins"))).toEqual(["4px", "8px", "4px", "8px"]);
    await expect(paddingOf(canvas.getByTestId("block-only"))).toEqual(["12px", "0px", "12px", "0px"]);
    // "0" is a real value, not "unset": it removes the inline padding that `padding` asked for.
    await expect(paddingOf(canvas.getByTestId("zero-wins"))).toEqual(["8px", "0px", "8px", "0px"]);
  },
};

export const NoPaddingUnlessAskedAndNoneInherited: Story = {
  render: () => (
    <Stack padding="8" data-testid="outer">
      <Stack data-testid="inner">
        <Inline data-testid="row">
          <span>Deep</span>
        </Inline>
      </Stack>
      <Stack as="ul" data-testid="list">
        <li>Item</li>
      </Stack>
    </Stack>
  ),
  play: async ({ canvas }) => {
    await expect(paddingOf(canvas.getByTestId("outer"))).toEqual(["24px", "24px", "24px", "24px"]);
    // Nested layouts have no padding of their own and do not pick up the parent's.
    for (const id of ["inner", "row", "list"])
      await expect(paddingOf(canvas.getByTestId(id))).toEqual(["0px", "0px", "0px", "0px"]);
    // A layout without padding props carries no padding declaration at all.
    await expect(canvas.getByTestId("inner").getAttribute("style")).not.toContain("pad");
  },
};

export const PaddingFollowsTheThemeAndStyleStillWins: Story = {
  render: () => (
    <div style={{ "--cy-space-6": "10px" } as React.CSSProperties}>
      <Stack padding="6" data-testid="themed">
        <span>A</span>
      </Stack>
      <Stack padding="6" style={{ paddingInlineStart: 3 }} data-testid="styled">
        <span>B</span>
      </Stack>
    </div>
  ),
  play: async ({ canvas }) => {
    // The padding is the token, so a theme that changes the space scale changes it.
    await expect(paddingOf(canvas.getByTestId("themed"))).toEqual(["10px", "10px", "10px", "10px"]);
    await expect(paddingOf(canvas.getByTestId("styled"))).toEqual(["10px", "10px", "10px", "3px"]);
  },
};

export const StableUnderHostileHost: Story = {
  render: () => (
    <Stack padding="6" paddingBlock="4">
      <Inline padding="2">
        <Badge>One</Badge>
      </Inline>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    for (const selector of [".cy-stack", ".cy-inline"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [
        "display",
        "flex-direction",
        "row-gap",
        "padding-top",
        "padding-left",
        "padding-right",
        "padding-bottom",
        "box-sizing",
        "margin-top",
      ]);
      await expect(hostile).toEqual(clean);
      await expect(clean["padding-left"]).toBe(selector === ".cy-stack" ? "16px" : "4px");
    }
  },
};
