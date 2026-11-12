import type { Meta, StoryObj } from "@storybook/react-vite";
import { createRef, type MouseEvent } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import * as icons from "../../icons/index.js";
import { arrowRight, file, folder, home } from "../../icons/index.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { type BreadcrumbItem, Breadcrumbs } from "./Breadcrumbs.js";

const iconMapping: Record<string, unknown> = {};
for (const value of Object.values(icons))
  if (typeof value === "object" && value && "body" in value) iconMapping[value.name] = value;

/** A router's click handler: it takes over the navigation. */
const route = fn((event: MouseEvent<HTMLElement>) => event.preventDefault());

const trail: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Cynosure", href: "/projects/cynosure" },
  { label: "Settings", href: "/projects/cynosure/settings" },
];

const deep: BreadcrumbItem[] = [
  { label: "Home", href: "/", onClick: route },
  { label: "Projects", href: "/projects", onClick: route },
  { label: "Cynosure", href: "#cynosure" },
  { label: "Drafts" },
  { label: "Releases", onClick: route },
  { label: "2026", href: "/2026", onClick: route },
  { label: "Notes", href: "/2026/notes" },
];

const meta = {
  title: "Components/Breadcrumbs",
  component: Breadcrumbs,
  args: { items: trail, size: "md" },
  argTypes: {
    items: { control: "object" },
    maxItems: { control: "number" },
    separator: { control: "select", options: Object.keys(iconMapping), mapping: iconMapping },
    size: { control: "inline-radio", options: ["sm", "md"] },
    labels: { control: "object" },
  },
} satisfies Meta<typeof Breadcrumbs>;
export default meta;
type Story = StoryObj<typeof meta>;

const separators = (root: Element) => [...root.querySelectorAll(".cy-breadcrumbs-separator")];
const names = (els: Element[]) => els.map((el) => el.textContent);
const pseudo = (el: Element) => {
  const s = getComputedStyle(el, "::before");
  return { w: Number.parseFloat(s.width), h: Number.parseFloat(s.height) };
};
/**
 * Stands in for the browser's navigation: records the href of every link click that nothing cancelled, then cancels
 * it so the test page stays where it is.
 */
function navigations(root: HTMLElement) {
  const hrefs: (string | null)[] = [];
  const listen = (event: Event) => {
    const link = (event.target as Element).closest("a");
    if (!link || event.defaultPrevented) return;
    hrefs.push(link.getAttribute("href"));
    event.preventDefault();
  };
  root.addEventListener("click", listen);
  return { hrefs, stop: () => root.removeEventListener("click", listen) };
}
const closed = (menu: Element) => waitFor(() => expect(menu.matches(":popover-open")).toBe(false));

export const Default: Story = {
  tags: ["visual"],
  play: async ({ canvas }) => {
    const nav = canvas.getByRole("navigation", { name: "Breadcrumb" });
    const list = within(nav).getByRole("list");
    await expect(list.tagName).toBe("OL");
    await expect(within(list).getAllByRole("listitem")).toHaveLength(4);
    // Every item but the last is a link to its page.
    const links = within(nav).getAllByRole("link");
    await expect(names(links)).toEqual(["Home", "Projects", "Cynosure"]);
    await expect(links.map((a) => a.getAttribute("href"))).toEqual(["/", "/projects", "/projects/cynosure"]);
    // The last item is the current page: text, not a link, although it has an href.
    const current = within(nav).getByText("Settings").closest("[aria-current]") as HTMLElement;
    await expect(current).toHaveAttribute("aria-current", "page");
    await expect(current.closest("a")).toBeNull();
    await expect(nav.querySelectorAll("[aria-current]")).toHaveLength(1);
    // Separators sit between the items and are hidden from assistive technology.
    const seps = separators(nav);
    await expect(seps).toHaveLength(3);
    for (const sep of seps) await expect(sep).toHaveAttribute("aria-hidden", "true");
    await expect(getComputedStyle(seps[0] as Element).scale).toBe("none");
  },
};

