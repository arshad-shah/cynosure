import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, fn, waitFor, within } from "storybook/test";
import { home } from "../../icons/home.js";
import { inbox } from "../../icons/inbox.js";
import { plus } from "../../icons/plus.js";
import { users } from "../../icons/users.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import { type NavEntry, SideNav } from "../SideNav/SideNav.js";
import { Table } from "../Table/Table.js";
import { AppShell, useAppShell } from "./AppShell.js";

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

const add = fn();

export const TabBarWithAPrimaryAction: Story = {
  render: (args) => {
    const items: NavEntry[] = [
      { id: "home", label: "Home", icon: home },
      { kind: "action", id: "add", label: "Add", icon: plus, onClick: add },
      { id: "inbox", label: "Inbox", icon: inbox },
    ];
    return (
      <div className="frame" style={{ inlineSize: 390, blockSize: 420 }}>
        <AppShell
          {...args}
          header={<strong>Acme</strong>}
          nav={<SideNav label="Main" items={items} current="home" />}
          tabs={<SideNav label="Sections" layout="bar" items={items} current="home" />}
        >
          <div style={{ blockSize: 2000, background: "var(--cy-color-surface)" }}>Long page</div>
        </AppShell>
      </div>
    );
  },
  beforeEach: () => {
    add.mockClear();
  },
  play: async ({ canvas, userEvent }) => {
    const tabs = await canvas.findByRole("navigation", { name: "Sections" }, RESIZE);
    const action = within(tabs).getByRole("button", { name: "Add" });
    // The raised button reaches over the content's edge and is painted on top of it, so all of it can be pressed.
    await expect(box(action).top).toBeLessThan(box(canvas.getByRole("main")).bottom);
    const top = document.elementFromPoint(box(action).left + box(action).width / 2, box(action).top + 2);
    await expect(action.contains(top)).toBe(true);
    await userEvent.click(action);
    await expect(add).toHaveBeenCalledTimes(1);
    // In the drawer the same entry is a full-width button; pressing it closes the drawer, like choosing a link.
    await userEvent.click(canvas.getByRole("button", { name: "Open navigation" }));
    const dialog = sheet() as HTMLDialogElement;
    await waitFor(() => expect(dialog.open).toBe(true));
    await shownFully(dialog.querySelector(".cy-dialog-panel") as Element);
    await userEvent.click(within(dialog).getByRole("button", { name: "Add" }));
    await expect(add).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(dialog.open).toBe(false));
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

export const WideningClosesTheDrawer: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    frame(canvasElement).style.inlineSize = "600px";
    await waitFor(
      () => expect(canvas.getByRole("button", { name: "Open navigation" })).toBeVisible(),
      RESIZE,
    );
    await userEvent.click(canvas.getByRole("button", { name: "Open navigation" }));
    await waitFor(() => expect(sheet()?.open).toBe(true));
    // Widened, the navigation moves back beside the content; narrowed again, the drawer stays shut until asked.
    frame(canvasElement).style.inlineSize = "900px";
    // Wait for the shell itself to be wide: the open drawer holds the same "Main" navigation, so seeing it proves
    // nothing, and narrowing again before the shell measured the wide width left the drawer rightly open (Firefox
    // and WebKit report sizes later; CI on #167).
    const shell = canvasElement.querySelector(".cy-app-shell") as HTMLElement;
    await waitFor(() => expect(shell).not.toHaveAttribute("data-narrow"), RESIZE);
    await waitFor(() => expect(canvas.getByRole("navigation", { name: "Main" })).toBeVisible(), RESIZE);
    frame(canvasElement).style.inlineSize = "600px";
    await waitFor(
      () => expect(canvas.getByRole("button", { name: "Open navigation" })).toBeVisible(),
      RESIZE,
    );
    await new Promise((r) => setTimeout(r, 100));
    // This story's own drawer stays shut. If WebKit ever shows one open again (it did once on CI, intermittently, on
    // #167), say which dialog it is and where, so the cause can be read from the failure.
    const open = [...document.querySelectorAll("dialog")].filter((d) => d.open);
    const where = open.map((d) =>
      [
        d.className,
        canvasElement.contains(d) ? "inside this story" : "outside this story",
        `narrow=${frame(canvasElement).querySelector("[data-narrow]") ? "yes" : "no"}`,
      ].join(", "),
    );
    await expect(where, "open dialogs").toEqual([]);
    await expect(canvas.getByRole("button", { name: "Open navigation" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
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

/** Shows what `useAppShell()` returns where it is rendered, and records every value it rendered with. */
function Probe({ name, seen }: { name: string; seen?: boolean[] }) {
  const { narrow } = useAppShell();
  seen?.push(narrow);
  return <span data-testid={name}>{narrow ? "narrow" : "wide"}</span>;
}

function ProbedShell({ width = 900, ...props }: { width?: number } & Parameters<typeof AppShell>[0]) {
  return (
    <div className="frame" style={{ inlineSize: width, blockSize: 300 }}>
      <AppShell
        header={<Probe name="in-header" />}
        nav={<Probe name="in-nav" />}
        tabs={<Probe name="in-tabs" />}
        {...props}
      >
        <Probe name="in-content" />
      </AppShell>
    </div>
  );
}

export const ChildrenReadTheNarrowState: Story = {
  args: { onNarrowChange: fn() },
  render: (args) => <ProbedShell {...args} />,
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    // Wide: the header, the navigation and the content all read "wide", and nothing was announced.
    for (const name of ["in-header", "in-nav", "in-content"])
      await expect(canvas.getByTestId(name)).toHaveTextContent("wide");
    await expect(args.onNarrowChange).not.toHaveBeenCalled();
    // The shell's own container shrinks under 768px (the window does not change).
    frame(canvasElement).style.inlineSize = "600px";
    await waitFor(() => expect(canvas.getByTestId("in-content")).toHaveTextContent("narrow"), RESIZE);
    for (const name of ["in-header", "in-tabs"])
      await expect(canvas.getByTestId(name)).toHaveTextContent("narrow");
    // The callback runs in an effect, just after the render that changed the text.
    await waitFor(() => expect(args.onNarrowChange).toHaveBeenCalledTimes(1));
    await expect(args.onNarrowChange).toHaveBeenLastCalledWith(true);
    // The navigation in the drawer reads it too.
    await userEvent.click(canvas.getByRole("button", { name: "Open navigation" }));
    const dialog = sheet() as HTMLDialogElement;
    await waitFor(() => expect(dialog.open).toBe(true));
    await expect(within(dialog).getByTestId("in-nav")).toHaveTextContent("narrow");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog.open).toBe(false));
    // Shrinking further is not a change.
    frame(canvasElement).style.inlineSize = "500px";
    await waitFor(() => expect(box(canvas.getByRole("main")).width).toBeLessThan(510), RESIZE);
    await expect(args.onNarrowChange).toHaveBeenCalledTimes(1);
    // Wide again: one more call.
    frame(canvasElement).style.inlineSize = "900px";
    await waitFor(() => expect(canvas.getByTestId("in-content")).toHaveTextContent("wide"), RESIZE);
    await expect(canvas.getByTestId("in-nav")).toHaveTextContent("wide");
    // The callback runs in an effect, just after the render that changed the text.
    await waitFor(() => expect(args.onNarrowChange).toHaveBeenCalledTimes(2));
    await expect(args.onNarrowChange).toHaveBeenLastCalledWith(false);
  },
};

export const NarrowStateHonoursCollapseBelow: Story = {
  args: { collapseBelow: 500, onNarrowChange: fn() },
  render: (args) => <ProbedShell {...args} width={600} />,
  play: async ({ args, canvas, canvasElement }) => {
    // 600px is narrow by default, but not under a 500px breakpoint.
    await expect(canvas.getByTestId("in-content")).toHaveTextContent("wide");
    await expect(canvas.getByTestId("in-nav")).toBeVisible();
    frame(canvasElement).style.inlineSize = "499px";
    await waitFor(() => expect(canvas.getByTestId("in-content")).toHaveTextContent("narrow"), RESIZE);
    // The callback runs in an effect, just after the render that changed the text.
    await waitFor(() => expect(args.onNarrowChange).toHaveBeenCalledTimes(1));
    await expect(args.onNarrowChange).toHaveBeenLastCalledWith(true);
    frame(canvasElement).style.inlineSize = "500px";
    await waitFor(() => expect(canvas.getByTestId("in-content")).toHaveTextContent("wide"), RESIZE);
    // The callback runs in an effect, just after the render that changed the text.
    await waitFor(() => expect(args.onNarrowChange).toHaveBeenCalledTimes(2));
    await expect(args.onNarrowChange).toHaveBeenLastCalledWith(false);
  },
};

const SEEN: boolean[] = [];

export const MountingNarrowStartsWide: Story = {
  args: { onNarrowChange: fn() },
  render: (args) => {
    function Outside() {
      // A new callback on every render must not be called again.
      const [calls, setCalls] = useState(0);
      return (
        <div className="frame" style={{ inlineSize: 420, blockSize: 300 }}>
          <AppShell
            {...args}
            className="host-shell"
            onNarrowChange={(narrow) => {
              args.onNarrowChange?.(narrow);
              setCalls((n) => n + 1);
            }}
          >
            <Probe name="in-content" seen={SEEN} />
            <span data-testid="calls">{calls}</span>
          </AppShell>
        </div>
      );
    }
    return <Outside />;
  },
  beforeEach: () => {
    SEEN.length = 0;
  },
  play: async ({ args, canvas, canvasElement }) => {
    await waitFor(() => expect(canvas.getByTestId("calls")).toHaveTextContent("1"));
    // Without a header or navigation there is no bar, and the shell still reports its width.
    await expect(canvasElement.querySelector(".cy-app-shell.host-shell")).toHaveAttribute("data-narrow");
    await expect(canvas.queryByRole("banner")).toBeNull();
    await expect(canvas.getByTestId("in-content")).toHaveTextContent("narrow");
    // The first render is always wide (as on the server); the measured value follows.
    await expect(SEEN[0]).toBe(false);
    await expect(SEEN[SEEN.length - 1]).toBe(true);
    await expect(args.onNarrowChange).toHaveBeenCalledTimes(1);
    await expect(args.onNarrowChange).toHaveBeenCalledWith(true);
  },
};

export const OutsideAShellTheHookSaysWide: Story = {
  render: () => (
    <div style={{ inlineSize: 200 }}>
      <Probe name="outside" />
    </div>
  ),
  play: async ({ canvas }) => {
    // No shell: no error, and the default is "not narrow", however small the space.
    await expect(canvas.getByTestId("outside")).toHaveTextContent("wide");
  },
};

export const ServerMarkupHydratesWithoutMismatch: Story = {
  render: () => <div className="host" />,
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector(".host") as HTMLElement;
    host.style.inlineSize = "420px";
    host.style.blockSize = "300px";
    const app = (
      <AppShell nav={<Probe name="in-nav" />}>
        <Probe name="in-content" />
      </AppShell>
    );
    // The server cannot measure: it renders the wide layout and the hook says wide.
    host.innerHTML = renderToString(app);
    await expect(within(host).getByTestId("in-content")).toHaveTextContent("wide");
    await expect(host.querySelector(".cy-app-shell")).not.toHaveAttribute("data-narrow");
    await expect(within(host).getByTestId("in-nav")).toHaveTextContent("wide");
    await expect(within(host).queryByRole("banner")).toBeNull();
    const mismatch = fn();
    const root = hydrateRoot(host, app, { onRecoverableError: mismatch });
    try {
      // The client starts from the same markup, then measures its 420px and becomes narrow.
      await waitFor(() => expect(within(host).getByTestId("in-content")).toHaveTextContent("narrow"), RESIZE);
      // With no header content, the bar appears only to hold the menu button.
      await expect(
        within(within(host).getByRole("banner")).getByRole("button", { name: "Open navigation" }),
      ).toBeVisible();
      await expect(mismatch).not.toHaveBeenCalled();
    } finally {
      root.unmount();
    }
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
