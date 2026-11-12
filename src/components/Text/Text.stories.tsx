import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, createRef } from "react";
import { expect, userEvent } from "storybook/test";
import { textContrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { TextField } from "../TextField/TextField.js";
import { Text } from "./Text.js";

const ELEMENTS = ["span", "p", "div", "label", "strong", "em", "small", "time", "figcaption"] as const;
const VARIANTS = ["body", "lead", "caption", "eyebrow", "code"] as const;
const SIZES = ["xs", "sm", "md", "lg", "xl", "2xl"] as const;
const WEIGHTS = ["regular", "medium", "bold"] as const;
const TONES = ["inherit", "neutral", "muted", "accent", "success", "warning", "danger", "info"] as const;
const LONG =
  "The export keeps every layer, guide and comment, and writes one file per page into the folder you pick, so nothing is lost on the way.";

const meta = {
  title: "Components/Text",
  component: Text,
  args: { children: "Last saved 2 minutes ago" },
  argTypes: {
    as: { control: "select", options: ELEMENTS },
    variant: { control: "inline-radio", options: VARIANTS },
    size: { control: "inline-radio", options: SIZES },
    weight: { control: "inline-radio", options: WEIGHTS },
    tone: { control: "select", options: TONES },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    truncate: { control: "number" },
    wrap: { control: "inline-radio", options: ["pre", "break"] },
    numeric: { control: "boolean" },
    children: { control: "text" },
  },
} satisfies Meta<typeof Text>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The computed value `property` has on `el` when it is set to `value` (a token), read on the element itself. */
function resolved(el: Element, property: string, value: string): string {
  const probe = document.createElement("i");
  probe.style.setProperty(property, value);
  el.append(probe);
  const out = getComputedStyle(probe).getPropertyValue(property);
  probe.remove();
  return out;
}
const css = (el: Element, property: string) => getComputedStyle(el).getPropertyValue(property);
/** Asserts each property of `el` computes to its token. */
async function expectTokens(el: Element, tokens: Record<string, string>) {
  const actual = Object.fromEntries(Object.keys(tokens).map((p) => [p, css(el, p)]));
  const wanted = Object.fromEntries(Object.entries(tokens).map(([p, v]) => [p, resolved(el, p, v)]));
  await expect(actual).toEqual(wanted);
}
/** Where the text itself is painted (not the element's box). */
function inkRect(el: Element): DOMRect {
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect();
}

const column: CSSProperties = { display: "grid", gap: 12, justifyItems: "start" };

export const Variants: Story = {
  tags: ["visual"],
  render: () => (
    <div style={column}>
      <Text variant="eyebrow">Release notes</Text>
      <Text variant="lead">Everything that changed in the editor this month.</Text>
      <Text>Layers can now be grouped, renamed and locked from the keyboard.</Text>
      <Text variant="caption">Updated 12 March</Text>
      <Text variant="code">pnpm add @arshad-shah/cynosure</Text>
    </div>
  ),
  play: async ({ canvas }) => {
    const body = canvas.getByText(/Layers can now/);
    await expect(body.tagName).toBe("SPAN");
    await expectTokens(body, {
      "font-size": "var(--cy-font-size-md)",
      "font-weight": "var(--cy-font-weight-regular)",
      "font-family": "var(--cy-font-sans)",
      "line-height": "var(--cy-font-line-height)",
    });
    // Body takes the colour around it.
    await expect(css(body, "color")).toBe(css(body.parentElement as Element, "color"));

    await expectTokens(canvas.getByText(/Everything that changed/), {
      "font-size": "var(--cy-font-size-lg)",
      "font-weight": "var(--cy-font-weight-regular)",
      "font-family": "var(--cy-font-sans)",
      color: "var(--cy-color-muted)",
    });
    await expectTokens(canvas.getByText("Updated 12 March"), {
      "font-size": "var(--cy-font-size-sm)",
      "font-family": "var(--cy-font-sans)",
      color: "var(--cy-color-muted)",
    });
    const eyebrow = canvas.getByText("Release notes");
    await expectTokens(eyebrow, {
      "font-size": "var(--cy-font-eyebrow-size)",
      "letter-spacing": "var(--cy-font-eyebrow-tracking)",
      "font-weight": "var(--cy-font-weight-bold)",
      "font-family": "var(--cy-font-mono)",
      color: "var(--cy-color-muted)",
    });
    const code = canvas.getByText(/pnpm add/);
    await expectTokens(code, { "font-family": "var(--cy-font-mono)", "font-size": "var(--cy-font-size-md)" });
    await expect(css(code, "color")).toBe(css(body, "color"));

    // Only the eyebrow is uppercased or tracked; every variant keeps the text's own case in the DOM.
    const texts = [...(eyebrow.parentElement as Element).querySelectorAll(".cy-text")];
    await expect(texts.map((t) => css(t, "text-transform"))).toEqual([
      "uppercase",
      "none",
      "none",
      "none",
      "none",
    ]);
    await expect(texts.slice(1).map((t) => css(t, "letter-spacing"))).toEqual([
      "normal",
      "normal",
      "normal",
      "normal",
    ]);
    await expect(eyebrow).toHaveTextContent("Release notes");
    // The muted presets stay readable.
    for (const el of texts) await expect(textContrast(el)).toBeGreaterThanOrEqual(4.5);
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={column}>
      {SIZES.map((size) => (
        <Text key={size} size={size}>
          Size {size}
        </Text>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const seen: number[] = [];
    for (const size of SIZES) {
      const el = canvas.getByText(`Size ${size}`);
      await expectTokens(el, { "font-size": `var(--cy-font-size-${size})` });
      seen.push(Number.parseFloat(css(el, "font-size")));
    }
    // Six distinct steps, smallest to largest.
    await expect(seen).toEqual([...new Set(seen)].sort((a, b) => a - b));
    await expect(new Set(seen).size).toBe(SIZES.length);
  },
};

export const Weights: Story = {
  render: () => (
    <div style={column}>
      {WEIGHTS.map((weight) => (
        <Text key={weight} weight={weight}>
          Weight {weight}
        </Text>
      ))}
      <Text as="strong">Strong by default</Text>
      <Text as="strong" weight="regular">
        Strong made regular
      </Text>
    </div>
  ),
  play: async ({ canvas }) => {
    for (const weight of WEIGHTS)
      await expectTokens(canvas.getByText(`Weight ${weight}`), {
        "font-weight": `var(--cy-font-weight-${weight})`,
      });
    // <strong> means bold unless a weight is given.
    await expectTokens(canvas.getByText("Strong by default"), {
      "font-weight": "var(--cy-font-weight-bold)",
    });
    await expectTokens(canvas.getByText("Strong made regular"), {
      "font-weight": "var(--cy-font-weight-regular)",
    });
  },
};

const TONE_TOKENS: Record<(typeof TONES)[number], string> = {
  inherit: "rgb(120, 40, 160)",
  neutral: "var(--cy-color-ink)",
  muted: "var(--cy-color-muted)",
  accent: "var(--cy-color-accent-text)",
  success: "var(--cy-color-success-text)",
  warning: "var(--cy-color-warning-text)",
  danger: "var(--cy-color-danger-text)",
  info: "var(--cy-color-info-text)",
};

export const Tones: Story = {
  tags: ["visual"],
  render: () => (
    <div style={{ ...column, color: TONE_TOKENS.inherit }}>
      {TONES.map((tone) => (
        <Text key={tone} tone={tone}>
          Tone {tone}
        </Text>
      ))}
      <Text>No tone given</Text>
    </div>
  ),
  play: async ({ canvas }) => {
    const colours: string[] = [];
    for (const tone of TONES) {
      const el = canvas.getByText(`Tone ${tone}`);
      await expectTokens(el, { color: TONE_TOKENS[tone] });
      await expect(textContrast(el)).toBeGreaterThanOrEqual(4.5);
      colours.push(css(el, "color"));
    }
    await expect(new Set(colours).size).toBe(TONES.length);
    // Without a tone, body text takes the surrounding colour.
    await expect(css(canvas.getByText("No tone given"), "color")).toBe(colours[0]);
  },
};

export const ExplicitPropsBeatThePreset: Story = {
  render: () => (
    <div style={column}>
      <Text variant="eyebrow" size="lg" weight="regular" tone="accent">
        Eyebrow overridden
      </Text>
      <Text variant="lead" size="xs" weight="bold" tone="neutral">
        Lead overridden
      </Text>
      <Text variant="caption" size="2xl" tone="danger">
        Caption overridden
      </Text>
      <Text variant="lead" tone="inherit">
        Lead inheriting
      </Text>
      <Text variant="code" size="sm" tone="muted">
        Code overridden
      </Text>
    </div>
  ),
  play: async ({ canvas }) => {
    const eyebrow = canvas.getByText("Eyebrow overridden");
    await expectTokens(eyebrow, {
      "font-size": "var(--cy-font-size-lg)",
      "font-weight": "var(--cy-font-weight-regular)",
      color: "var(--cy-color-accent-text)",
      // What the preset alone decides stays.
      "letter-spacing": "var(--cy-font-eyebrow-tracking)",
      "font-family": "var(--cy-font-mono)",
    });
    await expect(css(eyebrow, "text-transform")).toBe("uppercase");
    await expectTokens(canvas.getByText("Lead overridden"), {
      "font-size": "var(--cy-font-size-xs)",
      "font-weight": "var(--cy-font-weight-bold)",
      color: "var(--cy-color-ink)",
    });
    await expectTokens(canvas.getByText("Caption overridden"), {
      "font-size": "var(--cy-font-size-2xl)",
      color: "var(--cy-color-danger-text)",
    });
    const inheriting = canvas.getByText("Lead inheriting");
    await expect(css(inheriting, "color")).toBe(css(inheriting.parentElement as Element, "color"));
    await expectTokens(canvas.getByText("Code overridden"), {
      "font-size": "var(--cy-font-size-sm)",
      "font-family": "var(--cy-font-mono)",
      color: "var(--cy-color-muted)",
    });
  },
};

const refs = Object.fromEntries(ELEMENTS.map((as) => [as, createRef<HTMLElement>()]));

export const Elements: Story = {
  render: () => (
    <div style={{ inlineSize: 320 }}>
      {ELEMENTS.map((as) => (
        <Text
          key={as}
          as={as}
          ref={refs[as]}
          id={`el-${as}`}
          className="layout"
          htmlFor="el-field"
          dateTime="2026-03-12"
        >
          Element {as}
        </Text>
      ))}
      <Text id="el-default">No element given</Text>
      <TextField id="el-field" label="Project name" labelHidden />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    for (const as of ELEMENTS) {
      const el = canvas.getByText(`Element ${as}`);
      await expect(el.tagName.toLowerCase()).toBe(as);
      await expect(refs[as]?.current).toBe(el);
      await expect(el).toHaveAttribute("id", `el-${as}`);
      await expect(el).toHaveClass("cy-text", "layout");
      // Blocks stay blocks, the rest stay inline; none brings a margin (a <p> has one by default).
      await expect(css(el, "display")).toBe(["p", "div", "figcaption"].includes(as) ? "block" : "inline");
      await expect(css(el, "margin")).toBe("0px");
      // Only a label points at a control and only a time carries a date.
      await expect(el.getAttribute("for")).toBe(as === "label" ? "el-field" : null);
      await expect(el.getAttribute("datetime")).toBe(as === "time" ? "2026-03-12" : null);
      // An element's own look does not leak in: <small> is not smaller, only <strong> is bold.
      await expectTokens(el, {
        "font-size": "var(--cy-font-size-md)",
        "font-weight": `var(--cy-font-weight-${as === "strong" ? "bold" : "regular"})`,
      });
    }
    await expect(css(canvas.getByText("Element em"), "font-style")).toBe("italic");
    await expect(canvasElement.querySelector("#el-default")?.tagName).toBe("SPAN");
    // A label works as one: pressing it focuses its control.
    await userEvent.click(canvas.getByText("Element label"));
    await expect(canvasElement.querySelector("#el-field")).toHaveFocus();
  },
};

export const TruncateOneLine: Story = {
  args: { truncate: true },
  render: () => (
    <div style={{ inlineSize: 220 }}>
      <Text truncate id="t-span">
        {LONG}
      </Text>
      <Text as="p" truncate id="t-p">
        {LONG}
      </Text>
      <Text truncate id="t-short">
        Short
      </Text>
      <Text id="t-wrap">{LONG}</Text>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const get = (id: string) => canvasElement.querySelector(`#${id}`) as HTMLElement;
    const lineHeight = Number.parseFloat(css(get("t-span"), "line-height"));
    for (const id of ["t-span", "t-p"]) {
      const el = get(id);
      // The text really is cut: it is wider than its box, sits on one line and ends with an ellipsis.
      await expect(el.scrollWidth).toBeGreaterThan(el.clientWidth);
      await expect(el.getBoundingClientRect().width).toBeLessThanOrEqual(220);
      await expect(Math.abs(el.getBoundingClientRect().height - lineHeight)).toBeLessThan(1);
      await expect(css(el, "text-overflow")).toBe("ellipsis");
      // The whole text stays in the DOM for assistive technology.
      await expect(el).toHaveTextContent(LONG);
    }
    // An inline element gets a box of its own; a block stays a block.
    await expect(css(get("t-span"), "display")).toBe("inline-block");
    await expect(css(get("t-p"), "display")).toBe("block");
    // Text that fits is not stretched or cut.
    await expect(get("t-short").scrollWidth).toBe(get("t-short").clientWidth);
    await expect(get("t-short").getBoundingClientRect().width).toBeLessThan(220);
    // Without truncate the same text wraps.
    await expect(get("t-wrap").getClientRects().length).toBeGreaterThan(1);
  },
};

export const TruncateToLines: Story = {
  render: () => (
    <div style={{ inlineSize: 220, display: "grid", gap: 12 }}>
      <Text truncate={2} id="l-two">
        {LONG}
      </Text>
      <Text as="p" truncate={3} id="l-three" style={{ maxInlineSize: 200 }}>
        {LONG}
      </Text>
      <Text truncate={1.9} id="l-one">
        {LONG}
      </Text>
      <Text truncate={0} id="l-zero">
        {LONG}
      </Text>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const get = (id: string) => canvasElement.querySelector(`#${id}`) as HTMLElement;
    const full = get("l-zero");
    const lineHeight = Number.parseFloat(css(full, "line-height"));
    for (const [id, lines] of [
      ["l-two", 2],
      ["l-three", 3],
      ["l-one", 1],
    ] as const) {
      const el = get(id);
      // Clamped to exactly that many lines, with more text than is shown.
      await expect(Math.abs(el.getBoundingClientRect().height - lines * lineHeight)).toBeLessThan(1);
      await expect(el.scrollHeight).toBeGreaterThan(el.clientHeight);
      await expect(el).toHaveTextContent(LONG);
    }
    // A part of a line is no line: 1.9 keeps one. Zero does not truncate.
    await expect(full).not.toHaveAttribute("data-truncate");
    await expect(full.getBoundingClientRect().height).toBeGreaterThan(3 * lineHeight);
    // The caller's layout style is kept beside the line count.
    await expect(get("l-three").getBoundingClientRect().width).toBe(200);
  },
};

const ID = "c0a8f3e241d74b8e9f2a7d3c5b1e6a900f4c2d8b9e1a7c3f5d6b";
const SQL = "select id,\n       name\n  from users";

export const WrapKeepsLinesOrBreaksLongStrings: Story = {
  render: () => (
    <div style={{ inlineSize: 160 }}>
      <Text as="div" wrap="pre" id="w-pre">
        {SQL}
      </Text>
      <Text as="div" id="w-normal">
        {SQL}
      </Text>
      <Text as="div" wrap="break" id="w-break">
        {ID}
      </Text>
      <Text as="div" id="w-overflow">
        {ID}
      </Text>
      <div>
        <Text wrap="break" id="w-inline">
          {ID}
        </Text>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const get = (id: string) => canvasElement.querySelector(`#${id}`) as HTMLElement;
    const lineHeight = Number.parseFloat(css(get("w-pre"), "line-height"));
    const lines = (el: HTMLElement) => Math.round(el.getBoundingClientRect().height / lineHeight);
    // "pre": the line breaks and the leading spaces are kept; without it the text runs together.
    await expect(lines(get("w-pre"))).toBe(3);
    await expect(lines(get("w-normal"))).toBeLessThan(3);
    await expect(inkRect(get("w-pre")).width).toBeLessThan(160);
    // "break": a long unbroken string breaks inside its box instead of overflowing it.
    const box = get("w-break");
    await expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth);
    await expect(lines(box)).toBeGreaterThan(1);
    await expect(get("w-overflow").scrollWidth).toBeGreaterThan(get("w-overflow").clientWidth);
    // An inline Text breaks as well: its painted lines stay inside the column.
    await expect(inkRect(get("w-inline")).width).toBeLessThanOrEqual(160);
    await expect(get("w-inline").getClientRects().length).toBeGreaterThan(1);
    // The text itself is unchanged.
    await expect(get("w-pre").textContent).toBe(SQL);
    await expect(box).toHaveTextContent(ID);
    // Host CSS cannot undo either.
    for (const id of ["w-pre", "w-break"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, `#${id}`, [
        "white-space-collapse",
        "text-wrap-mode",
        "overflow-wrap",
        "word-break",
      ]);
      await expect(hostile).toEqual(clean);
    }
  },
};

const ALIGNS = ["start", "center", "end"] as const;

function Aligned({ dir }: { dir: "ltr" | "rtl" }) {
  return (
    <div dir={dir} data-testid={dir} style={{ inlineSize: 300 }}>
      {ALIGNS.map((align) => (
        <Text key={align} align={align}>
          {dir === "rtl" ? "نص قصير" : "Short text"}
        </Text>
      ))}
      <Text as="p" align="end">
        {dir === "rtl" ? "فقرة" : "Paragraph"}
      </Text>
    </div>
  );
}

export const AlignFollowsReadingDirection: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      <Aligned dir="ltr" />
      <Aligned dir="rtl" />
    </div>
  ),
  play: async ({ canvas }) => {
    for (const dir of ["ltr", "rtl"] as const) {
      const box = canvas.getByTestId(dir);
      const edge = box.getBoundingClientRect();
      const [start, center, end, paragraph] = [...box.querySelectorAll(".cy-text")].map((el) => ({
        el,
        ink: inkRect(el),
      })) as [Ink, Ink, Ink, Ink];
      // Aligning an inline element makes it a block, or there would be nothing to align within.
      await expect(css(start.el, "display")).toBe("block");
      const startGap = dir === "ltr" ? start.ink.left - edge.left : edge.right - start.ink.right;
      const endGap = dir === "ltr" ? edge.right - end.ink.right : end.ink.left - edge.left;
      const paragraphGap = dir === "ltr" ? edge.right - paragraph.ink.right : paragraph.ink.left - edge.left;
      // Start is the left edge in English and the right edge in Arabic; end is the opposite one.
      await expect(Math.abs(startGap)).toBeLessThan(1);
      await expect(Math.abs(endGap)).toBeLessThan(1);
      await expect(Math.abs(paragraphGap)).toBeLessThan(1);
      await expect(start.ink.width).toBeLessThan(200);
      const middle = (center.ink.left + center.ink.right) / 2;
      await expect(Math.abs(middle - (edge.left + edge.right) / 2)).toBeLessThan(1);
    }
  },
};
type Ink = { el: Element; ink: DOMRect };

export const NumericValuesLineUp: Story = {
  args: { numeric: true },
  render: () => (
    <div style={column}>
      <Text numeric size="xl" id="n-ones">
        1111.11
      </Text>
      <Text numeric size="xl" id="n-eights">
        8888.88
      </Text>
      <Text size="xl" id="n-plain">
        1111.11
      </Text>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const get = (id: string) => canvasElement.querySelector(`#${id}`) as HTMLElement;
    await expect(css(get("n-ones"), "font-variant-numeric")).toBe("tabular-nums");
    await expect(css(get("n-plain"), "font-variant-numeric")).toBe("normal");
    // Different digits take the same width, so columns of values line up.
    await expect(Math.abs(inkRect(get("n-ones")).width - inkRect(get("n-eights")).width)).toBeLessThan(0.5);
  },
};

export const NestedTextKeepsTheOuterType: Story = {
  render: () => (
    <div style={column}>
      <Text variant="lead" id="outer-lead">
        Export finished in <Text numeric>42</Text> seconds, <Text as="strong">no errors</Text>,{" "}
        <Text size="xs" weight="medium" tone="danger">
          3 warnings
        </Text>
        , <Text variant="caption">details below</Text>.
      </Text>
      <Text variant="eyebrow" id="outer-eyebrow">
        Step <Text numeric>2</Text>
      </Text>
      <Text weight="bold" size="xl" id="outer-bold">
        Total <Text tone="muted">estimated</Text>
      </Text>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const lead = canvasElement.querySelector("#outer-lead") as HTMLElement;
    // A value or a strong word inside a lead stays lead-sized and lead-coloured.
    const value = canvas.getByText("42");
    await expect(css(value, "font-size")).toBe(css(lead, "font-size"));
    await expect(css(value, "color")).toBe(css(lead, "color"));
    await expect(css(value, "font-variant-numeric")).toBe("tabular-nums");
    const strong = canvas.getByText("no errors");
    await expect(css(strong, "font-size")).toBe(css(lead, "font-size"));
    await expectTokens(strong, { "font-weight": "var(--cy-font-weight-bold)" });
    // What the inner Text is given still wins.
    await expectTokens(canvas.getByText("3 warnings"), {
      "font-size": "var(--cy-font-size-xs)",
      "font-weight": "var(--cy-font-weight-medium)",
      color: "var(--cy-color-danger-text)",
    });
    // An inner variant is its own preset again.
    await expectTokens(canvas.getByText("details below"), { "font-size": "var(--cy-font-size-sm)" });
    // Inside an eyebrow the value stays uppercase, tracked and mono.
    const eyebrow = canvasElement.querySelector("#outer-eyebrow") as HTMLElement;
    const step = canvas.getByText("2");
    for (const p of ["font-size", "font-family", "font-weight", "letter-spacing", "text-transform"])
      await expect([p, css(step, p)]).toEqual([p, css(eyebrow, p)]);
    const bold = canvasElement.querySelector("#outer-bold") as HTMLElement;
    const estimated = canvas.getByText("estimated");
    await expect(css(estimated, "font-weight")).toBe(css(bold, "font-weight"));
    await expect(css(estimated, "font-size")).toBe(css(bold, "font-size"));
    await expectTokens(estimated, { color: "var(--cy-color-muted)" });
  },
};

export const ThemedThroughTokens: Story = {
  render: () => (
    <div
      style={
        {
          ...column,
          "--cy-text-line-height": "2",
          "--cy-text-lead-size": "20px",
          "--cy-text-caption-size": "10px",
          "--cy-text-eyebrow-size": "14px",
          "--cy-text-eyebrow-tracking": "2px",
          "--cy-text-muted": "rgb(0, 90, 120)",
        } as CSSProperties
      }
    >
      <Text variant="lead">Themed lead</Text>
      <Text variant="caption">Themed caption</Text>
      <Text variant="eyebrow">Themed eyebrow</Text>
      <Text tone="muted">Themed muted</Text>
    </div>
  ),
  play: async ({ canvas }) => {
    const read = (text: string, props: string[]) => props.map((p) => css(canvas.getByText(text), p));
    await expect(read("Themed lead", ["font-size", "line-height", "color"])).toEqual([
      "20px",
      "40px",
      "rgb(0, 90, 120)",
    ]);
    await expect(read("Themed caption", ["font-size", "color"])).toEqual(["10px", "rgb(0, 90, 120)"]);
    await expect(read("Themed eyebrow", ["font-size", "letter-spacing", "color"])).toEqual([
      "14px",
      "2px",
      "rgb(0, 90, 120)",
    ]);
    await expect(read("Themed muted", ["color", "line-height"])).toEqual(["rgb(0, 90, 120)", "26px"]);
  },
};

const HOSTILE_PROPS = [
  "display",
  "box-sizing",
  "color",
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
  "text-transform",
  "margin-top",
  "padding-top",
  "height",
];

export const StableUnderHostileHost: Story = {
  render: () => (
    // The host colours everything red; an inline colour stands in for a themed surface around the text.
    <div style={{ color: "rgb(20, 60, 100)", inlineSize: 240 }}>
      <Text id="h-span">Span body</Text>
      <Text as="div" id="h-div" tone="neutral" weight="medium">
        Div body
      </Text>
      <Text as="p" variant="lead" id="h-lead">
        Lead paragraph
      </Text>
      <Text variant="caption" id="h-caption">
        Caption
      </Text>
      <Text as="div" variant="eyebrow" id="h-eyebrow">
        Eyebrow
      </Text>
      <Text variant="code" tone="accent" id="h-code">
        code
      </Text>
      <Text id="h-outer" size="lg">
        Outer <Text id="h-inner">inner</Text>
      </Text>
      <Text truncate id="h-truncate">
        {LONG}
      </Text>
      <Text as="div" truncate={2} id="h-lines">
        {LONG}
      </Text>
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const id of [
      "h-span",
      "h-div",
      "h-lead",
      "h-caption",
      "h-eyebrow",
      "h-code",
      "h-inner",
      "h-truncate",
      "h-lines",
    ]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, `#${id}`, HOSTILE_PROPS);
      await expect({ id, ...hostile }).toEqual({ id, ...clean });
    }
    // The host's uppercase, weight 900, tracking and red really were on offer: a bare span takes them.
    const bare = document.createElement("span");
    bare.textContent = "bare";
    canvasElement.querySelector("#h-span")?.before(bare);
    bare.id = "h-bare";
    const { clean, hostile } = computeUnderHostileHost(canvasElement, "#h-bare", [
      "text-transform",
      "font-weight",
    ]);
    bare.remove();
    await expect(hostile).not.toEqual(clean);
    await expect(hostile).toEqual({ "text-transform": "uppercase", "font-weight": "900" });
  },
};
