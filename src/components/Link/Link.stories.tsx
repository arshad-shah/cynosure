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
