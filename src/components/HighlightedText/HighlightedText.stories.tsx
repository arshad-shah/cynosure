import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { contrast, rgb } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { emulateMedia } from "../../test/media.js";
import { CynosureTheme } from "../../theme/CynosureTheme.js";
import { createTheme } from "../../tokens/index.js";
import { HighlightedText } from "./HighlightedText.js";

const meta = {
  tags: ["serial"],
  title: "Components/HighlightedText",
  component: HighlightedText,
  args: { text: "customer_orders", query: "order" },
  argTypes: {
    text: { control: "text" },
    query: { control: "text" },
    positions: { control: "object" },
  },
} satisfies Meta<typeof HighlightedText>;
export default meta;
type Story = StoryObj<typeof meta>;

const marks = (root: ParentNode) => [...root.querySelectorAll("mark")].map((m) => m.textContent);

export const QueryMarksEveryOccurrenceIgnoringCase: Story = {
  tags: ["visual"],
  args: { text: "Order orders by ORDER date", query: "order" },
  play: async ({ canvasElement }) => {
    // Every occurrence, whatever its case, is marked, and the text keeps its own case.
    await expect(marks(canvasElement)).toEqual(["Order", "order", "ORDER"]);
    await expect(canvasElement.querySelector(".cy-highlighted-text")?.textContent).toBe(
      "Order orders by ORDER date",
    );
  },
};

export const PositionsFromAFuzzyMatcher: Story = {
  args: { text: "customer_orders", query: undefined, positions: [9, 0, 1, 10, 99, -1] },
  play: async ({ canvasElement }) => {
    // Neighbouring positions join into one mark; order does not matter; indices outside the text are ignored.
    await expect(marks(canvasElement)).toEqual(["cu", "or"]);
  },
};

export const PositionsWinOverQuery: Story = {
  args: { text: "customer_orders", query: "orders", positions: [0] },
  play: async ({ canvasElement }) => {
    await expect(marks(canvasElement)).toEqual(["c"]);
  },
};

export const SeveralTermsMarkEachOne: Story = {
  args: { text: "Toggle line comment", query: ["line", "", "tog"] },
  play: async ({ canvasElement }) => {
    await expect(marks(canvasElement)).toEqual(["Tog", "line"]);
  },
};

export const QueryIsTextNotAPattern: Story = {
  args: { text: "a.b axb (c) [d]", query: ["a.b", "(c)", "[d]"] },
  play: async ({ canvasElement }) => {
    // Characters that mean something in a regular expression are matched as themselves.
    await expect(marks(canvasElement)).toEqual(["a.b", "(c)", "[d]"]);
  },
};

export const NothingMatchedIsPlainText: Story = {
  render: () => (
    <div>
      <HighlightedText text="users" query="zzz" className="no-match" />
      <HighlightedText text="users" query="" className="empty" />
      <HighlightedText text="users" className="none" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const cls of ["no-match", "empty", "none"]) {
      const el = canvasElement.querySelector(`.${cls}`) as HTMLElement;
      // One span holding the text as a single text node: no marks.
      await expect(el).toHaveClass("cy-highlighted-text");
      await expect(el.childNodes).toHaveLength(1);
      await expect(el.firstChild?.nodeType).toBe(Node.TEXT_NODE);
      await expect(el.textContent).toBe("users");
    }
  },
};

export const ScreenReadersReadTheWholeTextOnce: Story = {
  render: () => (
    <div role="listbox" aria-label="Tables">
      <div role="option" aria-selected="false" tabIndex={-1}>
        <HighlightedText text="Select a table" positions={[0, 1, 2, 9, 10]} />
      </div>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    // A row named by its content is named by the whole text, once (no copy for screen readers, none to find twice).
    await expect(canvas.getByRole("option", { name: "Select a table" })).toBeInTheDocument();
    await expect(canvasElement.querySelector(".cy-highlighted-text")?.textContent).toBe("Select a table");
    await expect(marks(canvasElement)).toEqual(["Sel", "ta"]);
  },
};

