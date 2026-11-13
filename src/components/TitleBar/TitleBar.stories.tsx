import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, fn, waitFor } from "storybook/test";
import { panelBottom, search, settings, windowMaximize, windowRestore } from "../../icons/index.js";
import type { IconData } from "../../icons/types.js";
import { createStyleSheet } from "../../styles/inline.js";
import { rgb } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { realHover } from "../../test/hover.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Menubar, type MenubarMenu } from "../Menubar/Menubar.js";
import { TextField } from "../TextField/TextField.js";
import { TitleBar, type TitleBarControls } from "./TitleBar.js";

const menus: MenubarMenu[] = [
  { label: "File", items: [{ value: "open", label: "Open" }] },
  { label: "Edit", items: [{ value: "copy", label: "Copy" }] },
  { label: "View", items: [{ value: "wrap", label: "Word wrap" }] },
];

const controls = (): TitleBarControls => ({
  minimize: fn(),
  toggleMaximize: fn(),
  close: fn(),
  maximized: false,
});

const meta = {
  tags: ["serial"],
  title: "Components/TitleBar",
  component: TitleBar,
  args: {
    label: "Verql",
    children: "orders.sql — Verql",
    leading: <Menubar label="Application" menus={menus} size="sm" onSelect={() => {}} />,
    trailing: (
      <IconButton icon={settings} label="Settings" variant="ghost" size="sm" tooltipPlacement="bottom" />
    ),
    controls: controls(),
    leadingInset: 0,
    overlay: false,
    onHeightChange: fn(),
  },
  argTypes: {
    leadingInset: { control: { type: "number", min: 0, step: 4 } },
    overlay: { control: "boolean" },
    label: { control: "text" },
    children: { control: "text" },
    leading: { control: false },
    trailing: { control: false },
    controls: { control: "object" },
    labels: { control: "object" },
  },
} satisfies Meta<typeof TitleBar>;
export default meta;
type Story = StoryObj<typeof meta>;

const bar = (root: HTMLElement) => root.querySelector(".cy-title-bar") as HTMLElement;
const box = (el: Element) => el.getBoundingClientRect();
const px = (root: Element, value: string) => {
  const probe = document.createElement("div");
  probe.style.inlineSize = value;
  root.append(probe);
  const width = probe.getBoundingClientRect().width;
  probe.remove();
  return width;
};
/** A colour token as painted (tokens such as light-dark() only resolve on an element). */
const paint = (root: Element, value: string) => {
  const probe = document.createElement("div");
  probe.style.color = value;
  root.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return rgb(color);
};
const pathOf = (icon: IconData) =>
  (icon.body.find(([tag]) => tag === "path")?.[1] as { d?: string } | undefined)?.d;
/** The engine's app-region property (Chromium: `app-region`, older ones `-webkit-app-region`); null where unsupported. */
const regionProp = () =>
  CSS.supports("app-region", "drag")
    ? "app-region"
    : CSS.supports("-webkit-app-region", "drag")
      ? "-webkit-app-region"
      : null;

export const Default: Story = {
  tags: ["visual"],
  play: async ({ canvas, canvasElement }) => {
    // A named group holding the app's own chrome, the title and the three window controls.
    const group = canvas.getByRole("group", { name: "Verql" });
    await expect(group).toBe(bar(canvasElement));
    await expect(canvas.getByText("orders.sql — Verql")).toBeVisible();
    for (const name of ["Minimize", "Maximize", "Close"])
      await expect(canvas.getByRole("button", { name })).toBeVisible();
  },
};

