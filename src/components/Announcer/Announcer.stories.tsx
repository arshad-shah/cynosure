import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, spyOn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { Inline } from "../Inline/Inline.js";
import { Announcer, useAnnounce } from "./Announcer.js";

function SaveButtons() {
  const announce = useAnnounce();
  return (
    <Inline gap="4">
      <Button onClick={() => announce("Draft saved")}>Save</Button>
      <Button
        tone="danger"
        onClick={() => announce("Could not save: you are offline", { politeness: "assertive" })}
      >
        Fail
      </Button>
    </Inline>
  );
}

const meta = {
  title: "Components/Announcer",
  component: Announcer,
  args: { clearAfter: 5000 },
  render: (args) => (
    <Announcer {...args}>
      <SaveButtons />
    </Announcer>
  ),
} satisfies Meta<typeof Announcer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const AnnouncesPolitely: Story = {
  play: async ({ canvas, userEvent }) => {
    const status = canvas.getByRole("status");
    await expect(status).toHaveAttribute("aria-live", "polite");
    await expect(status).toHaveTextContent("");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(status).toHaveTextContent("Draft saved");
    // The assertive region stays quiet.
    await expect(canvas.getByRole("alert")).toHaveTextContent("");
  },
};

export const AnnouncesErrorsAssertively: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Fail" }));
    const alert = canvas.getByRole("alert");
    await expect(alert).toHaveAttribute("aria-live", "assertive");
    await expect(alert).toHaveTextContent("Could not save: you are offline");
    await expect(canvas.getByRole("status")).toHaveTextContent("");
  },
};

export const RepeatsAreAnnouncedAgain: Story = {
  play: async ({ canvas, userEvent }) => {
    const save = canvas.getByRole("button", { name: "Save" });
    const status = canvas.getByRole("status");
    await userEvent.click(save);
    const first = status.firstElementChild;
    await userEvent.click(save);
    // Same words, new node: screen readers read added content, so the second save is spoken too.
    await expect(status).toHaveTextContent("Draft saved");
    await expect(status.firstElementChild).not.toBe(first);
    await expect(status.children).toHaveLength(1);
  },
};

export const ClearsAfterAWhile: Story = {
  args: { clearAfter: 100 },
  play: async ({ canvas, userEvent }) => {
    const status = canvas.getByRole("status");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(status).toHaveTextContent("Draft saved");
    // Old messages do not linger for someone reading the page later.
    await waitFor(() => expect(status).toHaveTextContent(""), { timeout: 2000 });
  },
};

export const HiddenButNotFromScreenReaders: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    const root = canvasElement.querySelector(".cy-announcer") as HTMLElement;
    const box = root.getBoundingClientRect();
    await expect(box.width).toBeLessThanOrEqual(1);
    await expect(box.height).toBeLessThanOrEqual(1);
    await expect(getComputedStyle(root).clipPath).toBe("inset(50%)");
    // Still in the accessibility tree: not display none, not aria-hidden.
    await expect(getComputedStyle(root).display).not.toBe("none");
    await expect(root.closest("[aria-hidden]")).toBeNull();
  },
};

export const StaysInsideTheApp: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const before = document.body.children.length;
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    // The regions render where the Announcer is, never appended to <body>.
    await expect(document.body.children.length).toBe(before);
    await expect(canvasElement.contains(canvas.getByRole("status"))).toBe(true);
  },
};

export const NearestAnnouncerSpeaks: Story = {
  render: (args) => (
    <Announcer {...args}>
      <div className="outer">
        <Announcer>
          <div className="inner">
            <SaveButtons />
          </div>
        </Announcer>
      </div>
    </Announcer>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    const [inner, outer] = canvas.getAllByRole("status");
    await expect(canvasElement.querySelector(".outer")?.contains(inner as Element)).toBe(true);
    await expect(inner).toHaveTextContent("Draft saved");
    await expect(outer).toHaveTextContent("");
  },
};

export const WarnsWithoutAnAnnouncer: Story = {
  render: () => <SaveButtons />,
  play: async ({ canvas, userEvent }) => {
    const warn = spyOn(console, "warn").mockImplementation(() => {});
    try {
      // Nothing to speak through: no throw, no region, one warning at most.
      await userEvent.click(canvas.getByRole("button", { name: "Save" }));
      await userEvent.click(canvas.getByRole("button", { name: "Save" }));
      await expect(canvas.queryByRole("status")).toBeNull();
      await expect(warn.mock.calls.length).toBeLessThanOrEqual(1);
      for (const [message] of warn.mock.calls) await expect(String(message)).toContain("<Announcer>");
    } finally {
      warn.mockRestore();
    }
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-announcer", [
      "position",
      "width",
      "height",
      "overflow",
      "clip-path",
      "box-sizing",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
