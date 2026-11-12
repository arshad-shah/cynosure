import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { trash } from "../../icons/trash.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { Link } from "../Link/Link.js";
import { VisuallyHidden } from "./VisuallyHidden.js";

const meta = {
  title: "Components/VisuallyHidden",
  component: VisuallyHidden,
  args: { children: "Read by screen readers only", as: "span", focusable: false },
  argTypes: {
    children: { control: "text" },
    as: { control: "select", options: ["span", "div", "p", "h1", "h2", "h3", "h4", "h5", "h6"] },
    focusable: { control: "boolean" },
    id: { control: "text" },
  },
} satisfies Meta<typeof VisuallyHidden>;
export default meta;
type Story = StoryObj<typeof meta>;

const box = (el: Element) => el.getBoundingClientRect();
const hidden = (el: Element) => {
  const { width, height } = box(el);
  return width <= 1 && height <= 1;
};

export const HiddenButStillRead: Story = {
  render: (args) => (
    <p data-testid="line">
      Total: 42 <VisuallyHidden {...args}>items in the basket</VisuallyHidden>
    </p>
  ),
  play: async ({ canvas, canvasElement }) => {
    const text = canvas.getByText("items in the basket");
    // In the DOM and the accessibility tree: no display:none, visibility:hidden or aria-hidden.
    await expect(text).toBeInTheDocument();
    await expect(getComputedStyle(text).display).not.toBe("none");
    await expect(getComputedStyle(text).visibility).toBe("visible");
    await expect(text).not.toHaveAttribute("aria-hidden");
    await expect(canvas.getByTestId("line")).toHaveTextContent("Total: 42 items in the basket");
    // Out of sight: one pixel, clipped away, and out of the flow so the line does not grow.
    await expect(hidden(text)).toBe(true);
    await expect(getComputedStyle(text).clipPath).toBe("inset(50%)");
    await expect(getComputedStyle(text).position).toBe("absolute");
    await expect(text.tagName).toBe("SPAN");
    await expect(canvasElement.querySelector(".cy-visually-hidden")).toBe(text);
  },
};

export const NamesAnIconOnlyControl: Story = {
  render: () => (
    <Button icon={trash}>
      <VisuallyHidden>Delete draft</VisuallyHidden>
    </Button>
  ),
  play: async ({ canvas }) => {
    // The hidden text is the button's accessible name.
    await expect(canvas.getByRole("button", { name: "Delete draft" })).toBeVisible();
    await expect(hidden(canvas.getByText("Delete draft"))).toBe(true);
  },
};

export const HeadingForScreenReaders: Story = {
  render: () => (
    <section aria-labelledby="plans-heading">
      <VisuallyHidden as="h2" id="plans-heading">
        Plans and pricing
      </VisuallyHidden>
      <p>Free, Pro and Team.</p>
    </section>
  ),
  play: async ({ canvas }) => {
    const heading = canvas.getByRole("heading", { level: 2, name: "Plans and pricing" });
    await expect(heading.tagName).toBe("H2");
    await expect(hidden(heading)).toBe(true);
    // The id is forwarded, so the section is a named region.
    await expect(canvas.getByRole("region", { name: "Plans and pricing" })).toBeInTheDocument();
  },
};

export const FocusableShowsOnFocus: Story = {
  args: { focusable: true, as: "div" },
  render: (args) => (
    <div>
      <VisuallyHidden {...args}>
        <Link href="#comments">Jump to the comments</Link>
      </VisuallyHidden>
      <Button>After</Button>
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const wrapper = canvasElement.querySelector(".cy-visually-hidden") as HTMLElement;
    await expect(wrapper).toHaveAttribute("data-focusable");
    await expect(hidden(wrapper)).toBe(true);
    // Tab reaches the link while it is hidden, and focus shows it.
    await userEvent.tab();
    const link = canvas.getByRole("link", { name: "Jump to the comments" });
    await expect(link).toHaveFocus();
    await expect(box(wrapper).width).toBeGreaterThan(20);
    await expect(box(link).height).toBeGreaterThan(10);
    await expect(getComputedStyle(wrapper).position).toBe("static");
    // Focus leaves: hidden again.
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "After" })).toHaveFocus();
    await expect(hidden(wrapper)).toBe(true);
  },
};

export const NotFocusableStaysHidden: Story = {
  render: () => (
    <VisuallyHidden>
      <Link href="#top">Back to top</Link>
    </VisuallyHidden>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    // Without `focusable`, focus does not reveal it (use `focusable` for anything a keyboard can reach).
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "Back to top" })).toHaveFocus();
    await expect(hidden(canvasElement.querySelector(".cy-visually-hidden") as Element)).toBe(true);
  },
};

export const StableUnderHostileHost: Story = {
  render: () => (
    <p>
      Total <VisuallyHidden>items in the basket</VisuallyHidden>
    </p>
  ),
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-visually-hidden", [
      "position",
      "width",
      "height",
      "overflow",
      "clip-path",
      "white-space",
      "margin-top",
      "padding-top",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
