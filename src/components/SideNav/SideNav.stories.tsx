import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { archive } from "../../icons/archive.js";
import { home } from "../../icons/home.js";
import { inbox } from "../../icons/inbox.js";
import { plus } from "../../icons/plus.js";
import { settings } from "../../icons/settings.js";
import { star } from "../../icons/star.js";
import { users } from "../../icons/users.js";
import { contrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { CynosureTheme } from "../../theme/CynosureTheme.js";
import { Badge } from "../Badge/Badge.js";
import { Button } from "../Button/Button.js";
import { Stack } from "../Stack/Stack.js";
import { type NavEntry, SideNav } from "./SideNav.js";

const ITEMS: NavEntry[] = [
  { id: "home", label: "Home", href: "#home", icon: home },
  { id: "inbox", label: "Inbox", href: "#inbox", icon: inbox, badge: <Badge tone="accent">3</Badge> },
  {
    label: "Workspace",
    items: [
      { id: "starred", label: "Starred", href: "#starred", icon: star },
      {
        id: "team",
        label: "Team",
        icon: users,
        items: [
          { id: "members", label: "Members", href: "#members" },
          { id: "billing", label: "Billing", href: "#billing" },
        ],
      },
      { id: "archive", label: "Archive", href: "#archive", icon: archive, disabled: true },
    ],
  },
  { label: "Account", items: [{ id: "settings", label: "Settings", icon: settings }] },
];

const meta = {
  title: "Components/SideNav",
  component: SideNav,
  args: { label: "Main", items: ITEMS, current: "inbox", collapsed: false, size: "md", onNavigate: fn() },
  argTypes: {
    current: { control: "select", options: ["home", "inbox", "starred", "members", "billing", "settings"] },
    collapsed: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof SideNav>;
export default meta;
type Story = StoryObj<typeof meta>;

export const MarksTheCurrentPage: Story = {
  tags: ["visual"],
  play: async ({ canvas }) => {
    const nav = canvas.getByRole("navigation", { name: "Main" });
    await expect(nav).toBeVisible();
    const inboxLink = canvas.getByRole("link", { name: "Inbox 3" });
    await expect(inboxLink).toHaveAttribute("aria-current", "page");
    await expect(inboxLink).toHaveAttribute("href", "#inbox");
    await expect(nav.querySelectorAll("[aria-current]")).toHaveLength(1);
    // Sections are named lists.
    await expect(canvas.getByRole("list", { name: "Workspace" })).toBeVisible();
    await expect(canvas.getByRole("list", { name: "Account" })).toBeVisible();
  },
};

export const GroupsExpandAndCollapse: Story = {
  play: async ({ canvas, userEvent }) => {
    const team = canvas.getByRole("button", { name: "Team" });
    await expect(team).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.queryByRole("link", { name: "Members" })).toBeNull();
    await userEvent.click(team);
    await expect(team).toHaveAttribute("aria-expanded", "true");
    const members = canvas.getByRole("link", { name: "Members" });
    await expect(members).toBeVisible();
    await expect(document.getElementById(team.getAttribute("aria-controls") as string)).toContainElement(
      members,
    );
    // Keyboard: Enter and Space toggle like any button.
    team.focus();
    await userEvent.keyboard("{Enter}");
    await expect(team).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard(" ");
    await expect(team).toHaveAttribute("aria-expanded", "true");
    // Children are indented under their group.
    await expect(members.getBoundingClientRect().left).toBeGreaterThan(team.getBoundingClientRect().left);
  },
};

export const GroupsOpenOnTheWayToTheCurrentPage: Story = {
  render: (args) => {
    function Shell() {
      const [current, setCurrent] = useState("home");
      return (
        <Stack gap="4">
          <SideNav {...args} current={current} />
          <Button onClick={() => setCurrent("billing")}>Go to billing</Button>
        </Stack>
      );
    }
    return <Shell />;
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole("button", { name: "Team" })).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(canvas.getByRole("button", { name: "Go to billing" }));
    await expect(canvas.getByRole("button", { name: "Team" })).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("link", { name: "Billing" })).toHaveAttribute("aria-current", "page");
  },
};