/** Paints colours over each other on one pixel and returns the result, so translucent marks are measured as seen. */
function painted(...layers: string[]): string {
  const ctx = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
  for (const layer of layers) {
    ctx.fillStyle = layer;
    ctx.fillRect(0, 0, 1, 1);
  }
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${g}, ${b})`;
}

export const ReadableInLightAndDark: Story = {
  render: (args) => (
    <div>
      {(["light", "dark"] as const).map((mode) => (
        <CynosureTheme key={mode} mode={mode}>
          <p className="surface" style={{ background: "var(--cy-color-surface)", margin: 0 }}>
            <HighlightedText {...args} />
          </p>
        </CynosureTheme>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const surface of canvasElement.querySelectorAll(".surface")) {
      const page = getComputedStyle(surface).backgroundColor;
      const mark = surface.querySelector("mark") as HTMLElement;
      const style = getComputedStyle(mark);
      const behind = painted(page, style.backgroundColor);
      // The mark is visibly tinted, its text reads on it, and it is bolder than the text around it.
      await expect(rgb(behind)).not.toEqual(rgb(page));
      await expect(contrast(style.color, behind)).toBeGreaterThanOrEqual(4.5);
      await expect(Number(style.fontWeight)).toBeGreaterThan(Number(getComputedStyle(surface).fontWeight));
    }
  },
};

export const MarkCornersFollowTheTheme: Story = {
  render: (args) => (
    <>
      <HighlightedText {...args} className="default" />
      <CynosureTheme theme={createTheme({ radius: 0 })}>
        <HighlightedText {...args} className="square" />
      </CynosureTheme>
      <span style={{ "--cy-highlighted-text-radius": "2px" } as React.CSSProperties}>
        <HighlightedText {...args} className="token" />
      </span>
    </>
  ),
  play: async ({ canvasElement }) => {
    const radius = (cls: string) =>
      Number.parseFloat(
        getComputedStyle(canvasElement.querySelector(`.${cls} mark`) as HTMLElement).borderTopLeftRadius,
      );
    // A soft corner by default (from the theme's radius), square in a theme with no radius, and the token wins.
    await expect(radius("default")).toBeGreaterThan(0);
    await expect(radius("square")).toBe(0);
    await expect(radius("token")).toBe(2);
  },
};

export const TokensRestyleTheMark: Story = {
  render: (args) => (
    <span
      style={
        {
          "--cy-highlighted-text-highlight": "rgb(255, 230, 0)",
          "--cy-highlighted-text-ink": "rgb(0, 0, 0)",
          "--cy-highlighted-text-weight": "400",
        } as React.CSSProperties
      }
    >
      <HighlightedText {...args} />
    </span>
  ),
  play: async ({ canvasElement }) => {
    const style = getComputedStyle(canvasElement.querySelector("mark") as HTMLElement);
    await expect(style.backgroundColor).toBe("rgb(255, 230, 0)");
    await expect(style.color).toBe("rgb(0, 0, 0)");
    await expect(style.fontWeight).toBe("400");
  },
};

export const ForcedColoursUseTheSystemMark: Story = {
  tags: ["!dev"],
  play: async ({ canvasElement }) => {
    if (!(await emulateMedia({ forcedColors: "active" }))) return;
    try {
      // Engines that cannot emulate forced colours, or lack `forced-color-adjust` (WebKit emulates the mode but has no
      // such property), have nothing to check here.
      if (!matchMedia("(forced-colors: active)").matches || !CSS.supports("forced-color-adjust", "none"))
        return;
      const mark = canvasElement.querySelector("mark") as HTMLElement;
      const style = getComputedStyle(mark);
      // The system's own mark colours, kept (not overridden), and an underline that survives any palette.
      await expect(style.textDecorationLine).toBe("underline");
      await expect(style.forcedColorAdjust).toBe("none");
      await expect(rgb(style.backgroundColor)).toEqual(rgb("Mark"));
    } finally {
      await emulateMedia({ forcedColors: null });
    }
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    // The text inherits its font from where it sits (a row, a paragraph); what it sets itself is checked here.
    const cases = {
      ".cy-highlighted-text": ["display", "box-sizing", "text-transform", "padding-left", "margin-left"],
      ".cy-highlighted-text-mark": [
        "display",
        "font-weight",
        "background-color",
        "color",
        "text-transform",
        "padding-left",
        "box-sizing",
      ],
    };
    for (const [selector, props] of Object.entries(cases)) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect(hostile).toEqual(clean);
    }
  },
};
