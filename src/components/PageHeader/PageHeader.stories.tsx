import type { Meta, StoryObj } from "@storybook/react-vite";
import { createRef } from "react";
import { expect, fn } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Badge } from "../Badge/Badge.js";
import { Breadcrumbs } from "../Breadcrumbs/Breadcrumbs.js";
import { Button } from "../Button/Button.js";
import { SearchField } from "../SearchField/SearchField.js";
import { Text } from "../Text/Text.js";
import { PageHeader } from "./PageHeader.js";

const create = fn();
const trail = (
  <Breadcrumbs
    items={[{ label: "Home", href: "#home" }, { label: "Projects", href: "#projects" }, { label: "Atlas" }]}
  />
);
const threeActions = (
  <>
    <Button variant="ghost">Share</Button>
    <Button>Export</Button>
    <Button variant="solid" tone="accent" onClick={create}>
      New capture
    </Button>
  </>
);
const meta = {
  title: "Components/PageHeader",
  component: PageHeader,
  args: {
    title: "Atlas",
    eyebrow: "Project",
    description: "Captures, notes and exports for the Atlas redesign, shared with the whole team.",
    headingLevel: 1,
    size: "md",
    align: "start",
    divider: false,
    as: "header",
  },
  argTypes: {
    title: { control: "text" },
    eyebrow: { control: "text" },
    description: { control: "text" },
    headingLevel: { control: "inline-radio", options: [1, 2, 3] },
    size: { control: "inline-radio", options: ["md", "lg"] },
    align: { control: "inline-radio", options: ["start", "center"] },
    divider: { control: "boolean" },
    as: { control: "inline-radio", options: ["header", "div", "section"] },
    breadcrumbs: { control: false },
    actions: { control: false },
    meta: { control: false },
    children: { control: false },
  },
  // A page header lives in the page's main area, where a `header` element is not a banner landmark.
  decorators: [
    (Story) => (
      <main>
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof PageHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

const part = (root: ParentNode, name: string) => root.querySelector(`.cy-page-header${name}`) as HTMLElement;
const box = (el: Element) => el.getBoundingClientRect();
/** True when `a` comes before `b` in the document. */
const before = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

export const Default: Story = {
  tags: ["visual"],
  args: {
    breadcrumbs: trail,
    actions: threeActions,
    meta: (
      <>
        <Badge tone="success">Active</Badge>
        <Text as="time" dateTime="2026-11-02">
          Updated 2 November 2026
        </Text>
      </>
    ),
    children: <SearchField label="Search this project" labelHidden />,
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    // One heading, at level 1 by default: the page's title.
    const headings = canvas.getAllByRole("heading");
    await expect(headings).toHaveLength(1);
    const title = canvas.getByRole("heading", { level: 1, name: "Atlas" });
    // A `header` element with no role of its own: inside `main` it is not a banner landmark (the accessibility
    // check of this story fails on a banner that is not at the top level).
    const root = part(canvasElement, "");
    await expect(root.tagName).toBe("HEADER");
    await expect(root).not.toHaveAttribute("role");
    await expect(root.closest("main")).not.toBeNull();

    // Documented reading order: breadcrumbs, eyebrow, title, description, meta, actions, children.
    const order = [
      canvas.getByRole("navigation", { name: "Breadcrumb" }),
      canvas.getByText("Project"),
      title,
      canvas.getByText(/Captures, notes and exports/),
      canvas.getByText("Active"),
      canvas.getByRole("button", { name: "Share" }),
      canvas.getByRole("searchbox", { name: "Search this project" }),
    ];
    for (let i = 1; i < order.length; i++) {
      await expect(before(order[i - 1] as Node, order[i] as Node)).toBe(true);
    }
    // The same order top to bottom on screen, except the actions, which sit beside the text when wide.
    const visual = [order[0], order[1], order[2], order[3], order[4], order[6]] as HTMLElement[];
    for (let i = 1; i < visual.length; i++) {
      await expect(box(visual[i] as Element).top).toBeGreaterThanOrEqual(
        box(visual[i - 1] as Element).bottom,
      );
    }
    // The description is a paragraph; the eyebrow is not a heading.
    await expect(canvas.getByText(/Captures, notes and exports/).tagName).toBe("P");
    await expect(canvas.getByText("Project").tagName).toBe("P");
    // Actions are the caller's own buttons and work as usual.
    create.mockClear();
    await userEvent.click(canvas.getByRole("button", { name: "New capture" }));
    await expect(create).toHaveBeenCalledTimes(1);
  },
};

export const TitleOnly: Story = {
  // The one-line usage: every default comes from the component, not from the story's args.
  render: () => <PageHeader title="Atlas" />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("heading", { level: 1, name: "Atlas" })).toBeVisible();
    // Parts that were not given leave nothing behind: no empty rows, no stray gaps.
    await expect(
      canvasElement.querySelector(
        ".cy-page-header-breadcrumbs, .cy-page-header-eyebrow, .cy-page-header-description, .cy-page-header-meta, .cy-page-header-actions, .cy-page-header-body",
      ),
    ).toBeNull();
    const root = part(canvasElement, "");
    await expect(root).toHaveAttribute("data-size", "md");
    await expect(root).toHaveAttribute("data-align", "start");
    await expect(root).not.toHaveAttribute("data-divider");
    // No outer margin, padding or border: the page layout spaces it.
    const style = getComputedStyle(root);
    await expect(style.margin).toBe("0px");
    await expect(style.padding).toBe("0px");
    await expect(style.borderBlockEndWidth).toBe("0px");
    // With only a title the header is exactly as tall as its heading.
    await expect(box(root).height).toBeCloseTo(box(canvas.getByRole("heading")).height, 0);
  },
};

export const HeadingLevels: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 32 }}>
      {([1, 2, 3] as const).map((level) => (
        <PageHeader key={level} {...args} headingLevel={level} title={`Level ${level}`} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    // The level sets the element, and "md" is Heading's usual size for that level.
    const sizes = { 1: "2xl", 2: "xl", 3: "lg" } as const;
    const px: number[] = [];
    for (const level of [1, 2, 3] as const) {
      const heading = canvas.getByRole("heading", { level, name: `Level ${level}` });
      await expect(heading.tagName).toBe(`H${level}`);
      await expect(heading).toHaveAttribute("data-size", sizes[level]);
      px.push(Number.parseFloat(getComputedStyle(heading).fontSize));
    }
    await expect(px[0]).toBeGreaterThan(px[1] as number);
    await expect(px[1]).toBeGreaterThan(px[2] as number);
  },
};

export const BuiltFromHeadingAndText: Story = {
  // Heading's and Text's own tokens retune the header, which proves it renders those components, not copies.
  render: (args) => (
    <div
      style={
        {
          "--cy-heading-size-2xl": "41px",
          "--cy-heading-size-display": "77px",
          "--cy-text-eyebrow-size": "13px",
          "--cy-text-eyebrow-tracking": "3px",
          "--cy-text-lead-size": "23px",
          "--cy-text-muted": "rgb(1, 90, 2)",
        } as React.CSSProperties
      }
    >
      <PageHeader {...args} />
      <PageHeader {...args} size="lg" title="Hero" />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const title = canvas.getByRole("heading", { name: "Atlas" });
    await expect(title).toHaveClass("cy-heading");
    await expect(getComputedStyle(title).fontSize).toBe("41px");

    const eyebrow = canvasElement.querySelector(".cy-page-header-eyebrow") as HTMLElement;
    await expect(eyebrow).toHaveClass("cy-text");
    await expect(eyebrow).toHaveAttribute("data-variant", "eyebrow");
    const eyebrowStyle = getComputedStyle(eyebrow);
    await expect(eyebrowStyle.fontSize).toBe("13px");
    await expect(eyebrowStyle.letterSpacing).toBe("3px");
    await expect(eyebrowStyle.textTransform).toBe("uppercase");
    await expect(eyebrowStyle.color).toBe("rgb(1, 90, 2)");

    const lead = canvasElement.querySelector(".cy-page-header-description") as HTMLElement;
    await expect(lead).toHaveClass("cy-text");
    await expect(lead).toHaveAttribute("data-variant", "lead");
    await expect(getComputedStyle(lead).fontSize).toBe("23px");
    await expect(getComputedStyle(lead).color).toBe("rgb(1, 90, 2)");

    // size="lg" is Heading's "display" size.
    const hero = canvas.getByRole("heading", { name: "Hero" });
    await expect(hero).toHaveAttribute("data-size", "display");
    await expect(getComputedStyle(hero).fontSize).toBe("77px");
  },
};

export const LargeForLandingPages: Story = {
  tags: ["visual"],
  args: {
    size: "lg",
    align: "center",
    title: "Capture anything",
    eyebrow: "Aperture 3",
    description: "Screenshots, recordings and notes in one place, on every browser.",
    actions: (
      <>
        <Button variant="solid" tone="accent" size="lg">
          Get started
        </Button>
        <Button size="lg">Read the docs</Button>
      </>
    ),
  },
  render: (args) => (
    <div style={{ display: "grid", gap: 32 }}>
      <PageHeader {...args} />
      <PageHeader {...args} size="md" align="start" title="Medium title" actions={undefined} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const lg = canvas.getByRole("heading", { name: "Capture anything" });
    const md = canvas.getByRole("heading", { name: "Medium title" });
    await expect(Number.parseFloat(getComputedStyle(lg).fontSize)).toBeGreaterThan(
      Number.parseFloat(getComputedStyle(md).fontSize),
    );
    await expect(part(canvasElement, "")).toHaveAttribute("data-size", "lg");
  },
};

export const ActionsMoveBelowWhenTheHeaderIsNarrow: Story = {
  args: { actions: threeActions },
  render: (args) => (
    // The story area stays wide: only the header's own width changes.
    <div data-testid="frame" style={{ width: 800 }}>
      <PageHeader {...args} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const frame = canvas.getByTestId("frame");
    const root = part(canvasElement, "");
    const text = part(canvasElement, "-text");
    const actions = part(canvasElement, "-actions");
    const first = canvas.getByRole("button", { name: "Share" });
    const last = canvas.getByRole("button", { name: "New capture" });

    // Wide: the actions are at the inline end, beside the text and level with its top.
    await expect(box(last).right).toBeCloseTo(box(root).right, 0);
    await expect(box(actions).left).toBeGreaterThanOrEqual(box(text).right);
    await expect(box(actions).top).toBeCloseTo(box(text).top, 0);
    await expect(box(first).top).toBeLessThan(box(text).bottom);

    // Narrow: they drop below the text and start from the start edge.
    frame.style.width = "480px";
    await expect(box(actions).top).toBeGreaterThanOrEqual(box(text).bottom);
    await expect(box(first).left).toBeCloseTo(box(root).left, 0);
    await expect(box(text).width).toBeCloseTo(box(root).width, 0);

    // The switch is at 36rem of the header's own width.
    frame.style.width = "576px";
    await expect(box(actions).left).toBeGreaterThanOrEqual(box(text).right);
    frame.style.width = "575px";
    await expect(box(actions).top).toBeGreaterThanOrEqual(box(text).bottom);
  },
};

export const NoOverflowAt320: Story = {
  args: {
    title:
      "Internationalisation and accessibility guidelines for Pneumonoultramicroscopicsilicovolcanoconiosis",
    eyebrow: "Guides / Writing / A deliberately long section name",
    actions: threeActions,
    meta: (
      <>
        <Badge>Draft</Badge>
        <Text>Updated 2 November 2026 by a person with a long name</Text>
      </>
    ),
    children: <SearchField label="Search" labelHidden />,
  },
  render: (args) => (
    <div style={{ display: "grid", gap: 32 }}>
      {(["md", "lg"] as const).map((size) => (
        <div key={size} data-testid={`frame-${size}`} style={{ width: 320, overflow: "auto" }}>
          <PageHeader
            {...args}
            size={size}
            breadcrumbs={
              <Breadcrumbs
                labels={{ nav: `Breadcrumb ${size}` }}
                items={[
                  { label: "Home", href: "#home" },
                  { label: "Projects", href: "#projects" },
                  { label: "Atlas" },
                ]}
              />
            }
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    for (const size of ["md", "lg"]) {
      const frame = canvas.getByTestId(`frame-${size}`);
      const root = part(frame, "");
      await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);
      await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
      // Every part, the long title and each button included, stays inside the 320px header.
      const edge = box(root);
      for (const el of root.querySelectorAll(".cy-heading, .cy-text, .cy-button, .cy-breadcrumbs")) {
        await expect(box(el).left).toBeGreaterThanOrEqual(edge.left - 0.5);
        await expect(box(el).right).toBeLessThanOrEqual(edge.right + 0.5);
      }
    }
  },
};

export const Centered: Story = {
  args: { align: "center", actions: threeActions, breadcrumbs: trail, meta: <Badge>Beta</Badge> },
  render: (args) => (
    <div style={{ width: 800 }}>
      <PageHeader {...args} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const root = part(canvasElement, "");
    const middle = (el: Element) => box(el).left + box(el).width / 2;
    const centre = middle(root);
    await expect(getComputedStyle(canvas.getByRole("heading")).textAlign).toBe("center");
    // Every part is on the centre line, and the actions are below the text even though the header is wide.
    for (const el of [
      canvas.getByRole("navigation"),
      canvas.getByText("Project"),
      canvas.getByRole("heading"),
      canvas.getByText(/Captures, notes and exports/),
      canvas.getByText("Beta"),
      part(canvasElement, "-actions"),
    ]) {
      await expect(Math.abs(middle(el) - centre)).toBeLessThan(1.5);
    }
    await expect(box(part(canvasElement, "-actions")).top).toBeGreaterThanOrEqual(
      box(part(canvasElement, "-text")).bottom,
    );
    // The row of buttons is centred as a group: the same room before the first as after the last.
    const edge = box(root);
    await expect(box(canvas.getByRole("button", { name: "Share" })).left - edge.left).toBeCloseTo(
      edge.right - box(canvas.getByRole("button", { name: "New capture" })).right,
      0,
    );
  },
};

export const Divider: Story = {
  args: { divider: true },
  render: (args) => (
    <div style={{ display: "grid", gap: 32 }}>
      <PageHeader {...args} />
      <div style={{ "--cy-page-header-divider-color": "rgb(1, 2, 3)" } as React.CSSProperties}>
        <PageHeader {...args} title="Themed" />
      </div>
      {/* The colour the default divider must match. */}
      <div
        data-testid="line"
        style={{ borderBlockEnd: "var(--cy-border-width) solid var(--cy-color-line)" }}
      />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const [plain, themed] = [...canvasElement.querySelectorAll(".cy-page-header")] as HTMLElement[];
    const line = getComputedStyle(canvas.getByTestId("line"));
    const style = getComputedStyle(plain as HTMLElement);
    await expect(style.borderBlockEndStyle).toBe("solid");
    await expect(style.borderBlockEndWidth).toBe(line.borderBlockEndWidth);
    await expect(style.borderBlockEndColor).toBe(line.borderBlockEndColor);
    // Only the bottom edge, with space between the content and the line.
    await expect(style.borderBlockStartWidth).toBe("0px");
    await expect(Number.parseFloat(style.paddingBlockEnd)).toBeGreaterThan(0);
    await expect(getComputedStyle(themed as HTMLElement).borderBlockEndColor).toBe("rgb(1, 2, 3)");
  },
};

export const RightToLeft: Story = {
  args: { actions: threeActions, title: "أطلس", eyebrow: "مشروع", description: "لقطات وملاحظات لفريق أطلس." },
  render: (args) => (
    <div dir="rtl" style={{ width: 800 }}>
      <PageHeader {...args} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const root = part(canvasElement, "");
    const text = part(canvasElement, "-text");
    const actions = part(canvasElement, "-actions");
    // The text starts at the right edge and the actions are on the left.
    await expect(box(canvas.getByRole("heading")).right).toBeCloseTo(box(root).right, 0);
    await expect(box(actions).right).toBeLessThanOrEqual(box(text).left);
    await expect(box(actions).left).toBeCloseTo(box(root).left, 0);
  },
};

export const Elements: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 32 }}>
      <PageHeader {...args} title="Default element" />
      <PageHeader {...args} as="div" title="Division" />
      <PageHeader {...args} as="section" title="Section" headingLevel={2} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const tags = [...canvasElement.querySelectorAll(".cy-page-header")].map((el) => el.tagName);
    await expect(tags).toEqual(["HEADER", "DIV", "SECTION"]);
    // No landmark role is added: the unnamed section is not a region, and a header inside main is not a banner.
    await expect(canvas.queryByRole("region")).toBeNull();
    for (const el of canvasElement.querySelectorAll(".cy-page-header"))
      await expect(el).not.toHaveAttribute("role");
  },
};

