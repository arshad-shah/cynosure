import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Badge } from "../Badge/Badge.js";
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
    edge: { control: "text" },
    title: { control: "text" },
    description: { control: "text" },
    headingLevel: { control: "inline-radio", options: [1, 2, 3, 4, 5, 6] },
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
const clicked = fn();

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

export const TitleAndDescriptionHeadTheCard: Story = {
  tags: ["visual"],
  render: () => (
    <div style={{ display: "grid", gap: 12, inlineSize: 320 }}>
      <Card as="section" title="Connection" description="Where the client connects." data-testid="static">
        Host, port and database.
      </Card>
      <Card title="Editor" headingLevel={2} data-testid="level">
        Font and tab size.
      </Card>
      <Card href="#saved" title="Saved queries" description="12 queries" data-testid="link">
        Opened yesterday.
      </Card>
      <Card onClick={fn()} title="Import" description="From CSV or JSON" data-testid="button">
        Up to 50 MB.
      </Card>
      <Card description="A description alone" data-testid="description">
        Body
      </Card>
    </div>
  ),
  play: async ({ canvas }) => {
    const part = (id: string, selector: string) =>
      canvas.getByTestId(id).querySelector(selector) as HTMLElement;
    // A heading, level 3 by default or as asked, with the description under it and the body under both.
    await expect(canvas.getByRole("heading", { level: 3, name: "Connection" })).toBe(
      part("static", ".cy-card-title"),
    );
    await expect(canvas.getByRole("heading", { level: 2, name: "Editor" })).toBeVisible();
    const title = part("static", ".cy-card-title").getBoundingClientRect();
    const description = part("static", ".cy-card-description").getBoundingClientRect();
    const body = part("static", ".cy-card-body").getBoundingClientRect();
    await expect(description.top).toBeGreaterThanOrEqual(title.bottom);
    await expect(body.top).toBeGreaterThan(description.bottom);
    await expect(part("static", ".cy-card-body")).toHaveTextContent("Host, port and database.");
    // A section card is a region named by its title.
    await expect(canvas.getByRole("region", { name: "Connection" })).toBe(canvas.getByTestId("static"));
    // The description reads quieter than the title.
    const size = (el: Element) => Number.parseFloat(getComputedStyle(el).fontSize);
    await expect(size(part("static", ".cy-card-description"))).toBeLessThan(
      size(part("static", ".cy-card-title")),
    );
    await expect(style(part("static", ".cy-card-description")).color).not.toBe(
      style(part("static", ".cy-card-title")).color,
    );
    // A link card keeps its heading inside the one link, which the title names.
    const link = canvas.getByRole("link", { name: /^Saved queries/ });
    await expect(within(link).getByRole("heading", { level: 3, name: "Saved queries" })).toBeVisible();
    // A button may only hold phrasing content: the title is text, not a heading, and still names the button.
    const button = canvas.getByRole("button", { name: /^Import/ });
    await expect(within(button).queryByRole("heading")).toBeNull();
    await expect(button).toHaveTextContent("ImportFrom CSV or JSONUp to 50 MB.");
    await expect(button.querySelector("div, p, h1, h2, h3, h4, h5, h6")).toBeNull();
    // Without a title there is no heading, but the description still heads the body.
    await expect(within(canvas.getByTestId("description")).queryByRole("heading")).toBeNull();
    await expect(part("description", ".cy-card-description")).toHaveTextContent("A description alone");
    // Host CSS cannot restyle the header.
    for (const selector of [".cy-card-title", ".cy-card-description", ".cy-card-header"]) {
      const { clean, hostile } = computeUnderHostileHost(canvas.getByTestId("static"), selector, [
        "font-size",
        "font-weight",
        "line-height",
        "color",
        "margin-top",
        "margin-bottom",
        "text-transform",
      ]);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};

export const HeaderSharesItsRowWithTheActions: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, inlineSize: 300 }}>
      <Card
        title="A static card with a title long enough to wrap"
        actions={<Button size="sm">Edit</Button>}
        data-testid="static"
      >
        Body
      </Card>
      <Card
        onClick={fn()}
        title="A pressable card with a title long enough to wrap"
        description="And a description"
        actions={<Button size="sm">Snooze</Button>}
        style={{ inlineSize: 300 }}
      >
        Body
      </Card>
      <div dir="rtl" data-testid="rtl">
        <Card
          title="عنوان البطاقة الطويل بما يكفي ليلتف على سطرين"
          actions={<Button size="sm">تعديل</Button>}
        >
          نص
        </Card>
      </div>
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const box = (el: Element) => el.getBoundingClientRect();
    const titles = [...canvasElement.querySelectorAll(".cy-card-title")];
    const [staticTitle, pressTitle, rtlTitle] = titles as [Element, Element, Element];
    const edit = canvas.getByRole("button", { name: "Edit" });
    const snooze = canvas.getByRole("button", { name: "Snooze" });
    const rtlEdit = canvas.getByRole("button", { name: "تعديل" });
    // The title wraps before the actions instead of running under them, and they share its first line.
    for (const [title, action] of [
      [staticTitle, edit],
      [pressTitle, snooze],
    ] as const) {
      await expect(box(title).right).toBeLessThanOrEqual(box(action).left);
      await expect(box(title).height).toBeGreaterThan(box(action).height / 2 + 10);
      await expect(box(action).top).toBeLessThan(box(title).top + box(title).height / 2);
    }
    await expect(box(rtlTitle).left).toBeGreaterThanOrEqual(box(rtlEdit).right);
    // The body still spans the whole card, under the header.
    const body = canvas.getByTestId("static").querySelector(".cy-card-body") as Element;
    await expect(box(body).top).toBeGreaterThanOrEqual(box(edit).bottom);
    await expect(box(body).right).toBeGreaterThan(box(edit).left);
    // The pressable card stays one button, and its action a separate one after it in the tab order.
    const card = canvas.getByRole("button", { name: /^A pressable card/ });
    await expect(card.contains(snooze)).toBe(false);
    card.focus();
    await userEvent.tab();
    await expect(snooze).toHaveFocus();
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

