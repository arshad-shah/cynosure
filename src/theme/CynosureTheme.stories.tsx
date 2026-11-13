import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactElement, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { expect, waitFor } from "storybook/test";
import { Button } from "../components/Button/Button.js";
import { Inline } from "../components/Inline/Inline.js";
import { SegmentedControl } from "../components/SegmentedControl/SegmentedControl.js";
import { Select } from "../components/Select/Select.js";
import { TextField } from "../components/TextField/TextField.js";
import { createStyleSheet } from "../styles/inline.js";
import { computeUnderHostileHost } from "../test/hostile.js";
import { emulateMedia } from "../test/media.js";
import {
  createTheme,
  createThemeRegistry,
  defineTheme,
  type ThemeDefinition,
  themeProperties,
} from "../tokens/index.js";
import { CynosureTheme } from "./CynosureTheme.js";
import { useCynosureTheme } from "./use-cynosure-theme.js";

const meta = {
  tags: ["serial"],
  title: "Foundations/CynosureTheme",
  component: CynosureTheme,
} satisfies Meta<typeof CynosureTheme>;
export default meta;
type Story = StoryObj<typeof meta>;

const token = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).trim();
const Swatch = ({ id }: { id: string }) => (
  <div
    data-testid={id}
    style={{ background: "var(--cy-color-accent)", color: "var(--cy-color-on-accent)", padding: 12 }}
  >
    {id}
  </div>
);

export const OwnWrapperOnly: Story = {
  args: { theme: createTheme({ accent: "#e8462e" }), children: <Swatch id="swatch" /> },
  play: async ({ canvas }) => {
    const swatch = await canvas.findByTestId("swatch");
    await expect(token(swatch, "--cy-color-accent")).toBe("#e8462e");
    await expect(document.documentElement.hasAttribute("data-cy-mode")).toBe(false);
    await expect(document.documentElement.style.getPropertyValue("--cy-color-accent")).toBe("");
  },
};

export const Nested: Story = {
  args: {
    theme: createTheme({ accent: "#e8462e" }),
    mode: "light",
    children: (
      <>
        <Swatch id="outer" />
        <CynosureTheme theme={createTheme({ accent: "#14b8a6", scale: "compact" })} mode="dark">
          <Swatch id="inner" />
        </CynosureTheme>
      </>
    ),
  },
  play: async ({ canvas }) => {
    const outer = await canvas.findByTestId("outer");
    const inner = await canvas.findByTestId("inner");
    await expect(token(outer, "--cy-color-accent")).toBe("#e8462e");
    await expect(token(inner, "--cy-color-accent")).toBe("#14b8a6");
    await expect(token(outer, "--cy-control-height-md")).toBe("32px");
    await expect(token(inner, "--cy-control-height-md")).toBe("28px");
    await expect(getComputedStyle(outer).colorScheme).toBe("light");
    await expect(getComputedStyle(inner).colorScheme).toBe("dark");
  },
};

export const DenseControlHeightIsOneToken: Story = {
  args: {
    theme: createTheme({ tokens: { control: { height: { xs: 24 } } } }),
    children: (
      <Inline gap="3">
        <Button size="xs">Run</Button>
        <TextField size="xs" label="Filter" />
        <Select size="xs" label="Mode" options={[{ value: "a", label: "All" }]} defaultValue="a" />
        <SegmentedControl
          size="xs"
          label="View"
          options={[
            { value: "tree", label: "Tree" },
            { value: "raw", label: "Raw" },
          ]}
          defaultValue="tree"
        />
      </Inline>
    ),
  },
  play: async ({ canvas }) => {
    // The theme's one xs control height sizes every dense control alike.
    await expect(token(canvas.getByRole("button", { name: "Run" }), "--cy-control-height-xs")).toBe("24px");
    const boxes = [
      canvas.getByRole("button", { name: "Run" }),
      canvas.getByRole("textbox", { name: "Filter" }).closest(".cy-text-field"),
      canvas.getByRole("combobox", { name: "Mode" }),
      canvas.getByRole("radiogroup", { name: "View" }),
    ];
    for (const box of boxes) await expect((box as Element).getBoundingClientRect().height).toBe(24);
  },
};

export const SystemMode: Story = {
  args: { mode: "system", children: <Swatch id="system" /> },
  play: async ({ canvas }) => {
    await expect(getComputedStyle(await canvas.findByTestId("system")).colorScheme).toBe("light dark");
  },
};

