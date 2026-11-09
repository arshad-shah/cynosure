import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { copy, download, edit, filter, link } from "../../icons/index.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { SearchField } from "../SearchField/SearchField.js";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl.js";
import { Toolbar } from "./Toolbar.js";

const meta = {
  title: "Components/Toolbar",
  component: Toolbar,
  args: { label: "Document actions", orientation: "horizontal", loop: true },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    loop: { control: "boolean" },
  },
  render: (args) => (
    <>
      <Toolbar {...args}>
        <Button size="sm">Bold</Button>
        <IconButton icon={edit} label="Edit" size="sm" />
        <Button size="sm" disabled>
          Strike
        </Button>
        <IconButton icon={link} label="Link" size="sm" />
      </Toolbar>
      <Button size="sm">After</Button>
    </>
  ),
} satisfies Meta<typeof Toolbar>;
export default meta;
type Story = StoryObj<typeof meta>;

const name = () =>
  (document.activeElement as HTMLElement | null)?.textContent ||
  document.activeElement?.getAttribute("aria-label");

export const OneTabStopArrowsHomeEnd: Story = {
  tags: ["visual"],
  play: async ({ canvas, userEvent }) => {
    const toolbar = canvas.getByRole("toolbar", { name: "Document actions" });
    await expect(toolbar).toHaveAttribute("aria-orientation", "horizontal");
    await userEvent.tab();
    await expect(name()).toBe("Bold");
    await userEvent.tab();
    await expect(name()).toBe("After");
    await userEvent.tab({ shift: true });
    await expect(name()).toBe("Bold");
    await userEvent.keyboard("{ArrowRight}");
    await expect(name()).toBe("Edit");
    await userEvent.keyboard("{ArrowRight}");
    await expect(name()).toBe("Link");
    await userEvent.keyboard("{Home}");
    await expect(name()).toBe("Bold");
    await userEvent.keyboard("{End}");
    await expect(name()).toBe("Link");
    await userEvent.keyboard("{ArrowRight}");
    await expect(name()).toBe("Bold");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect(name()).toBe("Edit");
    // Leaving and returning lands on the last focused item.
    await userEvent.tab();
    await userEvent.tab({ shift: true });
    await expect(name()).toBe("Edit");
  },
};

export const StopsAtEndsWithoutLoop: Story = {
  args: { loop: false },
  play: async ({ userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(name()).toBe("Bold");
    await userEvent.keyboard("{End}{ArrowRight}");
    await expect(name()).toBe("Link");
  },
};

export const VerticalUsesUpAndDown: Story = {
  args: { orientation: "vertical" },
  play: async ({ canvas, userEvent }) => {
    const toolbar = canvas.getByRole("toolbar");
    await expect(toolbar).toHaveAttribute("aria-orientation", "vertical");
    await expect(getComputedStyle(toolbar).flexDirection).toBe("column");
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    await expect(name()).toBe("Edit");
    await userEvent.keyboard("{ArrowRight}");
    await expect(name()).toBe("Edit");
    await userEvent.keyboard("{ArrowUp}");
    await expect(name()).toBe("Bold");
  },
};

export const ActivatesItems: Story = {
  render: (args) => {
    const onBold = fn();
    (window as unknown as { onBold: typeof onBold }).onBold = onBold;
    return (
      <Toolbar {...args}>
        <Button size="sm" onClick={onBold}>
          Bold
        </Button>
        <IconButton icon={copy} label="Copy" size="sm" />
      </Toolbar>
    );
  },
  play: async ({ userEvent }) => {
    const onBold = (window as unknown as { onBold: ReturnType<typeof fn> }).onBold;
    await userEvent.tab();
    await userEvent.keyboard("{Enter} ");
    await expect(onBold).toHaveBeenCalledTimes(2);
  },
};

function Mixed() {
  const [view, setView] = useState("list");
  return (
    <Toolbar label="Library">
      <IconButton icon={filter} label="Filter" size="sm" />
      <SegmentedControl
        label="View"
        size="sm"
        value={view}
        onChange={setView}
        options={[
          { value: "list", label: "List" },
          { value: "grid", label: "Grid" },
        ]}
      />
      <SearchField label="Search" size="sm" onSubmit={() => {}} />
      <IconButton icon={download} label="Download" size="sm" />
      <span data-testid="view">{view}</span>
    </Toolbar>
  );
}

export const RadiosMoveFocusAndSpaceChecks: Story = {
  render: () => <Mixed />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(name()).toBe("Filter");
    await userEvent.keyboard("{ArrowRight}");
    await expect(document.activeElement).toBe(canvas.getByRole("radio", { name: "List" }));
    await userEvent.keyboard("{ArrowRight}");
    const grid = canvas.getByRole("radio", { name: "Grid" });
    await expect(document.activeElement).toBe(grid);
    // Arrow keys move focus within the toolbar; they do not change the selection.
    await expect(canvas.getByTestId("view")).toHaveTextContent("list");
    await userEvent.keyboard(" ");
    await waitFor(() => expect(canvas.getByTestId("view")).toHaveTextContent("grid"));
  },
};

export const TextFieldsKeepTheirArrowKeys: Story = {
  render: () => <Mixed />,
  play: async ({ canvas, userEvent }) => {
    const box = canvas.getByRole("searchbox", { name: "Search" });
    await userEvent.click(box);
    await userEvent.type(box, "abc");
    await userEvent.keyboard("{ArrowLeft}{Home}");
    await expect(document.activeElement).toBe(box);
    await expect((box as HTMLInputElement).selectionStart).toBe(0);
    // Tab exits the toolbar (other controls, including the field's clear button, are not Tab stops).
    await userEvent.tab();
    await expect(canvas.getByRole("toolbar").contains(document.activeElement)).toBe(false);
  },
};

function Growing() {
  const [extra, setExtra] = useState(false);
  return (
    <>
      <Toolbar label="Growing">
        <Button size="sm" onClick={() => setExtra(true)}>
          Add
        </Button>
        {extra && <Button size="sm">Added</Button>}
      </Toolbar>
    </>
  );
}

export const ItemsAddedLaterJoinTheRovingGroup: Story = {
  render: () => <Growing />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    const added = await canvas.findByRole("button", { name: "Added" });
    await waitFor(() => expect(added.tabIndex).toBe(-1));
    await userEvent.keyboard("{ArrowRight}");
    await expect(added).toHaveFocus();
  },
};

export const RightToLeftFlipsArrows: Story = {
  render: (args) => (
    <div dir="rtl">
      <Toolbar {...args}>
        <Button size="sm">Bold</Button>
        <Button size="sm">Italic</Button>
      </Toolbar>
    </div>
  ),
  play: async ({ userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(name()).toBe("Italic");
  },
};

export const TouchTargets: Story = {
  tags: ["touch"],
  play: async ({ canvas, userEvent }) => {
    const bold = canvas.getByRole("button", { name: "Bold" });
    const hit = getComputedStyle(bold, "::before");
    const rect = bold.getBoundingClientRect();
    await expect(Math.max(rect.height, Number.parseFloat(hit.height) || 0)).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByRole("button", { name: "Edit" }) });
    await expect(canvas.getByRole("button", { name: "Edit" }).tabIndex).toBe(0);
  },
};
