import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { textContrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Link } from "./Link.js";

const meta = {
  title: "Components/Link",
  component: Link,
  args: { href: "#docs", children: "Read the docs", tone: "accent", size: "md" },
  argTypes: {
    tone: { control: "select", options: ["accent", "neutral", "danger", "success", "warning", "info"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    external: { control: "boolean" },
    href: { control: "text" },
    children: { control: "text" },
  },
} satisfies Meta<typeof Link>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Activates: Story = {
  tags: ["visual"],
  args: { onClick: fn((e: { preventDefault: () => void }) => e.preventDefault()) },
  play: async ({ canvas, args, userEvent }) => {
    const link = canvas.getByRole("link", { name: "Read the docs" });
    await userEvent.click(link);
    link.focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const ExternalAnnouncesNewTab: Story = {
  args: { href: "https://example.com", external: true },
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Read the docs (opens in new tab)" });
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(link.querySelector(".cy-icon")).toBeTruthy();
  },
};

export const ExternalLabelOverride: Story = {
  args: { href: "https://example.com", external: true, labels: { external: "(nouvel onglet)" } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Read the docs (nouvel onglet)" })).toBeInTheDocument();
  },
};

export const FocusRingVisible: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    const style = getComputedStyle(canvas.getByRole("link"));
    await expect(style.outlineStyle).toBe("solid");
    await expect(Number.parseFloat(style.outlineWidth)).toBeGreaterThan(0);
  },
};

export const TonesAreReadable: Story = {
  tags: ["visual"],
  render: () => (
    <p style={{ display: "flex", gap: 16 }}>
      {(["accent", "neutral", "danger", "success", "warning", "info"] as const).map((tone) => (
        <Link key={tone} href="#" tone={tone}>
          {tone}
        </Link>
      ))}
    </p>
  ),
  play: async ({ canvas }) => {
    for (const link of canvas.getAllByRole("link"))
      await expect({ tone: link.textContent, readable: textContrast(link) >= 4.5 }).toEqual({
        tone: link.textContent,
        readable: true,
      });
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, "a", [
      "color",
      "font-size",
      "text-decoration-line",
      "font-weight",
    ]);
    await expect(hostile).toEqual(clean);
  },
};

export const UnderlineChoices: Story = {
  render: () => (
    <p>
      <Link href="#a">Always</Link>{" "}
      <Link href="#h" underline="hover">
        On hover
      </Link>{" "}
      <Link href="#n" underline="none" aria-current="page">
        Never
      </Link>
    </p>
  ),
  play: async ({ canvas, userEvent }) => {
    const line = (name: string) => getComputedStyle(canvas.getByRole("link", { name })).textDecorationLine;
    await expect(line("Always")).toBe("underline");
    await expect(line("On hover")).toBe("none");
    await expect(line("Never")).toBe("none");
    // Keyboard focus brings the underline back on a `hover` link (as hovering does).
    canvas.getByRole("link", { name: "Always" }).focus();
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "On hover" })).toHaveFocus();
    await expect(line("On hover")).toBe("underline");
    // A `none` link still says where it is, and keeps its focus ring.
    await expect(canvas.getByRole("link", { name: "Never" })).toHaveAttribute("aria-current", "page");
    await userEvent.tab();
    await expect(getComputedStyle(canvas.getByRole("link", { name: "Never" })).outlineStyle).toBe("solid");
  },
};