export const ChoosingAnItem: Story = {
  args: {
    onNavigate: fn((_id: string, event: { preventDefault: () => void }) => event.preventDefault()),
  },
  play: async ({ args, canvas, userEvent }) => {
    const before = location.hash;
    await userEvent.click(canvas.getByRole("link", { name: "Home" }));
    await expect(args.onNavigate).toHaveBeenLastCalledWith("home", expect.anything());
    // The app routed on the client: the browser did not follow the link.
    await expect(location.hash).toBe(before);
    // Items without href are buttons that only call onNavigate.
    const settingsItem = canvas.getByRole("button", { name: "Settings" });
    settingsItem.focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onNavigate).toHaveBeenLastCalledWith("settings", expect.anything());
    // Disabled items do nothing.
    const archive = canvas.getByRole("button", { name: "Archive" });
    await expect(archive).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(archive);
    await expect(args.onNavigate).toHaveBeenCalledTimes(2);
  },
};

export const WorksWithYourRouter: Story = {
  args: {
    renderLink: ({ href, children, ...props }) => (
      <a {...props} href={`/app${href.slice(1)}`} data-router="yes">
        {children}
      </a>
    ),
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Inbox 3" });
    await expect(link).toHaveAttribute("data-router", "yes");
    await expect(link).toHaveAttribute("href", "/appinbox");
    await expect(link).toHaveAttribute("aria-current", "page");
    await expect(link).toHaveClass("cy-side-nav-link");
  },
};

export const CollapsedToARail: Story = {
  args: { collapsed: true, defaultExpanded: ["team"], onCollapsedChange: fn() },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const nav = canvas.getByRole("navigation", { name: "Main" });
    await expect(nav.getBoundingClientRect().width).toBeLessThan(80);
    // Labels are hidden from sight but still name every item.
    const homeLink = canvas.getByRole("link", { name: "Home" });
    const label = homeLink.querySelector(".cy-side-nav-label") as HTMLElement;
    await expect(label.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    // The badge shrinks into the corner and leaves the icon visible.
    const inboxLink = canvas.getByRole("link", { name: "Inbox 3" });
    const icon = (inboxLink.querySelector(".cy-side-nav-icon") as Element).getBoundingClientRect();
    const badge = (inboxLink.querySelector(".cy-side-nav-badge") as Element).getBoundingClientRect();
    await expect(badge.bottom).toBeLessThan(icon.top + icon.height / 2);
    // Keyboard focus shows the label in a tooltip.
    await userEvent.tab();
    await expect(homeLink).toHaveFocus();
    const tip = canvasElement.ownerDocument.getElementById(
      homeLink.getAttribute("aria-describedby") as string,
    );
    await waitFor(() => expect((tip as HTMLElement).matches(":popover-open")).toBe(true));
    await shownFully(tip as HTMLElement);
    await expect(tip).toHaveTextContent("Home");
    // Groups do not open inside the rail: they ask for the full navigation.
    await expect(canvas.queryByRole("link", { name: "Members" })).toBeNull();
    const team = canvas.getByRole("button", { name: "Team" });
    await expect(team).not.toHaveAttribute("aria-expanded");
    await userEvent.click(team);
    await expect(args.onCollapsedChange).toHaveBeenCalledWith(false);
  },
};

export const RailExpandsToTheGroup: Story = {
  args: { collapsed: true },
  render: (args) => {
    function Shell() {
      const [collapsed, setCollapsed] = useState(true);
      return <SideNav {...args} collapsed={collapsed} onCollapsedChange={setCollapsed} />;
    }
    return <Shell />;
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Team" }));
    // Widened, with the chosen group open.
    await expect(canvas.getByRole("button", { name: "Team" })).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("link", { name: "Members" })).toBeVisible();
  },
};

export const HitAreas: Story = {
  play: async ({ canvasElement }) => {
    for (const row of canvasElement.querySelectorAll(".cy-side-nav-link:not([hidden] *)")) {
      await expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
    }
  },
};

export const TouchRows: Story = {
  tags: ["touch", "!dev"],
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    for (const row of canvasElement.querySelectorAll(".cy-side-nav-link:not([hidden] *)")) {
      await expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    }
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByRole("button", { name: "Settings" }) });
    await expect(args.onNavigate).toHaveBeenLastCalledWith("settings", expect.anything());
  },
};

