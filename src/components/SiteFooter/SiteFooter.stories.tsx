import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect, within } from "storybook/test";
import { globe } from "../../icons/globe.js";
import { mail } from "../../icons/mail.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Link } from "../Link/Link.js";
import { SiteFooter, type SiteFooterColumn } from "./SiteFooter.js";

const COLUMNS: SiteFooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "#changelog" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "#docs" },
      { label: "Status", href: "https://status.example.com", external: true },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Contact", href: "#contact" },
    ],
  },
];

const legal = (
  <>
    © 2026 Acme. <Link href="#privacy">Privacy</Link>
  </>
);
const social = (
  <>
    <IconButton icon={mail} label="Email" href="mailto:hello@example.com" variant="ghost" tone="neutral" />
    <IconButton icon={globe} label="Website" href="https://example.com" variant="ghost" tone="neutral" />
  </>
);

const meta = {
  title: "Components/SiteFooter",
  component: SiteFooter,
  args: {
    brand: "Acme",
    tagline: "Tools for small teams, made with care.",
    columns: COLUMNS,
    headingLevel: 2,
    size: "lg",
  },
  argTypes: {
    brand: { control: "text" },
    tagline: { control: "text" },
    columns: { control: "object" },
    headingLevel: { control: "inline-radio", options: [2, 3, 4] },
    legal: { control: false },
    social: { control: false },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl", "full"] },
    labels: { control: "object" },
    id: { control: "text" },
    "aria-label": { control: "text" },
  },
  render: (args) => (
    <Width px={1100}>
      <SiteFooter {...args} legal={legal} social={social} />
    </Width>
  ),
} satisfies Meta<typeof SiteFooter>;
export default meta;
type Story = StoryObj<typeof meta>;

function Width({ px, children }: { px: number; children: ReactNode }) {
  return <div style={{ inlineSize: px }}>{children}</div>;
}

const box = (el: Element) => el.getBoundingClientRect();
const pseudo = (el: Element) => {
  const s = getComputedStyle(el, "::before");
  return { w: Number.parseFloat(s.width), h: Number.parseFloat(s.height) };
};

export const LandmarksHeadingsAndLinks: Story = {
  tags: ["visual"],
  play: async ({ canvas }) => {
    // A top-level footer is the contentinfo landmark; the columns are one named navigation.
    const footer = canvas.getByRole("contentinfo");
    await expect(footer.tagName).toBe("FOOTER");
    const nav = within(footer).getByRole("navigation", { name: "Footer" });
    // Each column: a heading, and a list named by it.
    const headings = within(nav).getAllByRole("heading", { level: 2 });
    await expect(headings.map((h) => h.textContent)).toEqual(["Product", "Resources", "Company"]);
    const product = within(nav).getByRole("list", { name: "Product" });
    const links = within(product).getAllByRole("link");
    await expect(links.map((l) => l.textContent)).toEqual(["Features", "Pricing", "Changelog"]);
    await expect(links.map((l) => l.getAttribute("href"))).toEqual(["#features", "#pricing", "#changelog"]);
    // An external link opens in a new tab and says so.
    const status = within(nav).getByRole("link", { name: /Status/ });
    await expect(status).toHaveAttribute("target", "_blank");
    await expect(status).toHaveAccessibleName("Status (opens in new tab)");
    // Brand, tagline, legal and social are the caller's content, in the footer.
    await expect(within(footer).getByText("Acme")).toBeVisible();
    await expect(within(footer).getByText(/Tools for small teams/).tagName).toBe("P");
    await expect(within(footer).getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "#privacy");
    await expect(within(footer).getByRole("link", { name: "Email" })).toHaveAttribute(
      "href",
      "mailto:hello@example.com",
    );
  },
};

export const KeyboardReachesEveryLink: Story = {
  play: async ({ userEvent }) => {
    const expected = [
      "Features",
      "Pricing",
      "Changelog",
      "Docs",
      "Status (opens in new tab)",
      "About",
      "Contact",
      "Privacy",
      "Email",
      "Website",
    ];
    const reached: string[] = [];
    for (let i = 0; i < expected.length; i++) {
      await userEvent.tab();
      const el = document.activeElement as HTMLElement;
      reached.push(el.getAttribute("aria-label") ?? el.textContent ?? "");
    }
    await expect(reached).toEqual(expected);
  },
};