export const ContrastMore: Story = {
  args: {
    theme: createTheme(),
    mode: "light",
    contrast: "more",
    children: (
      <p data-testid="ink" style={{ color: "var(--cy-color-ink)" }}>
        High-contrast ink
      </p>
    ),
  },
  play: async ({ canvas }) => {
    await expect(getComputedStyle(await canvas.findByTestId("ink")).color).toBe("rgb(0, 0, 0)");
  },
};

function DocumentTarget() {
  const [on, setOn] = useState(true);
  return (
    <div>
      <span data-testid="state">{on ? "mounted" : "unmounted"}</span>
      <button type="button" data-testid="unmount" onClick={() => setOn(false)}>
        unmount
      </button>
      {on && (
        <CynosureTheme
          theme={createTheme({ accent: "#4f7bd9" })}
          mode="dark"
          contrast="more"
          target="document"
        />
      )}
    </div>
  );
}

export const TargetDocument: Story = {
  args: { children: null },
  render: () => <DocumentTarget />,
  play: async ({ canvas, userEvent }) => {
    const html = document.documentElement;
    await waitFor(() => expect(html.getAttribute("data-cy-mode")).toBe("dark"));
    await expect(html.style.getPropertyValue("--cy-color-accent")).toBe("#4f7bd9");
    await expect(html.getAttribute("data-cy-contrast")).toBe("more");
    await userEvent.click(canvas.getByTestId("unmount"));
    await waitFor(() => expect(html.hasAttribute("data-cy-mode")).toBe(false));
    await expect(html.hasAttribute("data-cy-contrast")).toBe(false);
    await expect(html.style.getPropertyValue("--cy-color-accent")).toBe("");
  },
};

function ShadowHost({ content = <Swatch id="shadow" /> }: { content?: ReactElement }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    const root = el.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [createStyleSheet()];
    const mount = document.createElement("div");
    root.append(mount);
    createRoot(mount).render(content);
  }, [content]);
  return <div data-testid="host" ref={host} />;
}

export const InsideShadowRoot: Story = {
  args: { children: null },
  render: () => <ShadowHost />,
  play: async ({ canvas }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot?.querySelector('[data-testid="shadow"]')).toBeTruthy());
    const swatch = host.shadowRoot?.querySelector('[data-testid="shadow"]') as Element;
    await expect(token(swatch, "--cy-color-bg")).toBe("light-dark(#f4f1ea,#14120f)");
    await expect(getComputedStyle(swatch).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  },
};

/*
 * On an OS set to more contrast, the stylesheet gives the root (here a shadow host) the high-contrast palettes;
 * contrast="normal" without a theme must put the normal ones back for its subtree. Tagged "!dev": the media feature is
 * emulated through the Vitest run.
 */
const normalAndSystem = (
  <div>
    <Swatch id="system" />
    <CynosureTheme contrast="normal">
      <Swatch id="normal" />
    </CynosureTheme>
  </div>
);
export const ContrastNormalOnMoreContrastOs: Story = {
  tags: ["!dev"],
  args: { children: null },
  render: () => <ShadowHost content={normalAndSystem} />,
  play: async ({ canvas }) => {
    const host = await canvas.findByTestId("host");
    const swatch = (id: string) => host.shadowRoot?.querySelector(`[data-testid="${id}"]`) as Element;
    await waitFor(() => expect(swatch("normal")).toBeTruthy());
    const normal = themeProperties(createTheme())["--cy-color-muted"];
    const more = themeProperties(createTheme(), { contrast: true })["--cy-color-muted"];
    await expect(normal).not.toBe(more);
    if (!(await emulateMedia({ contrast: "more" }))) return;
    try {
      await waitFor(() => expect(matchMedia("(prefers-contrast: more)").matches).toBe(true));
      await waitFor(() => expect(token(swatch("system"), "--cy-color-muted")).toBe(more));
      await expect(token(swatch("normal"), "--cy-color-muted")).toBe(normal);
    } finally {
      await emulateMedia({ contrast: null });
    }
  },
};

export const NestedWithoutThemeInherits: Story = {
  args: {
    theme: createTheme({ accent: "#e8462e", scale: "compact" }),
    mode: "light",
    children: (
      <CynosureTheme mode="dark">
        <Swatch id="inherits" />
      </CynosureTheme>
    ),
  },
  play: async ({ canvas }) => {
    const swatch = await canvas.findByTestId("inherits");
    await expect(token(swatch, "--cy-color-accent")).toBe("#e8462e");
    await expect(token(swatch, "--cy-control-height-md")).toBe("28px");
    await expect(getComputedStyle(swatch).colorScheme).toBe("dark");
  },
};

