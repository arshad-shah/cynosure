import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, waitFor } from "storybook/test";
import { createStyleSheet } from "../styles/inline.js";
import { createTheme } from "../tokens/index.js";
import { CynosureTheme } from "./CynosureTheme.js";

const meta = { title: "Foundations/CynosureTheme", component: CynosureTheme } satisfies Meta<
  typeof CynosureTheme
>;
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

export const SystemMode: Story = {
  args: { mode: "system", children: <Swatch id="system" /> },
  play: async ({ canvas }) => {
    await expect(getComputedStyle(await canvas.findByTestId("system")).colorScheme).toBe("light dark");
  },
};

export const ContrastMore: Story = {
  args: { theme: createTheme(), mode: "light", contrast: "more", children: <Swatch id="contrast" /> },
  play: async ({ canvas }) => {
    const swatch = await canvas.findByTestId("contrast");
    swatch.style.color = "var(--cy-color-ink)";
    await expect(getComputedStyle(swatch).color).toBe("rgb(0, 0, 0)");
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

function ShadowHost() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    const root = el.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [createStyleSheet()];
    const mount = document.createElement("div");
    root.append(mount);
    createRoot(mount).render(<Swatch id="shadow" />);
  }, []);
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
