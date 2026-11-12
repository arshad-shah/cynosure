import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect } from "storybook/test";
import { Icon } from "../../foundations/Icon/Icon.js";
import { qrMatrix } from "../../foundations/qr.js";
import { globe } from "../../icons/index.js";
import { contrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CynosureTheme } from "../../theme/index.js";
import { QRCode } from "./QRCode.js";

const URL = "https://cynosure.arshadshah.com";

const meta = {
  title: "Components/QRCode",
  component: QRCode,
  args: { value: URL, size: "md", level: "M", quietZone: 4 },
  argTypes: {
    value: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    level: { control: "inline-radio", options: ["L", "M", "Q", "H"] },
    quietZone: { control: { type: "number", min: 0, max: 8 } },
    label: { control: "text" },
    labels: { control: "object" },
    icon: { control: false },
  },
} satisfies Meta<typeof QRCode>;
export default meta;
type Story = StoryObj<typeof meta>;

const code = (el: ParentNode, selector = ".cy-qr-code") => el.querySelector(selector) as HTMLElement;

/** The dark modules the path draws, as "x,y" cells (quiet zone removed). */
function drawn(root: HTMLElement): { cells: string[]; box: number } {
  const svg = root.querySelector("svg") as SVGSVGElement;
  const box = svg.viewBox.baseVal.width;
  const d = svg.querySelector("path")?.getAttribute("d") ?? "";
  const cells: string[] = [];
  for (const [, x, y, w] of d.matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g))
    for (let i = 0; i < Number(w); i++) cells.push(`${Number(x) + i},${Number(y)}`);
  return { cells, box };
}
const expected = (value: string, level: "L" | "M" | "Q" | "H", q = 4) => {
  const m = qrMatrix(value, { level });
  return {
    cells: m.flatMap((r, y) => r.flatMap((v, x) => (v ? [`${x + q},${y + q}`] : []))),
    box: m.length + q * 2,
  };
};
const sorted = (a: string[]) => [...a].sort();

export const Default: Story = {
  tags: ["visual"],
  play: async ({ canvasElement, canvas }) => {
    const root = canvas.getByRole("img", { name: "QR code" });
    // Every dark module of the encoded matrix, and nothing else, is drawn in one path.
    const got = drawn(root);
    const want = expected(URL, "M");
    await expect(got.box).toBe(want.box);
    await expect(sorted(got.cells)).toEqual(sorted(want.cells));
    await expect(root.querySelectorAll("path")).toHaveLength(1);
    // The SVG itself is hidden: the root is the one image.
    await expect(code(canvasElement, "svg")).toHaveAttribute("aria-hidden", "true");
    await expect(root).toHaveAttribute("data-level", "M");
  },
};

const LENGTHS: [value: string, level: "L" | "M" | "Q" | "H", version: number][] = [
  ["HELLO WORLD", "Q", 1],
  ["1".repeat(34), "M", 1],
  ["1".repeat(35), "M", 2],
  [URL, "M", 3],
  ["x".repeat(100), "L", 5],
  ["x".repeat(100), "H", 10],
  ["x".repeat(600), "M", 19],
];

export const GrowsWithTheValue: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {LENGTHS.map(([value, level], i) => (
        <QRCode key={i} {...args} value={value} level={level} size="sm" className={`n-${i}`} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const [i, [value, level, version]] of LENGTHS.entries()) {
      const root = code(canvasElement, `.n-${i}`);
      const got = drawn(root);
      // Version v has 4v + 17 modules a side, plus the quiet zone on both sides.
      await expect({ i, box: got.box }).toEqual({ i, box: version * 4 + 17 + 8 });
      await expect(sorted(got.cells)).toEqual(sorted(expected(value, level).cells));
      // A denser code is drawn at the same size, never larger.
      await expect(root.getBoundingClientRect().width).toBeCloseTo(
        code(canvasElement, ".n-0").getBoundingClientRect().width,
        0,
      );
    }
  },
};

