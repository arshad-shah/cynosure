import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { expect, userEvent } from "storybook/test";
import { check } from "../../icons/index.js";
import { textContrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Badge } from "./Badge.js";

const TONES = ["accent", "neutral", "danger", "success", "warning", "info"] as const;
const VARIANTS = ["soft", "solid", "outline"] as const;

const meta = {
  title: "Components/Feedback and display/Badge",
  component: Badge,
  args: { children: "Object", tone: "accent", variant: "soft", size: "md" },
  argTypes: {
    tone: { control: "select", options: TONES },
    variant: { control: "inline-radio", options: VARIANTS },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    children: { control: "text" },
  },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const EveryToneAndVariantIsReadable: Story = {
  tags: ["visual"],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, max-content)", gap: 10 }}>
      {TONES.flatMap((tone) =>
        VARIANTS.map((variant) => (
          <Badge
            key={`${tone}-${variant}`}
            tone={tone}
            variant={variant}
            icon={tone === "success" ? check : undefined}
          >
            {tone}
          </Badge>
        )),
      )}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const badges = [...canvasElement.querySelectorAll(".cy-badge")];
    await expect(badges).toHaveLength(18);
    for (const badge of badges)
      await expect({ text: badge.textContent, readable: textContrast(badge) >= 4.5 }).toEqual({
        text: badge.textContent,
        readable: true,
      });
  },
};

export const CategoryColours: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <Badge color="rgb(47 125 74)">GET</Badge>
      <Badge color="rgb(194 65 12)" variant="solid">
        DELETE
      </Badge>
      <Badge color="rgb(47 102 176)" variant="outline">
        PUT
      </Badge>
    </div>
  ),
  play: async ({ canvas }) => {
    const get = canvas.getByText("GET");
    const put = canvas.getByText("PUT");
    // Each takes its own colour; text stays readable (darker than the raw colour on the tinted background).
    await expect(getComputedStyle(get).backgroundColor).not.toBe(getComputedStyle(put).backgroundColor);
    await expect(getComputedStyle(canvas.getByText("DELETE")).backgroundColor).toBe("rgb(194, 65, 12)");
    await expect(get).not.toHaveAttribute("data-tone");
  },
};

export const LiveAndSteadyDots: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <Badge tone="danger" dot="live">
        Recording
      </Badge>
      <Badge tone="success" dot>
        Connected
      </Badge>
    </div>
  ),
  play: async ({ canvas }) => {
    const live = canvas.getByText("Recording").querySelector(".cy-badge-dot") as HTMLElement;
    const steady = canvas.getByText("Connected").querySelector(".cy-badge-dot") as HTMLElement;
    // The dot is decoration: the text says the state.
    await expect(live).toHaveAttribute("aria-hidden", "true");
    await expect(getComputedStyle(live).animationName).toBe("cy-badge-live");
    await expect(getComputedStyle(steady).animationName).toBe("none");
    await expect(getComputedStyle(live).backgroundColor).toBe(
      getComputedStyle(canvas.getByText("Recording")).color,
    );
  },
};

export const DotWithoutText: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Badge tone="success" dot label="Connected" />
      <Badge tone="danger" dot="live" label="Recording" />
      <Badge tone="success" dot>
        Steady
      </Badge>
      <span data-testid="decorative">
        <Badge tone="info" dot /> Synced
      </span>
    </div>
  ),
  play: async ({ canvas }) => {
    // Without a label, a dot alone is decoration (the text beside it says the state): no image, hidden from assistive
    // technology, still drawn.
    await expect(canvas.getAllByRole("img")).toHaveLength(2);
    const decorative = canvas.getByTestId("decorative").querySelector(".cy-badge") as HTMLElement;
    await expect(decorative).toHaveAttribute("aria-hidden", "true");
    await expect(decorative).not.toHaveAttribute("role");
    await expect(decorative.querySelector(".cy-badge-dot")?.getBoundingClientRect().width).toBeGreaterThan(0);
    // A dot alone is a status dot: an image named by `label`, since there is no text to say the state.
    const connected = canvas.getByRole("img", { name: "Connected" });
    const recording = canvas.getByRole("img", { name: "Recording" });
    await expect(connected).toHaveTextContent("");
    await expect(connected).toHaveAttribute("data-tone", "success");
    // Only the dot shows: no pill around it.
    const box = getComputedStyle(connected);
    await expect(box.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    await expect(box.paddingTop).toBe("0px");
    await expect(box.paddingLeft).toBe("0px");
    await expect(box.borderTopWidth).toBe("0px");
    const dot = connected.querySelector(".cy-badge-dot") as HTMLElement;
    const rect = connected.getBoundingClientRect();
    await expect(rect.width).toBeCloseTo(dot.getBoundingClientRect().width, 0);
    await expect(rect.height).toBeLessThanOrEqual(12);
    // The dot is the tone itself (not the darker text shade a badge with text uses), and the live one pulses.
    const pill = getComputedStyle(canvas.getByText("Steady"));
    await expect(getComputedStyle(dot).backgroundColor).not.toBe(pill.color);
    const live = recording.querySelector(".cy-badge-dot") as HTMLElement;
    await expect(getComputedStyle(live).animationName).toBe("cy-badge-live");
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-badge", [
      "font-size",
      "font-weight",
      "text-transform",
      "letter-spacing",
      "padding-top",
      "border-radius",
    ]);
    await expect(hostile).toEqual(clean);
  },
};

