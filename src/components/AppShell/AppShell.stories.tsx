import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, waitFor, within } from "storybook/test";
import { home } from "../../icons/home.js";
import { inbox } from "../../icons/inbox.js";
import { users } from "../../icons/users.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import { type NavEntry, SideNav } from "../SideNav/SideNav.js";
import { Table } from "../Table/Table.js";
import { AppShell } from "./AppShell.js";

const ITEMS: NavEntry[] = [
  { id: "home", label: "Home", icon: home },
  { id: "inbox", label: "Inbox", icon: inbox },
  { id: "team", label: "Team", icon: users, items: [{ id: "members", label: "Members" }] },
];

function Demo({
  width = 900,
  withTabs = false,
  ...props
}: { width?: number; withTabs?: boolean } & Parameters<typeof AppShell>[0]) {
  const [current, setCurrent] = useState("home");
  const tabs = withTabs ? (
    <SideNav
      label="Sections"
      layout="bar"
      items={ITEMS}
      current={current}
      onNavigate={(id) => setCurrent(id)}
    />
  ) : undefined;
  return (
    <div
      className="frame"
      style={{
        inlineSize: width,
        blockSize: 420,
        border: "var(--cy-border-width) solid var(--cy-color-line)",
      }}
    >
      <AppShell
        header={<strong>Acme</strong>}
        nav={<SideNav label="Main" items={ITEMS} current={current} onNavigate={(id) => setCurrent(id)} />}
        {...(tabs ? { tabs } : {})}
        {...props}
      >
        <div style={{ padding: 16 }}>
          <h1 style={{ margin: 0 }}>{current}</h1>
          <Button>Action</Button>
        </div>
      </AppShell>
    </div>
  );
}

const meta = {
  title: "Components/AppShell",
  component: AppShell,
  args: { collapseBelow: 768 },
  render: (args) => <Demo {...args} />,
} satisfies Meta<typeof AppShell>;
export default meta;
type Story = StoryObj<typeof meta>;

const box = (el: Element) => el.getBoundingClientRect();
const frame = (el: Element) => el.querySelector(".frame") as HTMLElement;
/** Layout changes arrive through a ResizeObserver, which a busy CI runner can deliver late. */
const RESIZE = { timeout: 3000 };
const sheet = () => document.querySelector("dialog.cy-dialog") as HTMLDialogElement | null;

export const NavigationBesideTheContent: Story = {
  tags: ["visual"],
  play: async ({ canvas }) => {
    const nav = canvas.getByRole("navigation", { name: "Main" });
    const main = canvas.getByRole("main");
    await expect(canvas.getByRole("banner")).toHaveTextContent("Acme");
    // The navigation sits beside the content, under the bar, with no menu button.
    await expect(box(nav).right).toBeLessThanOrEqual(box(main).left + 1);
    await expect(box(nav).top).toBeGreaterThanOrEqual(box(canvas.getByRole("banner")).bottom - 1);
    await expect(canvas.queryByRole("button", { name: "Open navigation" })).toBeNull();
  },
};

export const SkipLinkJumpsToTheContent: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    const skip = canvas.getByRole("link", { name: "Skip to content" });
    await expect(skip).toHaveFocus();
    // Hidden until focused, then visible.
    await expect(box(skip).width).toBeGreaterThan(20);
    const hash = location.hash;
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("main")).toHaveFocus();
    // The URL is left to the app's router.
    await expect(location.hash).toBe(hash);
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Action" })).toHaveFocus();
  },
};

