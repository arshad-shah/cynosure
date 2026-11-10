import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import { HoverCard, type HoverCardProps } from "./HoverCard.js";

const page = (name: string, scale = 1) => (
  <div
    style={{
      inlineSize: 60 * scale,
      blockSize: 80 * scale,
      display: "grid",
      placeItems: "center",
      background: "var(--cy-color-soft)",
      color: "var(--cy-color-ink)",
    }}
  >
    {name}
  </div>
);

/** A page rail as the tools app wires it: the card shows the hovered or focused page, larger. */
function Rail({
  align = "start",
  placement,
}: {
  align?: "start" | "end";
  placement?: HoverCardProps["placement"];
}) {
  const [shown, setShown] = useState<number | null>(null);
  const refs = [useRef<HTMLButtonElement>(null), useRef<HTMLButtonElement>(null)];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: align }}>
      {[0, 1].map((i) => (
        <Button
          key={i}
          ref={refs[i]}
          variant="ghost"
          onPointerEnter={() => setShown(i)}
          onPointerLeave={() => setShown(null)}
          onFocus={() => setShown(i)}
          onBlur={() => setShown(null)}
        >
          Page {i + 1}
        </Button>
      ))}
      <HoverCard
        open={shown !== null}
        anchor={refs[shown ?? 0] as React.RefObject<HTMLButtonElement>}
        {...(placement ? { placement } : {})}
      >
        {page(`Page ${(shown ?? 0) + 1}`, 3)}
      </HoverCard>
    </div>
  );
}

const meta = {
  title: "Components/HoverCard",
  component: HoverCard,
  args: { open: false, anchor: null },
  render: () => <Rail />,
} satisfies Meta<typeof HoverCard>;
export default meta;
type Story = StoryObj<typeof meta>;

const card = (el: Element) => el.querySelector(".cy-hover-card") as HTMLElement;

export const PreviewsTheHoveredItem: Story = {
  tags: ["visual"],
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(card(canvasElement)).not.toBeVisible();
    const two = canvas.getByRole("button", { name: "Page 2" });
    await userEvent.hover(two);
    await waitFor(() => expect(card(canvasElement)).toBeVisible());
    await shownFully(card(canvasElement));
    await expect(card(canvasElement)).toHaveTextContent("Page 2");
    // Beside its anchor, on the end side.
    await expect(card(canvasElement).getBoundingClientRect().left).toBeGreaterThan(
      two.getBoundingClientRect().right,
    );
    await userEvent.unhover(two);
    await waitFor(() => expect(card(canvasElement)).not.toBeVisible());
  },
};

export const PassiveToPointerAndAssistiveTech: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    canvas.getByRole("button", { name: "Page 1" }).focus();
    await waitFor(() => expect(card(canvasElement)).toBeVisible());
    // Hidden from the accessibility tree, never focusable, and the pointer goes through it.
    await expect(card(canvasElement)).toHaveAttribute("aria-hidden", "true");
    await expect(getComputedStyle(card(canvasElement)).pointerEvents).toBe("none");
    await userEvent.tab();
    await expect(card(canvasElement).contains(document.activeElement)).toBe(false);
    await expect(canvas.getByRole("button", { name: "Page 2" })).toHaveFocus();
    await expect(card(canvasElement)).toHaveTextContent("Page 2");
  },
};

export const FlipsWhenThereIsNoRoom: Story = {
  render: () => <Rail align="end" />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const one = canvas.getByRole("button", { name: "Page 1" });
    await userEvent.hover(one);
    await waitFor(() => expect(card(canvasElement)).toBeVisible());
    // At the end edge of the screen it goes to the start side instead, inside the viewport.
    const box = card(canvasElement).getBoundingClientRect();
    await expect(box.right).toBeLessThanOrEqual(one.getBoundingClientRect().left);
    await expect(box.left).toBeGreaterThanOrEqual(0);
  },
};

export const ChosenSide: Story = {
  render: () => <Rail placement="bottom" />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const one = canvas.getByRole("button", { name: "Page 1" });
    await userEvent.hover(one);
    await waitFor(() => expect(card(canvasElement)).toBeVisible());
    await expect(card(canvasElement).getBoundingClientRect().top).toBeGreaterThan(
      one.getBoundingClientRect().bottom,
    );
  },
};

export const NothingToShowWithoutAnAnchor: Story = {
  render: () => (
    <HoverCard open anchor={null}>
      Preview
    </HoverCard>
  ),
  play: async ({ canvasElement }) => {
    await expect(card(canvasElement)).not.toBeVisible();
  },
};

export const StableUnderHostileHost: Story = {
  render: () => (
    <HoverCard
      open
      anchor={{ getBoundingClientRect: () => new DOMRect(20, 20, 10, 10) }}
      className="product-card"
    >
      Preview
    </HoverCard>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(card(canvasElement)).toBeVisible());
    await expect(card(canvasElement)).toHaveClass("product-card");
    const props = [
      "position",
      "padding-top",
      "border-top-width",
      "box-sizing",
      "font-size",
      "pointer-events",
    ];
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-hover-card", props);
    await expect(hostile).toEqual(clean);
  },
};
