import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useRef, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { check, cloud, lock, zap } from "../../icons/index.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { List, type ListItem } from "./List.js";

const FRUIT: ListItem[] = [{ label: "Apples" }, { label: "Pears" }, { label: "Plums" }];

const INSTALL: ListItem[] = [
  { id: "add", label: "Add the package", description: "pnpm add @arshad-shah/cynosure" },
  { id: "css", label: "Import the styles", description: "Once, at the root of the app." },
  {
    id: "theme",
    label: "Wrap the app in CynosureTheme",
    description: "It sets the tokens for everything inside.",
  },
];

const FEATURES: ListItem[] = [
  { label: "Fast", description: "Builds in under a second.", icon: zap },
  { label: "Private", description: "Nothing leaves the device.", icon: lock },
  { label: "Synced", icon: cloud },
];

const meta = {
  title: "Components/List",
  component: List,
  args: { items: FRUIT, marker: "disc", gap: "md", size: "md", divided: false },
  argTypes: {
    items: { control: "object" },
    marker: { control: "select", options: ["disc", "number", "check", "icon", "tile", "none"] },
    as: { control: "inline-radio", options: [undefined, "ul", "ol"] },
    start: { control: "number" },
    icon: { control: false },
    tone: {
      control: "select",
      options: [undefined, "accent", "neutral", "danger", "success", "warning", "info"],
    },
    gap: { control: "inline-radio", options: ["none", "sm", "md", "lg"] },
    divided: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    label: { control: "text" },
  },
  render: (args) => (
    <div style={{ inlineSize: 360 }}>
      <List {...args} />
    </div>
  ),
} satisfies Meta<typeof List>;
export default meta;
type Story = StoryObj<typeof meta>;

const box = (el: Element) => el.getBoundingClientRect();
const css = (el: Element) => getComputedStyle(el);
const markers = (root: Element) => [...root.querySelectorAll(".cy-list-marker")] as HTMLElement[];
const labels = (root: Element) => [...root.querySelectorAll(".cy-list-label")] as HTMLElement[];
const middle = (r: DOMRect) => r.top + r.height / 2;

export const Default: Story = {
  tags: ["visual"],
  args: { className: "mine", style: { marginInlineStart: 8 } },
  play: async ({ canvas, canvasElement }) => {
    // A real unordered list: three items, read as such, with nothing focusable.
    const list = canvas.getByRole("list");
    await expect(list.tagName).toBe("UL");
    const items = within(list).getAllByRole("listitem");
    await expect(items.map((item) => item.textContent)).toEqual(["Apples", "Pears", "Plums"]);
    await userEvent.tab();
    await expect(list.contains(document.activeElement)).toBe(false);
    // Each bullet is drawn, decorative, and sits beside its label on the first line, at the reading start.
    for (const [i, marker] of markers(canvasElement).entries()) {
      const label = labels(canvasElement)[i] as HTMLElement;
      await expect(marker).toHaveAttribute("aria-hidden", "true");
      await expect(marker.querySelector(".cy-list-dot")).toBeVisible();
      await expect(box(marker).right).toBeLessThanOrEqual(box(label).left);
      await expect(middle(box(marker))).toBeCloseTo(middle(box(label)), 0);
    }
    // No native bullet on top of the drawn one; className and style land on the root.
    await expect(css(list).listStyleType).toBe("none");
    await expect(list).toHaveClass("cy-list", "mine");
    await expect(css(list).marginInlineStart).toBe("8px");
  },
};

