import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, waitFor } from "storybook/test";
import { createStyleSheet } from "../../styles/inline.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { SkipLink } from "./SkipLink.js";

const meta = {
  title: "Components/SkipLink",
  component: SkipLink,
  args: { href: "#main" },
  argTypes: {
    href: { control: "text" },
    labels: { control: "object" },
    id: { control: "text" },
    contained: { control: "boolean" },
  },
  render: (args) => (
    <div>
      <SkipLink {...args} />
      <Button>Site menu</Button>
      <main id="main" data-testid="main">
        <h1 style={{ margin: 0 }}>Article</h1>
        <Button>First action</Button>
      </main>
    </div>
  ),
} satisfies Meta<typeof SkipLink>;
export default meta;
type Story = StoryObj<typeof meta>;

const box = (el: Element) => el.getBoundingClientRect();
const shown = (el: Element) => box(el).width > 20 && box(el).height > 20;

export const RevealsOnTabAndMovesFocus: Story = {
  play: async ({ canvas, userEvent }) => {
    const skip = canvas.getByRole("link", { name: "Skip to content" });
    // In the accessibility tree from the start, but out of sight.
    await expect(skip).toHaveAttribute("href", "#main");
    await expect(shown(skip)).toBe(false);
    // The first Tab reaches it and shows it, fixed at the window's top-start corner.
    await userEvent.tab();
    await expect(skip).toHaveFocus();
    await expect(shown(skip)).toBe(true);
    await expect(getComputedStyle(skip).position).toBe("fixed");
    await expect(box(skip).top).toBeGreaterThan(0);
    await expect(box(skip).top).toBeLessThan(40);
    await expect(box(skip).left).toBeGreaterThan(0);
    await expect(box(skip).left).toBeLessThan(40);
    // Enter moves focus to the target, which becomes focusable from script only; the URL is left alone.
    const hash = location.hash;
    await userEvent.keyboard("{Enter}");
    const main = canvas.getByTestId("main");
    await expect(main).toHaveFocus();
    await expect(main).toHaveAttribute("tabindex", "-1");
    await expect(location.hash).toBe(hash);
    await expect(shown(skip)).toBe(false);
    // The next Tab continues from the target, past the menu it skipped.
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "First action" })).toHaveFocus();
  },
};

export const ClickMovesFocusToo: Story = {
  play: async ({ canvas, userEvent }) => {
    const skip = canvas.getByRole("link", { name: "Skip to content" });
    skip.focus();
    await userEvent.click(skip);
    await expect(canvas.getByTestId("main")).toHaveFocus();
  },
};

export const HidesAgainWhenFocusLeaves: Story = {
  play: async ({ canvas, userEvent }) => {
    const skip = canvas.getByRole("link", { name: "Skip to content" });
    await userEvent.tab();
    await expect(shown(skip)).toBe(true);
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Site menu" })).toHaveFocus();
    await expect(shown(skip)).toBe(false);
  },
};

export const FocusableTargetKeepsItsTabOrder: Story = {
  args: { href: "#start" },
  render: (args) => (
    <div>
      <SkipLink {...args} />
      <Button>Site menu</Button>
      <Button id="start">Start here</Button>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    const target = canvas.getByRole("button", { name: "Start here" });
    await expect(target).toHaveFocus();
    // Already focusable: no tabindex is added.
    await expect(target).not.toHaveAttribute("tabindex");
  },
};

export const WorksWithoutJavaScript: Story = {
  args: { href: "#nowhere" },
  play: async ({ canvas, canvasElement, userEvent }) => {
    // The server markup is a plain in-page link, which the browser follows before any script runs.
    const html = renderToString(<SkipLink href="#content" />);
    // (The text sits in the Button's content spans; no script is needed to show or follow it.)
    await expect(html).toMatch(
      /^<a [^>]*href="#content"[^>]*>(<span [^>]*>)*Skip to content(<\/span>)*<\/a>$/,
    );
    // With no target to focus, the click is left to the browser (here stopped so the story's page stays put).
    let followed = false;
    const listen = (event: Event) => {
      followed = !event.defaultPrevented;
      event.preventDefault();
    };
    canvasElement.addEventListener("click", listen);
    await userEvent.click(canvas.getByRole("link", { name: "Skip to content" }));
    canvasElement.removeEventListener("click", listen);
    await expect(followed).toBe(true);
  },
};

