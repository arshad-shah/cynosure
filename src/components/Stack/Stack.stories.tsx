import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { expect } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { BREAKPOINT_NAMES, expectVisibilityFollowsTheWindow } from "../../test/visibility.js";
import { Badge } from "../Badge/Badge.js";
import { Inline } from "../Inline/Inline.js";
import { Link } from "../Link/Link.js";
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
    grow: { control: "boolean" },
    shrink: { control: "boolean" },
    fill: { control: "boolean" },
    minSize: { control: "inline-radio", options: [undefined, "0"] },
    overflow: { control: "inline-radio", options: [undefined, "hidden", "auto", "visible"] },
    direction: { control: "inline-radio", options: ["column", "row"] },
    align: { control: "inline-radio", options: ["start", "center", "end", "stretch", "baseline"] },
    justify: { control: "inline-radio", options: ["start", "center", "end", "between"] },
    as: { control: "select", options: ["div", "section", "ul", "ol", "nav", "aside", "header", "footer"] },
  },
} satisfies Meta<typeof Stack>;
export default meta;
type Story = StoryObj<typeof meta>;

export const DirectionRowLaysOutARow: Story = {
  render: () => (
    <>
      <Stack direction="row" gap="4" data-testid="row">
        <Badge>One</Badge>
        <Badge>Two</Badge>
      </Stack>
      <Stack data-testid="column">
        <Badge>Three</Badge>
        <Badge>Four</Badge>
      </Stack>
      <Stack direction="row" align="baseline" data-testid="baseline">
        <span style={{ fontSize: 12 }}>small</span>
        <span style={{ fontSize: 32 }}>Large</span>
      </Stack>
    </>
  ),
  play: async ({ canvas }) => {
    const row = canvas.getByTestId("row");
    await expect([getComputedStyle(row).flexDirection, getComputedStyle(row).columnGap]).toEqual([
      "row",
      "8px",
    ]);
    const [one, two] = [canvas.getByText("One"), canvas.getByText("Two")].map((b) =>
      b.getBoundingClientRect(),
    );
    await expect((two as DOMRect).left).toBeGreaterThan((one as DOMRect).right);
    await expect((two as DOMRect).top).toBeCloseTo((one as DOMRect).top, 0);
    // The default stays a column, and a row Stack neither centres nor wraps: that is Inline's.
    await expect(getComputedStyle(canvas.getByTestId("column")).flexDirection).toBe("column");
    await expect([getComputedStyle(row).alignItems, getComputedStyle(row).flexWrap]).toEqual([
      "normal",
      "nowrap",
    ]);
    await expect(row).not.toHaveClass("cy-inline");
    await expect(getComputedStyle(canvas.getByTestId("baseline")).alignItems).toBe("baseline");
  },
};

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