export const NarrowMovesTheNavigationIntoADrawer: Story = {
  args: {},
  render: (args) => <Demo {...args} width={420} />,
  play: async ({ canvas, userEvent }) => {
    await waitFor(
      () => expect(canvas.getByRole("button", { name: "Open navigation" })).toBeVisible(),
      RESIZE,
    );
    await expect(canvas.queryByRole("navigation")).toBeNull();
    const open = canvas.getByRole("button", { name: "Open navigation" });
    await expect(open).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(open);
    const dialog = sheet() as HTMLDialogElement;
    await waitFor(() => expect(dialog.open).toBe(true));
    await shownFully(dialog.querySelector(".cy-dialog-panel") as Element);
    await expect(dialog).toHaveAccessibleName("Navigation");
    // A group toggle keeps the drawer open…
    const doc = within(dialog);
    await userEvent.click(doc.getByRole("button", { name: "Team" }));
    await expect(dialog.open).toBe(true);
    // …choosing a destination closes it, and focus returns to the menu button.
    await userEvent.click(doc.getByRole("button", { name: "Inbox" }));
    await waitFor(() => expect(dialog.open).toBe(false));
    await expect(canvas.getByRole("heading", { name: "inbox" })).toBeVisible();
    await waitFor(() => expect(open).toHaveFocus());
  },
};

export const TabBarOnPhones: Story = {
  tags: ["visual"],
  render: (args) => <Demo {...args} width={390} withTabs />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const tabs = await canvas.findByRole("navigation", { name: "Sections" }, RESIZE);
    const main = canvas.getByRole("main");
    // The bar runs along the bottom of the shell, under the content, one row of items.
    await expect(box(tabs).top).toBeGreaterThanOrEqual(box(main).bottom - 1);
    await expect(box(tabs).bottom).toBeCloseTo(box(frame(canvasElement)).bottom - 1, 0);
    const links = within(tabs).getAllByRole("button");
    await expect(links).toHaveLength(3);
    const tops = new Set(links.map((l) => Math.round(box(l).top)));
    await expect(tops.size).toBe(1);
    for (const l of links) await expect(box(l).height).toBeGreaterThanOrEqual(24);
    // The current section is marked; choosing another goes there.
    await expect(within(tabs).getByRole("button", { name: "Home" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(within(tabs).getByRole("button", { name: "Inbox" }));
    await expect(canvas.getByRole("heading")).toHaveTextContent("inbox");
    await expect(within(tabs).getByRole("button", { name: "Inbox" })).toHaveAttribute("aria-current", "page");
    // A group is one item in a bar: it navigates to itself rather than opening.
    const team = within(tabs).getByRole("button", { name: "Team" });
    await expect(team).not.toHaveAttribute("aria-expanded");
    await userEvent.click(team);
    await expect(canvas.getByRole("heading")).toHaveTextContent("team");
    // The drawer is still there for the full navigation.
    await expect(canvas.getByRole("button", { name: "Open navigation" })).toBeVisible();
  },
};

export const TabBarOnlyWhenNarrow: Story = {
  render: (args) => <Demo {...args} withTabs />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("navigation", { name: "Main" })).toBeVisible();
    await expect(canvas.queryByRole("navigation", { name: "Sections" })).toBeNull();
    frame(canvasElement).style.inlineSize = "390px";
    await canvas.findByRole("navigation", { name: "Sections" }, RESIZE);
  },
};

export const FollowsItsOwnWidth: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("navigation", { name: "Main" })).toBeVisible();
    frame(canvasElement).style.inlineSize = "600px";
    await waitFor(
      () => expect(canvas.getByRole("button", { name: "Open navigation" })).toBeVisible(),
      RESIZE,
    );
    await expect(canvas.queryByRole("navigation")).toBeNull();
    frame(canvasElement).style.inlineSize = "900px";
    await waitFor(() => expect(canvas.getByRole("navigation", { name: "Main" })).toBeVisible(), RESIZE);
  },
};

export const CustomBreakpointAndLabels: Story = {
  args: {
    collapseBelow: 1000,
    labels: { openNav: "Menü öffnen", nav: "Navigation öffnen", skip: "Zum Inhalt" },
  },
  play: async ({ canvas }) => {
    // 900px is under the custom 1000px breakpoint.
    await waitFor(() => expect(canvas.getByRole("button", { name: "Menü öffnen" })).toBeVisible(), RESIZE);
    await expect(canvas.getByRole("link", { name: "Zum Inhalt" })).toBeInTheDocument();
  },
};