export const FollowsTheTextDirection: Story = {
  render: (args) => (
    <div dir="rtl">
      <SideNav {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Inbox 3" });
    const box = link.getBoundingClientRect();
    const bar = getComputedStyle(link, "::before");
    // The current-page bar is on the inline start: the right in right-to-left text.
    await expect(bar.right).toBe("0px");
    const icon = link.querySelector(".cy-side-nav-icon") as Element;
    await expect(icon.getBoundingClientRect().right).toBeGreaterThan(box.right - 40);
  },
};

export const ReadableInLightAndDark: Story = {
  render: (args) => (
    <Stack gap="4">
      {(["light", "dark"] as const).map((mode) => (
        <CynosureTheme key={mode} mode={mode}>
          <div className="surface" style={{ background: "var(--cy-color-surface)" }}>
            <SideNav {...args} label={`Main (${mode})`} defaultExpanded={["team"]} />
          </div>
        </CynosureTheme>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    for (const surface of canvasElement.querySelectorAll(".surface")) {
      const page = getComputedStyle(surface).backgroundColor;
      const currentRow = surface.querySelector('[aria-current="page"]') as Element;
      const s = getComputedStyle(currentRow);
      await expect(contrast(s.color, s.backgroundColor)).toBeGreaterThanOrEqual(4.5);
      for (const el of surface.querySelectorAll(
        ".cy-side-nav-heading, .cy-side-nav-link:not([aria-current])",
      )) {
        await expect(contrast(getComputedStyle(el).color, page)).toBeGreaterThanOrEqual(4.5);
      }
    }
  },
};

export const DefaultsWithoutACurrentPage: Story = {
  args: { size: "sm", className: "host-nav", style: { marginInline: 8 } },
  render: ({ current: _current, onNavigate: _onNavigate, ...args }) => <SideNav {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const nav = canvasElement.querySelector(".host-nav") as HTMLElement;
    await expect(nav).toHaveAttribute("data-size", "sm");
    // Nothing is current and every group starts closed.
    await expect(nav.querySelector("[aria-current]")).toBeNull();
    await expect(canvas.getByRole("button", { name: "Team" })).toHaveAttribute("aria-expanded", "false");
    // Without onNavigate a button item is harmless.
    await userEvent.click(canvas.getByRole("button", { name: "Settings" }));
    await expect(canvas.getByRole("button", { name: "Settings" })).toBeVisible();
  },
};

export const UnknownCurrentMarksNothing: Story = {
  args: { current: "missing" },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[aria-current]")).toBeNull();
    await expect(canvasElement.querySelector('[aria-expanded="true"]')).toBeNull();
  },
};

const add = fn();
const clearAdd = () => {
  add.mockClear();
};
const DESTINATIONS = ["Home", "Inbox", "Starred", "Settings"];
/** A phone tab bar: two destinations, the primary action in the middle, two more destinations. */
const BAR_ITEMS: NavEntry[] = [
  { id: "home", label: "Home", icon: home },
  { id: "inbox", label: "Inbox", icon: inbox },
  { kind: "action", id: "add", label: "Add", icon: plus, onClick: add },
  { id: "starred", label: "Starred", icon: star },
  { id: "settings", label: "Settings", icon: settings },
];
const rect = (el: Element) => el.getBoundingClientRect();
const centre = (el: Element) => rect(el).left + rect(el).width / 2;
const phone = (args: Parameters<typeof SideNav>[0], dir?: "rtl") => (
  <div
    className="phone"
    dir={dir}
    style={{ inlineSize: 390, paddingBlockStart: 24, background: "var(--cy-color-surface)" }}
  >
    <SideNav {...args} />
    <span className="accent" style={{ background: "var(--cy-color-accent)" }} />
  </div>
);

export const BarWithAPrimaryAction: Story = {
  tags: ["visual"],
  args: { label: "Sections", layout: "bar", items: BAR_ITEMS, current: "home" },
  render: (args) => phone(args),
  beforeEach: clearAdd,
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const nav = canvas.getByRole("navigation", { name: "Sections" });
    // A button named by its label: not a link, and never the current page.
    const action = canvas.getByRole("button", { name: "Add" });
    await expect(action.tagName).toBe("BUTTON");
    await expect(action).not.toHaveAttribute("aria-current");
    await expect(canvas.queryByRole("link", { name: "Add" })).toBeNull();
    // Filled with the accent colour, round, in the middle of the bar, and raised above the row of destinations.
    const accent = getComputedStyle(canvasElement.querySelector(".accent") as Element).backgroundColor;
    await expect(getComputedStyle(action).backgroundColor).toBe(accent);
    await expect(getComputedStyle(action).boxShadow).not.toBe("none");
    await expect(rect(action).width).toBeCloseTo(rect(action).height, 0);
    await expect(Number.parseFloat(getComputedStyle(action).borderTopLeftRadius)).toBeGreaterThanOrEqual(
      rect(action).width / 2,
    );
    await expect(centre(action)).toBeCloseTo(centre(nav), 0);
    const homeItem = canvas.getByRole("button", { name: "Home" });
    await expect(rect(action).top).toBeLessThan(rect(homeItem).top);
    await expect(rect(action).top).toBeLessThan(rect(nav).top);
    // It sits where it was placed: after Inbox, before Starred.
    await expect(rect(action).left).toBeGreaterThanOrEqual(
      rect(canvas.getByRole("button", { name: "Inbox" })).right,
    );
    await expect(rect(action).right).toBeLessThanOrEqual(
      rect(canvas.getByRole("button", { name: "Starred" })).left,
    );
    // The destinations are unchanged: one row of equal items, the current one marked.
    const places = DESTINATIONS.map((name) => canvas.getByRole("button", { name }));
    await expect(new Set(places.map((el) => Math.round(rect(el).top))).size).toBe(1);
    await expect(new Set(places.map((el) => Math.round(rect(el).width))).size).toBe(1);
    await expect(homeItem).toHaveAttribute("aria-current", "page");
    await expect(nav.querySelectorAll("[aria-current]")).toHaveLength(1);
    // Pressing it runs its own handler and is not a navigation.
    await userEvent.click(action);
    await expect(add).toHaveBeenCalledTimes(1);
    await expect(args.onNavigate).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "Starred" }));
    await expect(args.onNavigate).toHaveBeenLastCalledWith("starred", expect.anything());
    await expect(add).toHaveBeenCalledTimes(1);
  },
};