const ref = createRef<HTMLElement>();
export const RefClassNameAndStyle: Story = {
  render: (args) => (
    <PageHeader
      {...args}
      ref={ref}
      className="host-head"
      style={{ maxInlineSize: 500 }}
      actions={threeActions}
    />
  ),
  play: async ({ canvasElement }) => {
    const root = part(canvasElement, "");
    await expect(ref.current).toBe(root);
    await expect(root).toHaveClass("cy-page-header", "host-head");
    // `style` is for layout: a narrower header also moves its actions below the text.
    await expect(box(root).width).toBe(500);
    await expect(box(part(canvasElement, "-actions")).top).toBeGreaterThanOrEqual(
      box(part(canvasElement, "-text")).bottom,
    );
  },
};

export const FillsItsParent: Story = {
  // The header is a size container, so it must not collapse where a parent sizes children to their content.
  render: (args) => (
    <div
      data-testid="column"
      style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: 700 }}
    >
      <PageHeader {...args} actions={threeActions} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(box(part(canvasElement, "")).width).toBe(box(canvas.getByTestId("column")).width);
  },
};

export const TokensSetTheSpacing: Story = {
  args: { actions: threeActions, breadcrumbs: trail, meta: <Badge>Beta</Badge>, divider: true },
  render: (args) => (
    <div
      style={
        {
          width: 800,
          "--cy-page-header-gap": "40px",
          "--cy-page-header-text-gap": "20px",
          "--cy-page-header-actions-gap": "30px",
          "--cy-page-header-description-max-width": "200px",
          "--cy-page-header-divider-space": "50px",
        } as React.CSSProperties
      }
    >
      <PageHeader {...args} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const root = part(canvasElement, "");
    const main = part(canvasElement, "-main");
    const title = canvas.getByRole("heading");
    const lead = part(canvasElement, "-description");
    await expect(box(main).top - box(part(canvasElement, "-breadcrumbs")).bottom).toBeCloseTo(40, 0);
    await expect(box(title).top - box(canvas.getByText("Project")).bottom).toBeCloseTo(20, 0);
    await expect(box(lead).top - box(title).bottom).toBeCloseTo(20, 0);
    await expect(box(part(canvasElement, "-meta")).top - box(lead).bottom).toBeCloseTo(20, 0);
    await expect(box(lead).width).toBeCloseTo(200, 0);
    await expect(box(canvas.getByRole("button", { name: "Export" })).left).toBeCloseTo(
      box(canvas.getByRole("button", { name: "Share" })).right + 30,
      0,
    );
    await expect(getComputedStyle(root).paddingBlockEnd).toBe("50px");
  },
};