export const NeverTouchesHostColorScheme: Story = {
  args: { children: <Swatch id="host" /> },
  play: async () => {
    await expect(getComputedStyle(document.documentElement).colorScheme).toBe("normal");
  },
};

export const LayoutPropsAndSpanWrapper: Story = {
  args: {
    as: "span",
    className: "app-root",
    style: { display: "block", marginTop: 4 },
    children: <Swatch id="span" />,
  },
  play: async ({ canvasElement }) => {
    const wrapper = canvasElement.querySelector("span.cy-theme.app-root") as HTMLElement;
    await expect(wrapper).toBeTruthy();
    await expect(getComputedStyle(wrapper).marginTop).toBe("4px");
  },
};

function BareDocumentTarget() {
  return <CynosureTheme theme={createTheme({ accent: "#14b8a6" })} target="document" />;
}

export const TargetDocumentWithoutModeLeavesAttributes: Story = {
  args: { children: null },
  render: () => <BareDocumentTarget />,
  play: async () => {
    const html = document.documentElement;
    await waitFor(() => expect(html.style.getPropertyValue("--cy-color-accent")).toBe("#14b8a6"));
    await expect(html.hasAttribute("data-cy-mode")).toBe(false);
    await expect(html.hasAttribute("data-cy-contrast")).toBe(false);
  },
};

function MountToggle() {
  const [on, setOn] = useState(false);
  return (
    <div>
      <button type="button" data-testid="toggle" onClick={() => setOn(!on)}>
        toggle
      </button>
      {on && <CynosureTheme theme={createTheme({ accent: "#4f7bd9" })} mode="dark" target="document" />}
    </div>
  );
}

export const TargetDocumentRestoresHostAttributes: Story = {
  args: { children: null },
  render: () => <MountToggle />,
  play: async ({ canvas, userEvent }) => {
    const html = document.documentElement;
    html.setAttribute("data-cy-mode", "light");
    html.style.setProperty("--cy-color-accent", "#111111");
    await userEvent.click(canvas.getByTestId("toggle"));
    await waitFor(() => expect(html.getAttribute("data-cy-mode")).toBe("dark"));
    await userEvent.click(canvas.getByTestId("toggle"));
    await waitFor(() => expect(html.getAttribute("data-cy-mode")).toBe("light"));
    await expect(html.style.getPropertyValue("--cy-color-accent")).toBe("#111111");
    html.removeAttribute("data-cy-mode");
    html.style.removeProperty("--cy-color-accent");
  },
};

/* Named themes and useCynosureTheme. */

const midnightDefinition: ThemeDefinition = {
  id: "midnight",
  name: "Midnight",
  mode: "dark",
  accent: "#7a5cff",
  palettes: { dark: { bg: "#05070d", surface: "#0b0f16", surfaceRaised: "#111827" } },
};
const midnight = defineTheme(midnightDefinition);

export const FixedModeThemeIgnoresTheColourMode: Story = {
  args: {
    theme: midnight.theme,
    mode: "light",
    children: (
      <>
        <Swatch id="midnight" />
        <CynosureTheme mode="light">
          <Swatch id="nested" />
        </CynosureTheme>
      </>
    ),
  },
  play: async ({ canvas }) => {
    const swatch = await canvas.findByTestId("midnight");
    await expect(token(swatch, "--cy-color-bg")).toBe("#05070d");
    await expect(token(swatch, "--cy-color-accent")).toBe("#7a5cff");
    await expect(getComputedStyle(swatch).colorScheme).toBe("dark");
    // A wrapper inside asking for light keeps the theme's own mode too.
    const nested = await canvas.findByTestId("nested");
    await expect(getComputedStyle(nested).colorScheme).toBe("dark");
    await expect(token(nested, "--cy-color-bg")).toBe("#05070d");
  },
};

/** Reads one canvas pixel as hex. */
function pixel(canvas: HTMLCanvasElement, x: number, y: number): string {
  const [r, g, b] = canvas.getContext("2d")?.getImageData(x, y, 1, 1).data ?? [];
  return `#${[r, g, b].map((v) => (v ?? 0).toString(16).padStart(2, "0")).join("")}`;
}

/** A canvas drawn from useCynosureTheme: the background, then the eight series colours along the top. */
function ChartSwatch() {
  const { palette, colors, fontSize } = useCynosureTheme();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, 160, 40);
    colors.seriesColors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(i * 20, 0, 20, 20);
    });
  }, [colors]);
  return (
    <div style={{ background: "var(--cy-color-bg)", color: "var(--cy-color-ink)", padding: 8 }}>
      <canvas ref={ref} width={160} height={40} data-testid="chart" data-palette={palette} />
      <span data-testid="font">{fontSize.md}</span>
    </div>
  );
}