export const WideColumnsSideBySide: Story = {
  play: async ({ canvas }) => {
    const nav = canvas.getByRole("navigation", { name: "Footer" });
    const tops = within(nav)
      .getAllByRole("heading")
      .map((h) => box(h).top);
    // One row of columns, next to the brand.
    for (const top of tops) await expect(top).toBeCloseTo(tops[0] as number, 0);
    await expect(box(canvas.getByText("Acme")).top).toBeCloseTo(tops[0] as number, -1);
    // The bottom row: legal at the start, social at the end, on one line, under a hairline.
    const privacy = box(canvas.getByRole("link", { name: "Privacy" }));
    const email = box(canvas.getByRole("link", { name: "Email" }));
    await expect(email.left).toBeGreaterThan(privacy.right + 200);
    await expect(Math.abs(email.top + email.height / 2 - (privacy.top + privacy.height / 2))).toBeLessThan(8);
    const bottom = canvas
      .getByRole("link", { name: "Privacy" })
      .closest(".cy-site-footer-bottom") as HTMLElement;
    await expect(Number.parseFloat(getComputedStyle(bottom).borderTopWidth)).toBeGreaterThan(0);
  },
};

export const NarrowStacks: Story = {
  render: (args) => (
    <Width px={340}>
      <SiteFooter {...args} legal={legal} social={social} />
    </Width>
  ),
  play: async ({ canvas, canvasElement }) => {
    const footer = box(canvasElement.querySelector("footer") as Element);
    // Nothing overflows the narrow footer.
    for (const el of canvasElement.querySelectorAll("footer *"))
      await expect(box(el).right).toBeLessThanOrEqual(footer.right + 0.5);
    // The brand above the columns, and the columns one above the other.
    const headings = within(canvas.getByRole("navigation", { name: "Footer" })).getAllByRole("heading");
    await expect(box(headings[0] as Element).top).toBeGreaterThan(box(canvas.getByText("Acme")).bottom);
    for (let i = 1; i < headings.length; i++)
      await expect(box(headings[i] as Element).top).toBeGreaterThan(box(headings[i - 1] as Element).bottom);
  },
};

export const HeadingLevelLabelsAndAttributes: Story = {
  args: { headingLevel: 3, labels: { nav: "Fußzeile" }, id: "site-footer", "aria-label": "Site" },
  render: (args) => (
    <main>
      <h1>Page</h1>
      <h2>Section</h2>
      <SiteFooter {...args} />
    </main>
  ),
  play: async ({ canvas, canvasElement }) => {
    const footer = canvasElement.querySelector("footer") as HTMLElement;
    await expect(footer).toHaveAttribute("id", "site-footer");
    await expect(footer).toHaveAttribute("aria-label", "Site");
    await expect(canvas.getByRole("navigation", { name: "Fußzeile" })).toBeInTheDocument();
    await expect(canvas.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Product",
      "Resources",
      "Company",
    ]);
  },
};

export const OnlyTheBottomRow: Story = {
  args: { brand: undefined, tagline: undefined, columns: [] },
  render: (args) => <SiteFooter {...args} legal={legal} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.queryByRole("navigation")).toBeNull();
    await expect(canvasElement.querySelector(".cy-site-footer-top, .cy-site-footer-social")).toBeNull();
    // With nothing above it, the bottom row draws no hairline of its own.
    const bottom = canvasElement.querySelector(".cy-site-footer-bottom") as HTMLElement;
    await expect(getComputedStyle(bottom).borderTopWidth).toBe("0px");
    await expect(canvas.getByRole("link", { name: "Privacy" })).toBeVisible();
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const check = (selector: string, props: string[]) => {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      return expect(hostile).toEqual(clean);
    };
    const text = ["font-size", "font-weight", "line-height", "letter-spacing", "text-transform", "color"];
    await check(".cy-site-footer", ["display", "box-sizing", "padding-top", "margin-top", ...text]);
    await check(".cy-site-footer-links", ["display", "gap", "padding-left", "margin-top", "list-style-type"]);
    await check(".cy-site-footer-item", ["display", "height", "padding-left"]);
    await check(".cy-site-footer-logo", text);
    await check(".cy-site-footer-legal", text);
  },
};

export const TouchHitAreas: Story = {
  tags: ["touch", "!dev"],
  render: (args) => (
    <Width px={360}>
      <SiteFooter {...args} legal={legal} social={social} />
    </Width>
  ),
  play: async ({ canvas }) => {
    await expect(matchMedia("(pointer: coarse)").matches).toBe(true);
    const nav = canvas.getByRole("navigation", { name: "Footer" });
    for (const list of within(nav).getAllByRole("list")) {
      const links = within(list).getAllByRole("link");
      for (const link of links) {
        const hit = pseudo(link);
        await expect(Math.min(hit.w, hit.h)).toBeGreaterThanOrEqual(44);
      }
      // Rows are a full hit area apart, so neighbouring targets do not overlap.
      for (let i = 1; i < links.length; i++) {
        const a = box(links[i - 1] as Element);
        const b = box(links[i] as Element);
        await expect(b.top + b.height / 2 - (a.top + a.height / 2)).toBeGreaterThanOrEqual(44 - 0.01);
      }
    }
    for (const name of ["Email", "Website"]) {
      const hit = pseudo(canvas.getByRole("link", { name }));
      await expect(Math.min(hit.w, hit.h)).toBeGreaterThanOrEqual(44);
    }
  },
};