export const WholeBarDragsAndControlsDoNot: Story = {
  args: {
    trailing: (
      <>
        <TextField label="Search" labelHidden size="xs" />
        <IconButton icon={search} label="Find" variant="ghost" size="sm" tooltipPlacement="bottom" />
      </>
    ),
  },
  play: async ({ canvas, canvasElement }) => {
    const prop = regionProp();
    // Only Chromium (Electron, installed web apps) has drag regions; elsewhere there is nothing to check.
    if (!prop) return;
    const region = (el: Element) => getComputedStyle(el).getPropertyValue(prop);
    // The bar moves the window from anywhere that is not a control, its title included.
    await expect(region(bar(canvasElement))).toBe("drag");
    // Every control inside opts out, wherever it came from: the app's menubar, field and button, and the window controls.
    const interactive = [
      ...canvas.getAllByRole("menuitem"),
      canvas.getByRole("textbox", { name: "Search" }),
      ...canvas.getAllByRole("button"),
    ];
    await expect(interactive.length).toBeGreaterThanOrEqual(8);
    for (const el of interactive) await expect(region(el)).toBe("no-drag");
  },
};

export const LeadingInsetReservesSpace: Story = {
  render: (args) => (
    <div>
      <TitleBar {...args} leadingInset={0} label="Plain" leading={<span data-testid="plain">Menu</span>} />
      <TitleBar {...args} leadingInset={88} label="Inset" leading={<span data-testid="inset">Menu</span>} />
      <div dir="rtl">
        <TitleBar
          {...args}
          leadingInset={88}
          label="Inset RTL"
          leading={<span data-testid="rtl">Menu</span>}
        />
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const [plain, inset, rtl] = ["Plain", "Inset", "Inset RTL"].map((name) =>
      canvas.getByRole("group", { name }),
    );
    const start = (id: string, b: HTMLElement) => box(canvas.getByTestId(id)).left - box(b).left;
    // macOS draws its traffic lights over the bar's start: the leading content moves past them by exactly the inset.
    await expect(start("inset", inset as HTMLElement) - start("plain", plain as HTMLElement)).toBeCloseTo(
      88,
      0,
    );
    await expect(start("inset", inset as HTMLElement)).toBeGreaterThanOrEqual(88);
    // The inset is at the inline start, so in right-to-left text it is on the right.
    await expect(box(rtl as HTMLElement).right - box(canvas.getByTestId("rtl")).right).toBeGreaterThanOrEqual(
      88,
    );
  },
};

export const OverlayUsesTheWindowControlsArea: Story = {
  args: { overlay: true },
  play: async ({ canvasElement }) => {
    const el = bar(canvasElement);
    const style = getComputedStyle(el);
    // Fixed to the window's title bar area; without Window Controls Overlay the env() fallbacks give the full width,
    // the top edge and the bar's token height.
    await expect(style.position).toBe("fixed");
    const rect = box(el);
    await expect(rect.top).toBe(0);
    await expect(rect.left).toBe(0);
    await expect(rect.width).toBeCloseTo(document.documentElement.clientWidth, 0);
    await expect(rect.height).toBeCloseTo(px(canvasElement, "var(--cy-control-height-lg)"), 0);
  },
};

export const OverlayHeightFollowsTheToken: Story = {
  args: { overlay: true },
  render: (args) => (
    <div style={{ "--cy-title-bar-height": "52px" } as never}>
      <TitleBar {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(box(bar(canvasElement)).height).toBeCloseTo(52, 0);
  },
};

function Resizable(props: { onHeightChange: (h: number) => void }) {
  const [tall, setTall] = useState(false);
  return (
    <div style={tall ? ({ "--cy-title-bar-height": "56px" } as never) : undefined}>
      <TitleBar label="Resizable" onHeightChange={props.onHeightChange}>
        Title
      </TitleBar>
      <IconButton icon={panelBottom} label="Taller" onClick={() => setTall(true)} />
    </div>
  );
}

export const ReportsItsHeight: Story = {
  render: (args) => <Resizable onHeightChange={args.onHeightChange as (h: number) => void} />,
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const spy = args.onHeightChange as ReturnType<typeof fn>;
    // Once on mount with the border-box height, then whenever the bar's height changes (density, token, overlay).
    await waitFor(() => expect(spy).toHaveBeenCalledWith(box(bar(canvasElement)).height));
    await expect(spy).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole("button", { name: "Taller" }));
    await waitFor(() => expect(spy).toHaveBeenLastCalledWith(56));
    await expect(spy).toHaveBeenCalledTimes(2);
  },
};