export const NumberedHowTo: Story = {
  tags: ["visual"],
  args: { items: INSTALL, marker: "number", label: "Install" },
  play: async ({ canvas, canvasElement }) => {
    // Numbers make it an ordered list, named by `label`.
    const list = canvas.getByRole("list", { name: "Install" });
    await expect(list.tagName).toBe("OL");
    const items = within(list).getAllByRole("listitem");
    await expect(items).toHaveLength(3);
    // The numbers are in order and drawn, not read: the list already gives each item's position.
    await expect(markers(canvasElement).map((m) => m.textContent)).toEqual(["1", "2", "3"]);
    for (const m of markers(canvasElement)) await expect(m).toHaveAttribute("aria-hidden", "true");
    // Each item is a title and a quieter description under it.
    const [first] = items as [HTMLElement];
    const title = first.querySelector(".cy-list-label") as HTMLElement;
    const description = first.querySelector(".cy-list-description") as HTMLElement;
    await expect(title).toHaveTextContent("Add the package");
    await expect(description).toHaveTextContent("pnpm add @arshad-shah/cynosure");
    await expect(box(description).top).toBeGreaterThanOrEqual(box(title).bottom - 1);
    await expect(Number(css(title).fontWeight)).toBeGreaterThan(Number(css(description).fontWeight));
    await expect(css(description).color).not.toBe(css(title).color);
    // The number sits on the title's line, not in the middle of the two lines.
    const marker = markers(canvasElement)[0] as HTMLElement;
    await expect(middle(box(marker))).toBeCloseTo(middle(box(title)), 0);
    // The circle is round and as tall as a line of the title.
    const circle = marker.querySelector(".cy-list-number") as HTMLElement;
    await expect(box(circle).width).toBe(box(circle).height);
    await expect(box(circle).height).toBeCloseTo(box(title).height, 0);
    await expect(css(circle).fontVariantNumeric).toBe("tabular-nums");
  },
};

export const NumbersStartWhereYouSay: Story = {
  args: { items: FRUIT, marker: "number", start: 4 },
  play: async ({ canvas, canvasElement }) => {
    const list = canvas.getByRole("list");
    // The drawn numbers and the list's own numbering agree.
    await expect(markers(canvasElement).map((m) => m.textContent)).toEqual(["4", "5", "6"]);
    await expect(list).toHaveAttribute("start", "4");
  },
};

export const NumbersRightToLeft: Story = {
  render: () => (
    <div dir="rtl" style={{ inlineSize: 360 }}>
      <List
        marker="number"
        items={[
          { label: "ثبّت الحزمة" },
          { label: "استورد الأنماط", description: "مرة واحدة" },
          { label: "ابدأ" },
        ]}
      />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const items = within(canvas.getByRole("list")).getAllByRole("listitem");
    await expect(items).toHaveLength(3);
    // Numbers count up from the top, and each sits at the right, before its label in reading order.
    const numbers = markers(canvasElement);
    await expect(numbers.map((m) => m.textContent)).toEqual(["1", "2", "3"]);
    const tops = numbers.map((m) => box(m).top);
    await expect(tops).toEqual([...tops].sort((a, b) => a - b));
    for (const [i, marker] of numbers.entries())
      await expect(box(marker).left).toBeGreaterThanOrEqual(box(labels(canvasElement)[i] as Element).right);
    // The markers line up in one column at the right edge.
    await expect(new Set(numbers.map((m) => Math.round(box(m).right))).size).toBe(1);
  },
};

export const ChecksForAFeatureList: Story = {
  tags: ["visual"],
  render: () => (
    <div style={{ display: "grid", gap: 16, inlineSize: 360 }}>
      <List
        marker="check"
        label="Included"
        items={[
          { label: "Unlimited projects" },
          { label: "Custom domains" },
          { label: "No trial", tone: "danger" },
        ]}
      />
      <List marker="check" label="Ordered" as="ol" tone="info" items={FRUIT} />
    </div>
  ),
  play: async ({ canvas }) => {
    const included = canvas.getByRole("list", { name: "Included" });
    const ticks = markers(included);
    // A tick before every item, in the success colour; an item's tone wins.
    for (const tick of ticks) await expect(tick.querySelectorAll("svg > *")).toHaveLength(check.body.length);
    await expect(css(ticks[0] as Element).color).toBe(css(ticks[1] as Element).color);
    await expect(css(ticks[2] as Element).color).not.toBe(css(ticks[0] as Element).color);
    await expect(included.tagName).toBe("UL");
    // `as` and `tone` override the defaults.
    const ordered = canvas.getByRole("list", { name: "Ordered" });
    await expect(ordered.tagName).toBe("OL");
    await expect(css(markers(ordered)[0] as Element).color).not.toBe(css(ticks[0] as Element).color);
  },
};

