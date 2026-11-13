import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { asIfPrinting } from "../../test/print.js";
import { Button } from "../Button/Button.js";
import { Accordion, AccordionItem } from "./Accordion.js";

const meta = {
  title: "Components/Accordion",
  component: Accordion,
  args: { type: "single", defaultValue: "format", collapsible: true, variant: "line", onValueChange: fn() },
  argTypes: {
    type: { control: "inline-radio", options: ["single", "multiple"] },
    variant: { control: "inline-radio", options: ["plain", "line", "card"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    headingLevel: { control: "select", options: [2, 3, 4, 5, 6] },
  },
  render: (args) => (
    <div style={{ maxWidth: 460 }}>
      <Accordion {...args}>
        <AccordionItem value="format" summary="Formatting">
          Indentation and key order.
        </AccordionItem>
        <AccordionItem value="validate" summary="Validation">
          Schema checks on load.
        </AccordionItem>
        <AccordionItem value="export" summary="Export">
          Download as JSON, XML or YAML.
        </AccordionItem>
      </Accordion>
    </div>
  ),
} satisfies Meta<typeof Accordion>;
export default meta;
type Story = StoryObj<typeof meta>;

const trigger = (canvas: { getByRole: (r: "button", o: { name: string }) => HTMLElement }, name: string) =>
  canvas.getByRole("button", { name });

export const SingleClosesTheOthers: Story = {
  tags: ["visual"],
  play: async ({ args, canvas, userEvent }) => {
    await expect(trigger(canvas, "Formatting")).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(trigger(canvas, "Validation"));
    await expect(trigger(canvas, "Validation")).toHaveAttribute("aria-expanded", "true");
    await expect(trigger(canvas, "Formatting")).toHaveAttribute("aria-expanded", "false");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("validate");
    // Collapsible: the open one can be closed, leaving none open.
    await userEvent.click(trigger(canvas, "Validation"));
    await expect(trigger(canvas, "Validation")).toHaveAttribute("aria-expanded", "false");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(undefined);
  },
};

export const NotCollapsibleKeepsOneOpen: Story = {
  args: { collapsible: false },
  play: async ({ canvas, userEvent }) => {
    const open = trigger(canvas, "Formatting");
    await expect(open).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(open);
    await expect(open).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(trigger(canvas, "Export"));
    await expect(trigger(canvas, "Export")).toHaveAttribute("aria-disabled", "true");
    await expect(open).not.toHaveAttribute("aria-disabled");
  },
};

export const MultipleOpensSeveral: Story = {
  args: { type: "multiple", defaultValue: ["format"] },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(trigger(canvas, "Export"));
    await expect(trigger(canvas, "Formatting")).toHaveAttribute("aria-expanded", "true");
    await expect(trigger(canvas, "Export")).toHaveAttribute("aria-expanded", "true");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(["format", "export"]);
    await userEvent.click(trigger(canvas, "Formatting"));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(["export"]);
  },
};

export const ArrowKeysMoveBetweenHeaders: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(trigger(canvas, "Formatting")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(trigger(canvas, "Validation")).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(trigger(canvas, "Export")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(trigger(canvas, "Formatting")).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(trigger(canvas, "Export")).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(trigger(canvas, "Formatting")).toHaveFocus();
    // Every header stays a Tab stop (APG accordion).
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Validation" })).toHaveFocus();
  },
};

export const HeadingsAndRegions: Story = {
  args: { headingLevel: 4 },
  play: async ({ canvas }) => {
    const headings = canvas.getAllByRole("heading", { level: 4 });
    await expect(headings.map((h) => h.textContent)).toEqual(["Formatting", "Validation", "Export"]);
    const region = canvas.getByRole("region", { name: "Formatting" });
    await expect(region).toHaveTextContent("Indentation and key order.");
    await waitFor(() => expect(canvas.getByText("Schema checks on load.")).not.toBeVisible());
  },
};

export const CardVariant: Story = {
  tags: ["visual"],
  args: { variant: "card" },
  play: async ({ canvas }) => {
    const items = canvas.getAllByRole("heading").map((h) => h.closest(".cy-disclosure") as HTMLElement);
    await expect(items).toHaveLength(3);
    await expect(getComputedStyle(items[0] as HTMLElement).borderTopStyle).toBe("solid");
  },
};

function ControlledPair() {
  const [one, setOne] = useState<string | undefined>("a");
  const [many, setMany] = useState<string[]>([]);
  return (
    <>
      <Accordion value={one} onValueChange={setOne} collapsible>
        <AccordionItem value="a" summary="Single A">
          A
        </AccordionItem>
        <AccordionItem value="b" summary="Single B">
          B
        </AccordionItem>
      </Accordion>
      <Accordion type="multiple" value={many} onValueChange={setMany} size="sm">
        <AccordionItem value="x" summary="Many X">
          X
        </AccordionItem>
        <AccordionItem value="y" summary="Many Y">
          Y
        </AccordionItem>
      </Accordion>
      <Button onClick={() => setOne("b")}>Open B</Button>
      <Button onClick={() => setMany(["x", "y"])}>Open all</Button>
    </>
  );
}

export const Controlled: Story = {
  render: () => <ControlledPair />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open B" }));
    await expect(trigger(canvas, "Single B")).toHaveAttribute("aria-expanded", "true");
    await expect(trigger(canvas, "Single A")).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(canvas.getByRole("button", { name: "Open all" }));
    await expect(trigger(canvas, "Many X")).toHaveAttribute("aria-expanded", "true");
    await expect(trigger(canvas, "Many Y")).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(trigger(canvas, "Many Y"));
    await expect(trigger(canvas, "Many Y")).toHaveAttribute("aria-expanded", "false");
    // Collapsible and controlled: undefined is "none open", so the open section closes, every time.
    await userEvent.click(trigger(canvas, "Single B"));
    await expect(trigger(canvas, "Single B")).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger(canvas, "Single A"));
    await expect(trigger(canvas, "Single A")).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(trigger(canvas, "Single A"));
    await expect(trigger(canvas, "Single A")).toHaveAttribute("aria-expanded", "false");
    // The parent holds the value: opening B from outside still works after closing.
    await userEvent.click(canvas.getByRole("button", { name: "Open B" }));
    await expect(trigger(canvas, "Single B")).toHaveAttribute("aria-expanded", "true");
  },
};

