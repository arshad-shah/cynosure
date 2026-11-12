import type { Meta, StoryObj } from "@storybook/react-vite";
import { createRef, type ReactElement } from "react";
import { expect, waitFor } from "storybook/test";
import { Badge } from "../components/Badge/Badge.js";
import { Button } from "../components/Button/Button.js";
import { Checkbox } from "../components/Checkbox/Checkbox.js";
import { Field } from "../components/Field/Field.js";
import { Kbd } from "../components/Kbd/Kbd.js";
import { Link } from "../components/Link/Link.js";
import { LoadingDots } from "../components/LoadingDots/LoadingDots.js";
import { SearchField } from "../components/SearchField/SearchField.js";
import { SegmentedControl } from "../components/SegmentedControl/SegmentedControl.js";
import { TextArea } from "../components/TextArea/TextArea.js";
import { TextField } from "../components/TextField/TextField.js";
import { Tooltip } from "../components/Tooltip/Tooltip.js";
import { ChoiceBase } from "../foundations/ChoiceBase/ChoiceBase.js";
import { InputBase } from "../foundations/InputBase/InputBase.js";
import { calendar, chevronDown } from "../icons/index.js";

/** Cross-component contracts from docs/conventions.md: layout className/style, size defaults, ref forwarding. */
const meta = { title: "Contracts/Layout props and refs" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const layout = { className: "layout-hook", style: { marginInlineStart: 7 } };
const cases: [string, string, ReactElement][] = [
  [
    "badge",
    ".cy-badge",
    <Badge key="b" {...layout}>
      New
    </Badge>,
  ],
  ["kbd", ".cy-kbd", <Kbd key="k" keys={["Esc"]} {...layout} />],
  [
    "link",
    ".cy-link",
    <Link key="l" href="#x" {...layout}>
      Docs
    </Link>,
  ],
  ["dots", ".cy-loading-dots", <LoadingDots key="d" {...layout} />],
  [
    "segmented",
    ".cy-segmented-control",
    <SegmentedControl key="s" label="View" options={[{ value: "a", label: "A" }]} {...layout} />,
  ],
  [
    "field",
    ".cy-field",
    <Field key="f" label="Name" {...layout}>
      {(f) => <InputBase id={f.id} />}
    </Field>,
  ],
  ["checkbox", ".cy-choice", <Checkbox key="c" label="Agree" {...layout} />],
];

export const EveryComponentMergesLayoutClassAndStyle: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {cases.map(([id, , el]) => (
        <div key={id} data-case={id}>
          {el}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const [id, selector] of cases) {
      const el = canvasElement.querySelector(`[data-case="${id}"] ${selector}`) as HTMLElement;
      await expect({ id, merged: el.classList.contains("layout-hook") && el.matches(selector) }).toEqual({
        id,
        merged: true,
      });
      await expect({ id, margin: getComputedStyle(el).marginInlineStart }).toEqual({ id, margin: "7px" });
    }
  },
};

export const DefaultsFollowTheVocabulary: Story = {
  render: () => (
    <div>
      <Badge>Default</Badge>
      <Kbd keys={["K"]} />
      <SegmentedControl label="View" options={[{ value: "a", label: "A" }]} />
      <Field label="Name">{(f) => <InputBase id={f.id} />}</Field>
      <Link href="#y">Inherit</Link>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const attr = (sel: string, a: string) => canvasElement.querySelector(sel)?.getAttribute(a);
    await expect([
      attr(".cy-badge", "data-tone"),
      attr(".cy-badge", "data-variant"),
      attr(".cy-badge", "data-size"),
    ]).toEqual(["neutral", "soft", "md"]);
    await expect(attr(".cy-kbd", "data-size")).toBe("md");
    await expect([
      attr(".cy-segmented-control", "data-size"),
      attr(".cy-segmented-control", "data-tone"),
    ]).toEqual(["md", "neutral"]);
    await expect(attr(".cy-field", "data-size")).toBe("md");
    await expect([attr(".cy-link", "data-tone"), attr(".cy-link", "data-size")]).toEqual([
      "accent",
      "inherit",
    ]);
  },
};

const objectRefs = {
  button: createRef<HTMLButtonElement>(),
  field: createRef<HTMLInputElement>(),
  area: createRef<HTMLTextAreaElement>(),
  choice: createRef<HTMLInputElement>(),
};
const callbackSeen: Record<string, Element | null> = {};

export const RefsForwardAsObjectsAndCallbacks: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, maxWidth: 320 }}>
      <Button ref={objectRefs.button}>Object</Button>
      <TextField ref={objectRefs.field} label="Object field" iconEnd={calendar} />
      <TextField
        ref={(n) => {
          callbackSeen.field = n;
        }}
        label="Callback field"
      />
      <SearchField ref={objectRefs.field} label="Object search" />
      <SearchField
        ref={(n) => {
          callbackSeen.search = n;
        }}
        label="Callback search"
      />
      <TextArea ref={objectRefs.area} label="Object area" />
      <TextArea
        ref={(n) => {
          callbackSeen.area = n;
        }}
        label="Callback area"
      />
      <ChoiceBase ref={objectRefs.choice} type="checkbox" aria-label="Object choice" />
      <ChoiceBase
        ref={(n) => {
          callbackSeen.choice = n;
        }}
        type="checkbox"
        aria-label="Callback choice"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(objectRefs.button.current?.tagName).toBe("BUTTON");
    await expect(objectRefs.field.current?.tagName).toBe("INPUT");
    await expect(objectRefs.area.current?.tagName).toBe("TEXTAREA");
    await expect(objectRefs.choice.current?.type).toBe("checkbox");
    for (const key of ["field", "search", "area", "choice"])
      await expect({ key, tag: callbackSeen[key]?.tagName }).toEqual({
        key,
        tag: key === "area" ? "TEXTAREA" : "INPUT",
      });
    await expect(canvasElement.querySelectorAll(".cy-text-field-icon").length).toBeGreaterThan(0);
  },
};

export const TooltipDefaultsAndRtlStart: Story = {
  render: () => (
    <div dir="rtl" style={{ padding: 120, display: "flex", gap: 24 }}>
      <Tooltip content="Default placement">
        <Button data-testid="default">Default</Button>
      </Tooltip>
      <Tooltip content="Start in RTL" placement="start" delay={0}>
        <Button data-testid="start" icon={chevronDown}>
          Start
        </Button>
      </Tooltip>
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const tips = canvasElement.querySelectorAll<HTMLElement>(".cy-tooltip");
    await userEvent.hover(canvas.getByTestId("start"));
    await waitFor(() => expect(tips[1]?.matches(":popover-open")).toBe(true));
    // In RTL, "start" is the right-hand side.
    await expect((tips[1] as HTMLElement).getBoundingClientRect().left).toBeGreaterThanOrEqual(
      canvas.getByTestId("start").getBoundingClientRect().right,
    );
    await userEvent.unhover(canvas.getByTestId("start"));
    await userEvent.hover(canvas.getByTestId("default"));
    await waitFor(() => expect(tips[0]?.matches(":popover-open")).toBe(true));
    await expect((tips[0] as HTMLElement).getBoundingClientRect().bottom).toBeLessThanOrEqual(
      canvas.getByTestId("default").getBoundingClientRect().top,
    );
  },
};