const chart = (root: ParentNode) => root.querySelector('[data-testid="chart"]') as HTMLCanvasElement;

const pluginJson = JSON.stringify({ id: "paper", name: "Paper", mode: "light", accent: "#2563eb" });
const brokenJson = JSON.stringify({
  id: "grey",
  name: "Grey",
  mode: "dark",
  palettes: { dark: { ink: "#333333" } },
});

/** A theme picker over a registry: the built-in theme, Midnight, and plugin themes registered from JSON. */
function ThemePicker() {
  const [registry] = useState(() =>
    createThemeRegistry([{ id: "cynosure", name: "Cynosure" }, midnightDefinition]),
  );
  const themes = useSyncExternalStore(registry.subscribe, registry.list);
  const [id, setId] = useState("cynosure");
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [more, setMore] = useState(false);
  const [error, setError] = useState("");
  const register = (json: string) => {
    try {
      registry.register(JSON.parse(json));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <CynosureTheme
      theme={(registry.get(id) ?? midnight).theme}
      mode={mode}
      contrast={more ? "more" : "normal"}
    >
      <Inline gap="2">
        {themes.map((t) => (
          <Button key={t.id} variant={t.id === id ? "solid" : "outline"} onClick={() => setId(t.id)}>
            {t.name}
          </Button>
        ))}
        <Button onClick={() => setMode(mode === "light" ? "dark" : "light")}>Mode: {mode}</Button>
        <Button onClick={() => setMore(!more)}>More contrast</Button>
        <Button onClick={() => register(pluginJson)}>Install Paper</Button>
        <Button onClick={() => register(brokenJson)}>Install Grey</Button>
      </Inline>
      <Swatch id="picked" />
      <ChartSwatch />
      <p data-testid="error" style={{ background: "var(--cy-color-bg)", color: "var(--cy-color-ink)" }}>
        {error}
      </p>
    </CynosureTheme>
  );
}

export const SwitchingNamedThemes: Story = {
  args: { children: null },
  render: () => <ThemePicker />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const swatch = await canvas.findByTestId("picked");
    const drawn = chart(canvasElement);
    const light = createTheme().palettes.light;
    await waitFor(() => expect(pixel(drawn, 10, 30)).toBe(light.bg));
    await expect(drawn.dataset.palette).toBe("light");
    await expect(pixel(drawn, 10, 10)).toBe(light.seriesColors[0]);

    // Midnight is dark-only: the page is still in light mode, the theme stays dark.
    await userEvent.click(canvas.getByRole("button", { name: "Midnight" }));
    await waitFor(() => expect(pixel(drawn, 10, 30)).toBe("#05070d"));
    await expect(drawn.dataset.palette).toBe("dark");
    await expect(pixel(drawn, 10, 10)).toBe("#7a5cff");
    await expect(token(swatch, "--cy-color-accent")).toBe("#7a5cff");
    await expect(getComputedStyle(swatch).colorScheme).toBe("dark");
    await userEvent.click(canvas.getByRole("button", { name: "Mode: light" }));
    await expect(drawn.dataset.palette).toBe("dark");

    // The built-in theme follows the mode; contrast swaps the palette the hook reports.
    await userEvent.click(canvas.getByRole("button", { name: "Cynosure" }));
    await waitFor(() => expect(drawn.dataset.palette).toBe("dark"));
    await expect(pixel(drawn, 10, 30)).toBe(createTheme().palettes.dark.bg);
    await userEvent.click(canvas.getByRole("button", { name: "More contrast" }));
    await waitFor(() => expect(drawn.dataset.palette).toBe("dark-contrast"));

    // A plugin theme arrives as JSON, is checked, and appears in the picker; a bad one is refused with a reason.
    await userEvent.click(canvas.getByRole("button", { name: "Install Grey" }));
    await expect(canvas.getByTestId("error").textContent).toMatch(/ink reads .* needs 4\.5:1/);
    await expect(canvas.queryByRole("button", { name: "Grey" })).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Install Paper" }));
    await expect(canvas.getByTestId("error").textContent).toBe("");
    await userEvent.click(await canvas.findByRole("button", { name: "Paper" }));
    // Paper is light-only: the page is in dark mode and the theme stays light.
    await waitFor(() => expect(drawn.dataset.palette).toBe("light-contrast"));
    await expect(pixel(drawn, 10, 10)).toBe("#2563eb");
    await expect(getComputedStyle(swatch).colorScheme).toBe("light");
  },
};