export const ErrorCorrectionLevels: Story = {
  args: { value: "Cynosure" },
  render: (args) => (
    <div style={{ display: "flex", gap: 8 }}>
      {(["L", "M", "Q", "H"] as const).map((level) => (
        <QRCode key={level} {...args} level={level} size="sm" className={`l-${level}`} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const level of ["L", "M", "Q", "H"] as const) {
      const root = code(canvasElement, `.l-${level}`);
      await expect(root).toHaveAttribute("data-level", level);
      await expect(sorted(drawn(root).cells)).toEqual(sorted(expected("Cynosure", level).cells));
    }
  },
};

export const KeepsTheQuietZone: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 8 }}>
      <QRCode {...args} size={200} className="q4" />
      <QRCode {...args} size={200} quietZone={1} className="q1" />
      <QRCode {...args} size={200} quietZone={0} className="q0" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const [name, q] of [
      ["q4", 4],
      ["q1", 1],
      ["q0", 0],
    ] as const) {
      const root = code(canvasElement, `.${name}`);
      const svg = root.querySelector("svg") as SVGSVGElement;
      const path = svg.querySelector("path") as SVGPathElement;
      const box = svg.viewBox.baseVal.width;
      // The modules start q modules in from every edge; the rest of the box is the light colour.
      const bbox = path.getBBox();
      await expect({ name, x: bbox.x, y: bbox.y, right: box - bbox.x - bbox.width }).toEqual({
        name,
        x: q,
        y: q,
        right: q,
      });
      const rect = root.getBoundingClientRect();
      await expect(rect.width).toBeCloseTo(200, 0);
      await expect(rect.height).toBeCloseTo(200, 0);
      // The quiet zone is painted light, not left transparent over whatever is behind.
      await expect(getComputedStyle(root).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    }
  },
};

export const NamedForScreenReaders: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 8 }}>
      <QRCode {...args} size="sm" />
      <QRCode {...args} size="sm" label="Open the documentation on your phone" />
      <QRCode {...args} size="sm" labels={{ name: "Code QR" }} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("img", { name: "QR code" })).toBeVisible();
    await expect(canvas.getByRole("img", { name: "Open the documentation on your phone" })).toBeVisible();
    await expect(canvas.getByRole("img", { name: "Code QR" })).toBeVisible();
    // One image each: nothing inside is announced separately, and nothing takes focus.
    await expect(canvas.getAllByRole("img")).toHaveLength(3);
    await expect(canvasElement.querySelector("[tabindex], svg:not([aria-hidden='true'])")).toBeNull();
  },
};

export const WithACentredIcon: Story = {
  tags: ["visual"],
  args: { level: "L", icon: <Icon icon={globe} /> },
  play: async ({ canvasElement }) => {
    const root = code(canvasElement);
    // The icon covers modules, so the level is raised to H whatever was asked.
    await expect(root).toHaveAttribute("data-level", "H");
    await expect(sorted(drawn(root).cells)).toEqual(sorted(expected(URL, "H").cells));
    // It sits in the middle, small enough for level H to recover what it hides, on the light colour.
    const icon = code(canvasElement, ".cy-qr-code-icon");
    const r = root.getBoundingClientRect();
    const b = icon.getBoundingClientRect();
    await expect(b.left + b.width / 2).toBeCloseTo(r.left + r.width / 2, 0);
    await expect(b.top + b.height / 2).toBeCloseTo(r.top + r.height / 2, 0);
    await expect(b.width / r.width).toBeLessThanOrEqual(0.22);
    await expect(getComputedStyle(icon).backgroundColor).toBe(getComputedStyle(root).backgroundColor);
    // The icon is decoration inside the image.
    await expect(icon.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  },
};

export const SizesAndPixels: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "start", gap: 8 }}>
      <QRCode {...args} size="sm" className="s-sm" />
      <QRCode {...args} size="md" className="s-md" />
      <QRCode {...args} size="lg" className="s-lg" />
      <QRCode {...args} size={96} className="s-96" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const w = (name: string) => code(canvasElement, `.s-${name}`).getBoundingClientRect();
    await expect(w("sm").width).toBeLessThan(w("md").width);
    await expect(w("md").width).toBeLessThan(w("lg").width);
    await expect(w("96").width).toBeCloseTo(96, 0);
    // Always square.
    for (const name of ["sm", "md", "lg", "96"]) await expect(w(name).height).toBeCloseTo(w(name).width, 0);
  },
};

