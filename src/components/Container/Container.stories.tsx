import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { BREAKPOINT_NAMES, expectVisibilityFollowsTheWindow } from "../../test/visibility.js";
import { Card } from "../Card/Card.js";
import { Stack } from "../Stack/Stack.js";
import { Container } from "./Container.js";

const SPACES = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const SIZES = ["sm", "md", "lg", "xl"] as const;

const meta = {
  title: "Components/Container",
  component: Container,
  args: { size: "sm", center: true, as: "div" },
  argTypes: {
    size: { control: "inline-radio", options: [...SIZES, "full"] },
    padding: { control: "select", options: SPACES },
    paddingBlock: { control: "select", options: SPACES },
    center: { control: "boolean" },
    as: { control: "inline-radio", options: ["div", "main", "section", "article"] },
  },
  render: (args) => (
    <Container {...args} data-testid="container">
      <Stack>
        <Card>Page heading</Card>
        <Card>Page content lines up with the heading, at every width.</Card>
      </Stack>
    </Container>
  ),
} satisfies Meta<typeof Container>;
export default meta;
type Story = StoryObj<typeof meta>;

const box = (el: Element) => el.getBoundingClientRect();
/** A wide room for the container to sit in, wider than the story canvas if need be. */
const room = (width: number, style?: CSSProperties) => ({ inlineSize: width, ...style });

export const CentredColumnWithGutters: Story = {
  tags: ["visual"],
  render: (args) => (
    <div style={room(900)} data-testid="room">
      <Container {...args} data-testid="container">
        <Stack>
          <Card data-testid="content">Page heading</Card>
          <Card>Page content lines up with the heading, at every width.</Card>
        </Stack>
      </Container>
    </div>
  ),
  play: async ({ canvas }) => {
    const [parent, container, content] = ["room", "container", "content"].map((id) =>
      box(canvas.getByTestId(id)),
    ) as [DOMRect, DOMRect, DOMRect];
    // size="sm" is 640px wide, gutters included, in the middle of the 900px room.
    await expect(container.width).toBeCloseTo(640, 0);
    await expect(container.left - parent.left).toBeCloseTo(parent.right - container.right, 0);
    await expect(container.left - parent.left).toBeCloseTo((900 - 640) / 2, 0);
    // The default gutters are space 6 (16px) on each side.
    await expect(content.left - container.left).toBeCloseTo(16, 0);
    await expect(container.right - content.right).toBeCloseTo(16, 0);
    await expect(content.top - container.top).toBeCloseTo(0, 0);
  },
};

export const EachSizeIsCappedAtItsToken: Story = {
  render: () => (
    <div style={room(2000)}>
      {SIZES.map((size) => (
        <Container key={size} size={size} data-testid={size}>
          {size}
        </Container>
      ))}
      <Container data-testid="default">default</Container>
      <div style={{ "--cy-container-size-md": "500px", "--cy-container-size-xl": "1100px" } as CSSProperties}>
        <Container size="md" data-testid="themed-md">
          themed md
        </Container>
        <Container size="xl" data-testid="themed-xl">
          themed xl
        </Container>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const width = (id: string) => box(canvas.getByTestId(id)).width;
    // In a 2000px room every size stops at its own width: 640, 768, 1024 and 1280px.
    await expect(SIZES.map(width)).toEqual([640, 768, 1024, 1280]);
    // lg is the default.
    await expect(width("default")).toBe(1024);
    // The caps are the --cy-container-size-* tokens: change the token, the cap follows.
    await expect(width("themed-md")).toBe(500);
    await expect(width("themed-xl")).toBe(1100);
    // Every one is centred.
    for (const id of [...SIZES, "default", "themed-md"]) {
      const b = box(canvas.getByTestId(id));
      await expect(b.left + b.width / 2).toBeCloseTo(
        box(canvas.getByTestId("sm").parentElement as Element).left + 1000,
        0,
      );
    }
  },
};

export const FullHasNoCap: Story = {
  args: { size: "full" },
  render: (args) => (
    <div style={room(3000)} data-testid="room">
      <Container {...args} data-testid="container">
        <span data-testid="content">Edge to edge, less the gutters</span>
      </Container>
    </div>
  ),
  play: async ({ canvas }) => {
    const container = canvas.getByTestId("container");
    await expect(box(container).width).toBe(3000);
    await expect(getComputedStyle(container).maxInlineSize).toBe("none");
    // The gutters stay.
    await expect(getComputedStyle(container).paddingLeft).toBe("16px");
    await expect(getComputedStyle(container).paddingRight).toBe("16px");
  },
};

