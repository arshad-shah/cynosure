import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useRef, useState } from "react";
import { expect, userEvent, waitFor } from "storybook/test";
import { folder, user } from "../../icons/index.js";
import { textContrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { Avatar, AvatarGroup } from "./Avatar.js";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const TONES = ["accent", "neutral", "danger", "success", "warning", "info"] as const;
const STATUSES = ["online", "away", "busy", "offline"] as const;

/** A picture that loads without the network. */
const PICTURE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23245'/%3E%3Ccircle cx='32' cy='26' r='12' fill='%23fc9'/%3E%3C/svg%3E";
/** A real address with no picture behind it. */
const MISSING = "/no-such-avatar-picture.png";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  args: { name: "Ada Lovelace", size: "md", shape: "circle", tone: "neutral" },
  argTypes: {
    name: { control: "text" },
    initials: { control: "text" },
    src: { control: "text" },
    icon: { control: false },
    size: { control: "inline-radio", options: SIZES },
    shape: { control: "inline-radio", options: ["circle", "square"] },
    tone: { control: "select", options: [...TONES, "auto"] },
    color: { control: "color" },
    status: { control: "select", options: [undefined, ...STATUSES] },
    labels: { control: "object" },
    decorative: { control: "boolean" },
  },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

const row = { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" } as const;
const box = (el: Element) => el.getBoundingClientRect();
const css = (el: Element) => getComputedStyle(el);
const avatars = (root: Element) => [...root.querySelectorAll(".cy-avatar")] as HTMLElement[];
const loaded = (root: Element) =>
  waitFor(() => expect(root.querySelector("img[data-loaded]")).not.toBeNull());

export const NamedPictureOfAPerson: Story = {
  args: { className: "mine", style: { marginInlineStart: 8 } },
  play: async ({ canvas }) => {
    // One image named after the person; the initials inside are not announced separately.
    const avatar = canvas.getByRole("img", { name: "Ada Lovelace" });
    await expect(avatar).toHaveTextContent("AL");
    await expect(canvas.getAllByRole("img")).toHaveLength(1);
    // Not interactive: nothing to tab to.
    await userEvent.tab();
    await expect(avatar.contains(document.activeElement)).toBe(false);
    // className and style land on the root, for layout.
    await expect(avatar).toHaveClass("cy-avatar", "mine");
    await expect(css(avatar).marginInlineStart).toBe("8px");
  },
};

const NAMES: [name: string, initials: string][] = [
  ["Ada Lovelace", "AL"],
  ["Cher", "C"],
  ["ada", "A"],
  ["Gabriel García Márquez", "GM"],
  ["grace brewster hopper", "GH"],
  ["  Alan   Turing  ", "AT"],
  ["Élodie Østergaard", "ÉØ"],
  ["Алексей Петров", "АП"],
  ["王小明", "王"],
  ["山田 太郎", "山太"],
  ["محمد علي", "مع"],
  ["🦊 Fox", "🦊F"],
  ["👩‍🚀 Sally Ride", "👩‍🚀R"],
  ["🇮🇪", "🇮🇪"],
  ["(Guest) @ada", "GA"],
  ["Agent 47", "A4"],
];

export const InitialsComeFromTheName: Story = {
  render: () => (
    <div style={row}>
      {NAMES.map(([name]) => (
        <Avatar key={name} name={name} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const shown = avatars(canvasElement).map((el) => [el.getAttribute("aria-label"), el.textContent]);
    // First letters of the first and last word, upper-cased; whole emoji and non-Latin letters survive.
    await expect(shown).toEqual(NAMES);
  },
};

export const InitialsOverride: Story = {
  args: { name: "Design Systems Team", initials: "DS" },
  play: async ({ canvas }) => {
    const avatar = canvas.getByRole("img", { name: "Design Systems Team" });
    await expect(avatar).toHaveTextContent(/^DS$/);
  },
};

function AddLater() {
  const [shown, setShown] = useState(false);
  return (
    <div style={row}>
      <Button onClick={() => setShown(true)}>Add</Button>
      {shown && <Avatar name="émile 🦊zorro" />}
    </div>
  );
}

export const InitialsWithoutTextSegmentation: Story = {
  render: () => <AddLater />,
  play: async ({ canvas }) => {
    // An engine without Intl.Segmenter still gets whole code points (an emoji is not cut in half).
    const intl = Intl as { Segmenter: unknown };
    const original = intl.Segmenter;
    intl.Segmenter = undefined;
    try {
      await userEvent.click(canvas.getByRole("button", { name: "Add" }));
      await expect(canvas.getByRole("img", { name: "émile 🦊zorro" })).toHaveTextContent(/^É🦊$/u);
    } finally {
      intl.Segmenter = original;
    }
  },
};

export const PictureReplacesTheFallback: Story = {
  args: { src: PICTURE, size: "xl" },
  play: async ({ canvas, canvasElement }) => {
    const avatar = canvas.getByRole("img", { name: "Ada Lovelace" });
    await loaded(canvasElement);
    const picture = avatar.querySelector("img") as HTMLImageElement;
    // The picture fills the avatar and takes its outline; the initials are gone.
    await expect(picture).toBeVisible();
    await expect(box(picture).width).toBe(box(avatar).width);
    await expect(box(picture).height).toBe(box(avatar).height);
    await expect(css(picture).objectFit).toBe("cover");
    await expect(css(picture).borderTopLeftRadius).toBe(css(avatar).borderTopLeftRadius);
    await expect(avatar).toHaveTextContent("");
    // The name is on the avatar; the picture itself is silent.
    await expect(picture).toHaveAttribute("alt", "");
    await expect(canvas.getAllByRole("img")).toHaveLength(1);
  },
};

export const FallbackWhenThePictureFails: Story = {
  args: { src: MISSING, size: "xl" },
  play: async ({ canvas }) => {
    const avatar = canvas.getByRole("img", { name: "Ada Lovelace" });
    // The initials show from the start (while loading) and stay; the broken picture is removed.
    await expect(avatar).toHaveTextContent("AL");
    await waitFor(() => expect(avatar.querySelector("img")).toBeNull());
    await expect(avatar).toHaveTextContent("AL");
  },
};

function Swap() {
  const [src, setSrc] = useState(MISSING);
  return (
    <div style={row}>
      <Avatar name="Ada Lovelace" src={src} />
      <Button onClick={() => setSrc(PICTURE)}>Upload</Button>
      <Button onClick={() => setSrc(MISSING)}>Break</Button>
    </div>
  );
}

export const ANewPictureIsTriedAgain: Story = {
  render: () => <Swap />,
  play: async ({ canvas, canvasElement }) => {
    const avatar = canvas.getByRole("img", { name: "Ada Lovelace" });
    await waitFor(() => expect(avatar.querySelector("img")).toBeNull());
    await userEvent.click(canvas.getByRole("button", { name: "Upload" }));
    await loaded(canvasElement);
    await expect(avatar).toHaveTextContent("");
    // And back: the fallback returns when the next picture fails.
    await userEvent.click(canvas.getByRole("button", { name: "Break" }));
    await waitFor(() => expect(avatar.querySelector("img")).toBeNull());
    await expect(avatar).toHaveTextContent("AL");
  },
};

export const IconFallback: Story = {
  render: () => (
    <div style={row}>
      <Avatar name="?" size="lg" />
      <Avatar name="" size="lg" />
      <Avatar name="Design files" icon={folder} size="lg" />
      <Avatar name="Design files" icon={folder} initials="DF" size="lg" />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const [symbol, nameless, thing, both] = avatars(canvasElement) as [
      HTMLElement,
      HTMLElement,
      HTMLElement,
      HTMLElement,
    ];
    const drawing = (el: Element) => el.querySelector("svg")?.innerHTML;
    // No letter worth showing: the person icon (a head and shoulders), and the name is still spoken.
    await expect(canvas.getByRole("img", { name: "?" })).toBe(symbol);
    await expect(symbol.textContent).toBe("");
    await expect(symbol.querySelectorAll("svg > *")).toHaveLength(user.body.length);
    await expect(symbol.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    // No name at all: the same icon, and nothing nameless is announced.
    await expect(drawing(nameless)).toBe(drawing(symbol));
    await expect(nameless).toHaveAttribute("aria-hidden", "true");
    await expect(nameless).not.toHaveAttribute("role");
    // A thing: its icon instead of initials, still named.
    await expect(thing).toHaveAttribute("aria-label", "Design files");
    await expect(thing.textContent).toBe("");
    await expect(drawing(thing)).not.toBe(drawing(symbol));
    // The icon is half the avatar.
    await expect(box(thing.querySelector("svg") as Element).width).toBe(box(thing).width / 2);
    // Initials given by hand win over the icon.
    await expect(both).toHaveTextContent("DF");
    await expect(both.querySelector("svg")).toBeNull();
  },
};

export const SizesFollowControlHeights: Story = {
  tags: ["visual"],
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={row} data-testid="defaults">
        {SIZES.map((size) => (
          <Avatar key={size} name="Ada Lovelace" size={size} />
        ))}
        {(["sm", "md", "lg"] as const).map((size) => (
          <Button key={size} size={size}>
            {size}
          </Button>
        ))}
      </div>
      <div
        style={
          {
            ...row,
            "--cy-avatar-size-xs": "10px",
            "--cy-avatar-size-sm": "20px",
            "--cy-avatar-size-md": "30px",
            "--cy-avatar-size-lg": "50px",
            "--cy-avatar-size-xl": "70px",
          } as CSSProperties
        }
        data-testid="tokens"
      >
        {SIZES.map((size) => (
          <Avatar key={size} name="Ada Lovelace" size={size} src={PICTURE} />
        ))}
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const defaults = canvas.getByTestId("defaults");
    const [xs, sm, md, lg, xl] = avatars(defaults).map((el) => box(el)) as [
      DOMRect,
      DOMRect,
      DOMRect,
      DOMRect,
      DOMRect,
    ];
    const [smButton, mdButton, lgButton] = [...defaults.querySelectorAll("button")].map(
      (el) => box(el).height,
    );
    // sm, md and lg are the control heights, so an avatar lines up with a button or a field of the same size.
    await expect([sm.height, md.height, lg.height]).toEqual([smButton, mdButton, lgButton]);
    await expect(xs.height).toBeCloseTo(md.height * 0.625, 1);
    await expect(xl.height).toBeCloseTo(md.height * 1.75, 1);
    for (const rect of [xs, sm, md, lg, xl]) await expect(rect.width).toBe(rect.height);
    // The initials scale with the avatar.
    const fonts = avatars(defaults).map((el) => Number.parseFloat(css(el).fontSize));
    await expect(fonts).toEqual([...fonts].sort((a, b) => a - b));
    await expect(new Set(fonts).size).toBe(5);
    // Each size reads its own token.
    const themed = avatars(canvas.getByTestId("tokens")).map((el) => [box(el).width, box(el).height]);
    await expect(themed).toEqual([
      [10, 10],
      [20, 20],
      [30, 30],
      [50, 50],
      [70, 70],
    ]);
  },
};

export const CircleAndSquare: Story = {
  render: () => (
    <div style={row}>
      <Avatar name="Ada Lovelace" size="lg" />
      <Avatar name="Cynosure" shape="square" size="lg" />
      <Avatar name="Cynosure" shape="square" size="xl" src={PICTURE} />
      <Avatar name="Cynosure" shape="square" style={{ "--cy-avatar-radius": "3px" } as CSSProperties} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [circle, square, large, themed] = avatars(canvasElement) as [
      HTMLElement,
      HTMLElement,
      HTMLElement,
      HTMLElement,
    ];
    const radius = (el: Element) => Number.parseFloat(css(el).borderTopLeftRadius);
    const factor = Number.parseFloat(css(square).getPropertyValue("--cy-radius-factor"));
    // A circle: the radius is at least half the avatar.
    await expect(radius(circle)).toBeGreaterThanOrEqual(box(circle).width / 2);
    // A square rounds like a control of its size: its size times the theme's radius factor.
    await expect(radius(square)).toBeCloseTo(box(square).width * factor, 1);
    await expect(radius(large)).toBeCloseTo(box(large).width * factor, 1);
    await expect(radius(square)).toBeLessThan(box(square).width / 2);
    await expect(radius(themed)).toBe(3);
  },
};

export const TonesAndOneOffColour: Story = {
  tags: ["visual"],
  render: () => (
    <div style={row}>
      {TONES.map((tone) => (
        <Avatar key={tone} name={`${tone} tone`} tone={tone} size="lg" />
      ))}
      <Avatar name="Custom colour" color="rgb(150 60 200)" size="lg" />
      <Avatar name="Design files" icon={folder} color="rgb(150 60 200)" tone="danger" size="lg" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const all = avatars(canvasElement);
    const toned = all.slice(0, TONES.length);
    // Each tone tints the fallback differently, and its initials stay readable.
    await expect(new Set(toned.map((el) => css(el).backgroundColor)).size).toBe(TONES.length);
    await expect(new Set(toned.map((el) => css(el).color)).size).toBe(TONES.length);
    for (const el of all.slice(0, 7))
      await expect({
        name: el.getAttribute("aria-label"),
        readable: textContrast(el.querySelector(".cy-avatar-initials") as Element) >= 4.5,
      }).toEqual({ name: el.getAttribute("aria-label"), readable: true });
    // `color` replaces the tone, also for the icon fallback.
    const [custom, icon] = all.slice(TONES.length) as [HTMLElement, HTMLElement];
    await expect(custom).not.toHaveAttribute("data-tone");
    await expect(icon).not.toHaveAttribute("data-tone");
    await expect(css(icon).backgroundColor).toBe(css(custom).backgroundColor);
    await expect(toned.map((el) => css(el).backgroundColor)).not.toContain(css(custom).backgroundColor);
    await expect(css(icon.querySelector("svg") as Element).color).toBe(css(custom).color);
  },
};

const PEOPLE = [
  "Ada Lovelace",
  "Grace Hopper",
  "Alan Turing",
  "Katherine Johnson",
  "Barbara Liskov",
  "Margaret Hamilton",
];

export const AutoToneFollowsTheName: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {["first", "again"].map((id) => (
        <div key={id} style={row} data-testid={id}>
          {PEOPLE.map((name) => (
            <Avatar key={name} name={name} tone="auto" />
          ))}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const tones = (id: string) => avatars(canvas.getByTestId(id)).map((el) => el.getAttribute("data-tone"));
    // The same name gets the same tone wherever and whenever it renders (no randomness, so the server agrees).
    await expect(tones("first")).toEqual(["warning", "danger", "info", "success", "accent", "warning"]);
    await expect(tones("again")).toEqual(tones("first"));
    // Different people get different tones, and the colours on screen differ with them.
    const [ada, grace] = avatars(canvas.getByTestId("first")) as [HTMLElement, HTMLElement];
    await expect(css(ada).backgroundColor).not.toBe(css(grace).backgroundColor);
    // Decoration only: every avatar still carries its name.
    await expect(canvas.getAllByRole("img", { name: "Ada Lovelace" })).toHaveLength(2);
  },
};

export const StatusIsSpokenWithTheName: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={row}>
        {STATUSES.map((status) => (
          <Avatar key={status} name="Ada Lovelace" status={status} size="lg" />
        ))}
        <Avatar name="Ada Lovelace" size="lg" />
      </div>
      <div style={row} dir="rtl">
        <Avatar name="آدا" status="online" labels={{ online: "متصلة" }} size="lg" />
        <Avatar name="Ada Lovelace" status="busy" labels={{ online: "en ligne" }} size="lg" decorative />
      </div>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const dot = (el: Element) => el.querySelector(".cy-avatar-status") as HTMLElement;
    const named = STATUSES.map((status) => canvas.getByRole("img", { name: `Ada Lovelace, ${status}` }));
    // Colour is not the only signal: the status is part of the name.
    await expect(named).toHaveLength(4);
    const plain = canvas.getByRole("img", { name: "Ada Lovelace" });
    await expect(dot(plain)).toBeNull();
    // Each status has its own dot, at the bottom end corner.
    await expect(new Set(named.map((el) => css(dot(el)).borderTopColor)).size).toBe(4);
    for (const el of named) {
      await expect(box(dot(el)).right).toBeCloseTo(box(el).right, 0);
      await expect(box(dot(el)).bottom).toBeCloseTo(box(el).bottom, 0);
      await expect(box(dot(el)).width).toBeCloseTo(box(el).width * 0.28, 0);
    }
    // Offline is hollow, so it differs from the others by more than colour.
    const [online, , , offline] = named as [HTMLElement, HTMLElement, HTMLElement, HTMLElement];
    await expect(css(dot(online)).backgroundColor).toBe(css(dot(online)).borderTopColor);
    await expect(css(dot(offline)).backgroundColor).not.toBe(css(dot(offline)).borderTopColor);
    // Translated through `labels`; in right-to-left text the dot moves to the left corner.
    const arabic = canvas.getByRole("img", { name: "آدا, متصلة" });
    await expect(box(dot(arabic)).left).toBeCloseTo(box(arabic).left, 0);
    // A label for another status leaves the built-in word; a decorative avatar says nothing but keeps its dot.
    const quiet = avatars(canvasElement).at(-1) as HTMLElement;
    await expect(quiet).not.toHaveAttribute("aria-label");
    await expect(dot(quiet)).toBeVisible();
  },
};

export const StatusLabelFallsBackToEnglish: Story = {
  args: { status: "busy", labels: { online: "en ligne" } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: "Ada Lovelace, busy" })).toBeVisible();
  },
};

export const DecorativeBesideAWrittenName: Story = {
  args: { decorative: true, src: PICTURE },
  render: (args) => (
    <div style={row}>
      <Avatar {...args} />
      <span>Ada Lovelace</span>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    // The name is read once, from the text; the avatar is hidden from assistive technology.
    await expect(canvas.queryByRole("img")).toBeNull();
    const avatar = canvasElement.querySelector(".cy-avatar") as HTMLElement;
    await expect(avatar).toHaveAttribute("aria-hidden", "true");
    await expect(avatar).not.toHaveAttribute("role");
    await expect(avatar).not.toHaveAttribute("aria-label");
    await expect(canvas.getAllByText("Ada Lovelace")).toHaveLength(1);
    await loaded(canvasElement);
  },
};

function Measured() {
  const ref = useRef<HTMLSpanElement>(null);
  const group = useRef<HTMLDivElement>(null);
  const [tags, setTags] = useState("");
  return (
    <div style={row}>
      <AvatarGroup ref={group} label="Authors" className="mine" style={{ marginInlineStart: 8 }}>
        <Avatar ref={ref} name="Ada Lovelace" />
      </AvatarGroup>
      <Button onClick={() => setTags(`${ref.current?.tagName} ${group.current?.tagName}`)}>Measure</Button>
      <output>{tags}</output>
    </div>
  );
}

export const RefsReachTheRootElements: Story = {
  render: () => <Measured />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Measure" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("SPAN DIV");
    const group = canvas.getByRole("group", { name: "Authors" });
    await expect(group).toHaveClass("cy-avatar-group", "mine");
    await expect(css(group).marginInlineStart).toBe("8px");
  },
};

