import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { arrowDown, arrowUp, minus, users } from "../../icons/index.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Grid } from "../Grid/Grid.js";
import { Stat } from "./Stat.js";

const meta = {
  title: "Components/Stat",
  component: Stat,
  args: {
    label: "Revenue",
    value: "£12,400",
    delta: { value: "+12%" },
    description: "vs last month",
    size: "md",
    align: "start",
    variant: "surface",
  },
  argTypes: {
    label: { control: "text" },
    value: { control: "text" },
    unit: { control: "text" },
    description: { control: "text" },
    delta: { control: "object" },
    icon: { control: false },
    iconTone: { control: "select", options: ["accent", "neutral", "danger", "success", "warning", "info"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    align: { control: "inline-radio", options: ["start", "center"] },
    variant: { control: "inline-radio", options: ["surface", "outline", "soft"] },
    as: { control: "inline-radio", options: ["div", "li", "article"] },
    href: { control: "text" },
    target: { control: "text" },
    labels: { control: "object" },
  },
  render: (args) => (
    <div style={{ inlineSize: 260 }}>
      <Stat {...args} />
    </div>
  ),
} satisfies Meta<typeof Stat>;
export default meta;
type Story = StoryObj<typeof meta>;

const box = (el: Element) => el.getBoundingClientRect();
const css = (el: Element) => getComputedStyle(el);
const stats = (root: Element) => [...root.querySelectorAll(".cy-stat")] as HTMLElement[];
/** What a screen reader says for the delta: the visible figure is hidden, the sentence is spoken. */
const spoken = (delta: Element) => (delta.querySelector(".cy-visually-hidden") as Element).textContent;

export const Default: Story = {
  tags: ["visual"],
  args: { className: "mine", style: { marginInlineStart: 8 } },
  play: async ({ canvas, canvasElement }) => {
    // The label is the term and the figures are its definitions, so they are read as "Revenue, £12,400, up 12%…".
    const term = canvas.getByRole("term");
    const [value, delta, description] = canvas.getAllByRole("definition") as [
      HTMLElement,
      HTMLElement,
      HTMLElement,
    ];
    await expect(term).toHaveTextContent(/^Revenue$/);
    await expect(term.parentElement?.tagName).toBe("DL");
    await expect(value).toHaveTextContent(/^£12,400$/);
    await expect(spoken(delta)).toBe("up 12%");
    await expect(description).toHaveTextContent(/^vs last month$/);
    // The label comes first in reading order and sits above the value.
    await expect(box(term).bottom).toBeLessThanOrEqual(box(value).top + 1);
    // Digits are tabular, so stats in a row line up; the value is larger than the label.
    await expect(css(value).fontVariantNumeric).toBe("tabular-nums");
    await expect(Number.parseFloat(css(value).fontSize)).toBeGreaterThan(
      Number.parseFloat(css(term).fontSize),
    );
    // A static stat is not interactive: nothing to tab to, no link.
    await expect(canvas.queryByRole("link")).toBeNull();
    await userEvent.tab();
    await expect(canvasElement.querySelector(".cy-stat")?.contains(document.activeElement)).toBe(false);
    // It is a Card; className and style land on it, for layout.
    const root = stats(canvasElement)[0] as HTMLElement;
    await expect(root).toHaveClass("cy-card", "cy-stat", "mine");
    await expect(css(root).marginInlineStart).toBe("8px");
  },
};

export const UnitAfterTheValue: Story = {
  args: { label: "p95 latency", value: "184", unit: "ms", delta: undefined, description: undefined },
  play: async ({ canvas }) => {
    const value = canvas.getByRole("definition");
    const unit = value.querySelector(".cy-stat-unit") as HTMLElement;
    // The unit is part of the value's definition, written after it, smaller and on the same baseline.
    await expect(value).toHaveTextContent(/^184ms$/);
    await expect(unit).toHaveTextContent("ms");
    await expect(Number.parseFloat(css(unit).fontSize)).toBeLessThan(Number.parseFloat(css(value).fontSize));
    await expect(box(unit).left).toBeGreaterThan(value.firstChild ? box(value).left : 0);
    // Only one definition: no delta or description was given.
    await expect(canvas.getAllByRole("definition")).toHaveLength(1);
  },
};

export const DeltaDirectionToneAndArrow: Story = {
  render: () => (
    <Grid columns={3}>
      <Stat label="Sign-ups" value="1,204" delta={{ value: "+12%" }} />
      <Stat label="Churn" value="2.1%" delta={{ value: "−0.4%" }} />
      <Stat label="Sessions" value="8,310" delta={{ value: "0%" }} />
      <Stat label="Errors" value="14" delta={{ value: "-30%", tone: "success" }} />
      <Stat label="Costs" value="£980" delta={{ value: "5%", direction: "up", tone: "danger" }} />
      <Stat label="Load" value="1.2s" delta={{ value: "-3%", direction: "flat" }} />
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    const deltas = [...canvasElement.querySelectorAll(".cy-stat-delta")] as HTMLElement[];
    // The direction comes from the value's sign ("+", "-" or the minus sign), unless it is given. The spoken words
    // drop the sign: the direction already says it.
    await expect(deltas.map(spoken)).toEqual([
      "up 12%",
      "down 0.4%",
      "unchanged at 0%",
      "down 30%",
      "up 5%",
      "unchanged at 3%",
    ]);
    // The figure is shown but not read twice; the arrow is decorative.
    for (const delta of deltas) {
      await expect(delta.querySelector('span[aria-hidden="true"]')).toBeVisible();
      await expect(delta.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
      await expect(box(delta.querySelector(".cy-visually-hidden") as Element).width).toBeLessThanOrEqual(1);
    }
    // Each direction has its own arrow.
    const drawn = deltas.map((d) => d.querySelectorAll("svg > *").length);
    await expect(drawn.slice(0, 3)).toEqual([arrowUp.body.length, arrowDown.body.length, minus.body.length]);
    // Up is good and down is bad by default; `tone` says otherwise for costs and errors.
    await expect(deltas.map((d) => d.getAttribute("data-tone"))).toEqual([
      "success",
      "danger",
      "neutral",
      "success",
      "danger",
      "neutral",
    ]);
    const [up, down, flat, goodDown, badUp] = deltas as [
      HTMLElement,
      HTMLElement,
      HTMLElement,
      HTMLElement,
      HTMLElement,
    ];
    await expect(css(up).color).not.toBe(css(down).color);
    await expect(css(flat).color).not.toBe(css(up).color);
    await expect(css(goodDown).color).toBe(css(up).color);
    await expect(css(badUp).color).toBe(css(down).color);
  },
};

export const DeltaWordsCanBeTranslated: Story = {
  args: {
    label: "Chiffre d'affaires",
    value: "12 400 €",
    delta: { value: "12 %", direction: "up" },
    labels: { up: (value) => `en hausse de ${value}` },
  },
  render: (args) => (
    <div style={{ display: "grid", gap: 12, inlineSize: 260 }}>
      <Stat {...args} />
      <Stat {...args} delta={{ value: "3 %", direction: "down" }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const deltas = [...canvasElement.querySelectorAll(".cy-stat-delta")];
    // The given word replaces the English one; a direction without a translation keeps English.
    await expect(deltas.map(spoken)).toEqual(["en hausse de 12 %", "down 3 %"]);
  },
};

const followed = fn();

export const WholeStatIsALink: Story = {
  args: {
    icon: users,
    href: "#revenue",
    // Record the activation and stay on the page: navigating would unload the test runner.
    onClick: (event) => {
      event.preventDefault();
      followed((event.currentTarget as HTMLAnchorElement).getAttribute("href"));
    },
  },
  play: async ({ canvas }) => {
    followed.mockClear();
    // One link, named by the whole stat with the delta's spoken words, and nothing interactive nested in it.
    const link = canvas.getByRole("link", { name: /^Revenue\s*£12,400\s*up 12%\s*vs last month$/ });
    await expect(link).toHaveClass("cy-card", "cy-stat");
    await expect(link.querySelectorAll("a, button")).toHaveLength(0);
    // The icon tile inside is decorative.
    await expect(within(link).queryByRole("img")).toBeNull();
    // Pointer and keyboard both follow it.
    await userEvent.click(within(link).getByText("£12,400"));
    link.blur();
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(css(link).boxShadow).not.toBe("none");
    await userEvent.keyboard("{Enter}");
    await expect(followed).toHaveBeenCalledTimes(2);
    await expect(followed).toHaveBeenCalledWith("#revenue");
  },
};

export const UnsafeLinkIsNotFollowed: Story = {
  args: { href: "javascript:alert(1)" },
  play: async ({ canvasElement }) => {
    // Through Card and LinkBase: an unsafe scheme is never put on the link.
    await expect(canvasElement.querySelector(".cy-stat")?.hasAttribute("href")).toBe(false);
  },
};

export const ListOfStats: Story = {
  render: () => (
    <Grid as="ul" columns={3}>
      <Stat as="li" label="Visitors" value="18,204" />
      <Stat as="li" label="Sign-ups" value="1,204" href="#sign-ups" onClick={(e) => e.preventDefault()} />
      <Stat as="li" label="Revenue" value="£12,400" />
    </Grid>
  ),
  play: async ({ canvas }) => {
    // A real list of three items; the linked stat keeps its list item and puts the link inside it.
    const list = canvas.getByRole("list");
    const items = within(list).getAllByRole("listitem");
    await expect(items).toHaveLength(3);
    await expect(within(items[1] as HTMLElement).getByRole("link")).toHaveAccessibleName(
      /^Sign-ups\s*1,204$/,
    );
    await expect(within(items[0] as HTMLElement).queryByRole("link")).toBeNull();
    // Each item holds its own term and value.
    for (const item of items) await expect(within(item).getAllByRole("term")).toHaveLength(1);
    // The linked item lines up with the others.
    await expect(box(items[1] as Element).height).toBeCloseTo(box(items[0] as Element).height, 0);
  },
};

export const ElementForAStaticStat: Story = {
  args: { as: "article" },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("article.cy-stat")).not.toBeNull();
  },
};

export const IconAndAlignment: Story = {
  tags: ["visual"],
  render: () => (
    <div style={{ display: "grid", gap: 12, inlineSize: 280 }}>
      <Stat label="Members" value="312" icon={users} />
      <Stat label="Members" value="312" icon={users} iconTone="success" align="center" />
      <div dir="rtl">
        <Stat label="الأعضاء" value="312" icon={users} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [start, center, rtl] = stats(canvasElement) as [HTMLElement, HTMLElement, HTMLElement];
    const tile = (el: Element) => el.querySelector(".cy-icon-tile") as HTMLElement;
    const term = (el: Element) => el.querySelector("dt") as HTMLElement;
    // Start: the decorative tile sits before the text, along the reading direction.
    await expect(tile(start)).toHaveAttribute("aria-hidden", "true");
    await expect(box(tile(start)).right).toBeLessThanOrEqual(box(term(start)).left);
    await expect(box(tile(rtl)).left).toBeGreaterThanOrEqual(box(term(rtl)).right);
    // Center: the tile above, everything centred.
    await expect(box(tile(center)).bottom).toBeLessThanOrEqual(box(term(center)).top);
    const middle = (r: DOMRect) => r.left + r.width / 2;
    await expect(middle(box(tile(center)))).toBeCloseTo(middle(box(center)), 0);
    await expect(middle(box(term(center)))).toBeCloseTo(middle(box(center)), 0);
    // The tile takes its tone.
    await expect(tile(center)).toHaveAttribute("data-tone", "success");
    await expect(tile(start)).toHaveAttribute("data-tone", "accent");
  },
};

export const Sizes: Story = {
  tags: ["visual"],
  render: () => (
    <div style={{ display: "grid", gap: 12, inlineSize: 280 }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Stat key={size} label={size} value="1,204" icon={users} size={size} delta={{ value: "+4%" }} />
      ))}
      <div
        style={
          {
            "--cy-stat-value-size-sm": "10px",
            "--cy-stat-value-size-md": "20px",
            "--cy-stat-value-size-lg": "30px",
            "--cy-stat-value-weight": "300",
          } as CSSProperties
        }
        data-testid="tokens"
      >
        {(["sm", "md", "lg"] as const).map((size) => (
          <Stat key={size} label={size} value="1" size={size} />
        ))}
      </div>
    </div>
  ),
  play: async ({ canvasElement, canvas }) => {
    const sized = stats(canvasElement).slice(0, 3);
    const value = (el: Element) => el.querySelector(".cy-stat-value") as HTMLElement;
    const measure = (pick: (el: HTMLElement) => number) => sized.map(pick);
    const ascending = async (list: number[]) => {
      await expect(list).toEqual([...list].sort((a, b) => a - b));
      await expect(new Set(list).size).toBe(3);
    };
    // The value, the label, the icon tile and the padding all grow with the size.
    await ascending(measure((el) => Number.parseFloat(css(value(el)).fontSize)));
    await ascending(measure((el) => Number.parseFloat(css(el.querySelector("dt") as Element).fontSize)));
    await ascending(measure((el) => box(el.querySelector(".cy-icon-tile") as Element).width));
    await ascending(measure((el) => Number.parseFloat(css(el).paddingTop)));
    // Each size reads its own token.
    const themed = stats(canvas.getByTestId("tokens")).map((el) => css(value(el)));
    await expect(themed.map((s) => s.fontSize)).toEqual(["10px", "20px", "30px"]);
    await expect(themed[0]?.fontWeight).toBe("300");
  },
};

