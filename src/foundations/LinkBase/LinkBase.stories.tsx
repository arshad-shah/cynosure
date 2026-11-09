import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { LinkBase } from "./LinkBase.js";

const meta = {
  title: "Foundations/LinkBase",
  component: LinkBase,
  args: { children: "Docs", href: "https://example.com" },
} satisfies Meta<typeof LinkBase>;
export default meta;
type Story = StoryObj<typeof meta>;

export const OpensExternalLinksSafely: Story = {
  args: { target: "_blank" },
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Docs" });
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  },
};

export const DropsJavascriptHrefs: Story = {
  args: { href: " JavaScript:alert(1)" },
  play: async ({ canvasElement }) => {
    const anchor = canvasElement.querySelector("a") as HTMLAnchorElement;
    await expect(anchor.hasAttribute("href")).toBe(false);
  },
};

export const AllowsOnlySafeSchemes: Story = {
  render: () => (
    <div>
      {[
        ["tab", "java\tscript:alert(1)"],
        ["newline", "java\nscript:alert(1)"],
        ["control", "\u0001javascript:alert(1)"],
        ["entity-like", "JaVaScRiPt:alert(1)"],
        ["data", "data:text/html,<script>alert(1)</script>"],
        ["relative", "/docs/start"],
        ["hash", "#top"],
        ["https", "https://example.com/a"],
        ["mailto", "mailto:hi@example.com"],
        ["tel", "tel:+353000000"],
      ].map(([id, href]) => (
        <LinkBase key={id} data-testid={id} href={href}>
          {id}
        </LinkBase>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    for (const id of ["tab", "newline", "control", "entity-like", "data"])
      await expect(canvas.getByTestId(id).hasAttribute("href")).toBe(false);
    for (const id of ["relative", "hash", "https", "mailto", "tel"])
      await expect(canvas.getByTestId(id).hasAttribute("href")).toBe(true);
  },
};