const people = (count: number) =>
  PEOPLE.slice(0, count).map((name) => <Avatar key={name} name={name} tone="auto" />);

export const GroupSummarisesTheRest: Story = {
  tags: ["visual"],
  render: () => (
    <div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      <AvatarGroup label="Reviewers" max={3}>
        {people(6)}
      </AvatarGroup>
      <AvatarGroup label="Authors" max={3}>
        {people(3)}
      </AvatarGroup>
      <AvatarGroup label="Everyone">{people(5)}</AvatarGroup>
      <AvatarGroup
        label="Équipe"
        max={2}
        labels={{ more: (count, names) => `${count} autres (${names.join(" et ")})` }}
      >
        {people(4)}
      </AvatarGroup>
      <AvatarGroup label="Nobody shown" max={-1}>
        {people(2)}
      </AvatarGroup>
    </div>
  ),
  play: async ({ canvas }) => {
    const names = (group: Element) => avatars(group).map((el) => el.getAttribute("aria-label"));
    // Three shown, then one avatar that counts and names the hidden three.
    const reviewers = canvas.getByRole("group", { name: "Reviewers" });
    await expect(names(reviewers)).toEqual([
      "Ada Lovelace",
      "Grace Hopper",
      "Alan Turing",
      "3 more: Katherine Johnson, Barbara Liskov, Margaret Hamilton",
    ]);
    await expect(avatars(reviewers).at(-1)).toHaveTextContent(/^\+3$/);
    // Exactly `max`, or no `max`: everyone is shown and nothing is summarised.
    await expect(names(canvas.getByRole("group", { name: "Authors" }))).toEqual(PEOPLE.slice(0, 3));
    await expect(names(canvas.getByRole("group", { name: "Everyone" }))).toEqual(PEOPLE.slice(0, 5));
    // The summary's words come from `labels.more`.
    const team = canvas.getByRole("group", { name: "Équipe" });
    await expect(names(team)).toEqual([
      "Ada Lovelace",
      "Grace Hopper",
      "2 autres (Alan Turing et Katherine Johnson)",
    ]);
    // A nonsense `max` hides everyone behind the count instead of breaking.
    await expect(names(canvas.getByRole("group", { name: "Nobody shown" }))).toEqual([
      "2 more: Ada Lovelace, Grace Hopper",
    ]);
  },
};

