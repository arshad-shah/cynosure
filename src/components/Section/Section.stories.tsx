import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { Heading } from "../Heading/Heading.js";
import { Link } from "../Link/Link.js";
import { Stack } from "../Stack/Stack.js";
import { Text } from "../Text/Text.js";
import { Section } from "./Section.js";

const SPACES = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const VARIANTS = ["plain", "surface", "soft", "accent"] as const;

const meta = {
  title: "Components/Section",
  component: Section,
  args: { variant: "soft", contained: true, size: "lg", as: "section" },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    paddingBlock: { control: "select", options: SPACES },
    contained: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl", "full"] },
    as: { control: "inline-radio", options: ["section", "div", "header", "footer", "aside", "article"] },
    id: { control: "text" },
    "aria-labelledby": { control: "text" },
    "aria-label": { control: "text" },
    role: { control: "text" },
    children: { control: false },
  },
  render: (args) => (
    <Section {...args} id="features" aria-labelledby="features-heading" data-testid="section">
      <Stack gap="4">
        <Heading id="features-heading">Features</Heading>
        <Text as="p">Everything a product needs, themed to match.</Text>
      </Stack>
    </Section>
  ),
} satisfies Meta<typeof Section>;
export default meta;
type Story = StoryObj<typeof meta>;

const box = (el: Element) => el.getBoundingClientRect();
const px = (value: string) => Number.parseFloat(value);
const room = (width: number): CSSProperties => ({ inlineSize: width });

