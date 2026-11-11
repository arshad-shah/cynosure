import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { archive } from "../../icons/archive.js";
import { home } from "../../icons/home.js";
import { inbox } from "../../icons/inbox.js";
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