export const NeverOverflowsANarrowParent: Story = {
  render: () => (
    <>
      {[320, 97].map((width) => (
        <div key={width} style={room(width)} data-testid={`room-${width}`}>
          <Container size="xl" data-testid={`container-${width}`}>
            <Card>Narrow</Card>
          </Container>
        </div>
      ))}
      <div style={{ display: "flex", inlineSize: 300 }}>
        <Container data-testid="in-row">
          <Card>In a flex row</Card>
        </Container>
      </div>
      <Stack align="center" style={{ inlineSize: 300 }}>
        <Container data-testid="in-centred-stack">
          <Card>In a centring Stack</Card>
        </Container>
      </Stack>
    </>
  ),
  play: async ({ canvas }) => {
    for (const width of [320, 97]) {
      const container = canvas.getByTestId(`container-${width}`);
      // Narrower than its cap: exactly as wide as the parent, gutters inside, nothing scrolling sideways.
      await expect(box(container).width).toBe(width);
      await expect(box(container).left).toBe(box(canvas.getByTestId(`room-${width}`)).left);
      await expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth);
      await expect(box(container.firstElementChild as Element).width).toBe(width - 32);
    }
    // It fills a flex row and a Stack that centres its children, instead of shrinking to its content.
    await expect(box(canvas.getByTestId("in-row")).width).toBe(300);
    await expect(box(canvas.getByTestId("in-centred-stack")).width).toBe(300);
  },
};

export const GuttersUseSpaceTokens: Story = {
  render: () => (
    <div style={room(600)}>
      <Container size="sm" padding="8" data-testid="wide-gutters">
        <span>Space 8</span>
      </Container>
      <Container size="sm" padding="0" data-testid="none">
        <span>No gutters</span>
      </Container>
      <Container size="sm" padding="4" paddingBlock="9" data-testid="block">
        <Container size="full" data-testid="nested">
          <span data-testid="nested-content">Nested</span>
        </Container>
      </Container>
      <div style={{ "--cy-container-padding": "40px", "--cy-space-8": "30px" } as CSSProperties}>
        <Container size="sm" data-testid="themed-default">
          <span>Token default</span>
        </Container>
        <Container size="sm" padding="8" data-testid="themed-space">
          <span>Themed space scale</span>
        </Container>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const padding = (id: string) => {
      const style = getComputedStyle(canvas.getByTestId(id));
      return [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft];
    };
    // `padding` is the side gutters only (space 8 = 24px); "0" removes them.
    await expect(padding("wide-gutters")).toEqual(["0px", "24px", "0px", "24px"]);
    await expect(padding("none")).toEqual(["0px", "0px", "0px", "0px"]);
    // `paddingBlock` is the top and bottom (space 9 = 32px).
    await expect(padding("block")).toEqual(["32px", "8px", "32px", "8px"]);
    // A nested Container gets the default gutters and no block padding: nothing is inherited from its parent.
    await expect(padding("nested")).toEqual(["0px", "16px", "0px", "16px"]);
    await expect(
      box(canvas.getByTestId("nested-content")).left - box(canvas.getByTestId("block")).left,
    ).toBeCloseTo(8 + 16, 0);
    // The default gutter is the --cy-container-padding token, and a `padding` prop follows the theme's space scale.
    await expect(padding("themed-default")).toEqual(["0px", "40px", "0px", "40px"]);
    await expect(padding("themed-space")).toEqual(["0px", "30px", "0px", "30px"]);
    // Gutters are inside the cap: the box is still the size's width.
    await expect(box(canvas.getByTestId("wide-gutters")).width).toBe(600);
  },
};

export const GuttersAndCentringInRtl: Story = {
  render: () => (
    <div dir="rtl" style={room(900)} data-testid="room">
      <Container size="sm" padding="7" data-testid="centred">
        <span data-testid="text" style={{ display: "block" }}>
          نص
        </span>
      </Container>
      <Container size="sm" center={false} data-testid="start">
        <span>Start</span>
      </Container>
    </div>
  ),
  play: async ({ canvas }) => {
    const [parent, centred, text, start] = ["room", "centred", "text", "start"].map((id) =>
      box(canvas.getByTestId(id)),
    ) as [DOMRect, DOMRect, DOMRect, DOMRect];
    // Still centred, with the same gutter (space 7 = 20px) on both sides.
    await expect(centred.left - parent.left).toBeCloseTo(parent.right - centred.right, 0);
    await expect(centred.right - text.right).toBeCloseTo(20, 0);
    await expect(text.left - centred.left).toBeCloseTo(20, 0);
    // center={false} keeps the column at the inline start: the right edge in right-to-left text.
    await expect(start.right).toBeCloseTo(parent.right, 0);
    await expect(start.left).toBeGreaterThan(parent.left + 100);
  },
};