/** A CSS value (`var(--cy-color-danger)`, a length token) as the browser resolves it next to `near`. */
function resolved(near: Element, property: "color" | "width", value: string) {
  const probe = document.createElement("i");
  probe.style.setProperty(property, value);
  probe.style.display = "block";
  near.after(probe);
  const result = getComputedStyle(probe).getPropertyValue(property);
  probe.remove();
  return result;
}
const EDGE_WIDTH = "var(--cy-card-edge-width, var(--cy-space-2))";
const VIOLET = "rgb(124, 58, 237)";

export const EdgeShowsAToneOrAnyColour: Story = {
  tags: ["visual"],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 200px)", gap: 12 }}>
      {TONES.map((tone) => (
        <Card key={tone} edge={tone} data-testid={tone}>
          {tone} <Badge tone={tone}>Category</Badge>
        </Card>
      ))}
      <Card edge={VIOLET} data-testid="custom">
        Garden <Badge color={VIOLET}>Category</Badge>
      </Card>
      <Card data-testid="none">No edge</Card>
    </div>
  ),
  play: async ({ canvas }) => {
    const none = canvas.getByTestId("none");
    const plain = style(none);
    const width = resolved(none, "width", EDGE_WIDTH);
    // The default thickness is a space token and is wider than the card's ordinary border.
    await expect(width).toBe(resolved(none, "width", "var(--cy-space-2)"));
    await expect(Number.parseFloat(width)).toBeGreaterThan(Number.parseFloat(plain.borderLeftWidth));
    const tokenOf = (tone: string) =>
      tone === "neutral" ? "var(--cy-color-ink)" : `var(--cy-color-${tone})`;
    for (const tone of TONES) {
      const card = style(canvas.getByTestId(tone));
      await expect({ tone, colour: rgba(card.borderLeftColor), width: card.borderLeftWidth }).toEqual({
        tone,
        colour: rgba(resolved(none, "color", tokenOf(tone))),
        width,
      });
    }
    const custom = style(canvas.getByTestId("custom"));
    await expect(rgba(custom.borderLeftColor)).toEqual(rgba(VIOLET));
    await expect(custom.borderLeftWidth).toBe(width);
    // Only the start side changes: the other three sides and every corner are those of a card without an edge.
    for (const side of ["Top", "Right", "Bottom"] as const) {
      await expect(custom[`border${side}Width`]).toBe(plain[`border${side}Width`]);
      await expect(custom[`border${side}Color`]).toBe(plain[`border${side}Color`]);
    }
    await expect(custom.borderRadius).toBe(plain.borderRadius);
    await expect(Number.parseFloat(custom.borderTopLeftRadius)).toBeGreaterThan(0);
    await expect(none).not.toHaveAttribute("data-edge");
    await expect(plain.borderLeftWidth).toBe(plain.borderTopWidth);
  },
};

