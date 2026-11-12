import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect, waitFor, within } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import { SiteHeader, type SiteHeaderLink } from "./SiteHeader.js";

const NAV: SiteHeaderLink[] = [
  { label: "Docs", href: "#docs", current: true },
  { label: "Components", href: "#components" },
  { label: "Blog", href: "#blog" },
  { label: "Pricing", href: "#pricing" },
];

const meta = {
  title: "Components/SiteHeader",
  component: SiteHeader,
  args: {
    brand: "Acme",
    brandHref: "/",
    nav: NAV,
    sticky: true,
    skipLink: true,
    skipTo: "#main",
    collapseBelow: "md",
    size: "lg",
  },
  argTypes: {
    brand: { control: "text" },
    brandHref: { control: "text" },
    nav: { control: "object" },
    actions: { control: false },
    sticky: { control: "boolean" },
    skipLink: { control: "boolean" },
    skipTo: { control: "text" },
    collapseBelow: { control: "inline-radio", options: ["sm", "md", "lg"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl", "full"] },
    labels: { control: "object" },
    id: { control: "text" },
  },
  render: (args) => (
    <Page width={1100}>
      <SiteHeader {...args} actions={<Button>Sign in</Button>} />
    </Page>
  ),
} satisfies Meta<typeof SiteHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A page of the given width: the header, then `main` (the skip link's target). */
function Page({ width, children }: { width: number; children: ReactNode }) {
  return (
    <div className="page" style={{ inlineSize: width }}>
      {children}
      <main id="main" data-testid="main">
        <h1 style={{ margin: 16 }}>Getting started</h1>
        <Button>In the page</Button>
      </main>
    </div>
  );
}

/**
 * One of several headers in a story: a named section, so its header is not a second banner landmark. Give each
 * header's navigation its own name too.
 */
function Demo({ name, width, children }: { name: string; width?: number; children: ReactNode }) {
  return (
    <section aria-label={name} data-testid={name} style={width ? { inlineSize: width } : undefined}>
      {children}
    </section>
  );
}

const box = (el: Element) => el.getBoundingClientRect();
const sheet = () => document.querySelector("dialog.cy-dialog") as HTMLDialogElement;
/** The menu sheet that is open (a story with several headers has a sheet for each). */
const openSheet = () =>
  waitFor(() => {
    const dialog = document.querySelector<HTMLDialogElement>("dialog.cy-dialog[open]");
    expect(dialog).not.toBeNull();
    return dialog as HTMLDialogElement;
  });
const pseudo = (el: Element) => {
  const s = getComputedStyle(el, "::before");
  return { w: Number.parseFloat(s.width), h: Number.parseFloat(s.height) };
};
/** Links are hash links; stop the story's page from jumping when one is followed. */
const stayPut = (event: Event) => {
  if ((event.target as Element).closest?.("a[href^='#']")) event.preventDefault();
};

export const BrandNavigationAndActions: Story = {
  tags: ["visual"],
  play: async ({ canvas, canvasElement }) => {
    // A top-level header is the banner landmark; the navigation inside it is named.
    const banner = canvas.getByRole("banner");
    await expect(banner.tagName).toBe("HEADER");
    const nav = within(banner).getByRole("navigation", { name: "Main" });
    const links = within(nav).getAllByRole("link");
    await expect(links.map((l) => l.textContent)).toEqual(["Docs", "Components", "Blog", "Pricing"]);
    await expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "#docs",
      "#components",
      "#blog",
      "#pricing",
    ]);
    // Only the current page is marked.
    await expect(within(nav).getByRole("link", { name: "Docs" })).toHaveAttribute("aria-current", "page");
    for (const link of links.slice(1)) await expect(link).not.toHaveAttribute("aria-current");
    // The brand links home.
    await expect(within(banner).getByRole("link", { name: "Acme" })).toHaveAttribute("href", "/");
    // Wide: the links are in the bar and the menu button is not shown.
    await expect(nav).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "Open menu" })).toBeNull();
    // Brand at the start, the actions at the end of the column.
    const bar = canvasElement.querySelector(".cy-site-header-bar") as HTMLElement;
    const signIn = canvas.getByRole("button", { name: "Sign in" });
    await expect(box(signIn).right).toBeLessThanOrEqual(box(bar).right);
    await expect(box(bar).right - box(signIn).right).toBeLessThan(40);
    await expect(box(within(banner).getByRole("link", { name: "Acme" })).left - box(bar).left).toBeLessThan(
      40,
    );
  },
};