export const TapFollowsTheLink: Story = {
  tags: ["touch", "!dev"],
  args: { href: "#revenue", onClick: fn((event) => event.preventDefault()) },
  play: async ({ canvas, args }) => {
    const link = canvas.getByRole("link");
    // The whole tile is the target: far larger than a finger needs.
    await expect(box(link).height).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: link });
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const StableUnderHostileHost: Story = {
  args: { icon: users, unit: "GBP", href: "#x", onClick: (event) => event.preventDefault() },
  play: async ({ canvasElement }) => {
    const parts: [selector: string, props: string[]][] = [
      [".cy-stat", ["display", "padding-top", "border-top-width", "box-sizing", "color", "font-size"]],
      [".cy-stat-body", ["display", "gap", "font-size", "line-height", "text-transform"]],
      [".cy-stat-list", ["display", "gap", "padding-inline-start", "margin-top"]],
      [
        ".cy-stat-label",
        ["font-size", "font-weight", "line-height", "color", "letter-spacing", "margin-top"],
      ],
      [".cy-stat-value", ["font-size", "font-weight", "line-height", "color", "margin-inline-start"]],
      [".cy-stat-unit", ["font-size", "font-weight", "color", "text-transform"]],
      [".cy-stat-delta", ["display", "font-size", "font-weight", "color", "line-height"]],
      [".cy-stat-delta span", ["font-size", "font-weight", "color", "letter-spacing", "text-transform"]],
      [".cy-stat-delta .cy-icon", ["width", "height", "display"]],
      [".cy-stat-description", ["font-size", "font-weight", "color", "margin-inline-start"]],
      [".cy-stat .cy-icon-tile", ["width", "height", "border-radius"]],
    ];
    for (const [selector, props] of parts) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
