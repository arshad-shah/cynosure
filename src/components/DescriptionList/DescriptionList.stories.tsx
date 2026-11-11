import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { contrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CynosureTheme } from "../../theme/CynosureTheme.js";
import { Badge } from "../Badge/Badge.js";
import { Stack } from "../Stack/Stack.js";
import { type DescriptionItem, DescriptionList } from "./DescriptionList.js";

const ITEMS: DescriptionItem[] = [
  { term: "Name", detail: "Ada Lovelace" },
  { term: "Email address", detail: "ada@example.com" },
  { term: "Role", detail: <Badge tone="accent">Owner</Badge> },
  { term: "Teams", detail: ["Engines", "Notes"] },
];

const meta = {
  title: "Components/DescriptionList",
  component: DescriptionList,
  args: { items: ITEMS, layout: "auto", divided: false, size: "md" },
  argTypes: {
    layout: { control: "inline-radio", options: ["auto", "inline", "stacked"] },
    divided: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  render: (args) => (
    <div className="frame" style={{ inlineSize: 600 }}>
      <DescriptionList {...args} />
    </div>
  ),
} satisfies Meta<typeof DescriptionList>;
export default meta;
type Story = StoryObj<typeof meta>;

const box = (el: Element) => el.getBoundingClientRect();
const terms = (el: Element) => [...el.querySelectorAll("dt")] as HTMLElement[];
const details = (el: Element) => [...el.querySelectorAll("dd")] as HTMLElement[];
const frame = (el: Element) => el.querySelector(".frame") as HTMLElement;
const isInline = (el: Element) => {
  const term = box(terms(el)[0] as Element);
  const detail = box(details(el)[0] as Element);
  return detail.left >= term.right && Math.abs(detail.top - term.top) < 4;
};

export const TermsAndDetails: Story = {
  tags: ["visual"],
  play: async ({ canvas }) => {
    const names = canvas.getAllByRole("term").map((t) => t.textContent);
    await expect(names).toEqual(["Name", "Email address", "Role", "Teams"]);
    const values = canvas.getAllByRole("definition").map((d) => d.textContent);
    await expect(values).toEqual(["Ada Lovelace", "ada@example.com", "Owner", "Engines", "Notes"]);
  },
};

export const TermsLineUpInOneColumn: Story = {
  args: { layout: "inline" },
  play: async ({ canvasElement }) => {
    await expect(isInline(canvasElement)).toBe(true);
    const lefts = details(canvasElement).map((d) => Math.round(box(d).left));
    // Every detail starts at the same place, after the widest term.
    await expect(new Set(lefts).size).toBe(1);
    const widest = Math.max(...terms(canvasElement).map((t) => box(t).right));
    await expect(lefts[0]).toBeGreaterThan(widest);
  },
};

export const LongTermsWrapWithinTheirColumn: Story = {
  args: {
    layout: "inline",
    items: [
      { term: "A very long term that would push every detail far to the end of the row", detail: "Value" },
      { term: "Short", detail: "Another value" },
    ],
  },
  play: async ({ canvasElement }) => {
    const width = box(frame(canvasElement)).width;
    const [long] = terms(canvasElement);
    // The term column stops at 40% of the list and the long term wraps inside it.
    await expect(box(long as Element).width).toBeLessThanOrEqual(width * 0.4 + 1);
    await expect(box(long as Element).height).toBeGreaterThan(
      box(details(canvasElement)[0] as Element).height,
    );
  },
};

export const StacksWhenNarrow: Story = {
  play: async ({ canvasElement }) => {
    await expect(isInline(canvasElement)).toBe(true);
    // Follows the list's own width, so it works in side panels and popups.
    frame(canvasElement).style.inlineSize = "300px";
    await waitFor(() => expect(isInline(canvasElement)).toBe(false));
    const term = box(terms(canvasElement)[0] as Element);
    const detail = box(details(canvasElement)[0] as Element);
    await expect(detail.top).toBeGreaterThanOrEqual(term.bottom);
    await expect(Math.abs(detail.left - term.left)).toBeLessThan(1);
    frame(canvasElement).style.inlineSize = "600px";
    await waitFor(() => expect(isInline(canvasElement)).toBe(true));
  },
};

export const LayoutCanBeFixed: Story = {
  render: (args) => (
    <Stack gap="8">
      <div className="wide-stacked" style={{ inlineSize: 600 }}>
        <DescriptionList {...args} layout="stacked" />
      </div>
      <div className="narrow-inline" style={{ inlineSize: 300 }}>
        <DescriptionList {...args} layout="inline" />
      </div>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    await expect(isInline(canvasElement.querySelector(".wide-stacked") as Element)).toBe(false);
    await expect(isInline(canvasElement.querySelector(".narrow-inline") as Element)).toBe(true);
  },
};

export const SeveralDetailsForATerm: Story = {
  args: { layout: "inline" },
  play: async ({ canvasElement }) => {
    const [engines, notes] = details(canvasElement).slice(-2).map(box);
    // Under each other, in the detail column, beside the one term.
    await expect(notes?.top).toBeGreaterThanOrEqual(engines?.bottom as number);
    await expect(Math.abs((notes?.left as number) - (engines?.left as number))).toBeLessThan(1);
    const teams = box(terms(canvasElement)[3] as Element);
    await expect(Math.abs(teams.top - (engines?.top as number))).toBeLessThan(4);
  },
};

export const Divided: Story = {
  args: { divided: true },
  play: async ({ canvasElement }) => {
    const rows = [...canvasElement.querySelectorAll(".cy-description-list-row")];
    const border = (el: Element) => Number.parseFloat(getComputedStyle(el).borderTopWidth);
    // A line between rows, none above the first.
    await expect(border(rows[0] as Element)).toBe(0);
    for (const row of rows.slice(1)) await expect(border(row)).toBeGreaterThan(0);
  },
};

export const FollowsTheTextDirection: Story = {
  args: { layout: "inline" },
  render: (args) => (
    <div dir="rtl" style={{ inlineSize: 600 }}>
      <DescriptionList {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const term = box(terms(canvasElement)[0] as Element);
    const detail = box(details(canvasElement)[0] as Element);
    await expect(term.left).toBeGreaterThan(detail.right);
  },
};

export const ReadableInLightAndDark: Story = {
  render: (args) => (
    <Stack gap="4">
      {(["light", "dark"] as const).map((mode) => (
        <CynosureTheme key={mode} mode={mode}>
          <div className="surface" style={{ background: "var(--cy-color-surface)", padding: 8 }}>
            <DescriptionList {...args} />
          </div>
        </CynosureTheme>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    for (const surface of canvasElement.querySelectorAll(".surface")) {
      const page = getComputedStyle(surface).backgroundColor;
      for (const text of [...terms(surface), ...details(surface).slice(0, 2)]) {
        await expect(contrast(getComputedStyle(text).color, page)).toBeGreaterThanOrEqual(4.5);
      }
    }
  },
};

export const DefaultsAndEmpty: Story = {
  render: () => (
    <Stack gap="4">
      <DescriptionList items={ITEMS.slice(0, 1)} className="plain" />
      <DescriptionList items={[]} className="empty" />
      <DescriptionList
        items={[
          { id: "a", term: <strong>Same</strong>, detail: "One" },
          { id: "b", term: <strong>Same</strong>, detail: "Two" },
        ]}
        className="nodes"
      />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const plain = canvasElement.querySelector(".plain") as HTMLElement;
    await expect(plain).toHaveAttribute("data-layout", "auto");
    await expect(plain).toHaveAttribute("data-size", "md");
    await expect(plain).not.toHaveAttribute("data-divided");
    await expect(details(canvasElement.querySelector(".empty") as Element)).toHaveLength(0);
    // Terms that are elements need an id; both rows render.
    await expect(details(canvasElement.querySelector(".nodes") as Element).map((d) => d.textContent)).toEqual(
      ["One", "Two"],
    );
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = [
      "display",
      "font-size",
      "font-weight",
      "color",
      "margin-left",
      "padding-left",
      "box-sizing",
    ];
    for (const selector of [
      ".cy-description-list",
      ".cy-description-list-term",
      ".cy-description-list-detail",
    ]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect(hostile).toEqual(clean);
    }
  },
};