export const GroupSetsTheSize: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      {SIZES.map((size) => (
        <AvatarGroup key={size} label={size} size={size} max={2}>
          <Avatar name="Ada Lovelace" size="xl" />
          <Avatar name="Grace Hopper" />
          <Avatar name="Alan Turing" />
        </AvatarGroup>
      ))}
      <AvatarGroup label="default" max={2}>
        <Avatar name="Ada Lovelace" size="xl" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Alan Turing" />
      </AvatarGroup>
      <Avatar name="Standalone" size="xl" />
    </div>
  ),
  play: async ({ canvas }) => {
    const sizes = (name: string) =>
      avatars(canvas.getByRole("group", { name })).map((el) => el.getAttribute("data-size"));
    // Every avatar, the "+1" included, takes the group's size whatever its own says.
    for (const size of SIZES) await expect(sizes(size)).toEqual([size, size, size]);
    await expect(sizes("default")).toEqual(["md", "md", "md"]);
    const widths = SIZES.map(
      (size) => box(avatars(canvas.getByRole("group", { name: size }))[0] as Element).width,
    );
    await expect(widths).toEqual([...widths].sort((a, b) => a - b));
    await expect(new Set(widths).size).toBe(5);
    // Outside a group an avatar keeps its own size.
    await expect(canvas.getByRole("img", { name: "Standalone" })).toHaveAttribute("data-size", "xl");
  },
};