export const ControlsActByPointer: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const c = args.controls as Required<TitleBarControls>;
    await userEvent.click(canvas.getByRole("button", { name: "Minimize" }));
    await expect(c.minimize).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole("button", { name: "Maximize" }));
    await expect(c.toggleMaximize).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
    await expect(c.close).toHaveBeenCalledTimes(1);
  },
};

export const ControlsActByKeyboard: Story = {
  args: { leading: undefined, trailing: undefined, controls: controls() },
  play: async ({ args, canvas, userEvent }) => {
    const c = args.controls as Required<TitleBarControls>;
    // Tab order follows the screen: minimize, maximize, close; Enter and Space both act.
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Minimize" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(c.minimize).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Maximize" })).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(c.toggleMaximize).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Close" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(c.close).toHaveBeenCalledTimes(1);
  },
};

export const MaximizedShowsRestore: Story = {
  render: function Render(args) {
    const [maximized, setMaximized] = useState(false);
    return (
      <TitleBar
        {...args}
        controls={{ ...args.controls, maximized, toggleMaximize: () => setMaximized((m) => !m) }}
      />
    );
  },
  play: async ({ canvas, userEvent }) => {
    const middle = canvas.getByRole("button", { name: "Maximize" });
    await expect(middle.querySelector("path")?.getAttribute("d")).toBe(pathOf(windowMaximize));
    await userEvent.click(middle);
    // The same button now restores the window: its icon and its name change together.
    const restore = await canvas.findByRole("button", { name: "Restore" });
    await expect(restore).toBe(middle);
    await expect(restore.querySelector("path")?.getAttribute("d")).toBe(pathOf(windowRestore));
    await expect(canvas.queryByRole("button", { name: "Maximize" })).toBeNull();
    await userEvent.click(restore);
    await expect(await canvas.findByRole("button", { name: "Maximize" })).toBe(middle);
  },
};

export const OnlyTheControlsGiven: Story = {
  args: { controls: { close: fn() } },
  play: async ({ canvas }) => {
    // A window that cannot be resized (a settings window) shows only the controls it has callbacks for.
    await expect(canvas.getByRole("button", { name: "Close" })).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "Minimize" })).toBeNull();
    await expect(canvas.queryByRole("button", { name: /Maximize|Restore/ })).toBeNull();
  },
};

export const NoControlsNoGap: Story = {
  args: { controls: undefined, trailing: <span data-testid="end">End</span> },
  play: async ({ canvas, canvasElement }) => {
    // Without window controls (macOS, or Window Controls Overlay where the OS draws them) the trailing content keeps
    // the bar's end padding instead of touching the edge.
    await expect(canvas.queryByRole("button", { name: "Close" })).toBeNull();
    const gap = box(bar(canvasElement)).right - box(canvas.getByTestId("end")).right;
    await expect(gap).toBeCloseTo(px(canvasElement, "var(--cy-space-4)"), 0);
  },
};

export const ControlsFillTheBarsEnd: Story = {
  play: async ({ canvas, canvasElement }) => {
    const el = bar(canvasElement);
    const inner = el.clientHeight;
    const buttons = ["Minimize", "Maximize", "Close"].map((name) => canvas.getByRole("button", { name }));
    const width = px(canvasElement, "calc(var(--cy-space-10) + var(--cy-space-3))");
    for (const b of buttons) {
      // Edge to edge: as tall as the bar inside its border, a fixed width, square corners.
      await expect(box(b).height).toBeCloseTo(inner, 0);
      await expect(box(b).top).toBeCloseTo(box(el).top, 0);
      await expect(box(b).width).toBeCloseTo(width, 0);
      await expect(getComputedStyle(b).borderTopLeftRadius).toBe("0px");
    }
    // Close sits flush against the window's edge, after the trailing content.
    await expect(box(buttons[2] as HTMLElement).right).toBeCloseTo(box(el).right, 0);
    await expect(box(canvas.getByRole("button", { name: "Settings" })).right).toBeLessThanOrEqual(
      box(buttons[0] as HTMLElement).left,
    );
  },
};

