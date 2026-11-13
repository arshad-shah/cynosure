import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, fn, waitFor } from "storybook/test";
import { retry } from "../../icons/retry.js";
import { sparkles } from "../../icons/sparkles.js";
import { createStyleSheet } from "../../styles/inline.js";
import { rgb } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { realHover } from "../../test/hover.js";
import { emulateMedia } from "../../test/media.js";
import { Announcer, useAnnounce } from "../Announcer/Announcer.js";
import { Avatar } from "../Avatar/Avatar.js";
import { Button } from "../Button/Button.js";
import { CopyButton } from "../CopyButton/CopyButton.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Prose } from "../Prose/Prose.js";
import { ScrollArea, type ScrollAreaHandle } from "../ScrollArea/ScrollArea.js";
import { Table } from "../Table/Table.js";
import { ChatMessage } from "./ChatMessage.js";

const assistantAvatar = <Avatar name="Assistant" icon={sparkles} size="sm" tone="accent" decorative />;
const onRetry = fn();
const actions = (
  <>
    <CopyButton value="The orders table has 1.2 million rows." size="sm" copy={async () => {}} />
    <IconButton icon={retry} label="Retry" size="sm" variant="ghost" onClick={onRetry} />
  </>
);

const meta = {
  tags: ["serial"],
  title: "Components/ChatMessage",
  component: ChatMessage,
  args: {
    role: "assistant",
    avatar: assistantAvatar,
    actions,
    children: (
      <Prose size="sm">
        <p>The orders table has 1.2 million rows.</p>
      </Prose>
    ),
  },
  argTypes: {
    role: { control: "inline-radio", options: ["user", "assistant"] },
    tone: { control: "inline-radio", options: ["neutral", "danger"] },
    wide: { control: "boolean" },
    streaming: { control: "boolean" },
    labels: { control: "object" },
    avatar: { control: false },
    actions: { control: false },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatMessage>;
export default meta;
type Story = StoryObj<typeof meta>;

const bubble = (el: ParentNode) => el.querySelector(".cy-chat-message-bubble") as HTMLElement;
const actionsOf = (el: ParentNode) => el.querySelector(".cy-chat-message-actions") as HTMLElement;
const rect = (el: Element) => el.getBoundingClientRect();

function Pair({ dir }: { dir?: "rtl" }) {
  return (
    <div dir={dir} style={{ display: "grid", gap: 8 }} data-testid="pair">
      <ChatMessage role="user">How many rows does orders have?</ChatMessage>
      <ChatMessage role="assistant" avatar={assistantAvatar} actions={actions}>
        <Prose size="sm">
          <p>The orders table has 1.2 million rows.</p>
        </Prose>
      </ChatMessage>
    </div>
  );
}

export const Default: Story = {
  tags: ["visual"],
  render: () => <Pair />,
  play: async ({ canvas }) => {
    const [user, assistant] = canvas.getAllByRole("article") as [HTMLElement, HTMLElement];
    // Each message is named by who wrote it.
    await expect(user).toHaveAccessibleName("You");
    await expect(assistant).toHaveAccessibleName("Assistant");
    const area = rect(canvas.getByTestId("pair"));
    // The person's message sits at the end, filled with the accent.
    await expect(rect(bubble(user)).right).toBeCloseTo(area.right, 0);
    await expect(rect(bubble(user)).left).toBeGreaterThan(area.left + 100);
    await expect(rgb(getComputedStyle(bubble(user)).backgroundColor)).toEqual(
      rgb(getComputedStyle(user).getPropertyValue("--cy-color-accent")),
    );
    // The assistant's starts at the start, after its avatar.
    const avatar = assistant.querySelector(".cy-avatar") as HTMLElement;
    await expect(rect(avatar).left).toBeCloseTo(area.left, 0);
    await expect(rect(bubble(assistant)).left).toBeGreaterThan(rect(avatar).right);
    await expect(rect(bubble(assistant)).right).toBeLessThan(area.right - 40);
  },
};

export const KeyboardReachesTheActions: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const toolbar = canvas.getByRole("toolbar", { name: "Message actions" });
    await expect(actionsOf(canvasElement).contains(toolbar)).toBe(true);
    // One Tab stop for the actions (an APG toolbar); arrows move between them.
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Copy" })).toHaveFocus();
    // Focus reveals them, whatever the pointer does.
    await waitFor(() => expect(getComputedStyle(actionsOf(canvasElement)).opacity).toBe("1"), {
      timeout: 3000,
    });
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("button", { name: "Retry" })).toHaveFocus();
    onRetry.mockClear();
    await userEvent.keyboard("{Enter}");
    await expect(onRetry).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    await expect(toolbar.contains(document.activeElement)).toBe(false);
  },
};

