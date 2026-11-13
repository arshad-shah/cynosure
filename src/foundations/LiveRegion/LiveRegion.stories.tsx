import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect } from "storybook/test";
import { Button } from "../../components/Button/Button.js";
import { Inline } from "../../components/Inline/Inline.js";
import { Kbd } from "../../components/Kbd/Kbd.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { LiveRegion, type Politeness, useLiveMessage } from "./LiveRegion.js";

/** A component that announces through its own region, as HotkeyField or CopyButton do. */
function Speaker({ politeness }: { politeness?: Politeness }) {
  const [message, say] = useLiveMessage();
  return (
    <Inline gap="4">
      <Button onClick={() => say("Draft saved")}>Save</Button>
      <Button
        onClick={() =>
          say(
            <>
              Shortcut set to <Kbd keys={["Ctrl", "K"]} />
            </>,
          )
        }
      >
        Record
      </Button>
      <Button onClick={() => say("")}>Clear</Button>
      <LiveRegion {...message} {...(politeness ? { politeness } : {})} />
    </Inline>
  );
}

/** A region that follows a value, as a zoom level or a match count: it speaks when the words change. */
function Follower() {
  const [count, setCount] = useState(3);
  return (
    <Inline gap="4">
      <Button onClick={() => setCount((c) => c + 1)}>More</Button>
      <Button onClick={() => setCount((c) => c)}>Same</Button>
      <LiveRegion>{`${count} results`}</LiveRegion>
    </Inline>
  );
}

const meta = {
  title: "Foundations/LiveRegion",
  component: LiveRegion,
  render: () => <Speaker />,
} satisfies Meta<typeof LiveRegion>;
export default meta;
type Story = StoryObj<typeof meta>;

export const AnnouncesPolitely: Story = {
  play: async ({ canvas, userEvent }) => {
    const status = canvas.getByRole("status");
    await expect(status).toHaveAttribute("aria-live", "polite");
    await expect(status).toHaveAttribute("aria-atomic", "true");
    // In the page from the start and empty, so the first message is heard.
    await expect(status).toHaveTextContent("");
    await expect(status.children).toHaveLength(0);
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(status).toHaveTextContent("Draft saved");
  },
};

export const AssertiveForErrors: Story = {
  render: () => <Speaker politeness="assertive" />,
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.queryByRole("status")).toBeNull();
    const alert = canvas.getByRole("alert");
    await expect(alert).toHaveAttribute("aria-live", "assertive");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(alert).toHaveTextContent("Draft saved");
  },
};

export const RepeatsAreAnnouncedAgain: Story = {
  play: async ({ canvas, userEvent }) => {
    const save = canvas.getByRole("button", { name: "Save" });
    const status = canvas.getByRole("status");
    await userEvent.click(save);
    const first = status.firstElementChild;
    await userEvent.click(save);
    // Same words, new node: screen readers read added content, so the second save is spoken too, with no clearing step.
    await expect(status).toHaveTextContent("Draft saved");
    await expect(status.firstElementChild).not.toBe(first);
    await expect(status.children).toHaveLength(1);
  },
};

export const SpeaksElements: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Record" }));
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent(/Shortcut set to .*(Ctrl|Control) plus K/);
    await expect(status.querySelector("kbd")).not.toBeNull();
  },
};

export const ClearsSilently: Story = {
  play: async ({ canvas, userEvent }) => {
    const status = canvas.getByRole("status");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await userEvent.click(canvas.getByRole("button", { name: "Clear" }));
    await expect(status).toHaveTextContent("");
    await expect(status.children).toHaveLength(0);
  },
};

export const FollowsAValue: Story = {
  render: () => <Follower />,
  play: async ({ canvas, userEvent }) => {
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("3 results");
    const first = status.firstElementChild;
    // Without a sequence the node stays: the same words are not read again on a re-render.
    await userEvent.click(canvas.getByRole("button", { name: "Same" }));
    await expect(status.firstElementChild).toBe(first);
    await userEvent.click(canvas.getByRole("button", { name: "More" }));
    await expect(status).toHaveTextContent("4 results");
  },
};

export const HiddenButNotFromScreenReaders: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    const status = canvas.getByRole("status");
    const box = status.getBoundingClientRect();
    await expect(box.width).toBeLessThanOrEqual(1);
    await expect(box.height).toBeLessThanOrEqual(1);
    await expect(getComputedStyle(status).clipPath).toBe("inset(50%)");
    await expect(getComputedStyle(status).display).not.toBe("none");
    await expect(status.closest("[aria-hidden]")).toBeNull();
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, "[role=status]", [
      "position",
      "width",
      "height",
      "overflow",
      "clip-path",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