export const KeyboardOrder: Story = {
  play: async ({ canvas, userEvent }) => {
    const expected = [
      "Skip to content",
      "Acme",
      "Docs",
      "Components",
      "Blog",
      "Pricing",
      "Sign in",
      "In the page",
    ];
    const reached: string[] = [];
    for (let i = 0; i < expected.length; i++) {
      await userEvent.tab();
      reached.push((document.activeElement as HTMLElement).textContent ?? "");
    }
    await expect(reached).toEqual(expected);
    // The skip link from the start: Enter jumps over the header to main.
    await userEvent.keyboard("{Shift>}{Tab}{Tab}{Tab}{Tab}{Tab}{Tab}{Tab}{/Shift}");
    const skip = canvas.getByRole("link", { name: "Skip to content" });
    await expect(skip).toHaveFocus();
    await expect(box(skip).width).toBeGreaterThan(20);
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByTestId("main")).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "In the page" })).toHaveFocus();
  },
};

export const NarrowMenuWithTheKeyboard: Story = {
  render: (args) => (
    <Page width={400}>
      <SiteHeader {...args} actions={<Button>Sign in</Button>} />
    </Page>
  ),
  play: async ({ canvas, userEvent }) => {
    // Narrow: the links leave the bar (and the accessibility tree) and a menu button takes their place.
    await expect(canvas.queryByRole("navigation")).toBeNull();
    const open = canvas.getByRole("button", { name: "Open menu" });
    await expect(open).toBeVisible();
    await expect(open).toHaveAttribute("aria-expanded", "false");
    // The actions stay in the bar.
    await expect(canvas.getByRole("button", { name: "Sign in" })).toBeVisible();
    open.focus();
    await userEvent.keyboard("{Enter}");
    const dialog = sheet();
    await waitFor(() => expect(dialog.open).toBe(true));
    await shownFully(dialog.querySelector(".cy-dialog-panel") as Element);
    await expect(dialog).toHaveAccessibleName("Menu");
    await expect(open).toHaveAttribute("aria-expanded", "true");
    // The same links, the current one marked.
    const nav = within(dialog).getByRole("navigation", { name: "Main" });
    const links = within(nav).getAllByRole("link");
    await expect(links.map((l) => l.textContent)).toEqual(["Docs", "Components", "Blog", "Pricing"]);
    await expect(within(nav).getByRole("link", { name: "Docs" })).toHaveAttribute("aria-current", "page");
    await expect(within(nav).getByRole("link", { name: "Blog" })).toHaveAttribute("href", "#blog");
    // Escape closes it and focus goes back to the menu button.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog.open).toBe(false));
    await expect(open).toHaveFocus();
    await expect(open).toHaveAttribute("aria-expanded", "false");
  },
};