/* Rendered in its own React root (ShadowHost), so no CynosureTheme (not even Storybook's) sits above the hook. */
export const ThemeHookWithoutAWrapper: Story = {
  tags: ["!dev"],
  args: { children: null },
  render: () => <ShadowHost content={<ChartSwatch />} />,
  play: async ({ canvas }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot && chart(host.shadowRoot)).toBeTruthy());
    const drawn = chart(host.shadowRoot as ShadowRoot);
    const { light, dark } = createTheme().palettes;
    await waitFor(() => expect(pixel(drawn, 10, 30)).toBe(light.bg));
    await expect(host.shadowRoot?.querySelector('[data-testid="font"]')?.textContent).toBe("13");
    if (!(await emulateMedia({ colorScheme: "dark" }))) return;
    try {
      // With no CynosureTheme above, the hook follows the OS: the canvas redraws when it turns dark.
      await waitFor(() => expect(pixel(drawn, 10, 30)).toBe(dark.bg));
      await expect(drawn.dataset.palette).toBe("dark");
    } finally {
      await emulateMedia({ colorScheme: null });
    }
  },
};

/* Its own React root again: an outermost CynosureTheme without a theme reports Cynosure's theme in its mode. */
export const OutermostWrapperWithoutATheme: Story = {
  args: { children: null },
  render: () => (
    <ShadowHost
      content={
        <CynosureTheme mode="dark">
          <ChartSwatch />
        </CynosureTheme>
      }
    />
  ),
  play: async ({ canvas }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot && chart(host.shadowRoot)).toBeTruthy());
    const drawn = chart(host.shadowRoot as ShadowRoot);
    await waitFor(() => expect(pixel(drawn, 10, 30)).toBe(createTheme().palettes.dark.bg));
    await expect(drawn.dataset.palette).toBe("dark");
  },
};

export const ThemeHookFollowsSystemModeAndScale: Story = {
  tags: ["!dev"],
  args: {
    theme: createTheme({ scale: "spacious" }),
    mode: "system",
    children: (
      <CynosureTheme>
        <ChartSwatch />
      </CynosureTheme>
    ),
  },
  play: async ({ canvas, canvasElement }) => {
    const drawn = chart(canvasElement);
    await waitFor(() => expect(drawn.dataset.palette).toBe("light"));
    await expect(canvas.getByTestId("font").textContent).toBe("15.6");
    if (!(await emulateMedia({ colorScheme: "dark", contrast: "more" }))) return;
    try {
      await waitFor(() => expect(drawn.dataset.palette).toBe("dark-contrast"));
    } finally {
      await emulateMedia({ colorScheme: null, contrast: null });
    }
  },
};

export const NamedThemeUnderHostileHost: Story = {
  args: { children: null },
  render: () => <ThemePicker />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Midnight" }));
    const drawn = chart(canvasElement);
    await waitFor(() => expect(pixel(drawn, 10, 30)).toBe("#05070d"));
    const { clean, hostile } = computeUnderHostileHost(canvasElement, '[data-testid="picked"]', [
      "background-color",
      "color-scheme",
    ]);
    await expect(hostile).toEqual(clean);
    await expect(clean["color-scheme"]).toBe("dark");
    await expect(pixel(drawn, 10, 10)).toBe("#7a5cff");
  },
};

export const ThemeHookInsideShadowRoot: Story = {
  args: { children: null },
  render: () => (
    <ShadowHost
      content={
        <CynosureTheme theme={midnight.theme} mode="light">
          <ChartSwatch />
        </CynosureTheme>
      }
    />
  ),
  play: async ({ canvas }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot && chart(host.shadowRoot)).toBeTruthy());
    const drawn = chart(host.shadowRoot as ShadowRoot);
    await waitFor(() => expect(pixel(drawn, 10, 30)).toBe("#05070d"));
    await expect(drawn.dataset.palette).toBe("dark");
    await expect(pixel(drawn, 30, 10)).toBe(midnight.theme.palettes.dark.seriesColors[1]);
  },
};

function MidnightOnDocument() {
  return (
    <CynosureTheme theme={midnight.theme} mode="light" target="document">
      <ChartSwatch />
    </CynosureTheme>
  );
}

export const FixedModeThemeOnTheDocument: Story = {
  args: { children: null },
  render: () => <MidnightOnDocument />,
  play: async ({ canvasElement }) => {
    const html = document.documentElement;
    await waitFor(() => expect(html.getAttribute("data-cy-mode")).toBe("dark"));
    await expect(chart(canvasElement).dataset.palette).toBe("dark");
  },
};
