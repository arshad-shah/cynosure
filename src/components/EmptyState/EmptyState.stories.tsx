import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { folderOpen, search } from "../../icons/index.js";
import { textContrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CynosureTheme } from "../../theme/CynosureTheme.js";
import { Button } from "../Button/Button.js";
import { EmptyState } from "./EmptyState.js";

const create = fn();
const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  args: {
    icon: folderOpen,
    title: "No projects yet",
    description: "Projects group your captures, notes and exports.",
    size: "md",
    headingLevel: 3,
    actions: (
      <Button variant="solid" tone="accent" onClick={create}>
        Create a project
      </Button>
    ),
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    headingLevel: { control: "inline-radio", options: [2, 3, 4, 5, 6] },
    title: { control: "text" },
    description: { control: "text" },
  },
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;

export const HeadingAndNextStep: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    // The title is a real heading at the chosen level, so it shows up in the page outline.
    await expect(canvas.getByRole("heading", { level: 3, name: "No projects yet" })).toBeVisible();
    // The icon is decorative.
    await expect(canvasElement.querySelector(".cy-icon")).toHaveAttribute("aria-hidden", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Create a project" }));
    await expect(create).toHaveBeenCalledTimes(1);
  },
};

export const NoResults: Story = {
  args: {
    icon: search,
    title: "No matches for “invoice 2024”",
    description: "Try fewer words or clear the filters.",
    headingLevel: 2,
    size: "sm",
    actions: (
      <>
        <Button>Clear filters</Button>
        <Button variant="ghost">Search all folders</Button>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 2 })).toHaveTextContent("No matches");
    await expect(canvas.getAllByRole("button")).toHaveLength(2);
  },
};

export const TitleOnly: Story = {
  args: { icon: undefined, description: undefined, actions: undefined, title: "Nothing selected" },
  play: async ({ canvasElement, canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Nothing selected" })).toBeVisible();
    await expect(canvasElement.querySelector(".cy-empty-state-icon, .cy-empty-state-actions, p")).toBeNull();
  },
};

export const WrapsInANarrowPanel: Story = {
  args: {
    title: "A deliberately long title that has to wrap inside a small extension popup",
    actions: (
      <>
        <Button>Import from a file</Button>
        <Button variant="solid" tone="accent">
          Create a project
        </Button>
      </>
    ),
  },
  render: (args) => (
    <div data-testid="panel" style={{ width: 220, border: "1px solid" }}>
      <EmptyState {...args} size="sm" />
    </div>
  ),
  play: async ({ canvas }) => {
    const panel = canvas.getByTestId("panel");
    const root = panel.querySelector(".cy-empty-state") as HTMLElement;
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
    // The two actions wrap onto separate lines rather than overflowing.
    const [a, b] = canvas.getAllByRole("button");
    await expect((b as HTMLElement).getBoundingClientRect().top).toBeGreaterThanOrEqual(
      (a as HTMLElement).getBoundingClientRect().bottom,
    );
  },
};

export const ReadableInBothModes: Story = {
  render: (args) => (
    <>
      {(["light", "dark"] as const).map((mode) => (
        <CynosureTheme key={mode} mode={mode}>
          {/* An EmptyState is transparent: it sits on the page background. */}
          <div style={{ background: "var(--cy-color-bg)" }}>
            <EmptyState {...args} />
          </div>
        </CynosureTheme>
      ))}
    </>
  ),
  play: async ({ canvasElement }) => {
    for (const part of canvasElement.querySelectorAll(".cy-empty-state-title, .cy-empty-state-description")) {
      await expect(textContrast(part)).toBeGreaterThanOrEqual(4.5);
    }
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    for (const selector of [".cy-empty-state", ".cy-empty-state-title", ".cy-empty-state-description"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [
        "display",
        "padding-top",
        "margin-top",
        "font-size",
        "box-sizing",
        "color",
        "text-transform",
        "letter-spacing",
      ]);
      await expect(hostile).toEqual(clean);
    }
  },
};
