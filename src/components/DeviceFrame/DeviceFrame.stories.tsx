import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect } from "storybook/test";
import { contrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CynosureTheme } from "../../theme/index.js";
import { Button } from "../Button/Button.js";
import { DeviceFrame } from "./DeviceFrame.js";

/** A screenshot that needs no network: an SVG of the given size as a data URL. */
const shot = (width: number, height: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#0f766e"/><rect x="8%" y="8%" width="84%" height="10%" rx="8" fill="#ccfbf1"/><circle cx="50%" cy="60%" r="${Math.min(width, height) / 5}" fill="#fbbf24"/></svg>`,
  )}`;

const meta = {
  title: "Components/DeviceFrame",
  component: DeviceFrame,
  args: { device: "phone", orientation: "portrait" },
  argTypes: {
    device: { control: "inline-radio", options: ["phone", "tablet", "browser"] },
    orientation: { control: "inline-radio", options: ["portrait", "landscape"] },
    ratio: { control: "number" },
    url: { control: "text" },
    label: { control: "text" },
    children: { control: false },
  },
} satisfies Meta<typeof DeviceFrame>;
export default meta;
type Story = StoryObj<typeof meta>;

const box = (el: Element) => el.getBoundingClientRect();
const q = (el: ParentNode, selector: string) => el.querySelector(selector) as HTMLElement;
const screenOf = (el: ParentNode) => q(el, ".cy-device-frame-screen");

export const Phone: Story = {
  tags: ["visual"],
  render: (args) => (
    <DeviceFrame {...args}>
      <img src={shot(390, 844)} alt="The app's home screen" />
    </DeviceFrame>
  ),
  play: async ({ canvasElement, canvas }) => {
    const frame = box(q(canvasElement, ".cy-device-frame"));
    const screen = box(screenOf(canvasElement));
    // A tall screen (9 to 19.5) inside a bezel on every side.
    await expect(screen.height / screen.width).toBeCloseTo(19.5 / 9, 1);
    await expect(screen.left).toBeGreaterThan(frame.left);
    await expect(screen.right).toBeLessThan(frame.right);
    await expect(screen.top).toBeGreaterThan(frame.top);
    // The screenshot fills the screen and keeps its own name.
    const img = canvas.getByRole("img", { name: "The app's home screen" });
    await expect(box(img).width).toBeCloseTo(screen.width, 0);
    await expect(box(img).height).toBeCloseTo(screen.height, 0);
    // The screen's corners are rounded, inside the frame's rounder corners.
    const body = getComputedStyle(q(canvasElement, ".cy-device-frame-body")).borderTopLeftRadius;
    const corner = getComputedStyle(screenOf(canvasElement)).borderTopLeftRadius;
    await expect(Number.parseFloat(corner)).toBeGreaterThan(0);
    await expect(Number.parseFloat(corner)).toBeLessThan(Number.parseFloat(body));
  },
};

export const ContentIsClippedToTheScreen: Story = {
  args: { device: "tablet" },
  render: (args) => (
    <div style={{ inlineSize: 300 }}>
      <DeviceFrame {...args}>
        <div style={{ background: "var(--cy-color-soft)" }}>
          <div className="tall" style={{ blockSize: 2000, inlineSize: 2000, background: "teal" }} />
        </div>
      </DeviceFrame>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const screen = screenOf(canvasElement);
    const s = box(screen);
    // The content is far bigger than the screen, but the screen keeps its ratio and nothing shows outside it.
    await expect(s.height / s.width).toBeCloseTo(4 / 3, 1);
    await expect(getComputedStyle(screen).overflow).toBe("hidden");
    const outside = document.elementFromPoint(s.left + s.width / 2, s.bottom + 4);
    await expect(outside?.closest(".tall"), "content below the screen").toBeNull();
    const within = document.elementFromPoint(s.left + s.width / 2, s.bottom - 4);
    await expect(within?.closest(".tall"), "content inside the screen").not.toBeNull();
    // Rounded corners clip too: the very corner of the screen shows the frame, not the content.
    const corner = document.elementFromPoint(s.left + 1, s.top + 1);
    await expect(corner?.closest(".tall"), "content at the screen's rounded corner").toBeNull();
  },
};

const WIDTHS = [120, 200, 280];

export const KeepsItsShapeAtAnyWidth: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {(["phone", "tablet", "browser"] as const).flatMap((device) =>
        WIDTHS.map((width) => (
          <div key={`${device}-${width}`} style={{ inlineSize: width }}>
            <DeviceFrame device={device} className={`${device}-${width}`} url="example.com" />
          </div>
        )),
      )}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const ratios = { phone: 9 / 19.5, tablet: 3 / 4, browser: 16 / 10 };
    for (const [device, ratio] of Object.entries(ratios)) {
      const shapes: number[] = [];
      for (const width of WIDTHS) {
        const frame = q(canvasElement, `.${device}-${width}`);
        const s = box(screenOf(frame));
        await expect(box(frame).width).toBeCloseTo(width, 0);
        await expect({ device, width, ratio: Math.abs(s.width / s.height - ratio) < 0.02 }).toEqual({
          device,
          width,
          ratio: true,
        });
        shapes.push(box(frame).height / box(frame).width);
      }
      // A phone or tablet scales as one piece: bezel and corners grow with it, so the outline keeps its shape.
      if (device !== "browser")
        for (const shape of shapes) await expect(shape).toBeCloseTo(shapes[0] as number, 2);
    }
  },
};

export const LandscapeTurnsTheScreen: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, inlineSize: 600 }}>
      <DeviceFrame device="phone" orientation="landscape" className="phone-l" />
      <DeviceFrame device="tablet" orientation="landscape" className="tablet-l" />
      <DeviceFrame device="phone" orientation="portrait" className="phone-p" />
      <DeviceFrame device="browser" orientation="landscape" className="browser" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const shape = (name: string) => {
      const s = box(screenOf(q(canvasElement, `.${name}`)));
      return s.width / s.height;
    };
    await expect(shape("phone-l")).toBeCloseTo(19.5 / 9, 1);
    await expect(shape("tablet-l")).toBeCloseTo(4 / 3, 1);
    await expect(shape("phone-p")).toBeCloseTo(9 / 19.5, 1);
    // The browser has no orientation.
    await expect(shape("browser")).toBeCloseTo(16 / 10, 1);
    await expect(q(canvasElement, ".browser")).not.toHaveAttribute("data-orientation");
    // A turned phone is as tall as an upright one is wide.
    const tall = box(q(canvasElement, ".phone-p"));
    const turned = box(q(canvasElement, ".phone-l"));
    await expect(Math.abs(turned.height - tall.width)).toBeLessThan(tall.width * 0.05);
    // The camera moves from the top bezel to the left one.
    const island = (name: string) =>
      getComputedStyle(q(canvasElement, `.${name} .cy-device-frame-body`), "::after");
    await expect(Number.parseFloat(island("phone-l").height)).toBeGreaterThan(
      Number.parseFloat(island("phone-l").width),
    );
    await expect(Number.parseFloat(island("phone-p").width)).toBeGreaterThan(
      Number.parseFloat(island("phone-p").height),
    );
  },
};

export const CustomRatio: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, inlineSize: 400 }}>
      <DeviceFrame device="browser" ratio={2} className="wide" />
      <DeviceFrame device="phone" ratio={1 / 2} orientation="landscape" className="turned" />
      <DeviceFrame device="tablet" ratio={0} className="bad" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const shape = (name: string) => {
      const s = box(screenOf(q(canvasElement, `.${name}`)));
      return s.width / s.height;
    };
    await expect(shape("wide")).toBeCloseTo(2, 1);
    await expect(shape("turned")).toBeCloseTo(2, 1);
    // A ratio that is not above zero uses the device's own.
    await expect(shape("bad")).toBeCloseTo(3 / 4, 1);
  },
};

export const BrowserWindow: Story = {
  tags: ["visual"],
  args: { device: "browser", url: "https://cynosure.arshadshah.com/storybook/" },
  render: (args) => (
    <div style={{ inlineSize: 480 }}>
      <DeviceFrame {...args}>
        <img src={shot(1440, 900)} alt="The documentation home page" />
      </DeviceFrame>
    </div>
  ),
  play: async ({ canvasElement, canvas }) => {
    const bar = q(canvasElement, ".cy-device-frame-bar");
    const screen = box(screenOf(canvasElement));
    // The bar sits above the screen, with three drawn dots (shapes, not characters) and the address.
    await expect(box(bar).bottom).toBeLessThanOrEqual(screen.top + 0.5);
    const dots = [...bar.querySelectorAll(".cy-device-frame-dots > span")];
    await expect(dots).toHaveLength(3);
    for (const dot of dots) {
      await expect(dot.textContent).toBe("");
      await expect(box(dot).width).toBeGreaterThan(0);
      await expect(getComputedStyle(dot).borderTopLeftRadius).not.toBe("0px");
    }
    await expect(bar).toHaveTextContent("https://cynosure.arshadshah.com/storybook/");
    // The screenshot is the only thing announced.
    await expect(bar).toHaveAttribute("aria-hidden", "true");
    await expect(canvas.getByRole("img", { name: "The documentation home page" })).toBeVisible();
    await expect(box(canvas.getByRole("img")).width).toBeCloseTo(screen.width, 0);
  },
};

export const LongAddressesAreCut: Story = {
  args: { device: "browser", url: `https://example.com/${"very-long-path/".repeat(20)}` },
  render: (args) => (
    <div style={{ inlineSize: 260 }}>
      <DeviceFrame {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const url = q(canvasElement, ".cy-device-frame-url");
    const bar = q(canvasElement, ".cy-device-frame-bar");
    await expect(box(url).right).toBeLessThanOrEqual(box(bar).right);
    await expect(getComputedStyle(url).textOverflow).toBe("ellipsis");
    await expect(bar.scrollWidth).toBeLessThanOrEqual(bar.clientWidth);
  },
};