export const HoverRevealsTheActions: Story = {
  tags: ["!dev"],
  play: async ({ canvas, canvasElement }) => {
    const toolbar = actionsOf(canvasElement);
    if (!(await realHover(null))) return;
    if (!matchMedia("(hover: hover)").matches) return;
    // Out of the way until the message is pointed at: still in the layout, so nothing moves when they show.
    await waitFor(() => expect(getComputedStyle(toolbar).opacity).toBe("0"), { timeout: 3000 });
    const before = rect(toolbar);
    await realHover(canvas.getByRole("article"));
    await waitFor(() => expect(getComputedStyle(toolbar).opacity).toBe("1"), { timeout: 3000 });
    await expect(rect(toolbar)).toEqual(before);
    await realHover(null);
    await waitFor(() => expect(getComputedStyle(toolbar).opacity).toBe("0"), { timeout: 3000 });
  },
};

export const TouchShowsTheActions: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, canvasElement, userEvent }) => {
    // No hover on a touch screen: the actions are always shown, and big enough for a finger.
    await expect(getComputedStyle(actionsOf(canvasElement)).opacity).toBe("1");
    const retryButton = canvas.getByRole("button", { name: "Retry" });
    const hit = getComputedStyle(retryButton, "::before");
    await expect(Number.parseFloat(hit.blockSize || hit.height)).toBeGreaterThanOrEqual(44);
    onRetry.mockClear();
    await userEvent.pointer({ keys: "[TouchA]", target: retryButton });
    await expect(onRetry).toHaveBeenCalledTimes(1);
  },
};