export const WithoutNavigation: Story = {
  render: () => (
    <div className="frame" style={{ inlineSize: 420, blockSize: 300 }}>
      <AppShell header={<strong>Acme</strong>}>
        <p>Only content.</p>
      </AppShell>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.queryByRole("button", { name: "Open navigation" })).toBeNull();
    await expect(box(canvas.getByRole("main")).width).toBeCloseTo(box(frame(canvasElement)).width, 0);
  },
};

export const ContentScrollsOnItsOwn: Story = {
  render: () => (
    <div className="frame" style={{ inlineSize: 900, blockSize: 300 }}>
      <AppShell header={<strong>Acme</strong>} nav={<SideNav label="Main" items={ITEMS} />}>
        <div style={{ blockSize: 2000 }}>
          <Button>Top</Button>
        </div>
      </AppShell>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const main = canvas.getByRole("main");
    const banner = canvas.getByRole("banner");
    // The shell fills its container; the content scrolls while the bar and navigation stay put.
    await expect(box(canvasElement.querySelector(".cy-app-shell") as Element).height).toBeCloseTo(300, 0);
    main.scrollTop = 500;
    await expect(main.scrollTop).toBeGreaterThan(0);
    await expect(box(banner).top).toBeCloseTo(box(frame(canvasElement)).top, 0);
  },
};

export const HiddenTextStaysInsideTheScrollingAreas: Story = {
  render: () => (
    <div className="frame" style={{ inlineSize: 900, blockSize: 300 }}>
      <AppShell
        header={<strong>Acme</strong>}
        nav={
          <div style={{ blockSize: 1200 }}>
            <SideNav label="Main" items={ITEMS} />
            <span className="cy-visually-hidden" style={{ insetBlockStart: 1100 }}>
              Hidden in the navigation
            </span>
          </div>
        }
      >
        <div style={{ blockSize: 2000 }}>
          <Button>Top</Button>
        </div>
        <Table
          caption="Far down the page"
          captionHidden
          columns={[{ key: "name", header: "Name", rowHeader: true }]}
          rows={[{ name: "Ada" }]}
          getRowId={(row) => row.name}
        />
      </AppShell>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const outer = frame(canvasElement);
    const main = canvas.getByRole("main");
    // Text hidden for screen readers is absolutely positioned. It must scroll with the area it is in: when it
    // escapes, the container (the page, for a full-height shell) grows a second scrollbar beside the content's own.
    await expect(main.scrollHeight).toBeGreaterThan(2000);
    await expect(outer.scrollHeight).toBe(outer.clientHeight);
    const shell = canvasElement.querySelector(".cy-app-shell") as HTMLElement;
    await expect(shell.scrollHeight).toBe(shell.clientHeight);
  },
};

export const TouchMenuButton: Story = {
  tags: ["touch", "!dev"],
  render: (args) => <Demo {...args} width={420} />,
  play: async ({ canvas, userEvent }) => {
    const open = await waitFor(() => canvas.getByRole("button", { name: "Open navigation" }), RESIZE);
    // The hit area (the button's ::before) is at least 44px on touch screens.
    const hit = getComputedStyle(open, "::before");
    await expect(Number.parseFloat(hit.height)).toBeGreaterThanOrEqual(44);
    await expect(Number.parseFloat(hit.width)).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: open });
    await waitFor(() => expect(sheet()?.open).toBe(true));
    await userEvent.keyboard("{Escape}");
  },
};

export const FollowsTheTextDirection: Story = {
  render: (args) => (
    <div dir="rtl">
      <Demo {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const nav = canvas.getByRole("navigation", { name: "Main" });
    await expect(box(nav).left).toBeGreaterThanOrEqual(box(canvas.getByRole("main")).right - 1);
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = [
      "display",
      "grid-template-columns",
      "height",
      "font-size",
      "padding-left",
      "box-sizing",
      "color",
    ];
    const shell = computeUnderHostileHost(canvasElement, ".cy-app-shell", props);
    await expect(shell.hostile).toEqual(shell.clean);
    // Row heights follow the product's own bar content (host CSS may resize that); the frames do not change.
    const frameProps = props.filter((p) => p !== "height");
    for (const selector of [".cy-app-shell-header", ".cy-app-shell-main", ".cy-app-shell-nav"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, frameProps);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