export const DecorativeByDefault: Story = {
  args: { device: "browser", url: "example.com" },
  render: (args) => (
    <DeviceFrame {...args}>
      <div>
        <Button>Sign in</Button>
      </div>
    </DeviceFrame>
  ),
  play: async ({ canvasElement, canvas }) => {
    const root = q(canvasElement, ".cy-device-frame");
    // A plain div with no role or name: the content keeps its own semantics and stays usable.
    await expect(root.tagName).toBe("DIV");
    await expect(root).not.toHaveAttribute("role");
    await expect(root).not.toHaveAttribute("aria-label");
    await expect(canvas.queryByRole("figure")).toBeNull();
    // The address is drawn, not announced.
    await expect(canvas.queryByText("example.com")).toBeVisible();
    await expect(canvas.queryByText("example.com")?.closest("[aria-hidden='true']")).not.toBeNull();
    const button = canvas.getByRole("button", { name: "Sign in" });
    button.focus();
    await expect(button).toHaveFocus();
  },
};

export const LabelledIsANamedFigure: Story = {
  args: { label: "The checkout on a phone" },
  render: (args) => (
    <DeviceFrame {...args}>
      <img src={shot(390, 844)} alt="" />
    </DeviceFrame>
  ),
  play: async ({ canvas }) => {
    const figure = canvas.getByRole("figure", { name: "The checkout on a phone" });
    await expect(figure.tagName).toBe("FIGURE");
    // A figure has no margins of its own here.
    await expect(getComputedStyle(figure).marginLeft).toBe("0px");
    await expect(getComputedStyle(figure).marginTop).toBe("0px");
  },
};