export const TitleIsCentredAndTruncates: Story = {
  render: (args) => (
    <div style={{ inlineSize: 720 }}>
      <TitleBar
        {...args}
        label="Short"
        leading={<span style={{ display: "inline-block", inlineSize: 220 }} />}
      >
        Centred
      </TitleBar>
      <TitleBar {...args} label="Long">
        {"A very long document title that cannot fit between the menus and the window controls ".repeat(3)}
      </TitleBar>
    </div>
  ),
  play: async ({ canvas }) => {
    // The title is centred on the bar, not on the space left between uneven leading and trailing content.
    const short = canvas.getByRole("group", { name: "Short" });
    const title = canvas.getByText("Centred");
    const mid = (r: DOMRect) => r.left + r.width / 2;
    await expect(Math.abs(mid(box(title)) - mid(box(short)))).toBeLessThan(2);
    // A title too long for the space ends in an ellipsis and never runs under the controls.
    const long = canvas.getByRole("group", { name: "Long" });
    const longTitle = long.querySelector(".cy-title-bar-title") as HTMLElement;
    await expect(getComputedStyle(longTitle).textOverflow).toBe("ellipsis");
    await expect(longTitle.scrollWidth).toBeGreaterThan(longTitle.clientWidth);
    const minimize = long.querySelector('[aria-label="Minimize"]') as HTMLElement;
    await expect(box(longTitle).right).toBeLessThanOrEqual(box(minimize).left);
    await expect(box(longTitle).left).toBeGreaterThanOrEqual(
      box(canvas.getByRole("menubar") as HTMLElement).right,
    );
  },
};

export const CloseGoesDangerOnHover: Story = {
  tags: ["!dev"],
  play: async ({ canvas, canvasElement }) => {
    const close = canvas.getByRole("button", { name: "Close" });
    const minimize = canvas.getByRole("button", { name: "Minimize" });
    const danger = paint(canvasElement, "var(--cy-color-danger)");
    const onDanger = paint(canvasElement, "var(--cy-color-on-danger)");
    if (!(await realHover(close))) return;
    // Close fills with the danger colour, its icon in the colour that reads on it.
    await waitFor(() => expect(rgb(getComputedStyle(close).backgroundColor)).toEqual(danger));
    await expect(rgb(getComputedStyle(close).color)).toEqual(onDanger);
    // Minimize keeps a quiet hover, never the danger fill.
    await realHover(minimize);
    await waitFor(() => expect(getComputedStyle(close).backgroundColor).toBe("rgba(0, 0, 0, 0)"));
    await waitFor(() => expect(getComputedStyle(minimize).backgroundColor).not.toBe("rgba(0, 0, 0, 0)"));
    await expect(rgb(getComputedStyle(minimize).backgroundColor)).not.toEqual(danger);
    await realHover(null);
  },
};

export const CloseHoverColoursAreTokens: Story = {
  tags: ["!dev"],
  render: (args) => (
    <div
      style={
        {
          "--cy-title-bar-close-hover-bg": "rgb(10, 20, 30)",
          "--cy-title-bar-close-hover-ink": "rgb(1, 2, 3)",
        } as never
      }
    >
      <TitleBar {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const close = canvas.getByRole("button", { name: "Close" });
    if (!(await realHover(close))) return;
    await waitFor(() => expect(rgb(getComputedStyle(close).backgroundColor)).toEqual([10, 20, 30]));
    await expect(rgb(getComputedStyle(close).color)).toEqual([1, 2, 3]);
    await realHover(null);
  },
};

export const TouchHitAreas: Story = {
  tags: ["touch", "!dev"],
  args: { controls: controls() },
  play: async ({ args, canvas, userEvent }) => {
    await expect(matchMedia("(pointer: coarse)").matches).toBe(true);
    for (const name of ["Minimize", "Maximize", "Close"]) {
      const hit = getComputedStyle(canvas.getByRole("button", { name }), "::before");
      await expect(
        Math.min(Number.parseFloat(hit.width), Number.parseFloat(hit.height)),
      ).toBeGreaterThanOrEqual(44);
    }
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByRole("button", { name: "Close" }) });
    await expect((args.controls as Required<TitleBarControls>).close).toHaveBeenCalledTimes(1);
  },
};