export const GroupOverlapsAlongTheReadingDirection: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      <AvatarGroup label="Left to right" size="lg">
        {people(3)}
      </AvatarGroup>
      <div dir="rtl">
        <AvatarGroup label="Right to left" size="lg">
          {people(3)}
        </AvatarGroup>
      </div>
      <AvatarGroup label="Tighter" size="lg" style={{ "--cy-avatar-overlap": "20px" } as CSSProperties}>
        {people(3)}
      </AvatarGroup>
      <div data-testid="surface" style={{ background: "var(--cy-color-surface)" }} />
    </div>
  ),
  play: async ({ canvas }) => {
    const rects = (name: string) => avatars(canvas.getByRole("group", { name })).map((el) => box(el));
    const [a, b, c] = rects("Left to right") as [DOMRect, DOMRect, DOMRect];
    // Each avatar slides a quarter of its width over the one before it.
    await expect(b.left).toBeCloseTo(a.right - a.width * 0.25, 1);
    await expect(c.left).toBeCloseTo(b.right - b.width * 0.25, 1);
    await expect(a.top).toBe(b.top);
    // Right to left: the first is on the right and the next ones overlap towards the left.
    const [x, y, z] = rects("Right to left") as [DOMRect, DOMRect, DOMRect];
    await expect(y.right).toBeCloseTo(x.left + x.width * 0.25, 1);
    await expect(z.right).toBeCloseTo(y.left + y.width * 0.25, 1);
    await expect(y.left).toBeLessThan(x.left);
    // The overlap is a token.
    const [p, q] = rects("Tighter") as [DOMRect, DOMRect];
    await expect(q.left).toBeCloseTo(p.right - 20, 1);
    // Each grouped avatar has a ring in the surface colour so the overlapping edges read; a lone avatar has none.
    const surface = css(canvas.getByTestId("surface")).backgroundColor;
    for (const el of avatars(canvas.getByRole("group", { name: "Left to right" }))) {
      await expect(css(el).boxShadow).toContain(surface);
      await expect(css(el).boxShadow).toMatch(/0px 0px 0px [1-9]/);
    }
  },
};