export const CustomTargetAndLabels: Story = {
  args: { href: "#inhalt", labels: { skip: "Zum Inhalt springen" } },
  render: (args) => (
    <div>
      <SkipLink {...args} />
      <article id="inhalt" data-testid="target">
        Text
      </article>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const skip = canvas.getByRole("link", { name: "Zum Inhalt springen" });
    await expect(skip).toHaveAttribute("href", "#inhalt");
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByTestId("target")).toHaveFocus();
  },
};

export const RightToLeft: Story = {
  render: (args) => (
    <div dir="rtl">
      <SkipLink {...args} />
      <main id="main">Text</main>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    const skip = canvas.getByRole("link", { name: "Skip to content" });
    await expect(skip).toHaveFocus();
    // Top-start is the top-right corner in right-to-left text.
    const right = document.documentElement.clientWidth - box(skip).right;
    await expect(right).toBeGreaterThan(0);
    await expect(right).toBeLessThan(40);
  },
};

function ShadowPage() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    const root = el.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [createStyleSheet()];
    const mount = document.createElement("div");
    root.append(mount);
    createRoot(mount).render(
      <div>
        <SkipLink href="#shadow-main" />
        <main id="shadow-main">Inside</main>
      </div>,
    );
  }, []);
  return <div data-testid="host" ref={host} />;
}

export const InsideShadowRoot: Story = {
  render: () => <ShadowPage />,
  play: async ({ canvas }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot?.querySelector("a")).toBeTruthy());
    const root = host.shadowRoot as ShadowRoot;
    const skip = root.querySelector("a") as HTMLAnchorElement;
    skip.focus();
    await expect(shown(skip)).toBe(true);
    // A hash link cannot reach into a shadow root; the link finds its target there and focuses it.
    skip.click();
    await expect(root.activeElement).toBe(root.getElementById("shadow-main"));
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvas, canvasElement }) => {
    canvas.getByRole("link", { name: "Skip to content" }).focus();
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-skip-link", [
      "position",
      "box-sizing",
      "height",
      "width",
      "padding-top",
      "font-size",
      "font-weight",
      "line-height",
      "letter-spacing",
      "text-transform",
      "color",
    ]);
    await expect(hostile).toEqual(clean);
  },
};

export const TouchHitArea: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas }) => {
    await expect(matchMedia("(pointer: coarse)").matches).toBe(true);
    const skip = canvas.getByRole("link", { name: "Skip to content" });
    skip.focus();
    await expect(box(skip).height).toBeGreaterThanOrEqual(44);
  },
};

export const ContainedInAFrame: Story = {
  args: { contained: true },
  render: (args) => (
    <div data-testid="frame" style={{ position: "relative", marginBlockStart: 120, marginInlineStart: 160 }}>
      <SkipLink {...args} />
      <main id="main">Text</main>
    </div>
  ),
  play: async ({ canvas }) => {
    const skip = canvas.getByRole("link", { name: "Skip to content" });
    skip.focus();
    await expect(shown(skip)).toBe(true);
    // At the frame's top-start corner, not the window's.
    await expect(getComputedStyle(skip).position).toBe("absolute");
    const frame = box(canvas.getByTestId("frame"));
    await expect(box(skip).top - frame.top).toBeLessThan(40);
    await expect(box(skip).top).toBeGreaterThan(100);
    await expect(box(skip).left - frame.left).toBeLessThan(40);
    await expect(box(skip).left).toBeGreaterThan(140);
  },
};