export const IconsAndTiles: Story = {
  tags: ["visual"],
  render: () => (
    <div style={{ display: "grid", gap: 24, inlineSize: 360 }}>
      <List marker="icon" label="Icons" icon={check} items={[...FEATURES, { label: "Plain" }]} />
      <List marker="tile" label="Tiles" items={[...FEATURES, { label: "Plain" }]} />
    </div>
  ),
  play: async ({ canvas }) => {
    const icons = canvas.getByRole("list", { name: "Icons" });
    const drawn = (el: Element) => el.querySelectorAll("svg > *").length;
    // Each item's icon wins over the list's; an item without one takes the list's.
    await expect(markers(icons).map(drawn)).toEqual([
      zap.body.length,
      lock.body.length,
      cloud.body.length,
      check.body.length,
    ]);
    // Tiles: each icon on a decorative IconTile; an item with no icon (and no list icon) falls back to a dot.
    const tiles = canvas.getByRole("list", { name: "Tiles" });
    const [fast, , synced, plain] = markers(tiles) as [HTMLElement, HTMLElement, HTMLElement, HTMLElement];
    await expect(fast.querySelector(".cy-icon-tile")).toHaveAttribute("aria-hidden", "true");
    await expect(plain.querySelector(".cy-icon-tile")).toBeNull();
    await expect(plain.querySelector(".cy-list-dot")).toBeVisible();
    await expect(within(tiles).queryAllByRole("img")).toHaveLength(0);
    // A one-line item centres on its tile; a two-line item hangs its title from the tile's top.
    const syncedLabel = labels(tiles)[2] as HTMLElement;
    await expect(middle(box(syncedLabel))).toBeCloseTo(middle(box(synced)), 0);
    const fastLabel = labels(tiles)[0] as HTMLElement;
    await expect(box(fastLabel).top).toBeCloseTo(box(fast).top, 0);
  },
};

export const NoMarker: Story = {
  args: { marker: "none", items: INSTALL },
  play: async ({ canvas, canvasElement }) => {
    await expect(markers(canvasElement)).toHaveLength(0);
    const list = canvas.getByRole("list");
    // Still a real list, and the text starts at the list's edge.
    await expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    await expect(box(labels(canvasElement)[0] as Element).left).toBe(box(list).left);
  },
};

export const GapAndDividers: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24, inlineSize: 360 }}>
      {(["none", "sm", "md", "lg"] as const).map((gap) => (
        <List key={gap} label={gap} gap={gap} items={FRUIT} />
      ))}
      <List label="divided" divided items={FRUIT} />
      <List
        label="themed"
        divided
        items={FRUIT}
        style={{ "--cy-list-gap-md": "30px", "--cy-list-divider-color": "rgb(200, 0, 100)" } as CSSProperties}
      />
    </div>
  ),
  play: async ({ canvas }) => {
    const items = (name: string) => within(canvas.getByRole("list", { name })).getAllByRole("listitem");
    const space = (name: string) => {
      const [a, b] = items(name) as [HTMLElement, HTMLElement];
      return box(b).top - box(a).bottom;
    };
    // Each gap is larger than the last, and `none` is none.
    const gaps = ["none", "sm", "md", "lg"].map(space);
    await expect(gaps[0]).toBe(0);
    await expect(gaps).toEqual([...gaps].sort((a, b) => a - b));
    await expect(new Set(gaps).size).toBe(4);
    // Divided: a line under every item but the last, with the gap split around it.
    const divided = items("divided");
    const widths = divided.map((el) => css(el).borderBottomWidth);
    await expect(widths).toEqual(["1px", "1px", "0px"]);
    const [a, b] = divided as [HTMLElement, HTMLElement];
    const above = box(a).bottom - box(a.querySelector(".cy-list-text") as Element).bottom;
    const below = box(b.querySelector(".cy-list-text") as Element).top - box(b).top;
    await expect(above - 1).toBeCloseTo(below, 0);
    // The gap and the line's colour are tokens.
    const themed = items("themed") as [HTMLElement, HTMLElement];
    await expect(css(themed[0]).borderBottomColor).toBe("rgb(200, 0, 100)");
    await expect(css(themed[0]).paddingBottom).toBe("15px");
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24, inlineSize: 360 }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <List key={size} label={size} size={size} marker="number" items={INSTALL.slice(0, 1)} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const sized = ["sm", "md", "lg"].map((name) => canvas.getByRole("list", { name }));
    const fonts = sized.map((list) => Number.parseFloat(css(list).fontSize));
    const circles = sized.map((list) => box(list.querySelector(".cy-list-number") as Element).width);
    // The text and the markers grow together.
    for (const list of [fonts, circles]) {
      await expect(list).toEqual([...list].sort((a, b) => a - b));
      await expect(new Set(list).size).toBe(3);
    }
  },
};