export const PassesIdDataAndRef: Story = {
  render: (args) => {
    function WithRef() {
      const ref = useRef<HTMLSpanElement>(null);
      const [seen, setSeen] = useState("");
      useEffect(() => setSeen(ref.current?.dataset.state ?? ""), []);
      return (
        <>
          <Badge tone={args.tone ?? "accent"} ref={ref} id="tip" data-state="ready" data-row={3}>
            Draft
          </Badge>
          <output data-testid="ref">{seen}</output>
        </>
      );
    }
    return <WithRef />;
  },
  play: async ({ canvasElement, canvas }) => {
    const root = canvasElement.querySelector("#tip") as HTMLElement;
    // The id and any data-* attribute land on the component's root, and the ref is that element.
    await expect(root).toHaveClass("cy-badge");
    await expect(root).toHaveAttribute("data-state", "ready");
    await expect(root).toHaveAttribute("data-row", "3");
    await expect(canvas.getByTestId("ref")).toHaveTextContent("ready");
  },
};

function Filters({ initial = ["GET", "Errors", "Last hour"] }: { initial?: string[] }) {
  const [filters, setFilters] = useState(initial);
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {filters.map((f) => (
        <Badge key={f} onRemove={() => setFilters((all) => all.filter((x) => x !== f))}>
          {f}
        </Badge>
      ))}
      <output data-testid="left">{filters.join(",")}</output>
    </div>
  );
}

/** `onRemove` adds a remove IconButton named "Remove <text>": a removable chip (an active filter). */
export const RemovableChip: Story = {
  render: () => <Filters />,
  play: async ({ canvas }) => {
    const left = canvas.getByTestId("left");
    await userEvent.click(canvas.getByRole("button", { name: "Remove GET" }));
    await expect(left).toHaveTextContent(/^Errors,Last hour$/);
    // Keyboard: Tab reaches each remove button; Enter and Space remove.
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Remove Errors" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(left).toHaveTextContent(/^Last hour$/);
    canvas.getByRole("button", { name: "Remove Last hour" }).focus();
    await userEvent.keyboard(" ");
    await expect(left).toBeEmptyDOMElement();
  },
};

/** The remove button reads on every tone and variant, and its name can be replaced through `labels`. */
export const RemovableLabelsAndTones: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, max-content)", gap: 10 }}>
      {TONES.flatMap((tone) =>
        VARIANTS.map((variant) => (
          <Badge key={`${tone}-${variant}`} tone={tone} variant={variant} onRemove={() => {}}>
            {tone}
          </Badge>
        )),
      )}
      <Badge color="#2f7d4a" onRemove={() => {}}>
        Custom
      </Badge>
      <Badge onRemove={() => {}} labels={{ remove: "Filter entfernen" }}>
        <strong>Status</strong>: 500
      </Badge>
      <Badge onRemove={() => {}}>
        <strong>Rich</strong>
      </Badge>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("button", { name: "Filter entfernen" })).toBeVisible();
    // Content that is not plain text gets the plain default.
    await expect(canvas.getByRole("button", { name: "Remove" })).toBeVisible();
    for (const button of canvasElement.querySelectorAll<HTMLElement>(".cy-badge button"))
      await expect({ name: button.getAttribute("aria-label"), readable: textContrast(button) >= 3 }).toEqual({
        name: button.getAttribute("aria-label"),
        readable: true,
      });
    // The chip stays one line tall: the button does not stretch the badge past a small control.
    const badge = canvas.getAllByText("accent", { selector: ".cy-badge" })[0] as HTMLElement;
    const control = Number.parseFloat(getComputedStyle(canvas.getAllByRole("button")[0] as Element).height);
    await expect(badge.getBoundingClientRect().height).toBeLessThanOrEqual(control + 2);
  },
};

/** A finger presses the remove button through a 44px hit area. */
export const TouchRemovesAChip: Story = {
  tags: ["touch", "!dev"],
  render: () => <Filters initial={["GET"]} />,
  play: async ({ canvas }) => {
    const remove = canvas.getByRole("button", { name: "Remove GET" });
    await expect(Number.parseFloat(getComputedStyle(remove, "::before").height)).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: remove });
    await expect(canvas.getByTestId("left")).toBeEmptyDOMElement();
  },
};