export const BarActionWithTheKeyboard: Story = {
  args: { label: "Sections", layout: "bar", items: BAR_ITEMS, current: "home" },
  render: (args) => phone(args),
  beforeEach: clearAdd,
  play: async ({ args, canvas, userEvent }) => {
    // Tab walks the bar in order, the action in its place between the destinations.
    for (const name of ["Home", "Inbox", "Add", "Starred", "Settings"]) {
      await userEvent.tab();
      await expect(canvas.getByRole("button", { name })).toHaveFocus();
    }
    await userEvent.tab({ shift: true });
    await userEvent.tab({ shift: true });
    const action = canvas.getByRole("button", { name: "Add" });
    await expect(action).toHaveFocus();
    // Focus is shown with the ring.
    await waitFor(() => expect(getComputedStyle(action).boxShadow).toContain("0px 0px 0px"));
    await userEvent.keyboard("{Enter}");
    await expect(add).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(" ");
    await expect(add).toHaveBeenCalledTimes(2);
    await expect(args.onNavigate).not.toHaveBeenCalled();
  },
};

export const ActionIsNeverTheCurrentPage: Story = {
  args: { label: "Sections", layout: "bar", items: BAR_ITEMS, current: "add" },
  render: (args) => phone(args),
  play: async ({ canvas }) => {
    const nav = canvas.getByRole("navigation", { name: "Sections" });
    await expect(canvas.getByRole("button", { name: "Add" })).not.toHaveAttribute("aria-current");
    await expect(nav.querySelector("[aria-current]")).toBeNull();
  },
};