export const ChoosingALinkClosesTheMenu: Story = {
  render: (args) => (
    <Page width={400}>
      <SiteHeader {...args} />
    </Page>
  ),
  play: async ({ canvas, userEvent }) => {
    document.addEventListener("click", stayPut);
    try {
      await userEvent.click(canvas.getByRole("button", { name: "Open menu" }));
      const dialog = sheet();
      await waitFor(() => expect(dialog.open).toBe(true));
      await shownFully(dialog.querySelector(".cy-dialog-panel") as Element);
      await userEvent.click(within(dialog).getByRole("link", { name: "Pricing" }));
      await waitFor(() => expect(dialog.open).toBe(false));
      await expect(canvas.getByRole("button", { name: "Open menu" })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    } finally {
      document.removeEventListener("click", stayPut);
    }
  },
};

export const CollapsesOnItsOwnWidth: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(
        [
          ["sm", 700],
          ["md", 700],
          ["md", 800],
          ["lg", 900],
        ] as const
      ).map(([collapseBelow, width]) => (
        <Demo key={`${collapseBelow}-${width}`} name={`${collapseBelow}-${width}`} width={width}>
          <SiteHeader
            {...args}
            collapseBelow={collapseBelow}
            skipLink={false}
            sticky={false}
            labels={{ nav: `Main ${collapseBelow}-${width}` }}
          />
        </Demo>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const collapsed = (id: string) => {
      const header = within(canvas.getByTestId(id));
      return (
        header.queryByRole("navigation") === null &&
        header.queryByRole("button", { name: "Open menu" }) !== null
      );
    };
    // sm 40rem, md 48rem, lg 64rem, measured on the header itself (16px root font size).
    await expect(collapsed("sm-700")).toBe(false);
    await expect(collapsed("md-700")).toBe(true);
    await expect(collapsed("md-800")).toBe(false);
    await expect(collapsed("lg-900")).toBe(true);
  },
};

export const StickyWhileThePageScrolls: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 16 }}>
      {[true, false].map((sticky) => (
        <Demo key={String(sticky)} name={sticky ? "sticky" : "static"}>
          <div
            data-testid={`${sticky ? "sticky" : "static"}-frame`}
            style={{ inlineSize: 500, blockSize: 300, overflowY: "auto" }}
          >
            <SiteHeader
              {...args}
              sticky={sticky}
              skipLink={false}
              collapseBelow="sm"
              nav={NAV.slice(0, 2)}
              labels={{ nav: `Main ${sticky}` }}
            />
            <div style={{ blockSize: 1500 }}>Page</div>
          </div>
        </Demo>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    for (const id of ["sticky", "static"]) {
      const frame = canvas.getByTestId(`${id}-frame`);
      frame.scrollTop = 600;
      const header = frame.querySelector("header") as HTMLElement;
      if (id === "sticky") {
        await expect(box(header).top).toBeCloseTo(box(frame).top, 0);
        // The page shows through, blurred.
        await expect(getComputedStyle(header).backdropFilter).toMatch(/^blur\(/);
      } else {
        await expect(box(header).bottom).toBeLessThan(box(frame).top);
      }
    }
  },
};

export const SkipLinkOptions: Story = {
  render: (args) => (
    <div>
      <Demo name="default">
        <SiteHeader {...args} labels={{ nav: "Main default" }} />
      </Demo>
      <Demo name="custom">
        <SiteHeader
          {...args}
          skipTo="#article"
          labels={{ nav: "Main custom", skip: "Jump to the article" }}
        />
      </Demo>
      <Demo name="none">
        <SiteHeader {...args} skipLink={false} labels={{ nav: "Main none" }} />
      </Demo>
    </div>
  ),
  play: async ({ canvas }) => {
    const skip = (id: string) =>
      within(canvas.getByTestId(id)).queryAllByRole("link", { name: /skip|jump/i });
    await expect(skip("default")[0]).toHaveAttribute("href", "#main");
    await expect(skip("custom")[0]).toHaveAttribute("href", "#article");
    await expect(skip("custom")[0]).toHaveAccessibleName("Jump to the article");
    await expect(skip("none")).toHaveLength(0);
    // The skip link comes before the header, as the first stop of the Tab order.
    const first = skip("default")[0] as HTMLElement;
    await expect(first.nextElementSibling?.tagName).toBe("HEADER");
  },
};

export const BrandWithoutLinkAndLabels: Story = {
  args: {
    brandHref: false,
    labels: { nav: "Hauptmenü", openMenu: "Menü öffnen", menu: "Menü", skip: "Zum Inhalt" },
  },
  render: (args) => (
    <div>
      <Demo name="wide" width={1100}>
        <SiteHeader {...args} skipLink={false} />
      </Demo>
      <Demo name="narrow" width={400}>
        <SiteHeader {...args} />
      </Demo>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const wide = within(canvas.getByTestId("wide"));
    await expect(wide.getByText("Acme")).toBeVisible();
    await expect(wide.queryByRole("link", { name: "Acme" })).toBeNull();
    await expect(wide.getByRole("navigation", { name: "Hauptmenü" })).toBeVisible();
    const narrow = within(canvas.getByTestId("narrow"));
    await expect(narrow.getByRole("link", { name: "Zum Inhalt" })).toBeInTheDocument();
    await userEvent.click(narrow.getByRole("button", { name: "Menü öffnen" }));
    const dialog = await openSheet();
    await expect(dialog).toHaveAccessibleName("Menü");
    await expect(within(dialog).getByRole("navigation", { name: "Hauptmenü" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog.open).toBe(false));
  },
};

export const RightToLeft: Story = {
  render: (args) => (
    <div dir="rtl">
      <Page width={1100}>
        <SiteHeader {...args} actions={<Button>Sign in</Button>} />
      </Page>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const bar = box(canvasElement.querySelector(".cy-site-header-bar") as Element);
    // The brand starts at the right edge, the actions end at the left.
    await expect(bar.right - box(canvas.getByRole("link", { name: "Acme" })).right).toBeLessThan(40);
    await expect(box(canvas.getByRole("button", { name: "Sign in" })).left - bar.left).toBeLessThan(40);
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const check = (selector: string, props: string[]) => {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      return expect(hostile).toEqual(clean);
    };
    const text = ["font-size", "font-weight", "line-height", "letter-spacing", "text-transform", "color"];
    await check(".cy-site-header", ["display", "box-sizing", "height", "margin-top", "padding-top", ...text]);
    await check(".cy-site-header-bar", ["display", "height", "padding-top"]);
    await check(".cy-site-header-link", ["display", "height", "padding-left", "box-sizing", ...text]);
    await check(".cy-site-header-brand", ["display", "height", ...text]);
    await check(".cy-site-header-list", ["display", "gap", "padding-left", "margin-top", "list-style-type"]);
  },
};

export const TouchHitAreas: Story = {
  tags: ["touch", "!dev"],
  render: (args) => (
    <div>
      <Demo name="wide" width={1100}>
        <SiteHeader {...args} skipLink={false} labels={{ nav: "Main wide" }} />
      </Demo>
      <Demo name="narrow" width={360}>
        <SiteHeader {...args} skipLink={false} labels={{ nav: "Main narrow" }} />
      </Demo>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await expect(matchMedia("(pointer: coarse)").matches).toBe(true);
    // Links in the bar and the brand: at least 44px to a finger.
    const wide = within(canvas.getByTestId("wide"));
    for (const link of wide.getAllByRole("link")) {
      const hit = pseudo(link);
      await expect(Math.min(hit.w, hit.h)).toBeGreaterThanOrEqual(44);
    }
    // The menu button and the links in the menu.
    const open = within(canvas.getByTestId("narrow")).getByRole("button", { name: "Open menu" });
    const hit = pseudo(open);
    await expect(Math.min(hit.w, hit.h)).toBeGreaterThanOrEqual(44);
    await userEvent.click(open);
    const dialog = await openSheet();
    await shownFully(dialog.querySelector(".cy-dialog-panel") as Element);
    for (const link of within(dialog).getAllByRole("link"))
      await expect(box(link).height).toBeGreaterThanOrEqual(44);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog.open).toBe(false));
  },
};