export const EdgeFollowsReadingDirectionAndItsWidthToken: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, inlineSize: 240 }}>
      <Card edge="success" data-testid="ltr">
        Left to right
      </Card>
      <div dir="rtl">
        <Card edge="success" data-testid="rtl">
          Right to left
        </Card>
      </div>
      <div style={{ "--cy-card-edge-width": "7px" } as CSSProperties}>
        <Card edge="success" data-testid="wide">
          Wider edge
        </Card>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const ltr = style(canvas.getByTestId("ltr"));
    const rtl = style(canvas.getByTestId("rtl"));
    const green = rgba(resolved(canvas.getByTestId("ltr"), "color", "var(--cy-color-success)"));
    await expect(ltr.borderLeftWidth).not.toBe(ltr.borderRightWidth);
    await expect(rgba(ltr.borderLeftColor)).toEqual(green);
    // Mirrored: the edge is on the right, the left side is an ordinary border, and the corners keep their radius.
    await expect(rtl.borderRightWidth).toBe(ltr.borderLeftWidth);
    await expect(rgba(rtl.borderRightColor)).toEqual(green);
    await expect(rtl.borderLeftWidth).toBe(ltr.borderRightWidth);
    await expect(rgba(rtl.borderLeftColor)).toEqual(rgba(ltr.borderRightColor));
    await expect(rtl.borderRadius).toBe(ltr.borderRadius);
    await expect(style(canvas.getByTestId("wide")).borderLeftWidth).toBe("7px");
  },
};

export const EdgeWorksWithEveryVariantAndTone: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 160px)", gap: 12 }}>
      {(["surface", "outline", "soft"] as const).map((variant) => (
        <Card key={variant} variant={variant} tone="info" edge="danger" data-testid={variant}>
          {variant}
        </Card>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const red = rgba(resolved(canvas.getByTestId("surface"), "color", "var(--cy-color-danger)"));
    for (const variant of ["surface", "outline", "soft"]) {
      const card = style(canvas.getByTestId(variant));
      // The edge is its own colour, not the card's tone, which still colours the other sides.
      await expect({ variant, edge: rgba(card.borderLeftColor) }).toEqual({ variant, edge: red });
      await expect(rgba(card.borderTopColor)).not.toEqual(red);
      await expect(card.borderLeftWidth).toBe(resolved(canvas.getByTestId(variant), "width", EDGE_WIDTH));
    }
  },
};

export const InteractiveCardKeepsItsEdgeAndStaysOneTarget: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, inlineSize: 280 }}>
      <Card href="#task" edge="warning" onClick={(event) => event.preventDefault()}>
        Renew passport
      </Card>
      <Card onClick={clicked} edge={VIOLET} actions={<Button size="sm">Snooze</Button>}>
        Water the garden
      </Card>
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    clicked.mockClear();
    const link = canvas.getByRole("link", { name: "Renew passport" });
    const button = canvas.getByRole("button", { name: "Water the garden" });
    // Still exactly one link, one card button and the separate action: the edge adds no element.
    await expect(canvas.getAllByRole("link")).toHaveLength(1);
    await expect(canvas.getAllByRole("button")).toHaveLength(2);
    await expect(link.querySelector("a, button")).toBeNull();
    await expect(button.contains(canvas.getByRole("button", { name: "Snooze" }))).toBe(false);
    await expect(canvasElement.querySelector(".cy-card-frame")?.hasAttribute("data-edge")).toBe(false);
    const amber = rgba(resolved(link, "color", "var(--cy-color-warning)"));
    const accent = rgba(resolved(link, "color", "var(--cy-color-accent)"));
    await expect(rgba(style(link).borderLeftColor)).toEqual(amber);
    await expect(rgba(style(button).borderLeftColor)).toEqual(rgba(VIOLET));
    // Keyboard focus recolours the other three sides; the edge keeps its colour.
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await waitFor(() => expect(rgba(style(link).borderTopColor)).toEqual(accent), { timeout: 3000 });
    await expect(rgba(style(link).borderLeftColor)).toEqual(amber);
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await waitFor(() => expect(rgba(style(button).borderTopColor)).toEqual(accent), { timeout: 3000 });
    await expect(rgba(style(button).borderLeftColor)).toEqual(rgba(VIOLET));
    await userEvent.keyboard("{Enter}");
    await userEvent.click(button);
    await expect(clicked).toHaveBeenCalledTimes(2);
  },
};