export const NeverWiderThanItsContainer: Story = {
  render: (args) => (
    <div className="narrow" style={{ inlineSize: 120 }}>
      <QRCode {...args} size={300} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const r = code(canvasElement).getBoundingClientRect();
    await expect(r.width).toBeCloseTo(120, 0);
    await expect(r.height).toBeCloseTo(120, 0);
  },
};

const fill = (el: Element) => getComputedStyle(el).fill;

export const DarkOnLightInEveryMode: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 8 }}>
      {(["light", "dark"] as const).map((mode) => (
        <CynosureTheme key={mode} mode={mode}>
          <div className={`mode-${mode}`} style={{ background: "var(--cy-color-bg)", padding: 8 }}>
            <QRCode {...args} size="sm" />
          </div>
        </CynosureTheme>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const pairs = ["light", "dark"].map((mode) => {
      const root = code(canvasElement, `.mode-${mode} .cy-qr-code`);
      return {
        ink: fill(root.querySelector("path") as Element),
        paper: getComputedStyle(root).backgroundColor,
      };
    });
    const [light, dark] = pairs as [(typeof pairs)[0], (typeof pairs)[0]];
    // Scanners expect dark modules on a light ground: the dark-mode code is the same as the light one.
    await expect(dark).toEqual(light);
    await expect(contrast(dark.ink, dark.paper)).toBeGreaterThanOrEqual(7);
    const lum = (c: string) => {
      const ctx = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1);
      const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data;
      return r + g + b;
    };
    await expect(lum(dark.ink)).toBeLessThan(lum(dark.paper));
    // The page around it is dark, so the light quiet zone also sets the code apart.
    const page = getComputedStyle(code(canvasElement, ".mode-dark")).backgroundColor;
    await expect(lum(page)).toBeLessThan(lum(dark.paper));
  },
};

export const TokensRecolourIt: Story = {
  render: (args) => (
    <div
      style={
        {
          "--cy-qr-code-color": "rgb(0, 0, 128)",
          "--cy-qr-code-background": "rgb(255, 255, 240)",
        } as CSSProperties
      }
    >
      <QRCode {...args} size="sm" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const root = code(canvasElement);
    await expect(fill(root.querySelector("path") as Element)).toBe("rgb(0, 0, 128)");
    await expect(getComputedStyle(root).backgroundColor).toBe("rgb(255, 255, 240)");
  },
};

export const SameInRightToLeft: Story = {
  render: (args) => (
    <div dir="rtl">
      <QRCode {...args} size="sm" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // A QR code is never mirrored: the finder patterns stay top-left, top-right and bottom-left.
    const got = drawn(code(canvasElement));
    await expect(sorted(got.cells)).toEqual(sorted(expected(URL, "M").cells));
    const path = code(canvasElement, "path").getBoundingClientRect();
    const svg = code(canvasElement, "svg").getBoundingClientRect();
    await expect(getComputedStyle(code(canvasElement, "svg")).transform).toBe("none");
    await expect(path.left - svg.left).toBeCloseTo(svg.right - path.right, 0);
  },
};

export const StableUnderHostileHost: Story = {
  args: { icon: <Icon icon={globe} /> },
  play: async ({ canvasElement }) => {
    // The host sheet sizes every svg to 100px, sets `height: auto`, recolours everything and pads it all.
    const root = computeUnderHostileHost(canvasElement, ".cy-qr-code", [
      "width",
      "height",
      "box-sizing",
      "padding-top",
      "background-color",
      "border-top-left-radius",
    ]);
    await expect(root.hostile).toEqual(root.clean);
    for (const selector of [".cy-qr-code-svg", ".cy-qr-code-icon"]) {
      const part = computeUnderHostileHost(canvasElement, selector, [
        "width",
        "height",
        "display",
        "max-width",
      ]);
      await expect(part.hostile).toEqual(part.clean);
    }
    const ink = computeUnderHostileHost(canvasElement, ".cy-qr-code-modules", ["fill"]);
    await expect(ink.hostile).toEqual(ink.clean);
  },
};