export const DescriptionLineLength: Story = {
  args: {
    description:
      "A long lead that keeps going so that it has to wrap: the measure is capped so that lines stay readable on a wide page, however wide the header itself becomes on a large screen.",
  },
  render: (args) => (
    <div style={{ width: 1400 }}>
      <PageHeader {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const lead = part(canvasElement, "-description");
    // 65ch of the lead's own font, far less than the 1400px header.
    const probe = document.createElement("span");
    probe.style.cssText = "display:block;inline-size:65ch;font:inherit";
    lead.append(probe);
    const cap = box(probe).width;
    probe.remove();
    await expect(box(lead).width).toBeCloseTo(cap, 0);
    await expect(box(lead).width).toBeLessThan(1000);
  },
};

export const StableUnderHostileHost: Story = {
  args: { actions: threeActions, meta: <Badge>Beta</Badge>, divider: true, children: <Text>Below</Text> },
  play: async ({ canvasElement }) => {
    for (const selector of [
      ".cy-page-header",
      ".cy-page-header-main",
      ".cy-page-header-text",
      ".cy-page-header-eyebrow",
      ".cy-page-header-title",
      ".cy-page-header-description",
      ".cy-page-header-meta",
      ".cy-page-header-actions",
      ".cy-page-header-body",
    ]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [
        "display",
        "gap",
        "margin-top",
        "padding-top",
        "padding-bottom",
        "border-bottom-width",
        // Only the root draws a border; the colour of a border with no width paints nothing.
        ...(selector === ".cy-page-header" ? ["border-bottom-color"] : []),
        "font-size",
        "font-weight",
        "line-height",
        "box-sizing",
        "color",
        "text-transform",
        "letter-spacing",
        "width",
        "height",
      ]);
      await expect(hostile, selector).toEqual(clean);
    }
  },
};

export const BetweenMediumAndLarge: Story = {
  args: { title: "Prayer times", titleSize: "3xl", actions: undefined },
  render: (args) => (
    <div style={{ display: "grid", gap: 32 }}>
      <PageHeader {...args} />
      <PageHeader {...args} titleSize={undefined} title="Medium title" />
      <PageHeader {...args} titleSize={undefined} size="lg" title="Large title" />
    </div>
  ),
  play: async ({ canvas }) => {
    const px = (name: string) =>
      Number.parseFloat(getComputedStyle(canvas.getByRole("heading", { name })).fontSize);
    // Larger than "md" (2xl), smaller than the hero size, and still the page's h1.
    await expect(px("Prayer times")).toBeGreaterThan(px("Medium title"));
    await expect(px("Prayer times")).toBeLessThan(px("Large title"));
    await expect(canvas.getByRole("heading", { name: "Prayer times", level: 1 })).toBeInTheDocument();
  },
};