export const EdgeIsStableUnderHostileHostAndKeptInForcedColours: Story = {
  args: { edge: "danger", children: "Hostile edge", style: { maxWidth: 240 } },
  play: async ({ canvasElement }) => {
    const props = ["border-left-width", "border-left-color", "border-top-width", "border-top-left-radius"];
    const card = computeUnderHostileHost(canvasElement, ".cy-card", props);
    await expect(card.clean["border-left-width"]).toBe(
      resolved(canvasElement.querySelector(".cy-card") as Element, "width", EDGE_WIDTH),
    );
    await expect(card.hostile).toEqual(card.clean);
    // Forced colours: the edge is declared in the system text colour, at the same thickness.
    const el = canvasElement.querySelector(".cy-card") as Element;
    const forced: string[] = [];
    const walk = (rules: CSSRuleList, inside: boolean) => {
      for (const rule of rules) {
        if (rule instanceof CSSMediaRule)
          walk(rule.cssRules, inside || rule.conditionText.includes("forced-colors"));
        else if (rule instanceof CSSStyleRule) {
          if (inside && el.matches(rule.selectorText))
            forced.push(rule.style.borderInlineStartColor.toLowerCase());
          walk(rule.cssRules, inside);
        }
      }
    };
    for (const sheet of document.styleSheets) walk(sheet.cssRules, false);
    await expect(forced.filter(Boolean)).toEqual(["canvastext"]);
  },
};

export const CustomEdgeKeepsLayoutStyle: Story = {
  args: { edge: "teal", style: { maxWidth: 200 }, "data-testid": "tile" },
  play: async ({ canvas }) => {
    const tile = canvas.getByTestId("tile");
    await expect(style(tile).maxWidth).toBe("200px");
    await expect(rgba(style(tile).borderLeftColor)).toEqual(rgba("teal"));
  },
};

export const CurrentCardOfASet: Story = {
  render: () => (
    <nav aria-label="Sections" style={{ display: "flex", gap: 8 }}>
      <Card href="#prayer" aria-current="page">
        Prayer times
      </Card>
      <Card href="#qibla">Qibla</Card>
      <Card onClick={fn()} aria-current="step">
        Step card
      </Card>
    </nav>
  ),
  play: async ({ canvas }) => {
    const current = canvas.getByRole("link", { name: "Prayer times" });
    const other = canvas.getByRole("link", { name: "Qibla" });
    // Screen readers hear which card is the page being shown; the eye sees the accent border.
    await expect(current).toHaveAttribute("aria-current", "page");
    await expect(other).not.toHaveAttribute("aria-current");
    await expect(canvas.getByRole("button", { name: "Step card" })).toHaveAttribute("aria-current", "step");
    await expect(getComputedStyle(current).borderTopColor).not.toBe(getComputedStyle(other).borderTopColor);
    const probe = document.createElement("span");
    probe.style.color = "var(--cy-color-accent)";
    current.append(probe);
    await expect(getComputedStyle(current).borderTopColor).toBe(getComputedStyle(probe).color);
    probe.remove();
  },
};