export const HidesByTheWindowWidth: Story = {
  render: () => (
    <div data-testid="root">
      {BREAKPOINT_NAMES.map((bp) => (
        <div key={bp}>
          <Stack hideBelow={bp}>{`stack below ${bp}`}</Stack>
          <Stack hideAbove={bp}>{`stack above ${bp}`}</Stack>
          <Inline hideBelow={bp}>{`inline below ${bp}`}</Inline>
          <Inline hideAbove={bp}>{`inline above ${bp}`}</Inline>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const root = canvas.getByTestId("root");
    await expectVisibilityFollowsTheWindow(root);
    // At any window width, each pair shows exactly one of its two boxes.
    for (const bp of BREAKPOINT_NAMES)
      for (const kind of ["stack", "inline"]) {
        const shown = [`${kind} below ${bp}`, `${kind} above ${bp}`].filter((t) =>
          canvas.getByText(t).checkVisibility(),
        );
        await expect(shown).toHaveLength(1);
      }
    // Visible boxes keep their own display.
    const flex = [...root.querySelectorAll<HTMLElement>(".cy-stack,.cy-inline")].filter((b) =>
      b.checkVisibility(),
    );
    for (const box of flex) await expect(getComputedStyle(box).display).toBe("flex");
  },
};

export const NamedAndLinkable: Story = {
  render: () => (
    <>
      <Stack as="section" id="team" aria-labelledby="team-title">
        <h2 id="team-title">Team</h2>
      </Stack>
      <Inline role="group" aria-label="Filters" aria-describedby="hint">
        <Badge>One</Badge>
      </Inline>
      <p id="hint">Pick one</p>
    </>
  ),
  play: async ({ canvas, canvasElement }) => {
    // id, role and ARIA reach the element, so a Stack can be a named landmark and the target of a link.
    await expect(canvas.getByRole("region", { name: "Team" })).toBe(canvasElement.querySelector("#team"));
    const group = canvas.getByRole("group", { name: "Filters" });
    await expect(group).toHaveAccessibleDescription("Pick one");
  },
};

export const StickyStaysInView: Story = {
  render: () => (
    <section
      data-testid="scroller"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrolling area must be reachable by keyboard (axe)
      tabIndex={0}
      aria-label="Page"
      style={{ blockSize: 200, overflow: "auto" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Stack sticky stickyOffset="12px" data-testid="sticky">
          <Badge>Contents</Badge>
        </Stack>
        <Stack data-testid="long" style={{ blockSize: 1000 }}>
          Long column
        </Stack>
        <Stack sticky data-testid="flush">
          <Badge>Flush</Badge>
        </Stack>
      </div>
    </section>
  ),
  play: async ({ canvas }) => {
    const scroller = canvas.getByTestId("scroller");
    const sticky = canvas.getByTestId("sticky");
    const flush = canvas.getByTestId("flush");
    const top = () => scroller.getBoundingClientRect().top;
    scroller.scrollTop = 400;
    // The long column scrolled away; the sticky ones stayed, at their offset from the top of the scrolling area.
    await expect(canvas.getByTestId("long").getBoundingClientRect().top - top()).toBeCloseTo(-400, 0);
    await expect(sticky.getBoundingClientRect().top - top()).toBeCloseTo(12, 0);
    await expect(flush.getBoundingClientRect().top - top()).toBeCloseTo(0, 0);
    // A Stack inside a sticky one does not inherit its offset.
    await expect(getComputedStyle(canvas.getByTestId("long")).position).toBe("static");
  },
};

/** A status bar: the grown middle takes the free space, so what follows it sits at the end of the row. */
export const GrowPushesTheRestToTheEnd: Story = {
  render: () => (
    <div style={{ inlineSize: 400 }}>
      <Inline gap="2" data-testid="bar">
        <Badge>main</Badge>
        <Inline grow data-testid="middle">
          <Badge>Ready</Badge>
        </Inline>
        <Badge>Ln 1</Badge>
        <Stack shrink={false} data-testid="fixed">
          <Badge>UTF-8</Badge>
        </Stack>
      </Inline>
    </div>
  ),
  play: async ({ canvas }) => {
    const bar = canvas.getByTestId("bar").getBoundingClientRect();
    const middle = canvas.getByTestId("middle").getBoundingClientRect();
    const fixed = canvas.getByTestId("fixed");
    // The last item ends at the row's end; the grown one fills the space before the items after it.
    await expect(fixed.getBoundingClientRect().right).toBeCloseTo(bar.right, 0);
    await expect(canvas.getByText("Ln 1").getBoundingClientRect().left - middle.right).toBeCloseTo(4, 0);
    await expect(middle.width).toBeGreaterThan(200);
    await expect(getComputedStyle(fixed).flexShrink).toBe("0");
    // Nothing grows that did not ask to.
    await expect(getComputedStyle(fixed).flexGrow).toBe("0");
  },
};

const longList = (n: number) =>
  Array.from({ length: n }, (_, i) => (
    <li key={`row-${i + 1}`}>
      <Link href={`#row-${i + 1}`}>Row {i + 1}</Link>
    </li>
  ));

/**
 * An app shell column: a header, a body that takes the rest and scrolls, and a footer that stays in view. The body
 * needs `minSize="0"`: a flex child is otherwise at least as tall as its content, and pushes the footer off.
 */
export const FillAndMinSizeLetAChildScroll: Story = {
  render: () => (
    <>
      <div style={{ blockSize: 240 }} data-testid="frame">
        <Stack fill gap="0" data-testid="shell">
          <Badge>Header</Badge>
          <Stack grow minSize="0" data-testid="body">
            <Stack as="ul" grow overflow="auto" data-testid="scroller">
              {longList(40)}
            </Stack>
          </Stack>
          <Badge>Footer</Badge>
        </Stack>
      </div>
      <div style={{ blockSize: 240 }}>
        <Stack fill gap="0" overflow="hidden" data-testid="unshrunk">
          <Stack grow data-testid="body-without">
            <Stack as="ul" grow overflow="auto">
              {longList(40)}
            </Stack>
          </Stack>
        </Stack>
      </div>
    </>
  ),
  play: async ({ canvas }) => {
    const frame = canvas.getByTestId("frame").getBoundingClientRect();
    const shell = canvas.getByTestId("shell");
    const scroller = canvas.getByTestId("scroller");
    // fill: the shell is exactly as big as its parent.
    await expect(shell.getBoundingClientRect().height).toBeCloseTo(240, 0);
    await expect(shell.getBoundingClientRect().width).toBeCloseTo(frame.width, 0);
    // The footer stays inside the shell, and the list scrolls inside the body instead of overflowing.
    await expect(canvas.getByText("Footer").getBoundingClientRect().bottom).toBeLessThanOrEqual(
      shell.getBoundingClientRect().bottom + 0.5,
    );
    await expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);
    await expect(shell.scrollHeight).toBeLessThanOrEqual(shell.clientHeight);
    scroller.scrollTop = 200;
    await expect(scroller.scrollTop).toBe(200);
    await expect(getComputedStyle(canvas.getByTestId("body")).minHeight).toBe("0px");
    // Without minSize the body is as tall as its list, so the shell overflows.
    const unshrunk = canvas.getByTestId("unshrunk");
    await expect(canvas.getByTestId("body-without").getBoundingClientRect().height).toBeGreaterThan(240);
    await expect(unshrunk.scrollHeight).toBeGreaterThan(unshrunk.clientHeight);
  },
};

export const OverflowClipsOrScrolls: Story = {
  render: () => (
    <>
      {(["hidden", "auto", "visible"] as const).map((overflow) => (
        <Stack key={overflow} overflow={overflow} style={{ blockSize: 40 }} data-testid={overflow}>
          <Link href={`#${overflow}`}>{overflow}</Link>
          <Stack shrink={false} style={{ blockSize: 100 }}>
            Tall
          </Stack>
        </Stack>
      ))}
      <Stack data-testid="default">
        <span>Plain</span>
      </Stack>
    </>
  ),
  play: async ({ canvas }) => {
    for (const overflow of ["hidden", "auto", "visible"])
      await expect(getComputedStyle(canvas.getByTestId(overflow)).overflowY).toBe(overflow);
    const auto = canvas.getByTestId("auto");
    auto.scrollTop = 30;
    await expect(auto.scrollTop).toBe(30);
    // The box props add nothing to a box that does not ask for them.
    const plain = getComputedStyle(canvas.getByTestId("default"));
    await expect([plain.overflowY, plain.flexGrow, plain.flexShrink]).toEqual(["visible", "0", "1"]);
  },
};

export const BoxPropsStableUnderHostileHost: Story = {
  render: () => (
    <div style={{ blockSize: 120, display: "flex", flexDirection: "column" }}>
      <Stack fill grow shrink={false} minSize="0" overflow="hidden">
        <Badge>One</Badge>
      </Stack>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-stack", [
      "flex-grow",
      "flex-shrink",
      "height",
      "width",
      "min-height",
      "min-width",
      "overflow-y",
    ]);
    await expect(hostile).toEqual(clean);
    await expect([clean["flex-grow"], clean["flex-shrink"], clean["min-height"], clean.height]).toEqual([
      "1",
      "0",
      "0px",
      "120px",
    ]);
  },
};