export const RightToLeft: Story = {
  render: (args) => (
    <div dir="rtl">
      <TitleBar {...args} leading={<span data-testid="lead">قائمة</span>}>
        مستند
      </TitleBar>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const el = bar(canvasElement);
    const [minimize, maximize, close] = ["Minimize", "Maximize", "Close"].map((name) =>
      box(canvas.getByRole("button", { name })),
    ) as [DOMRect, DOMRect, DOMRect];
    // Mirrored as Windows mirrors its caption buttons in right-to-left languages: the controls are at the inline end
    // (the left), close outermost, and the leading content at the right.
    await expect(close.left).toBeCloseTo(box(el).left, 0);
    await expect(close.right).toBeLessThanOrEqual(maximize.left + 0.5);
    await expect(maximize.right).toBeLessThanOrEqual(minimize.left + 0.5);
    await expect(box(canvas.getByTestId("lead")).right).toBeGreaterThan(box(el).right - 40);
  },
};

export const LabelsOverride: Story = {
  args: {
    labels: { minimize: "Réduire", maximize: "Agrandir", restore: "Restaurer", close: "Fermer" },
    controls: { ...controls(), maximized: true },
  },
  play: async ({ canvas }) => {
    for (const name of ["Réduire", "Restaurer", "Fermer"])
      await expect(canvas.getByRole("button", { name })).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "Close" })).toBeNull();
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const root = computeUnderHostileHost(canvasElement, ".cy-title-bar", [
      "display",
      "height",
      "box-sizing",
      "padding-inline-start",
      "background-color",
      "font-size",
      "border-bottom-width",
    ]);
    await expect(root.hostile).toEqual(root.clean);
    const title = computeUnderHostileHost(canvasElement, ".cy-title-bar-title", [
      "font-size",
      "font-weight",
      "text-transform",
      "color",
    ]);
    await expect(title.hostile).toEqual(title.clean);
    const control = computeUnderHostileHost(canvasElement, '[aria-label="Close"]', [
      "width",
      "height",
      "padding-top",
      "border-top-width",
    ]);
    await expect(control.hostile).toEqual(control.clean);
  },
};

function ShadowTitleBar() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    const root = el.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [createStyleSheet()];
    const mount = document.createElement("div");
    root.append(mount);
    createRoot(mount).render(
      <TitleBar label="Shadow" controls={{ minimize: () => {}, close: () => {} }}>
        Inside
      </TitleBar>,
    );
  }, []);
  return (
    <div>
      <TitleBar label="Page" controls={{ minimize: () => {}, close: () => {} }}>
        Outside
      </TitleBar>
      <div data-testid="host" ref={host} />
    </div>
  );
}

export const InsideShadowRoot: Story = {
  render: () => <ShadowTitleBar />,
  play: async ({ canvas, canvasElement }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot?.querySelector(".cy-title-bar")).toBeTruthy());
    const inside = host.shadowRoot?.querySelector(".cy-title-bar") as HTMLElement;
    const onPage = bar(canvasElement);
    for (const p of ["height", "padding-inline-start", "background-color", "display"])
      await expect(getComputedStyle(inside).getPropertyValue(p)).toBe(
        getComputedStyle(onPage).getPropertyValue(p),
      );
    const close = inside.querySelector('[aria-label="Close"]') as HTMLElement;
    await expect(box(close).width).toBeCloseTo(
      box(onPage.querySelector('[aria-label="Close"]') as HTMLElement).width,
      0,
    );
    const prop = regionProp();
    if (prop) await expect(getComputedStyle(close).getPropertyValue(prop)).toBe("no-drag");
  },
};
