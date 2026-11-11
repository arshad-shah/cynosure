import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { Card } from "./Card.js";

/** Any CSS colour as painted sRGB plus alpha, so "oklab(… / 0.5)" mid-transition never equals the settled colour. */
function rgba(value: string): number[] {
  const ctx = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  return [...ctx.getImageData(0, 0, 1, 1).data];
}

const TONES = ["neutral", "accent", "danger", "success", "warning", "info"] as const;

const meta = {
  title: "Components/Card",
  component: Card,
  args: { variant: "surface", padding: "md", tone: "neutral", children: "Workspace settings" },
  argTypes: {
    variant: { control: "inline-radio", options: ["surface", "outline", "soft"] },
    padding: { control: "inline-radio", options: ["none", "sm", "md", "lg"] },
    tone: { control: "select", options: TONES },
    as: { control: "select", options: ["div", "section", "article", "li"] },
    children: { control: "text" },
  },
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

const style = (el: Element) => getComputedStyle(el);

export const VariantsAndTones: Story = {
  tags: ["visual"],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 160px)", gap: 12 }}>
      {TONES.flatMap((tone) =>
        (["surface", "outline", "soft"] as const).map((variant) => (
          <Card key={`${tone}-${variant}`} tone={tone} variant={variant} data-testid={`${tone}-${variant}`}>
            {tone} {variant}
          </Card>
        )),
      )}
    </div>
  ),
  play: async ({ canvas }) => {
    const surface = style(canvas.getByTestId("neutral-surface"));
    const outline = style(canvas.getByTestId("neutral-outline"));
    const soft = style(canvas.getByTestId("accent-soft"));
    await expect(surface.borderTopStyle).toBe("solid");
    await expect(outline.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    await expect(soft.backgroundColor).not.toBe(surface.backgroundColor);
    await expect(style(canvas.getByTestId("danger-outline")).borderTopColor).not.toBe(outline.borderTopColor);
  },
};

export const PaddingUsesSpaceTokens: Story = {
  render: () => (
    <>
      <Card padding="none" data-testid="none">
        none
      </Card>
      <Card padding="sm" data-testid="sm">
        sm
      </Card>
      <Card padding="lg" data-testid="lg">
        lg
      </Card>
    </>
  ),
  play: async ({ canvas }) => {
    await expect(style(canvas.getByTestId("none")).paddingTop).toBe("0px");
    await expect(style(canvas.getByTestId("sm")).paddingTop).toBe("8px");
    await expect(style(canvas.getByTestId("lg")).paddingTop).toBe("24px");
  },
};

export const RendersTheRequestedElement: Story = {
  args: { as: "article" },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("article.cy-card")).toBeTruthy();
  },
};

const followed = fn();

export const WholeCardLinkActivatesByClickAndEnter: Story = {
  args: {
    href: "#settings",
    children: "Open settings",
    // Record the activation and stay on the page: navigating would unload the test runner.
    onClick: (event) => {
      event.preventDefault();
      followed((event.currentTarget as HTMLAnchorElement).getAttribute("href"));
    },
  },
  play: async ({ canvas, userEvent }) => {
    followed.mockClear();
    const link = canvas.getByRole("link", { name: "Open settings" });
    await expect(link).toHaveClass("cy-card");
    await expect(link).toHaveAttribute("data-interactive");
    await expect(link.querySelector("a, button")).toBeNull();
    await userEvent.click(link);
    link.focus();
    await userEvent.keyboard("{Enter}");
    await expect(followed).toHaveBeenCalledTimes(2);
    await expect(followed).toHaveBeenCalledWith("#settings");
  },
};

export const UnsafeLinkIsNotLinked: Story = {
  args: { href: "javascript:alert(1)", children: "Bad" },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".cy-card")?.hasAttribute("href")).toBe(false);
  },
};

export const WholeCardButtonActivatesByClickEnterAndSpace: Story = {
  args: { onClick: fn(), children: "Choose plan" },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Choose plan" });
    await expect(button).toHaveAttribute("type", "button");
    await userEvent.click(button);
    button.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await expect(args.onClick).toHaveBeenCalledTimes(3);
    await expect(style(button).textAlign).toBe("start");
    await expect(style(button).inlineSize ?? style(button).width).not.toBe("auto");
  },
};

export const DisabledButtonCardDoesNothing: Story = {
  args: { onClick: fn(), disabled: true, children: "Unavailable" },
  play: async ({ args, canvas, userEvent }) => {
    canvas.getByRole("button").click();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const ActionsBesideTheTarget: Story = {
  render: () => (
    <Card onClick={fn()} actions={<Button size="sm">2 players</Button>} style={{ inlineSize: 280 }}>
      <strong>Snake</strong>
      <p>Eat, grow, don't bite yourself.</p>
    </Card>
  ),
  play: async ({ canvas, userEvent }) => {
    const card = canvas.getByRole("button", { name: /^Snake/ });
    const two = canvas.getByRole("button", { name: "2 players" });
    // Two separate controls: the action is not inside the card's button.
    await expect(card.contains(two)).toBe(false);
    await userEvent.tab();
    await expect(card).toHaveFocus();
    await userEvent.tab();
    await expect(two).toHaveFocus();
    // It sits over the card's top end.
    const c = card.getBoundingClientRect();
    const t = two.getBoundingClientRect();
    await expect(t.top).toBeGreaterThanOrEqual(c.top);
    await expect(t.right).toBeLessThanOrEqual(c.right);
    await expect(t.right).toBeGreaterThan(c.right - 80);
  },
};

export const StableUnderHostileHost: Story = {
  args: { href: "#x", children: "Hostile" },
  play: async ({ canvasElement }) => {
    const props = [
      "padding-top",
      "border-top-width",
      "border-radius",
      "font-size",
      "line-height",
      "display",
      "text-decoration-line",
      "color",
    ];
    const card = computeUnderHostileHost(canvasElement, ".cy-card", props);
    await expect(card.hostile).toEqual(card.clean);
  },
};

export const KeyboardFocusShowsAnAccentBorder: Story = {
  args: { onClick: fn(), children: "Focusable" },
  play: async ({ canvas, userEvent }) => {
    const card = canvas.getByRole("button");
    const accent = document.createElement("i");
    accent.style.color = "var(--cy-color-accent)";
    card.after(accent);
    await userEvent.tab();
    await expect(card).toHaveFocus();
    // The border colour transitions; wait for it to settle (WebKit on a busy CI runner can take over a second).
    // Compared as painted sRGB, since engines serialise the same colour differently (oklab vs rgb).
    await waitFor(() => expect(rgba(style(card).borderTopColor)).toEqual(rgba(style(accent).color)), {
      timeout: 3000,
    });
    accent.remove();
  },
};

export const StaticCardKeepsLayoutClassAndStyle: Story = {
  args: { className: "host-tile", style: { maxWidth: 240 }, "data-testid": "tile" },
  play: async ({ canvas }) => {
    const tile = canvas.getByTestId("tile");
    await expect(tile).toHaveClass("cy-card", "host-tile");
    await expect(getComputedStyle(tile).maxWidth).toBe("240px");
    await expect(tile.tagName).toBe("DIV");
  },
};