export const LabelsOverride: Story = {
  args: { items: deep, maxItems: 3, labels: { nav: "Fil d'Ariane", more: "Afficher tout le chemin" } },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole("navigation", { name: "Fil d'Ariane" })).toBeVisible();
    const more = canvas.getByRole("button", { name: "Afficher tout le chemin" });
    await userEvent.click(more);
    const menu = await canvas.findByRole("menu", { name: "Afficher tout le chemin" });
    await shownFully(menu);
    await expect(menu).toBeVisible();
  },
};

export const OnClickItems: Story = {
  args: {
    items: [
      { label: "Home", href: "/", onClick: route },
      { label: "Library", onClick: route },
      { label: "Archive" },
      { label: "Report", href: "/report", onClick: route },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    route.mockClear();
    // A link with onClick: the handler gets the click and can stop the navigation.
    await userEvent.click(canvas.getByRole("link", { name: "Home" }));
    await expect(route).toHaveBeenCalledTimes(1);
    await expect(route.mock.calls[0]?.[0].defaultPrevented).toBe(true);
    // onClick without href is a button, for pointer and keyboard.
    const library = canvas.getByRole("button", { name: "Library" });
    await userEvent.click(library);
    await expect(route).toHaveBeenCalledTimes(2);
    library.focus();
    await userEvent.keyboard("{Enter}");
    await expect(route).toHaveBeenCalledTimes(3);
    // Neither href nor onClick: plain text.
    const archive = canvas.getByText("Archive");
    await expect(archive.closest("a, button")).toBeNull();
    // The current page is never pressable, even with href and onClick.
    await userEvent.click(canvas.getByText("Report"));
    await expect(route).toHaveBeenCalledTimes(3);
    await expect(canvas.queryByRole("link", { name: "Report" })).toBeNull();
  },
};

export const LinkNavigates: Story = {
  args: {
    items: [{ label: "Home", href: "/home" }, { label: "Page" }],
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const nav = navigations(canvasElement);
    await userEvent.click(canvas.getByRole("link", { name: "Home" }));
    canvas.getByRole("link", { name: "Home" }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(nav.hrefs).toEqual(["/home", "/home"]);
    nav.stop();
  },
};

export const IconsAndSeparator: Story = {
  tags: ["visual"],
  args: {
    separator: arrowRight,
    items: [
      { label: "Home", href: "/", icon: home },
      { label: "Documents", onClick: route, icon: folder },
      { label: "Shared", icon: folder },
      { label: "Report.pdf", icon: file },
    ],
  },
  play: async ({ canvas }) => {
    const nav = canvas.getByRole("navigation");
    // Item icons are decorative: the names stay the labels.
    await expect(canvas.getByRole("link", { name: "Home" }).querySelector(".cy-icon")).toBeTruthy();
    await expect(canvas.getByRole("button", { name: "Documents" }).querySelector(".cy-icon")).toBeTruthy();
    for (const label of ["Shared", "Report.pdf"]) {
      const icon = canvas.getByText(label).parentElement?.querySelector(".cy-icon");
      await expect(icon).toHaveAttribute("aria-hidden", "true");
    }
    // The separator prop replaces the chevron.
    const seps = separators(nav);
    await expect(seps).toHaveLength(3);
    for (const sep of seps) await expect(sep.innerHTML).toContain("M4.5 12H19");
  },
};

export const RightToLeft: Story = {
  render: (args) => (
    <div dir="rtl">
      <Breadcrumbs {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const nav = canvas.getByRole("navigation");
    // The chevron points the way the trail reads.
    for (const sep of separators(nav)) await expect(getComputedStyle(sep).scale).toBe("-1 1");
    // The trail starts on the right.
    const first = canvas.getByRole("link", { name: "Home" }).getBoundingClientRect();
    const current = canvas.getByText("Settings").getBoundingClientRect();
    await expect(first.left).toBeGreaterThan(current.right);
  },
};

export const CollapsesTheMiddle: Story = {
  tags: ["visual"],
  args: { items: deep, maxItems: 3 },
  play: async ({ canvas, canvasElement, userEvent }) => {
    route.mockClear();
    const trailNav = canvas.getByRole("navigation");
    // The first item, the button, then the last two items.
    await expect(within(trailNav).getAllByRole("listitem")).toHaveLength(4);
    await expect(names(within(trailNav).getAllByRole("link"))).toEqual(["Home", "2026"]);
    await expect(canvas.getByText("Notes").closest("[aria-current]")).toHaveAttribute("aria-current", "page");
    await expect(trailNav.querySelector('[data-index="2"]')).not.toBeVisible();
    await expect(separators(trailNav)).toHaveLength(3);
    const more = canvas.getByRole("button", { name: "Show the full path" });
    await expect(more).toHaveAttribute("aria-haspopup", "menu");
    await expect(more).toHaveAttribute("aria-expanded", "false");
    // The button sits between the first item and the kept ones.
    const x = (el: Element) => el.getBoundingClientRect().left;
    await expect(x(more)).toBeGreaterThan(x(canvas.getByRole("link", { name: "Home" })));
    await expect(x(more)).toBeLessThan(x(canvas.getByRole("link", { name: "2026" })));

    // Pointer: the menu lists the hidden items in trail order.
    await userEvent.click(more);
    const menu = await canvas.findByRole("menu", { name: "Show the full path" });
    await shownFully(menu);
    await expect(more).toHaveAttribute("aria-expanded", "true");
    await expect(names(within(menu).getAllByRole("menuitem"))).toEqual([
      "Projects",
      "Cynosure",
      "Drafts",
      "Releases",
    ]);
    // An item with neither href nor onClick cannot be chosen.
    await expect(within(menu).getByRole("menuitem", { name: "Drafts" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    // Choosing a link with onClick calls it with a click it can cancel.
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Projects" }));
    await expect(route).toHaveBeenCalledTimes(1);
    await expect(route.mock.calls[0]?.[0].defaultPrevented).toBe(true);
    await expect((route.mock.lastCall?.[0].target as Element | undefined)?.closest("a")).toHaveAttribute(
      "href",
      "/projects",
    );
    await closed(menu);

    // Choosing a plain link follows its href.
    const nav = navigations(canvasElement);
    await userEvent.click(more);
    await shownFully(menu);
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Cynosure" }));
    await expect(nav.hrefs).toEqual(["#cynosure"]);
    nav.stop();
    await closed(menu);

    // Choosing an item that only has onClick calls it.
    await userEvent.click(more);
    await shownFully(menu);
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Releases" }));
    await expect(route).toHaveBeenCalledTimes(2);
  },
};

export const CollapsedMenuByKeyboard: Story = {
  args: { items: deep, maxItems: 3 },
  play: async ({ canvas, userEvent }) => {
    route.mockClear();
    const more = canvas.getByRole("button", { name: "Show the full path" });
    // Tab reaches the first link, then the button.
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "Home" })).toHaveFocus();
    await userEvent.tab();
    await expect(more).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const menu = await canvas.findByRole("menu", { name: "Show the full path" });
    await shownFully(menu);
    await waitFor(() => expect(within(menu).getByRole("menuitem", { name: "Projects" })).toHaveFocus());
    // Down moves on, skipping the item that goes nowhere.
    await userEvent.keyboard("{ArrowDown}");
    await expect(within(menu).getByRole("menuitem", { name: "Cynosure" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(within(menu).getByRole("menuitem", { name: "Releases" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(route).toHaveBeenCalledTimes(1);
    await closed(menu);
    await expect(more).toHaveFocus();
    // Escape closes without choosing.
    await userEvent.keyboard("{ArrowDown}");
    await shownFully(menu);
    await userEvent.keyboard("{Escape}");
    await closed(menu);
    await expect(route).toHaveBeenCalledTimes(1);
    await expect(more).toHaveFocus();
  },
};

export const MaxItemsLimits: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      <Breadcrumbs {...args} items={deep} maxItems={1} labels={{ nav: "At least two" }} />
      <Breadcrumbs {...args} items={deep} maxItems={6} labels={{ nav: "One hidden" }} />
      <Breadcrumbs {...args} items={deep} maxItems={7} labels={{ nav: "Fits" }} />
      <Breadcrumbs {...args} items={[{ label: "Home", href: "/" }]} maxItems={2} labels={{ nav: "Single" }} />
      <Breadcrumbs {...args} items={[]} labels={{ nav: "Empty" }} />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const visible = (name: string) =>
      within(canvas.getByRole("navigation", { name }))
        .getAllByRole("listitem")
        .map((li) => (li.querySelector("[aria-haspopup]") ? "more" : li.textContent));
    // Under 2 counts as 2: the first item and the current page always show.
    await expect(visible("At least two")).toEqual(["Home", "more", "Notes"]);
    // One over the limit hides exactly one item.
    await expect(visible("One hidden")).toEqual([
      "Home",
      "more",
      "Cynosure",
      "Drafts",
      "Releases",
      "2026",
      "Notes",
    ]);
    const oneHidden = within(canvas.getByRole("navigation", { name: "One hidden" }));
    await userEvent.click(oneHidden.getByRole("button", { name: "Show the full path" }));
    await expect(names(await oneHidden.findAllByRole("menuitem"))).toEqual(["Projects"]);
    await userEvent.keyboard("{Escape}");
    // At the limit nothing is hidden and there is no button.
    const fits = within(canvas.getByRole("navigation", { name: "Fits" }));
    await expect(fits.getAllByRole("listitem")).toHaveLength(7);
    await expect(fits.queryByRole("button", { name: "Show the full path" })).toBeNull();
    // A single item is the current page, with no separator.
    const single = canvas.getByRole("navigation", { name: "Single" });
    await expect(within(single).queryByRole("link")).toBeNull();
    await expect(within(single).getByText("Home").closest("[aria-current]")).toBeTruthy();
    await expect(separators(single)).toHaveLength(0);
    await expect(
      within(canvas.getByRole("navigation", { name: "Empty" })).queryAllByRole("listitem"),
    ).toHaveLength(0);
  },
};

export const TabOrderFollowsTheTrail: Story = {
  play: async ({ canvas, userEvent }) => {
    for (const name of ["Home", "Projects", "Cynosure"]) {
      await userEvent.tab();
      const link = canvas.getByRole("link", { name });
      await expect(link).toHaveFocus();
      await expect(getComputedStyle(link).outlineStyle).toBe("solid");
    }
    // The current page is not a tab stop.
    await userEvent.tab();
    await expect(canvas.getByRole("navigation")).not.toContainElement(document.activeElement as HTMLElement);
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      <Breadcrumbs {...args} size="sm" labels={{ nav: "Small" }} />
      <Breadcrumbs {...args} labels={{ nav: "Medium" }} />
      <span data-testid="sm" style={{ fontSize: "var(--cy-font-size-sm)" }} />
      <span data-testid="md" style={{ fontSize: "var(--cy-font-size-md)" }} />
    </div>
  ),
  play: async ({ canvas }) => {
    const token = (id: string) => getComputedStyle(canvas.getByTestId(id)).fontSize;
    await expect(token("sm")).not.toBe(token("md"));
    for (const [name, id] of [
      ["Small", "sm"],
      ["Medium", "md"],
    ] as const) {
      const nav = within(canvas.getByRole("navigation", { name }));
      // Links and the current page share the size's font size.
      await expect(getComputedStyle(nav.getByRole("link", { name: "Home" })).fontSize).toBe(token(id));
      await expect(getComputedStyle(nav.getByText("Settings")).fontSize).toBe(token(id));
    }
  },
};

export const SizeAppliesToButtons: Story = {
  args: { items: [{ label: "Library", onClick: route }, { label: "Page" }] },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      <Breadcrumbs {...args} size="sm" labels={{ nav: "Small" }} />
      <Breadcrumbs {...args} labels={{ nav: "Medium" }} />
    </div>
  ),
  play: async ({ canvas }) => {
    const size = (name: string) => {
      const nav = within(canvas.getByRole("navigation", { name }));
      return [
        getComputedStyle(nav.getByRole("button", { name: "Library" })).fontSize,
        getComputedStyle(nav.getByText("Page")).fontSize,
      ];
    };
    // A button crumb has the same text size as the rest of its trail.
    await expect(size("Small")[0]).toBe(size("Small")[1]);
    await expect(size("Medium")[0]).toBe(size("Medium")[1]);
    await expect(size("Small")[0]).not.toBe(size("Medium")[0]);
  },
};

const long: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Quarterly planning and budget review documents for the whole organisation", href: "/a" },
  { label: "Action item with a very long name that cannot fit in a narrow column", onClick: route },
  { label: "Unlinked section with a very long name that cannot fit either" },
  { label: "The final report with every appendix attached and a long title" },
];

export const LongLabelsTruncateAndWrap: Story = {
  tags: ["visual"],
  args: { items: long },
  render: (args) => (
    <div data-testid="box" style={{ inlineSize: 200, border: "1px solid var(--cy-color-line)" }}>
      <Breadcrumbs {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const box = canvas.getByTestId("box");
    const nav = canvas.getByRole("navigation");
    // Nothing sticks out of the narrow container.
    await expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth);
    await expect(nav.scrollWidth).toBeLessThanOrEqual(nav.clientWidth);
    const edge = box.getBoundingClientRect().right;
    for (const li of within(nav).getAllByRole("listitem"))
      await expect(li.getBoundingClientRect().right).toBeLessThanOrEqual(edge + 0.5);
    // Long names are cut with an ellipsis on one line; the full name stays in the accessible name.
    const link = canvas.getByRole("link", { name: long[1]?.label as string });
    const label = link.querySelector(".cy-breadcrumbs-label") as HTMLElement;
    await expect(getComputedStyle(label).textOverflow).toBe("ellipsis");
    await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    const button = canvas.getByRole("button", { name: long[2]?.label as string });
    await expect(button.getBoundingClientRect().right).toBeLessThanOrEqual(edge);
    const current = canvas.getByText(long[4]?.label as string);
    await expect(current.scrollWidth).toBeGreaterThan(current.clientWidth);
    // The trail wraps: the current page is on a lower line than the first item.
    const top = (el: Element) => el.getBoundingClientRect().top;
    await expect(top(current)).toBeGreaterThan(top(canvas.getByRole("link", { name: "Home" })) + 10);
  },
};

export const ThemedByTokens: Story = {
  args: { items: long.slice(0, 3) },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      <Breadcrumbs {...args} labels={{ nav: "Plain" }} />
      <Breadcrumbs
        {...args}
        labels={{ nav: "Themed" }}
        style={
          {
            "--cy-breadcrumbs-gap": "20px",
            "--cy-breadcrumbs-item-max-width": "80px",
            "--cy-breadcrumbs-separator-color": "rgb(1, 2, 3)",
          } as React.CSSProperties
        }
      />
    </div>
  ),
  play: async ({ canvas }) => {
    const plain = canvas.getByRole("navigation", { name: "Plain" });
    const themed = canvas.getByRole("navigation", { name: "Themed" });
    const part = (nav: HTMLElement, selector: string) => nav.querySelector(selector) as HTMLElement;
    await expect(getComputedStyle(part(themed, "ol")).columnGap).toBe("20px");
    await expect(getComputedStyle(part(plain, "ol")).columnGap).not.toBe("20px");
    await expect(getComputedStyle(part(themed, ".cy-breadcrumbs-separator")).color).toBe("rgb(1, 2, 3)");
    const width = (nav: HTMLElement) =>
      within(nav).getAllByRole("link")[1]?.getBoundingClientRect().width ?? 0;
    await expect(width(themed)).toBeLessThanOrEqual(80);
    await expect(width(plain)).toBeGreaterThan(80);
  },
};

const navRef = createRef<HTMLElement>();
export const RefClassNameAndStyle: Story = {
  render: (args) => <Breadcrumbs {...args} ref={navRef} className="mine" style={{ marginBlockStart: 12 }} />,
  play: async ({ canvas }) => {
    const nav = canvas.getByRole("navigation");
    await expect(navRef.current).toBe(nav);
    await expect(nav).toHaveClass("cy-breadcrumbs", "mine");
    await expect(getComputedStyle(nav).marginTop).toBe("12px");
  },
};

export const TouchHitArea: Story = {
  tags: ["touch", "!dev"],
  args: { items: deep, maxItems: 3 },
  play: async ({ canvas, userEvent }) => {
    const more = canvas.getByRole("button", { name: "Show the full path" });
    // The hit area grows to 44px on coarse pointers; the button itself stays compact.
    const hit = pseudo(more);
    await expect(hit.w).toBeGreaterThanOrEqual(44);
    await expect(hit.h).toBeGreaterThanOrEqual(44);
    await expect(more.getBoundingClientRect().height).toBeLessThan(44);
    // A tap opens the menu, and its rows are finger sized.
    await userEvent.pointer({ keys: "[TouchA]", target: more });
    const menu = await canvas.findByRole("menu", { name: "Show the full path" });
    await shownFully(menu);
    for (const row of within(menu).getAllByRole("menuitem"))
      await expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    route.mockClear();
    await userEvent.pointer({
      keys: "[TouchA]",
      target: within(menu).getByRole("menuitem", { name: "Projects" }),
    });
    await expect(route).toHaveBeenCalledTimes(1);
  },
};

export const StableUnderHostileHost: Story = {
  args: { items: [...deep.slice(0, 2), { label: "Shared", icon: folder }, ...deep.slice(3)], maxItems: 5 },
  play: async ({ canvasElement }) => {
    const check = (selector: string, props: string[]) => {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      return expect(hostile).toEqual(clean);
    };
    const text = ["font-size", "font-weight", "line-height", "letter-spacing", "text-transform", "color"];
    await check(".cy-breadcrumbs", ["display", "box-sizing", "margin", "padding", ...text]);
    await check(".cy-breadcrumbs-list", [
      "display",
      "gap",
      "padding",
      "margin",
      "list-style-type",
      "box-sizing",
    ]);
    await check(".cy-breadcrumbs-item", ["display", "gap", "min-height", "box-sizing", ...text]);
    await check(".cy-breadcrumbs-label", ["max-width", "overflow", "white-space", ...text]);
    await check(".cy-breadcrumbs-current", ["display", ...text]);
    await check(".cy-breadcrumbs-text", ["display", ...text]);
    await check(".cy-breadcrumbs-separator", ["width", "height", "color", "display"]);
    await check(".cy-breadcrumbs-item[hidden]", ["display"]);
    // The trail keeps its height, so nothing around it moves.
    const nav = canvasElement.querySelector(".cy-breadcrumbs") as HTMLElement;
    const before = nav.getBoundingClientRect().height;
    const { hostile } = computeUnderHostileHost(canvasElement, ".cy-breadcrumbs", ["height"]);
    await expect(Number.parseFloat(hostile.height as string)).toBeCloseTo(before, 0);
  },
};