export const BarActionFollowsItsTokens: Story = {
  args: { label: "Sections", layout: "bar", items: BAR_ITEMS },
  render: (args) => (
    <Stack gap="8">
      {phone(args)}
      <div
        className="themed"
        style={
          {
            "--cy-side-nav-action-size": "60px",
            "--cy-side-nav-action-lift": "20px",
          } as React.CSSProperties
        }
      >
        {phone({ ...args, label: "Themed" })}
      </div>
    </Stack>
  ),
  play: async ({ canvas }) => {
    const [plain, themed] = canvas.getAllByRole("button", { name: "Add" }) as [HTMLElement, HTMLElement];
    const [plainHome, themedHome] = canvas.getAllByRole("button", { name: "Home" }) as [
      HTMLElement,
      HTMLElement,
    ];
    // --cy-side-nav-action-size sets the diameter; --cy-side-nav-action-lift how far it rises.
    await expect(rect(themed).width).toBeCloseTo(60, 0);
    await expect(rect(themed).height).toBeCloseTo(60, 0);
    await expect(getComputedStyle(themed).translate).toBe("0px -20px");
    await expect(rect(plain).width).toBeLessThan(60);
    const rise = (action: Element, row: Element) =>
      rect(row).top + rect(row).height / 2 - (rect(action).top + rect(action).height / 2);
    await expect(rise(themed, themedHome)).toBeCloseTo(20, 0);
    await expect(rise(plain, plainHome)).toBeGreaterThan(0);
    await expect(rise(plain, plainHome)).toBeLessThan(20);
    // A larger button rises out of the bar; the bar keeps its height.
    await expect(rect(themedHome).height).toBe(rect(plainHome).height);
    const [plainNav, themedNav] = canvas.getAllByRole("navigation") as [HTMLElement, HTMLElement];
    await expect(rect(themedNav).height).toBe(rect(plainNav).height);
  },
};

export const TouchBarAction: Story = {
  tags: ["touch", "!dev"],
  args: { label: "Sections", layout: "bar", items: BAR_ITEMS },
  render: (args) => phone(args),
  beforeEach: clearAdd,
  play: async ({ args, canvas, userEvent }) => {
    const action = canvas.getByRole("button", { name: "Add" });
    // The button and its hit area are at least 44px on touch screens.
    await expect(rect(action).width).toBeGreaterThanOrEqual(44);
    await expect(rect(action).height).toBeGreaterThanOrEqual(44);
    const hit = getComputedStyle(action, "::before");
    await expect(Number.parseFloat(hit.width)).toBeGreaterThanOrEqual(44);
    await expect(Number.parseFloat(hit.height)).toBeGreaterThanOrEqual(44);
    for (const name of DESTINATIONS)
      await expect(rect(canvas.getByRole("button", { name })).height).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: action });
    await expect(add).toHaveBeenCalledTimes(1);
    await expect(args.onNavigate).not.toHaveBeenCalled();
  },
};

export const BarActionFollowsTheTextDirection: Story = {
  args: { label: "Sections", layout: "bar", items: BAR_ITEMS.slice(1) },
  render: (args) => phone(args, "rtl"),
  play: async ({ canvas }) => {
    // Inbox, Add, Starred, Settings read from the right: the action is left of Inbox and right of Starred.
    const action = canvas.getByRole("button", { name: "Add" });
    await expect(rect(action).right).toBeLessThanOrEqual(
      rect(canvas.getByRole("button", { name: "Inbox" })).left,
    );
    await expect(rect(action).left).toBeGreaterThanOrEqual(
      rect(canvas.getByRole("button", { name: "Starred" })).right,
    );
    // Off-centre here, because it is the second of four entries; still raised.
    await expect(centre(action)).toBeGreaterThan(centre(canvas.getByRole("navigation")));
    await expect(rect(action).top).toBeLessThan(rect(canvas.getByRole("button", { name: "Inbox" })).top);
  },
};