export const LoneAvatarHasNoRing: Story = {
  play: async ({ canvas }) => {
    await expect(css(canvas.getByRole("img", { name: "Ada Lovelace" })).boxShadow).toBe("none");
  },
};

export const StableUnderHostileHost: Story = {
  render: () => (
    <AvatarGroup label="Team" max={3}>
      <Avatar name="Ada Lovelace" tone="accent" status="online" />
      <Avatar name="Grace Hopper" src={PICTURE} shape="square" />
      <Avatar name="?" />
      <Avatar name="Alan Turing" />
      <Avatar name="Barbara Liskov" />
    </AvatarGroup>
  ),
  play: async ({ canvasElement }) => {
    await loaded(canvasElement);
    const parts: [selector: string, props: string[]][] = [
      [
        ".cy-avatar",
        [
          "display",
          "width",
          "height",
          "margin-inline-start",
          "padding-top",
          "border-top-width",
          "border-radius",
          "background-color",
          "color",
          "font-size",
          "font-weight",
          "line-height",
          "letter-spacing",
          "text-transform",
          "box-sizing",
        ],
      ],
      [".cy-avatar + .cy-avatar", ["margin-inline-start", "box-shadow", "border-radius"]],
      [".cy-avatar-initials", ["font-size", "font-weight", "line-height", "letter-spacing", "color"]],
      [".cy-avatar-image", ["display", "width", "height", "max-width", "position", "border-top-width"]],
      [".cy-avatar-status", ["width", "height", "border-top-width", "background-color", "box-sizing"]],
      [".cy-avatar .cy-icon", ["width", "height", "display", "color"]],
      [".cy-avatar-group", ["display", "width", "height", "font-size", "line-height", "box-sizing"]],
    ];
    for (const [selector, props] of parts) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
