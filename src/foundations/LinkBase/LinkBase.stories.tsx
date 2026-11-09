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