export const ActionInTheColumnAndTheRail: Story = {
  args: {
    label: "Column",
    items: [BAR_ITEMS[0], BAR_ITEMS[2], BAR_ITEMS[1]] as NavEntry[],
    current: "home",
    size: "sm",
  },
  render: (args) => (
    <Stack gap="6">
      <SideNav {...args} />
      <SideNav {...args} label="Rail" collapsed />
      <span className="accent" style={{ background: "var(--cy-color-accent)" }} />
    </Stack>
  ),
  beforeEach: clearAdd,
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const [column, rail] = canvas.getAllByRole("button", { name: "Add" }) as [HTMLElement, HTMLElement];
    const accent = getComputedStyle(canvasElement.querySelector(".accent") as Element).backgroundColor;
    // Column: a filled accent button with its label shown, as wide as the rows, between its neighbours, not lifted.
    const [homeRow] = canvas.getAllByRole("button", { name: "Home" }) as [HTMLElement];
    const [inboxRow] = canvas.getAllByRole("button", { name: "Inbox" }) as [HTMLElement];
    await expect(column).toHaveTextContent("Add");
    await expect(getComputedStyle(column).backgroundColor).toBe(accent);
    await expect(rect(column).width).toBeCloseTo(rect(homeRow).width, 0);
    await expect(rect(column).top).toBeGreaterThanOrEqual(rect(homeRow).bottom);
    await expect(rect(column).bottom).toBeLessThanOrEqual(rect(inboxRow).top);
    await expect(getComputedStyle(column).translate).toBe("none");
    await expect(column).toHaveAttribute("data-size", "sm");
    await expect(column).not.toHaveAttribute("aria-current");
    await userEvent.click(column);
    await expect(add).toHaveBeenCalledTimes(1);
    // Rail: an icon button that keeps its name and fits the rail.
    await expect(rail).toHaveAccessibleName("Add");
    await expect(rect(rail).width).toBeCloseTo(rect(rail).height, 0);
    await expect(rect(rail).width).toBeLessThanOrEqual(
      rect(canvas.getByRole("navigation", { name: "Rail" })).width,
    );
    await userEvent.click(rail);
    await expect(add).toHaveBeenCalledTimes(2);
    await expect(args.onNavigate).not.toHaveBeenCalled();
  },
};

export const DisabledActionDoesNothing: Story = {
  args: {
    label: "Sections",
    layout: "bar",
    items: BAR_ITEMS.map((entry) => ("kind" in entry ? { ...entry, disabled: true } : entry)),
  },
  render: (args) => phone(args),
  beforeEach: clearAdd,
  play: async ({ canvas, userEvent }) => {
    const action = canvas.getByRole("button", { name: "Add" });
    await expect(action).toBeDisabled();
    await userEvent.click(action);
    await expect(add).not.toHaveBeenCalled();
  },
};

export const BarWithoutAnActionIsUnchanged: Story = {
  args: { label: "Sections", layout: "bar", items: ITEMS, current: "inbox" },
  render: (args) => phone(args),
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const nav = canvas.getByRole("navigation", { name: "Sections" });
    // Sections are flattened and a group is one item: six equal items in one row filling the bar.
    const rows = [...nav.querySelectorAll(".cy-side-nav-link")];
    await expect(rows).toHaveLength(6);
    await expect(canvasElement.querySelector("[data-action]")).toBeNull();
    await expect(new Set(rows.map((el) => Math.round(rect(el).top))).size).toBe(1);
    await expect(
      Math.max(...rows.map((el) => rect(el).width)) - Math.min(...rows.map((el) => rect(el).width)),
    ).toBeLessThan(1);
    await expect(canvas.queryByText("Workspace")).toBeNull();
    await expect(canvas.getByRole("link", { name: "Inbox 3" })).toHaveAttribute("aria-current", "page");
    const team = canvas.getByRole("button", { name: "Team" });
    await expect(team).not.toHaveAttribute("aria-expanded");
    await userEvent.click(team);
    await expect(args.onNavigate).toHaveBeenLastCalledWith("team", expect.anything());
    // Tab moves from one item to the next (the bar has no arrow-key roving).
    (rows[0] as HTMLElement).focus();
    await userEvent.tab();
    await expect(rows[1]).toHaveFocus();
  },
};

export const BarActionStableUnderHostileHost: Story = {
  args: { label: "Sections", layout: "bar", items: BAR_ITEMS, current: "home" },
  render: (args) => phone(args),
  play: async ({ canvasElement }) => {
    const props = [
      "display",
      "width",
      "height",
      "background-color",
      "color",
      "border-top-width",
      "border-top-left-radius",
      "padding-left",
      "translate",
      "box-sizing",
    ];
    for (const selector of [".cy-side-nav-action", "[data-action]", ".cy-side-nav-action svg"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector(".cy-side-nav-link")).not.toBeNull());
    const props = [
      "display",
      "height",
      "font-size",
      "font-weight",
      "color",
      "padding-left",
      "text-decoration-line",
      "list-style-type",
      "box-sizing",
    ];
    for (const selector of [
      ".cy-side-nav",
      ".cy-side-nav-list",
      ".cy-side-nav-link",
      "[aria-current] ",
      ".cy-side-nav-heading",
    ]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector.trim(), props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