export const NotCentred: Story = {
  args: { center: false },
  render: (args) => (
    <div style={room(900)} data-testid="room">
      <Container {...args} data-testid="container">
        <Card>At the start edge</Card>
      </Container>
    </div>
  ),
  play: async ({ canvas }) => {
    const [parent, container] = [box(canvas.getByTestId("room")), box(canvas.getByTestId("container"))];
    await expect(container.left).toBeCloseTo(parent.left, 0);
    await expect(parent.right - container.right).toBeCloseTo(900 - 640, 0);
  },
};

export const RendersTheRequestedElement: Story = {
  render: () => {
    let node: HTMLElement | null = null;
    return (
      <>
        <Container as="main" data-testid="main" className="host-page" style={{ minBlockSize: 50 }}>
          <Container as="section" data-testid="section" aria-label="Summary">
            Section
          </Container>
          <Container as="article" data-testid="article">
            Article
          </Container>
        </Container>
        <Container
          data-testid="div"
          ref={(el) => {
            node = el;
            el?.setAttribute("data-ref", el.tagName);
          }}
        >
          {node}Div
        </Container>
      </>
    );
  },
  play: async ({ canvas }) => {
    // `main` is the page's main landmark; the others are their own elements; the default is a plain div.
    await expect(canvas.getByRole("main")).toBe(canvas.getByTestId("main"));
    await expect(canvas.getByTestId("section").tagName).toBe("SECTION");
    await expect(canvas.getByRole("region", { name: "Summary" })).toBe(canvas.getByTestId("section"));
    await expect(canvas.getByRole("article")).toBe(canvas.getByTestId("article"));
    const div = canvas.getByTestId("div");
    await expect(div.tagName).toBe("DIV");
    // The ref is the root element; className and style land on it too.
    await expect(div).toHaveAttribute("data-ref", "DIV");
    await expect(canvas.getByTestId("main")).toHaveClass("cy-container", "host-page");
    await expect(getComputedStyle(canvas.getByTestId("main")).minBlockSize).toBe("50px");
  },
};

export const AddsNoStylingOfItsOwn: Story = {
  render: () => (
    <div style={{ color: "rgb(1, 2, 3)", fontSize: 21, lineHeight: "30px", fontFamily: "monospace" }}>
      <Container data-testid="container">Text</Container>
    </div>
  ),
  play: async ({ canvas }) => {
    const style = getComputedStyle(canvas.getByTestId("container"));
    // Layout only: text styles come from the page, and there is no background or border.
    await expect([style.color, style.fontSize, style.lineHeight, style.fontFamily]).toEqual([
      "rgb(1, 2, 3)",
      "21px",
      "30px",
      "monospace",
    ]);
    await expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    await expect(style.borderTopWidth).toBe("0px");
  },
};

export const StableUnderHostileHost: Story = {
  render: () => (
    <div style={room(900)}>
      <Container size="sm" paddingBlock="4">
        <Card>Content</Card>
      </Container>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-container", [
      "display",
      "width",
      "max-width",
      "box-sizing",
      "margin-left",
      "margin-right",
      "margin-top",
      "padding-left",
      "padding-right",
      "padding-top",
    ]);
    await expect(hostile).toEqual(clean);
    await expect(clean).toMatchObject({
      width: "640px",
      "padding-left": "16px",
      "padding-top": "8px",
    });
  },
};

export const LinkableAndNamed: Story = {
  render: () => (
    <>
      <Container as="section" id="pricing" aria-label="Pricing">
        Plans
      </Container>
      <div data-testid="root">
        {BREAKPOINT_NAMES.map((bp) => (
          <div key={bp}>
            <Container hideBelow={bp}>{`below ${bp}`}</Container>
            <Container hideAbove={bp}>{`above ${bp}`}</Container>
          </div>
        ))}
      </div>
    </>
  ),
  play: async ({ canvas, canvasElement }) => {
    // The id makes the column the target of an in-page link (#pricing); the label names its region.
    await expect(canvas.getByRole("region", { name: "Pricing" })).toBe(
      canvasElement.querySelector("#pricing"),
    );
    await expectVisibilityFollowsTheWindow(canvas.getByTestId("root"));
    const shown = [...canvas.getByTestId("root").querySelectorAll<HTMLElement>(".cy-container")].filter((c) =>
      c.checkVisibility(),
    );
    for (const c of shown) await expect(getComputedStyle(c).display).toBe("block");
    await expect(shown).toHaveLength(BREAKPOINT_NAMES.length);
  },
};