export const StreamingShowsACaret: Story = {
  args: { streaming: true },
  render: function Render(args) {
    const [streaming, setStreaming] = useState(Boolean(args.streaming));
    return (
      <div>
        <ChatMessage {...args} streaming={streaming} />
        <Button onClick={() => setStreaming(false)}>Finish</Button>
      </div>
    );
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const article = canvas.getByRole("article");
    const caret = canvasElement.querySelector(".cy-chat-message-caret") as HTMLElement;
    await expect(caret).toBeVisible();
    await expect(caret).toHaveAttribute("aria-hidden", "true");
    // The caret follows the content and blinks.
    await expect(bubble(canvasElement).lastElementChild).toBe(caret);
    await expect(getComputedStyle(caret).animationName).toBe("cy-chat-message-blink");
    // Busy while text arrives, so screen readers wait for the whole message.
    await expect(article).toHaveAttribute("aria-busy", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Finish" }));
    await expect(canvasElement.querySelector(".cy-chat-message-caret")).toBeNull();
    await expect(article).not.toHaveAttribute("aria-busy");
  },
};

export const CaretRestsUnderReducedMotion: Story = {
  tags: ["!dev"],
  args: { streaming: true },
  play: async ({ canvasElement }) => {
    const caret = canvasElement.querySelector(".cy-chat-message-caret") as HTMLElement;
    if (!(await emulateMedia({ reducedMotion: "reduce" }))) return;
    try {
      await waitFor(() => expect(getComputedStyle(caret).animationName).toBe("none"));
      await expect(getComputedStyle(caret).opacity).toBe("1");
    } finally {
      await emulateMedia({ reducedMotion: null });
    }
  },
};

export const DangerTone: Story = {
  render: () => (
    <div>
      <ChatMessage role="assistant" avatar={assistantAvatar}>
        Fine
      </ChatMessage>
      <ChatMessage role="assistant" tone="danger" avatar={assistantAvatar}>
        The request failed: rate limited.
      </ChatMessage>
    </div>
  ),
  play: async ({ canvas }) => {
    const [fine, failed] = canvas.getAllByRole("article") as [HTMLElement, HTMLElement];
    await expect(failed).toHaveAttribute("data-tone", "danger");
    await expect(fine).toHaveAttribute("data-tone", "neutral");
    for (const prop of ["background-color", "border-top-color", "color"])
      await expect(getComputedStyle(bubble(failed)).getPropertyValue(prop)).not.toBe(
        getComputedStyle(bubble(fine)).getPropertyValue(prop),
      );
  },
};

export const WideContentTakesTheWholeRow: Story = {
  render: () => (
    <div>
      <ChatMessage role="assistant" avatar={assistantAvatar}>
        Short
      </ChatMessage>
      <ChatMessage role="assistant" avatar={assistantAvatar} wide>
        <Table
          caption="Largest tables"
          columns={[
            { key: "name", header: "Table" },
            { key: "rows", header: "Rows" },
          ]}
          rows={[
            { id: "1", name: "orders", rows: "1.2M" },
            { id: "2", name: "events", rows: "880K" },
          ]}
          getRowId={(row) => row.id}
        />
      </ChatMessage>
      <ChatMessage role="assistant" avatar={assistantAvatar}>
        {"A long answer that keeps going well past the width a narrow bubble allows, so it wraps."}
      </ChatMessage>
    </div>
  ),
  play: async ({ canvas }) => {
    const [short, wide, long] = canvas.getAllByRole("article") as [HTMLElement, HTMLElement, HTMLElement];
    // A short message hugs its text; a wide one takes the whole row after the avatar.
    await expect(rect(bubble(short)).width).toBeLessThan(120);
    await expect(rect(bubble(wide)).right).toBeCloseTo(rect(wide).right, 0);
    // A long one stops short of the row's end.
    await expect(rect(bubble(long)).right).toBeLessThan(rect(long).right - 40);
  },
};

export const RightToLeft: Story = {
  render: () => <Pair dir="rtl" />,
  play: async ({ canvas }) => {
    const [user, assistant] = canvas.getAllByRole("article") as [HTMLElement, HTMLElement];
    const area = rect(canvas.getByTestId("pair"));
    // Mirrored: the person's message on the left, the assistant's avatar on the right.
    await expect(rect(bubble(user)).left).toBeCloseTo(area.left, 0);
    const avatar = assistant.querySelector(".cy-avatar") as HTMLElement;
    await expect(rect(avatar).right).toBeCloseTo(area.right, 0);
    await expect(rect(bubble(assistant)).right).toBeLessThan(rect(avatar).left);
  },
};

export const LabelsName: Story = {
  render: () => (
    <div>
      <ChatMessage role="user" labels={{ user: "Arshad" }}>
        Hi
      </ChatMessage>
      <ChatMessage
        role="assistant"
        labels={{ assistant: "Verql", actions: "Actions du message" }}
        actions={actions}
      >
        Hello
      </ChatMessage>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("article", { name: "Arshad" })).toBeVisible();
    await expect(canvas.getByRole("article", { name: "Verql" })).toBeVisible();
    await expect(canvas.getByRole("toolbar", { name: "Actions du message" })).toBeInTheDocument();
  },
};

export const StableUnderHostileHost: Story = {
  render: () => <Pair />,
  play: async ({ canvasElement }) => {
    const parts: [string, string[]][] = [
      [".cy-chat-message", ["display", "gap", "font-size", "box-sizing", "justify-content"]],
      [
        ".cy-chat-message-bubble",
        ["padding-top", "border-top-width", "font-size", "line-height", "text-transform"],
      ],
      [".cy-chat-message-body", ["display", "max-width", "min-width"]],
    ];
    for (const [selector, props] of parts) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};

function ShadowPair() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    const root = el.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [createStyleSheet()];
    const mount = document.createElement("div");
    root.append(mount);
    createRoot(mount).render(<Pair />);
  }, []);
  return <div data-testid="host" ref={host} />;
}

export const WorksInsideAShadowRoot: Story = {
  render: () => <ShadowPair />,
  play: async ({ canvas }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot?.querySelector(".cy-chat-message-bubble")).toBeTruthy());
    const root = host.shadowRoot as ShadowRoot;
    const user = bubble(root);
    // Its styles reach it inside the shadow root: the person's message is filled and at the end.
    await expect(getComputedStyle(user).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    const row = (root.querySelector(".cy-chat-message") as HTMLElement).getBoundingClientRect();
    await expect(rect(user).right).toBeCloseTo(row.right, 0);
  },
};

const REPLY = "The orders table has 1.2 million rows, and events has 880 thousand.";