export const RightToLeft: Story = {
  args: { device: "browser", url: "example.com/صفحة" },
  render: (args) => (
    <div dir="rtl" style={{ inlineSize: 360 }}>
      <DeviceFrame {...args} />
      <DeviceFrame device="phone" className="phone" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bar = box(q(canvasElement, ".cy-device-frame-bar"));
    const dots = box(q(canvasElement, ".cy-device-frame-dots"));
    // The dots start the bar, so they sit on the right.
    await expect(dots.right).toBeGreaterThan(bar.left + bar.width / 2);
    // An address reads left to right in any language.
    await expect(q(canvasElement, ".cy-device-frame-url")).toHaveAttribute("dir", "ltr");
    // A phone is the same object either way: its camera stays centred.
    const phone = q(canvasElement, ".phone .cy-device-frame-body");
    const after = getComputedStyle(phone, "::after");
    const frame = box(phone);
    const centre = Number.parseFloat(after.left) + Number.parseFloat(after.width) / 2;
    // `left: 50%` with a -50% translate; the computed left is half the frame.
    await expect(Number.parseFloat(after.left)).toBeCloseTo(frame.width / 2, 0);
    await expect(centre).toBeGreaterThan(frame.width / 2);
  },
};

export const LightAndDark: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      {(["light", "dark"] as const).map((mode) => (
        <CynosureTheme key={mode} mode={mode}>
          <div
            className={`mode-${mode}`}
            style={{ background: "var(--cy-color-bg)", padding: 16, inlineSize: 160 }}
          >
            <DeviceFrame />
          </div>
        </CynosureTheme>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const part = (mode: string, pseudo: string) =>
      getComputedStyle(q(canvasElement, `.mode-${mode} .cy-device-frame-body`), pseudo);
    const page = (mode: string) => getComputedStyle(q(canvasElement, `.mode-${mode}`)).backgroundColor;
    const bezel = (mode: string) => part(mode, "::before").backgroundColor;
    // Light page: a dark device that stands out clearly, its camera in the bezel's colour.
    await expect(contrast(bezel("light"), page("light"))).toBeGreaterThan(3);
    await expect(part("light", "::after").backgroundColor).toBe(bezel("light"));
    // Dark page: the device is still dark (never white), but lifted off the page so its outline shows,
    // and its rim reads like any outline (3:1, WCAG non-text contrast).
    await expect(contrast(bezel("dark"), "#000000")).toBeLessThan(2.5);
    await expect(contrast(bezel("dark"), page("dark"))).toBeGreaterThanOrEqual(1.5);
    const edge = getComputedStyle(q(canvasElement, ".mode-dark .cy-device-frame-body")).boxShadow;
    await expect(contrast(edge.slice(0, edge.indexOf(")") + 1), page("dark"))).toBeGreaterThanOrEqual(3);
    // The screen follows the theme, and is set apart from the bezel in both modes.
    const screen = (mode: string) =>
      getComputedStyle(screenOf(q(canvasElement, `.mode-${mode}`))).backgroundColor;
    await expect(screen("light")).not.toBe(screen("dark"));
    for (const mode of ["light", "dark"])
      await expect(contrast(screen(mode), bezel(mode))).toBeGreaterThan(1.2);
  },
};

export const ContentClearsTheCamera: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div className="upright" style={{ inlineSize: 180 }}>
        <DeviceFrame>
          <p className="first" style={{ margin: 0 }}>
            Today
          </p>
        </DeviceFrame>
      </div>
      <div className="turned" style={{ inlineSize: 360 }}>
        <DeviceFrame orientation="landscape">
          <p className="first" style={{ margin: 0 }}>
            Today
          </p>
        </DeviceFrame>
      </div>
      <div className="bleed" style={{ inlineSize: 180 }}>
        <DeviceFrame>
          <img className="first" alt="" src={shot(390, 844)} />
        </DeviceFrame>
      </div>
      <div className="forced" style={{ inlineSize: 180 }}>
        <DeviceFrame safeArea={false}>
          <p className="first" style={{ margin: 0 }}>
            Under the camera
          </p>
        </DeviceFrame>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const camera = (root: string) => {
      const body = q(canvasElement, `.${root} .cy-device-frame-body`);
      const s = getComputedStyle(body, "::after");
      const b = box(body);
      return { top: b.top + Number.parseFloat(s.top), left: b.left + Number.parseFloat(s.left), s, b };
    };
    const first = (root: string) => box(q(canvasElement, `.${root} .first`));
    // Upright: live content starts below the camera island, not under it.
    const up = camera("upright");
    const islandBottom = up.top + Number.parseFloat(up.s.height);
    await expect(first("upright").top).toBeGreaterThanOrEqual(islandBottom);
    // Turned: the camera is at the left edge, so content starts to its right.
    const turned = camera("turned");
    const islandRight = turned.left + Number.parseFloat(turned.s.width);
    await expect(first("turned").left).toBeGreaterThanOrEqual(islandRight);
    // A screenshot (it has its own status bar) fills the whole screen by default.
    const screen = box(screenOf(q(canvasElement, ".bleed")));
    await expect(first("bleed").top).toBeCloseTo(screen.top, 0);
    await expect(first("bleed").height).toBeCloseTo(screen.height, 0);
    // safeArea={false} lets any content run under the camera.
    await expect(first("forced").top).toBeCloseTo(box(screenOf(q(canvasElement, ".forced"))).top, 0);
  },
};