export const RegionsOffForLongListsAndOtherKeysIgnored: Story = {
  args: { regions: false, className: "host-accordion", type: "multiple", defaultValue: [] },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(trigger(canvas, "Formatting"));
    await expect(canvas.queryAllByRole("region")).toHaveLength(0);
    await expect(canvasElement.querySelector(".cy-accordion.host-accordion")).toBeTruthy();
    await userEvent.keyboard("a{ArrowRight}");
    await expect(trigger(canvas, "Formatting")).toHaveFocus();
  },
};

export const PrintsEverySection: Story = {
  play: async ({ canvas }) => {
    const closed = canvas.getByText("Download as JSON, XML or YAML.");
    // On screen a closed section's content is collapsed and out of the accessibility tree.
    await waitFor(() => expect(closed.checkVisibility({ visibilityProperty: true })).toBe(false));
    const stop = asIfPrinting();
    try {
      // On paper every section is open, at its full height.
      for (const text of [
        "Indentation and key order.",
        "Schema checks on load.",
        "Download as JSON, XML or YAML.",
      ]) {
        const body = canvas.getByText(text);
        await expect(body.checkVisibility({ visibilityProperty: true })).toBe(true);
        await expect(body.getBoundingClientRect().height).toBeGreaterThan(0);
      }
    } finally {
      stop();
    }
    // Back on screen nothing changed: the closed section is still closed.
    await expect(trigger(canvas, "Export")).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(closed.checkVisibility({ visibilityProperty: true })).toBe(false));
  },
};
