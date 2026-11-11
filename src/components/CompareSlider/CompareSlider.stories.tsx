import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { CompareSlider } from "./CompareSlider.js";

const side = (name: string, background: string) => (
  <div
    data-testid={name}
    style={{
      blockSize: 220,
      background,
      display: "grid",
      placeItems: "center",
      color: "var(--cy-color-ink)",
    }}
  >
    {name}
  </div>
);

const meta = {
  title: "Components/CompareSlider",
  component: CompareSlider,
  args: {
    before: side("original", "var(--cy-color-soft)"),
    after: side("edited", "var(--cy-color-accent-soft)"),
    onChange: fn(),
  },
  decorators: [(Story) => <div style={{ inlineSize: 400 }}>{Story()}</div>],
} satisfies Meta<typeof CompareSlider>;
export default meta;
type Story = StoryObj<typeof meta>;

const root = (el: Element) => el.querySelector(".cy-compare-slider") as HTMLElement;
/** What is shown at a fraction of the width, half-way down. */
const shownAt = (el: Element, fraction: number) => {
  const box = root(el).getBoundingClientRect();
  return document
    .elementFromPoint(box.left + box.width * fraction, box.top + box.height / 2)
    ?.closest("[data-testid]")
    ?.getAttribute("data-testid");
};

export const BeforeAndAfterSplitByADivider: Story = {
  tags: ["visual"],
  play: async ({ canvas, canvasElement }) => {
    const divider = canvas.getByRole("slider", { name: "Comparison" });
    await expect(divider).toHaveAttribute("aria-valuenow", "50");
    await expect(divider).toHaveAttribute("aria-valuetext", "50% before");
    // The original on the left of the divider, the edit on the right.
    await expect(shownAt(canvasElement, 0.25)).toBe("original");
    await expect(shownAt(canvasElement, 0.75)).toBe("edited");
  },
};

export const KeyboardMovesTheDivider: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("slider");
    await userEvent.tab();
    await expect(divider).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(divider).toHaveAttribute("aria-valuenow", "51");
    await userEvent.keyboard("{Shift>}{ArrowLeft}{/Shift}");
    await expect(divider).toHaveAttribute("aria-valuenow", "41");
    await userEvent.keyboard("{PageUp}");
    await expect(args.onChange).toHaveBeenLastCalledWith(51);
    await userEvent.keyboard("{End}");
    await expect(shownAt(canvasElement, 0.9)).toBe("original");
    await userEvent.keyboard("{Home}{ArrowLeft}");
    await expect(divider).toHaveAttribute("aria-valuenow", "0");
    await expect(shownAt(canvasElement, 0.1)).toBe("edited");
  },
};

export const ClickOrDragWithThePointer: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("slider");
    const box = root(canvasElement).getBoundingClientRect();
    const y = box.top + box.height / 2;
    // A click jumps the divider there.
    await userEvent.pointer({
      keys: "[MouseLeft]",
      target: root(canvasElement),
      coords: { clientX: box.left + box.width * 0.8, clientY: y },
    });
    await expect(divider).toHaveAttribute("aria-valuenow", "80");
    // A drag follows the pointer.
    const init = {
      bubbles: true,
      cancelable: true,
      pointerId: 2,
      pointerType: "mouse",
      isPrimary: true,
      button: 0,
      buttons: 1,
    };
    const target = root(canvasElement);
    target.dispatchEvent(
      new PointerEvent("pointerdown", { ...init, clientX: box.left + box.width * 0.8, clientY: y }),
    );
    target.dispatchEvent(
      new PointerEvent("pointermove", { ...init, clientX: box.left + box.width * 0.5, clientY: y }),
    );
    target.dispatchEvent(
      new PointerEvent("pointermove", { ...init, clientX: box.left + box.width * 0.3, clientY: y }),
    );
    target.dispatchEvent(
      new PointerEvent("pointerup", { ...init, buttons: 0, clientX: box.left + box.width * 0.3, clientY: y }),
    );
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "30"));
    await expect(divider).toHaveFocus();
    // Escape mid-drag puts it back.
    target.dispatchEvent(
      new PointerEvent("pointerdown", { ...init, clientX: box.left + box.width * 0.6, clientY: y }),
    );
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "60"));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "30"));
  },
};

export const Controlled: Story = {
  render: (args) => {
    function Pair() {
      const [value, setValue] = useState(20);
      return (
        <>
          <CompareSlider {...args} value={value} onChange={setValue} />
          <Button onClick={() => setValue(70)}>Show more of the original</Button>
        </>
      );
    }
    return <Pair />;
  },
  play: async ({ canvas, userEvent }) => {
    const divider = canvas.getByRole("slider");
    await expect(divider).toHaveAttribute("aria-valuenow", "20");
    await userEvent.click(canvas.getByRole("button", { name: "Show more of the original" }));
    await expect(divider).toHaveAttribute("aria-valuenow", "70");
    // Keys go through onChange too.
    divider.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(divider).toHaveAttribute("aria-valuenow", "69");
  },
};

export const LabelsAndTags: Story = {
  args: {
    labels: { divider: "Vergleich", position: (p) => `${p} % vorher`, before: "Vorher", after: "Nachher" },
    className: "product-compare",
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("slider", { name: "Vergleich" })).toHaveAttribute(
      "aria-valuetext",
      "50 % vorher",
    );
    await expect(root(canvasElement)).toHaveTextContent("Vorher");
    await expect(root(canvasElement)).toHaveTextContent("Nachher");
    await expect(root(canvasElement)).toHaveClass("product-compare");
  },
};

export const WithoutTags: Story = {
  args: { showTags: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".cy-compare-slider-tag")).toBeNull();
  },
};

export const TouchDivider: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("slider");
    // The divider's hit area is at least 44px wide on touch screens.
    await expect(Number.parseFloat(getComputedStyle(divider, "::before").width)).toBeGreaterThanOrEqual(44);
    // A sideways finger drags at once and a vertical swipe scrolls the page; a tap jumps the divider.
    await expect(getComputedStyle(root(canvasElement)).touchAction).toBe("pan-y");
    const box = root(canvasElement).getBoundingClientRect();
    await userEvent.pointer({
      keys: "[TouchA]",
      target: root(canvasElement),
      coords: { clientX: box.left + box.width * 0.25, clientY: box.top + box.height / 2 },
    });
    await expect(divider).toHaveAttribute("aria-valuenow", "25");
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = ["display", "overflow", "font-size", "box-sizing", "width", "background-color"];
    for (const selector of [".cy-compare-slider", ".cy-compare-slider-divider", ".cy-compare-slider-tag"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