function Growing() {
  const ref = useRef<HTMLUListElement | HTMLOListElement>(null);
  const [items, setItems] = useState<ListItem[]>(FRUIT);
  const [tag, setTag] = useState("");
  return (
    <div style={{ display: "grid", gap: 12, inlineSize: 360 }}>
      <List ref={ref} marker="number" items={items} />
      <Button onClick={() => setItems([{ id: "fig", label: "Figs" }, ...items])}>Add figs</Button>
      <Button onClick={() => setTag(ref.current?.tagName ?? "")}>Measure</Button>
      <output>{tag}</output>
    </div>
  );
}

export const NumbersFollowTheItems: Story = {
  render: () => <Growing />,
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add figs" }));
    // A new first item is numbered 1 and the rest move down.
    await expect(markers(canvasElement).map((m) => m.textContent)).toEqual(["1", "2", "3", "4"]);
    await expect(labels(canvasElement).map((l) => l.textContent)).toEqual([
      "Figs",
      "Apples",
      "Pears",
      "Plums",
    ]);
    // The ref is the list element.
    await userEvent.click(canvas.getByRole("button", { name: "Measure" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("OL");
  },
};

export const StableUnderHostileHost: Story = {
  args: { items: FEATURES, marker: "number", divided: true },
  play: async ({ canvasElement }) => {
    const parts: [selector: string, props: string[]][] = [
      [
        ".cy-list",
        [
          "display",
          "gap",
          "padding-inline-start",
          "margin-top",
          "list-style-type",
          "font-size",
          "line-height",
        ],
      ],
      [
        ".cy-list-item",
        ["display", "padding-top", "border-bottom-width", "font-size", "font-weight", "color", "line-height"],
      ],
      [".cy-list-marker", ["display", "width", "height", "color", "font-size"]],
      [".cy-list-number", ["width", "height", "font-size", "font-weight", "line-height", "background-color"]],
      [
        ".cy-list-label",
        ["font-size", "font-weight", "line-height", "color", "letter-spacing", "text-transform"],
      ],
      [".cy-list-description", ["font-size", "font-weight", "line-height", "color", "margin-top"]],
    ];
    for (const [selector, props] of parts) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};

export const StableUnderHostileHostWithTiles: Story = {
  args: { items: FEATURES, marker: "tile" },
  play: async ({ canvasElement }) => {
    const parts: [selector: string, props: string[]][] = [
      [".cy-list-marker", ["display", "width", "height"]],
      [".cy-list .cy-icon-tile", ["width", "height", "border-radius", "background-color"]],
      [".cy-list .cy-icon-tile .cy-icon", ["width", "height"]],
    ];
    for (const [selector, props] of parts) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