/**
 * The thread pattern: a ScrollArea that follows the end while replies stream in, a way back to the end when the person
 * scrolled up (onAtBottomChange), and finished replies announced through useAnnounce instead of a live thread.
 */
function Thread() {
  const announce = useAnnounce();
  const scroller = useRef<ScrollAreaHandle>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [messages, setMessages] = useState<{ id: number; role: "user" | "assistant"; text: string }[]>(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      role: i % 2 ? "assistant" : "user",
      text: i % 2 ? `Answer ${i}: ${"a long line of text ".repeat(4)}` : `Question ${i}`,
    })),
  );
  const [streamed, setStreamed] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  useEffect(() => () => clearInterval(timer.current), []);
  const send = () => {
    setMessages((m) => [...m, { id: m.length, role: "user", text: "How big are the tables?" }]);
    let shown = 0;
    setStreamed("");
    timer.current = setInterval(() => {
      shown += 8;
      if (shown < REPLY.length) return setStreamed(REPLY.slice(0, shown));
      clearInterval(timer.current);
      setStreamed(null);
      setMessages((m) => [...m, { id: m.length, role: "assistant", text: REPLY }]);
      // Only the finished reply is spoken, once; the thread itself is not a live region.
      announce(REPLY);
    }, 30);
  };
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <ScrollArea
        label="Conversation"
        follow
        onAtBottomChange={setAtBottom}
        handle={scroller}
        style={{ blockSize: 240 }}
        overlay={
          !atBottom && (
            <Button size="sm" variant="soft" onClick={() => scroller.current?.scrollToEnd()}>
              Latest
            </Button>
          )
        }
      >
        <div style={{ display: "grid", gap: 8, padding: 8 }}>
          {messages.map((m) => (
            <ChatMessage
              key={m.id}
              role={m.role}
              avatar={m.role === "assistant" ? assistantAvatar : undefined}
            >
              {m.text}
            </ChatMessage>
          ))}
          {streamed !== null && (
            <ChatMessage role="assistant" avatar={assistantAvatar} streaming>
              {streamed}
            </ChatMessage>
          )}
        </div>
      </ScrollArea>
      <Button onClick={send}>Send</Button>
    </div>
  );
}

export const Thread_: Story = {
  name: "Thread",
  render: () => (
    <Announcer>
      <Thread />
    </Announcer>
  ),
  play: async ({ canvas, userEvent }) => {
    const region = canvas.getByRole("region", { name: "Conversation" });
    const atEnd = () => region.scrollHeight - region.scrollTop - region.clientHeight < 2;
    await waitFor(() => expect(atEnd()).toBe(true));
    await userEvent.click(canvas.getByRole("button", { name: "Send" }));
    // While the reply streams in, the thread keeps to the end and says nothing.
    await waitFor(() => expect(region.querySelector(".cy-chat-message-caret")).not.toBeNull());
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("");
    await expect(region).not.toHaveAttribute("aria-live");
    // Finished: the reply is announced once, and the thread is still at the end.
    await waitFor(() => expect(status).toHaveTextContent(REPLY), { timeout: 3000 });
    await expect(region.querySelector(".cy-chat-message-caret")).toBeNull();
    await waitFor(() => expect(atEnd()).toBe(true));
    // Scrolled up to read: a way back to the latest message appears.
    region.scrollTop = 0;
    const latest = await canvas.findByRole("button", { name: "Latest" });
    await userEvent.click(latest);
    await waitFor(() => expect(atEnd()).toBe(true));
    await waitFor(() => expect(canvas.queryByRole("button", { name: "Latest" })).toBeNull());
  },
};

export const LayoutHooks: Story = {
  render: function Render(args) {
    const ref = useRef<HTMLElement>(null);
    const [tag, setTag] = useState("");
    useEffect(() => setTag(ref.current?.tagName ?? ""), []);
    return (
      <div>
        <ChatMessage {...args} ref={ref} className="host-message" style={{ marginBlockEnd: 12 }} />
        <output data-testid="ref">{tag}</output>
      </div>
    );
  },
  play: async ({ canvas }) => {
    const article = canvas.getByRole("article");
    // The ref is the article, which takes the layout class and style.
    await waitFor(() => expect(canvas.getByTestId("ref")).toHaveTextContent("ARTICLE"));
    await expect(article).toHaveClass("cy-chat-message", "host-message");
    await expect(article.style.marginBlockEnd).toBe("12px");
  },
};