export const TokensRestyleIt: Story = {
  render: () => (
    <div
      style={
        {
          "--cy-device-frame-bezel": "rgb(20, 40, 60)",
          "--cy-device-frame-screen": "rgb(1, 2, 3)",
          "--cy-device-frame-phone-width": "200px",
          "--cy-device-frame-shadow": "none",
          inlineSize: 500,
        } as CSSProperties
      }
    >
      <DeviceFrame />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const body = q(canvasElement, ".cy-device-frame-body");
    await expect(getComputedStyle(body, "::before").backgroundColor).toBe("rgb(20, 40, 60)");
    await expect(getComputedStyle(screenOf(canvasElement)).backgroundColor).toBe("rgb(1, 2, 3)");
    // The phone width token caps it, even in a wider container.
    await expect(box(q(canvasElement, ".cy-device-frame")).width).toBeCloseTo(200, 0);
  },
};

export const StableUnderHostileHost: Story = {
  args: { device: "browser", url: "example.com" },
  render: (args) => (
    <div style={{ inlineSize: 400 }}>
      <DeviceFrame {...args}>
        <img src={shot(1440, 900)} alt="Page" />
      </DeviceFrame>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const layout = ["width", "height", "box-sizing", "padding-top", "margin-top", "border-top-left-radius"];
    for (const selector of [
      ".cy-device-frame",
      ".cy-device-frame-body",
      ".cy-device-frame-bar",
      ".cy-device-frame-dots > span",
      ".cy-device-frame-screen",
    ]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, layout);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
    const url = computeUnderHostileHost(canvasElement, ".cy-device-frame-url", [
      "font-size",
      "letter-spacing",
      "text-transform",
      "line-height",
    ]);
    await expect(url.hostile).toEqual(url.clean);
  },
};