export const LandingPageBands: Story = {
  tags: ["visual"],
  render: () => (
    <div style={room(1200)}>
      <Section as="header" variant="plain" data-testid="plain">
        <Stack gap="4">
          <Heading level={1} size="display">
            Build it once
          </Heading>
          <Link href="#pricing">See the pricing</Link>
        </Stack>
      </Section>
      {(["surface", "soft", "accent"] as const).map((variant) => (
        <Section
          key={variant}
          variant={variant}
          id={variant === "accent" ? "pricing" : undefined}
          aria-labelledby={`${variant}-heading`}
          data-testid={variant}
        >
          <Stack gap="4">
            <Heading id={`${variant}-heading`}>
              {variant === "accent" ? "Pricing" : `A ${variant} band`}
            </Heading>
            <Text as="p">Its content sits in the page column.</Text>
            <Button>Action</Button>
          </Stack>
        </Section>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    // Named sections are region landmarks; the id makes them in-page link targets.
    const pricing = canvas.getByRole("region", { name: "Pricing" });
    await expect(pricing).toHaveAttribute("id", "pricing");
    await expect(pricing).toHaveAttribute("data-variant", "accent");
    await expect(canvas.getByRole("link", { name: "See the pricing" })).toHaveAttribute("href", "#pricing");
    // Each variant has its own background; plain has none, so the page shows through.
    const bg = (id: string) => getComputedStyle(canvas.getByTestId(id)).backgroundColor;
    await expect(bg("plain")).toBe("rgba(0, 0, 0, 0)");
    const fills = new Set(["surface", "soft", "accent"].map(bg));
    await expect(fills.size).toBe(3);
    for (const fill of fills) await expect(fill).not.toBe("rgba(0, 0, 0, 0)");
    // Bands fill the width and stack with nothing between them.
    const [a, b] = [box(canvas.getByTestId("surface")), box(canvas.getByTestId("soft"))] as [
      DOMRect,
      DOMRect,
    ];
    await expect(a.width).toBeCloseTo(1200, 0);
    await expect(b.top).toBeCloseTo(a.bottom, 0);
  },
};

export const VariantsReadTheirTokens: Story = {
  render: () => (
    <div
      style={
        {
          "--cy-section-surface": "rgb(251, 250, 249)",
          "--cy-section-soft": "rgb(248, 247, 246)",
          "--cy-section-accent": "rgb(245, 244, 243)",
          "--cy-section-padding-block": "10px",
        } as CSSProperties
      }
    >
      {VARIANTS.map((variant) => (
        <Section key={variant} variant={variant} data-testid={variant}>
          {variant}
        </Section>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const style = (id: string) => getComputedStyle(canvas.getByTestId(id));
    await expect(style("surface").backgroundColor).toBe("rgb(251, 250, 249)");
    await expect(style("soft").backgroundColor).toBe("rgb(248, 247, 246)");
    await expect(style("accent").backgroundColor).toBe("rgb(245, 244, 243)");
    for (const variant of VARIANTS) {
      await expect(style(variant).paddingTop).toBe("10px");
      await expect(style(variant).paddingBottom).toBe("10px");
    }
  },
};

export const PaddingUsesSpaceTokens: Story = {
  render: () => (
    <>
      <Section data-testid="default">Default</Section>
      <Section paddingBlock="6" data-testid="six">
        Space 6<Section data-testid="nested">Nested</Section>
      </Section>
      <Section paddingBlock="0" data-testid="none">
        None
      </Section>
    </>
  ),
  play: async ({ canvas }) => {
    const style = (id: string) => getComputedStyle(canvas.getByTestId(id));
    // Default: twice space 10 (80px); the prop takes any space token.
    await expect(px(style("default").paddingTop)).toBeCloseTo(80, 0);
    await expect(px(style("default").paddingBottom)).toBeCloseTo(80, 0);
    await expect(px(style("six").paddingTop)).toBeCloseTo(16, 0);
    await expect(px(style("none").paddingTop)).toBe(0);
    // A nested Section does not inherit its parent's padding.
    await expect(px(style("nested").paddingTop)).toBeCloseTo(80, 0);
    // Never padding at the sides: the inner Container's gutters do that.
    await expect(px(style("default").paddingLeft)).toBe(0);
  },
};

export const ContentInThePageColumn: Story = {
  render: () => (
    <div style={room(1400)}>
      <Section data-testid="lg">
        <div data-testid="lg-content">Default column</div>
      </Section>
      <Section size="sm" data-testid="sm">
        <div data-testid="sm-content">Narrow column</div>
      </Section>
      <Section contained={false} data-testid="free">
        <div data-testid="free-content">Fills the band</div>
      </Section>
    </div>
  ),
  play: async ({ canvas }) => {
    const b = (id: string) => box(canvas.getByTestId(id));
    // The band is full width; its content sits in a centred Container of the given size (gutters included).
    await expect(b("lg").width).toBeCloseTo(1400, 0);
    await expect(b("lg-content").width).toBeCloseTo(1024 - 32, 0);
    await expect(b("lg-content").left - b("lg").left).toBeCloseTo(b("lg").right - b("lg-content").right, 0);
    await expect(b("sm-content").width).toBeCloseTo(640 - 32, 0);
    // contained={false}: no column, the content fills the band.
    await expect(b("free-content").width).toBeCloseTo(1400, 0);
  },
};

export const ElementAndAriaAreForwarded: Story = {
  render: () => (
    <div>
      <Section as="aside" aria-label="Related reading" data-testid="aside">
        Aside
      </Section>
      <Section as="div" role="note" aria-label="Note" data-testid="note">
        Note
      </Section>
      <Section data-testid="anonymous">No name</Section>
    </div>
  ),
  play: async ({ canvas }) => {
    const aside = canvas.getByRole("complementary", { name: "Related reading" });
    await expect(aside.tagName).toBe("ASIDE");
    await expect(canvas.getByRole("note", { name: "Note" }).tagName).toBe("DIV");
    // A section without a name is not a landmark.
    await expect(canvas.getByTestId("anonymous").tagName).toBe("SECTION");
    await expect(canvas.queryByRole("region")).toBeNull();
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-section", [
      "display",
      "box-sizing",
      "padding-top",
      "padding-left",
      "margin-top",
      "font-size",
      "font-weight",
      "line-height",
      "letter-spacing",
      "text-transform",
      "color",
      "background-color",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
