import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { code, info, list, plus } from "../../icons/index.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { realHover } from "../../test/hover.js";
import { asIfPrinting } from "../../test/print.js";
import { shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Tab, TabList, TabPanel, Tabs } from "./Tabs.js";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  args: { defaultValue: "tree", activation: "auto", size: "md", variant: "line", onChange: fn() },
  argTypes: {
    activation: { control: "inline-radio", options: ["auto", "manual"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    variant: { control: "inline-radio", options: ["line", "soft"] },
  },
  render: (args) => (
    <Tabs {...args}>
      <TabList label="Document views">
        <Tab value="tree" icon={list}>
          Tree
        </Tab>
        <Tab value="raw" icon={code}>
          Raw
        </Tab>
        <Tab value="schema" disabled>
          Schema
        </Tab>
        <Tab value="info" icon={info}>
          Info
        </Tab>
      </TabList>
      <TabPanel value="tree">Tree panel</TabPanel>
      <TabPanel value="raw">Raw panel</TabPanel>
      <TabPanel value="schema">Schema panel</TabPanel>
      <TabPanel value="info">Info panel</TabPanel>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

const selected = (canvas: { getAllByRole: (r: "tab") => HTMLElement[] }) =>
  canvas.getAllByRole("tab").find((t) => t.getAttribute("aria-selected") === "true")?.textContent;

export const ArrowsSelectSkippingDisabled: Story = {
  tags: ["visual"],
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("tab", { name: "Tree" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(selected(canvas)).toBe("Raw");
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("Raw panel");
    await expect(args.onChange).toHaveBeenLastCalledWith("raw");
    await userEvent.keyboard("{ArrowRight}");
    await expect(selected(canvas)).toBe("Info");
    await userEvent.keyboard("{Home}");
    await expect(selected(canvas)).toBe("Tree");
    await userEvent.keyboard("{End}");
    await expect(selected(canvas)).toBe("Info");
    // Tab moves on to the panel, not along the tabs.
    await userEvent.tab();
    await expect(canvas.getByRole("tabpanel")).toHaveFocus();
  },
};

export const ManualActivationNeedsEnterOrSpace: Story = {
  args: { activation: "manual" },
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "Raw" })).toHaveFocus();
    await expect(selected(canvas)).toBe("Tree");
    await userEvent.keyboard("{Enter}");
    await expect(selected(canvas)).toBe("Raw");
    await userEvent.keyboard("{ArrowRight} ");
    await expect(selected(canvas)).toBe("Info");
  },
};

export const AriaIsWired: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("tablist")).not.toHaveAttribute("data-more-end");
    await expect(canvas.getByRole("tablist", { name: "Document views" })).toHaveAttribute(
      "aria-orientation",
      "horizontal",
    );
    const tab = canvas.getByRole("tab", { name: "Tree" });
    const panel = canvas.getByRole("tabpanel");
    await expect(tab).toHaveAttribute("aria-selected", "true");
    await expect(tab.getAttribute("aria-controls")).toBe(panel.id);
    await expect(panel.getAttribute("aria-labelledby")).toBe(tab.id);
    await expect(panel).toHaveAccessibleName("Tree");
    // Hidden panels stay in the DOM (so aria-controls resolves) but are hidden.
    const raw = document.getElementById(
      canvas.getByRole("tab", { name: "Raw" }).getAttribute("aria-controls") as string,
    );
    await expect(raw).toBeTruthy();
    await expect(raw).not.toBeVisible();
    await expect(canvasElement.querySelectorAll('[role="tab"][tabindex="0"]').length).toBe(1);
  },
};

export const PointerAndControlled: Story = {
  render: () => {
    function Controlled() {
      const [value, setValue] = useState("b");
      return (
        <>
          <Tabs value={value} onChange={setValue}>
            <TabList label="Controlled">
              <Tab value="a">Alpha</Tab>
              <Tab value="b">Beta</Tab>
            </TabList>
            <TabPanel value="a">A</TabPanel>
            <TabPanel value="b">B</TabPanel>
          </Tabs>
          <Button onClick={() => setValue("a")}>Show alpha</Button>
          <span data-testid="value">{value}</span>
        </>
      );
    }
    return <Controlled />;
  },
  play: async ({ canvas, userEvent }) => {
    await expect(selected(canvas)).toBe("Beta");
    await userEvent.click(canvas.getByRole("tab", { name: "Alpha" }));
    await expect(canvas.getByTestId("value")).toHaveTextContent("a");
    await userEvent.click(canvas.getByRole("tab", { name: "Beta" }));
    await userEvent.click(canvas.getByRole("button", { name: "Show alpha" }));
    await expect(selected(canvas)).toBe("Alpha");
    // The Tab stop follows a selection made from outside.
    await waitFor(() => expect(canvas.getByRole("tab", { name: "Alpha" }).tabIndex).toBe(0));
  },
};

function Removable() {
  const [tabs, setTabs] = useState(["one", "two", "three"]);
  const [value, setValue] = useState("two");
  return (
    <>
      <Tabs value={value} onChange={setValue}>
        <TabList label="Files">
          {tabs.map((t) => (
            <Tab key={t} value={t}>
              {t}
            </Tab>
          ))}
        </TabList>
        {tabs.map((t) => (
          <TabPanel key={t} value={t}>
            Panel {t}
          </TabPanel>
        ))}
      </Tabs>
      <Button onClick={() => setTabs((all) => all.filter((t) => t !== value))}>Close current</Button>
    </>
  );
}

export const RemovingTheSelectedTabSelectsTheNextOne: Story = {
  render: () => <Removable />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Close current" }));
    await waitFor(() => expect(selected(canvas)).toBe("three"));
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("Panel three");
    // Removing the last one falls back to the previous.
    await userEvent.click(canvas.getByRole("button", { name: "Close current" }));
    await waitFor(() => expect(selected(canvas)).toBe("one"));
  },
};

export const OverflowScrollsTheActiveTabIntoView: Story = {
  render: () => (
    <div style={{ width: 260 }}>
      <Tabs defaultValue="t0">
        <TabList label="Many">
          {Array.from({ length: 10 }, (_, i) => (
            <Tab key={i} value={`t${i}`}>
              Section {i + 1}
            </Tab>
          ))}
        </TabList>
      </Tabs>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const listEl = canvas.getByRole("tablist");
    await expect(listEl.scrollWidth).toBeGreaterThan(listEl.clientWidth);
    await expect(listEl.getBoundingClientRect().width).toBeLessThanOrEqual(260);
    // Edges with hidden tabs fade, so it is clear there is more to scroll to.
    await waitFor(() => expect(listEl).toHaveAttribute("data-more-end"));
    await expect(listEl).not.toHaveAttribute("data-more-start");
    await expect(getComputedStyle(listEl).maskImage).not.toBe("none");
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    const last = canvas.getByRole("tab", { name: "Section 10" });
    await expect(last).toHaveFocus();
    await waitFor(() => {
      const l = listEl.getBoundingClientRect();
      const t = last.getBoundingClientRect();
      expect(t.right).toBeLessThanOrEqual(l.right + 1);
      expect(t.left).toBeGreaterThanOrEqual(l.left - 1);
    });
    await waitFor(() => expect(listEl).toHaveAttribute("data-more-start"));
    await expect(listEl).not.toHaveAttribute("data-more-end");
    // A tab revealed mid-list clears the faded edge, so it is never shown washed out.
    await userEvent.keyboard("{Home}{ArrowRight}{ArrowRight}{ArrowRight}");
    const mid = canvas.getByRole("tab", { name: "Section 4" });
    await waitFor(() => {
      const fade = Number.parseFloat(getComputedStyle(listEl).getPropertyValue("--cy-space-9"));
      const t = mid.getBoundingClientRect();
      const l = listEl.getBoundingClientRect();
      expect(t.right).toBeLessThanOrEqual(l.right - fade + 1);
      expect(t.left).toBeGreaterThanOrEqual(l.left + fade - 1);
    });
  },
};

export const RightToLeftFlipsArrows: Story = {
  render: (args) => (
    <div dir="rtl">
      <Tabs {...args} defaultValue="a">
        <TabList label="RTL">
          <Tab value="a">Alpha</Tab>
          <Tab value="b">Beta</Tab>
        </TabList>
      </Tabs>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(selected(canvas)).toBe("Beta");
  },
};

export const TouchSelects: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, userEvent }) => {
    const raw = canvas.getByRole("tab", { name: "Raw" });
    const hit = getComputedStyle(raw, "::before");
    await expect(
      Math.max(raw.getBoundingClientRect().height, Number.parseFloat(hit.height) || 0),
    ).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: raw });
    await expect(selected(canvas)).toBe("Raw");
  },
};

export const SelectedTabIsMarkedVisually: Story = {
  args: { variant: "line" },
  play: async ({ canvas }) => {
    const on = getComputedStyle(canvas.getByRole("tab", { name: "Tree" }));
    const off = getComputedStyle(canvas.getByRole("tab", { name: "Raw" }));
    await expect(on.color).not.toBe(off.color);
    await expect(on.boxShadow).not.toBe(off.boxShadow);
  },
};

/** An editor's open files: closable, reorderable document tabs. */
function OpenFiles({ onClose }: { onClose?: (file: string) => void }) {
  const [files, setFiles] = useState(["a.ts", "b.ts", "c.ts"]);
  const [current, setCurrent] = useState("a.ts");
  return (
    <Tabs value={current} onChange={setCurrent}>
      <TabList label="Open files" onReorder={setFiles}>
        {files.map((f) => (
          <Tab
            key={f}
            value={f}
            onClose={() => {
              onClose?.(f);
              setFiles((all) => all.filter((x) => x !== f));
            }}
          >
            {f}
          </Tab>
        ))}
      </TabList>
      {files.map((f) => (
        <TabPanel key={f} value={f}>
          Editing {f}
        </TabPanel>
      ))}
      <span data-testid="order" hidden>
        {files.join(",")}
      </span>
    </Tabs>
  );
}
const orderOf = (el: Element) => (el.querySelector('[data-testid="order"]') as HTMLElement).textContent;
const closeButton = (el: Element, name: string) =>
  el.querySelector(`[aria-label="Close ${name}"]`) as HTMLElement;

export const ClosableTabs: Story = {
  render: () => {
    const spy = fn();
    (window as unknown as { tabsClosed: typeof spy }).tabsClosed = spy;
    return <OpenFiles onClose={spy} />;
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const closed = (window as unknown as { tabsClosed: ReturnType<typeof fn> }).tabsClosed;
    const b = canvas.getByRole("tab", { name: "b.ts" });
    await expect(b).toHaveAttribute("aria-keyshortcuts", "Delete");
    // The close button is for the pointer: out of the tab order and the accessibility tree; Delete is the keyboard's.
    await expect(closeButton(canvasElement, "b.ts").closest('[aria-hidden="true"]')).not.toBeNull();
    await expect(closeButton(canvasElement, "b.ts")).toHaveAttribute("tabindex", "-1");
    await userEvent.click(closeButton(canvasElement, "b.ts"));
    await expect(closed).toHaveBeenLastCalledWith("b.ts");
    await expect(orderOf(canvasElement)).toBe("a.ts,c.ts");
    await expect(selected(canvas)).toBe("a.ts");
    // Delete closes the focused tab; the one now in its place is selected and focused.
    await userEvent.tab();
    await expect(canvas.getByRole("tab", { name: "a.ts" })).toHaveFocus();
    await userEvent.keyboard("{Delete}");
    await expect(orderOf(canvasElement)).toBe("c.ts");
    await waitFor(() => expect(canvas.getByRole("tab", { name: "c.ts" })).toHaveFocus());
    await expect(selected(canvas)).toBe("c.ts");
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("Editing c.ts");
    // Tab still goes from the tabs to the panel, past the close button.
    await userEvent.tab();
    await expect(canvas.getByRole("tabpanel")).toHaveFocus();
  },
};

export const ReorderWithTheKeyboard: Story = {
  render: () => <OpenFiles />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{Control>}{Shift>}{ArrowRight}{/Shift}{/Control}");
    await expect(orderOf(canvasElement)).toBe("b.ts,a.ts,c.ts");
    await waitFor(() => expect(canvas.getByRole("tab", { name: "a.ts" })).toHaveFocus());
    await expect(canvas.getByRole("status")).toHaveTextContent("Moved a.ts to position 2 of 3");
    // Cmd works as Ctrl does; the ends stop it.
    await userEvent.keyboard("{Meta>}{Shift>}{ArrowRight}{ArrowRight}{/Shift}{/Meta}");
    await expect(orderOf(canvasElement)).toBe("b.ts,c.ts,a.ts");
    await userEvent.keyboard("{Control>}{Shift>}{ArrowLeft}{/Shift}{/Control}");
    await expect(orderOf(canvasElement)).toBe("b.ts,a.ts,c.ts");
    // Plain arrows still move between tabs and do not reorder.
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "c.ts" })).toHaveFocus();
    await expect(orderOf(canvasElement)).toBe("b.ts,a.ts,c.ts");
  },
};

export const DragToReorder: Story = {
  render: () => <OpenFiles />,
  play: async ({ canvas, canvasElement }) => {
    const a = canvas.getByRole("tab", { name: "a.ts" });
    const from = a.getBoundingClientRect();
    const last = canvas.getByRole("tab", { name: "c.ts" }).getBoundingClientRect();
    const init = {
      bubbles: true,
      cancelable: true,
      pointerId: 6,
      pointerType: "mouse",
      isPrimary: true,
      button: 0,
      buttons: 1,
    };
    const y = from.top + from.height / 2;
    a.dispatchEvent(new PointerEvent("pointerdown", { ...init, clientX: from.left + 6, clientY: y }));
    for (const x of [from.left + 20, last.left + 10, last.right - 4])
      a.dispatchEvent(new PointerEvent("pointermove", { ...init, clientX: x, clientY: y }));
    a.dispatchEvent(
      new PointerEvent("pointerup", { ...init, buttons: 0, clientX: last.right - 4, clientY: y }),
    );
    await waitFor(() => expect(orderOf(canvasElement)).toBe("b.ts,c.ts,a.ts"));
    await expect(canvas.getByRole("status")).toHaveTextContent("Moved a.ts to position 3 of 3");
    // A press on a close button closes, it does not start a drag.
    const close = closeButton(canvasElement, "b.ts");
    const c = close.getBoundingClientRect();
    close.dispatchEvent(
      new PointerEvent("pointerdown", { ...init, clientX: c.left + 2, clientY: c.top + 2 }),
    );
    close.dispatchEvent(
      new PointerEvent("pointermove", { ...init, clientX: c.left + 80, clientY: c.top + 2 }),
    );
    close.dispatchEvent(
      new PointerEvent("pointerup", { ...init, buttons: 0, clientX: c.left + 80, clientY: c.top + 2 }),
    );
    await expect(orderOf(canvasElement)).toBe("b.ts,c.ts,a.ts");
  },
};

export const RightToLeftReorderAndBackspace: Story = {
  render: () => (
    <div dir="rtl">
      <OpenFiles />
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.tab();
    // In right-to-left text, Left moves a tab toward the end.
    await userEvent.keyboard("{Control>}{Shift>}{ArrowLeft}{/Shift}{/Control}");
    await expect(orderOf(canvasElement)).toBe("b.ts,a.ts,c.ts");
    // With nothing but Ctrl (or only Shift), arrows only move focus.
    await userEvent.keyboard("{Shift>}{ArrowLeft}{/Shift}");
    await expect(orderOf(canvasElement)).toBe("b.ts,a.ts,c.ts");
    await userEvent.keyboard("{Control>}{Shift>}{Home}{/Shift}{/Control}");
    await expect(orderOf(canvasElement)).toBe("b.ts,a.ts,c.ts");
    // Backspace closes too, like Delete.
    canvas.getByRole("tab", { name: "a.ts" }).focus();
    await userEvent.keyboard("{Backspace}");
    await expect(orderOf(canvasElement)).toBe("b.ts,c.ts");
    await waitFor(() => expect(canvas.getByRole("tab", { name: "c.ts" })).toHaveFocus());
    // Other keys on a closable tab do nothing to it.
    await userEvent.keyboard("x");
    await expect(orderOf(canvasElement)).toBe("b.ts,c.ts");
  },
};

export const CloseLabelsOverride: Story = {
  render: () => (
    <Tabs defaultValue="x" labels={{ close: (n) => `Fermer ${n}` }}>
      <TabList label="Fichiers">
        <Tab value="x" onClose={() => {}}>
          <strong>x.ts</strong>
        </Tab>
        <Tab value="q-7f3a" onClose={() => {}} closeLabel="Fermer la requête 3">
          <strong>Requête 3</strong> <em>non enregistrée</em>
        </Tab>
        <Tab value="y" onClose={() => {}}>
          y.ts
        </Tab>
      </TabList>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const closeNames = () =>
      [...canvasElement.querySelectorAll(".cy-tab-close [aria-label]")].map((b) =>
        b.getAttribute("aria-label"),
      );
    // A label that is not plain text is named by its text, never by the tab's value; `closeLabel` names it outright.
    await waitFor(() => expect(closeNames()).toEqual(["Fermer x.ts", "Fermer la requête 3", "Fermer y.ts"]));
  },
};

export const ValuesThatDifferOnlyInPunctuationGetTheirOwnIds: Story = {
  render: () => (
    <Tabs defaultValue="a b">
      <TabList label="Queries">
        <Tab value="a b">Space</Tab>
        <Tab value="a_b">Underscore</Tab>
        <Tab value="a.b">Dot</Tab>
      </TabList>
      <TabPanel value="a b" keepMounted>
        Space panel
      </TabPanel>
      <TabPanel value="a_b" keepMounted>
        Underscore panel
      </TabPanel>
      <TabPanel value="a.b" keepMounted>
        Dot panel
      </TabPanel>
    </Tabs>
  ),
  play: async ({ canvas, canvasElement }) => {
    const tabs = canvas.getAllByRole("tab");
    // Every tab and panel has its own id, so each tab controls its own panel and each panel is named by its own tab.
    const ids = [...canvasElement.querySelectorAll("[id]")].map((el) => el.id);
    await expect(new Set(ids).size).toBe(ids.length);
    for (const tab of tabs) {
      const panel = document.getElementById(tab.getAttribute("aria-controls") as string) as HTMLElement;
      await expect(panel).toHaveTextContent(`${tab.textContent} panel`);
      await expect(document.getElementById(panel.getAttribute("aria-labelledby") as string)).toBe(tab);
    }
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = ["height", "font-size", "padding-left", "border-top-width", "background-color", "color"];
    const tab = computeUnderHostileHost(canvasElement, '[role="tab"]', props);
    await expect(tab.hostile).toEqual(tab.clean);
  },
};

export const OverflowInRightToLeft: Story = {
  render: () => (
    <div dir="rtl" style={{ width: 260 }}>
      <Tabs defaultValue="t0">
        <TabList label="Many RTL">
          {Array.from({ length: 10 }, (_, i) => (
            <Tab key={i} value={`t${i}`}>
              Section {i + 1}
            </Tab>
          ))}
        </TabList>
      </Tabs>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const listEl = canvas.getByRole("tablist");
    // Settled state (Firefox updates the two edges a frame apart).
    await waitFor(() => {
      expect(listEl).toHaveAttribute("data-more-end");
      expect(listEl).not.toHaveAttribute("data-more-start");
    });
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    const last = canvas.getByRole("tab", { name: "Section 10" });
    await waitFor(() => {
      const l = listEl.getBoundingClientRect();
      const t = last.getBoundingClientRect();
      expect(t.left).toBeGreaterThanOrEqual(l.left - 1);
      expect(t.right).toBeLessThanOrEqual(l.right + 1);
    });
    await waitFor(() => expect(listEl).toHaveAttribute("data-more-start"));
  },
};

export const DefaultsToTheFirstEnabledTab: Story = {
  render: () => (
    <Tabs className="host-tabs">
      <TabList label="Defaults" className="host-list">
        <Tab value="off" disabled>
          Off
        </Tab>
        <Tab value="on">On</Tab>
      </TabList>
      <TabPanel value="on" className="host-panel">
        On panel
      </TabPanel>
    </Tabs>
  ),
  play: async ({ canvas, canvasElement }) => {
    await waitFor(() => expect(selected(canvas)).toBe("On"));
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("On panel");
    // Layout classes land on each part.
    await expect(canvasElement.querySelector(".cy-tabs.host-tabs")).toBeTruthy();
    await expect(canvas.getByRole("tablist")).toHaveClass("host-list");
    await expect(canvas.getByRole("tabpanel")).toHaveClass("host-panel");
  },
};

function Draft() {
  const [text, setText] = useState("");
  return <input aria-label="Draft" value={text} onChange={(e) => setText(e.target.value)} />;
}

export const KeepMountedPreservesPanelState: Story = {
  render: () => (
    <Tabs defaultValue="kept">
      <TabList label="State">
        <Tab value="kept">Kept</Tab>
        <Tab value="fresh">Fresh</Tab>
        <Tab value="other">Other</Tab>
      </TabList>
      <TabPanel value="kept" keepMounted>
        <Draft />
      </TabPanel>
      <TabPanel value="fresh">
        <Draft />
      </TabPanel>
      <TabPanel value="other">Other</TabPanel>
    </Tabs>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "Draft" }), "kept text");
    await userEvent.click(canvas.getByRole("tab", { name: "Fresh" }));
    await userEvent.type(canvas.getByRole("textbox", { name: "Draft" }), "fresh text");
    await userEvent.click(canvas.getByRole("tab", { name: "Other" }));
    await userEvent.click(canvas.getByRole("tab", { name: "Kept" }));
    await expect(canvas.getByRole("textbox", { name: "Draft" })).toHaveValue("kept text");
    await userEvent.click(canvas.getByRole("tab", { name: "Fresh" }));
    await expect(canvas.getByRole("textbox", { name: "Draft" })).toHaveValue("");
  },
};

function RemovableBeforeDisabled() {
  const [tabs, setTabs] = useState(["a", "b"]);
  return (
    <Tabs defaultValue="a">
      <TabList label="Files">
        {tabs.map((t) => (
          <Tab key={t} value={t}>
            {t}
          </Tab>
        ))}
        <Tab value="locked" disabled>
          locked
        </Tab>
      </TabList>
      <Button onClick={() => setTabs(["b"])}>Close a</Button>
      <Button onClick={() => setTabs([])}>Close all</Button>
    </Tabs>
  );
}

export const RemovalSkipsDisabledNeighbours: Story = {
  render: () => <RemovableBeforeDisabled />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Close a" }));
    await waitFor(() => expect(selected(canvas)).toBe("b"));
    // Only a disabled tab left: nothing selectable, nothing selected.
    await userEvent.click(canvas.getByRole("button", { name: "Close all" }));
    await expect(canvas.getByRole("tab", { name: "locked" })).toHaveAttribute("aria-selected", "false");
  },
};

export const ManualActivationDoesNotSelectOnFocus: Story = {
  args: { activation: "manual" },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    await expect(canvas.getByRole("tab", { name: "Info" })).toHaveFocus();
    await expect(selected(canvas)).toBe("Tree");
    // Re-selecting the current tab does not report a change.
    await userEvent.keyboard("{Home}{Enter}");
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const PrintsEveryPanel: Story = {
  render: () => (
    <Tabs defaultValue="one">
      <TabList label="Sections">
        <Tab value="one">One</Tab>
        <Tab value="two">Two</Tab>
        <Tab value="three">Three</Tab>
      </TabList>
      <TabPanel value="one">First panel</TabPanel>
      <TabPanel value="two">Second panel</TabPanel>
      <TabPanel value="three" keepMounted>
        Third panel
      </TabPanel>
    </Tabs>
  ),
  play: async ({ canvas }) => {
    // On screen only the selected panel shows, and unselected ones have no content unless kept mounted.
    await expect(canvas.queryByText("Second panel")).toBeNull();
    await expect(canvas.getByText("Third panel").checkVisibility()).toBe(false);
    const stop = asIfPrinting();
    try {
      // On paper every panel is there, in order.
      const texts = ["First panel", "Second panel", "Third panel"];
      for (const text of texts) await expect(canvas.getByText(text).checkVisibility()).toBe(true);
      const tops = texts.map((t) => canvas.getByText(t).getBoundingClientRect().top);
      await expect([...tops].sort((a, b) => a - b)).toEqual(tops);
    } finally {
      stop();
    }
    // After printing the screen is as it was.
    await waitFor(() => expect(canvas.queryByText("Second panel")).toBeNull());
    await expect(canvas.getByRole("tab", { name: "One" })).toHaveAttribute("aria-selected", "true");
  },
};

/** An editor's tab strip: closable, reorderable, some with unsaved changes. */
function Editor({
  initial = ["a.ts", "b.ts", "c.ts"],
  dirty = [],
  width,
  dir,
  onClose,
}: {
  initial?: string[];
  dirty?: string[];
  width?: number;
  dir?: "rtl";
  onClose?: (file: string) => void;
}) {
  const [files, setFiles] = useState(initial);
  const [current, setCurrent] = useState(initial[0] as string);
  const close = (f: string) => {
    onClose?.(f);
    setFiles((all) => all.filter((x) => x !== f));
  };
  return (
    <div dir={dir} style={width ? { width } : undefined}>
      <Tabs value={current} onChange={setCurrent}>
        <TabList label="Open files" onReorder={setFiles}>
          {files.map((f) => (
            <Tab key={f} value={f} dirty={dirty.includes(f)} onClose={() => close(f)}>
              {f}
            </Tab>
          ))}
        </TabList>
        {files.map((f) => (
          <TabPanel key={f} value={f}>
            Editing {f}
          </TabPanel>
        ))}
      </Tabs>
      <span data-testid="order" hidden>
        {files.join(",")}
      </span>
    </div>
  );
}
const slotOf = (tab: HTMLElement) => tab.closest(".cy-tab-slot") as HTMLElement;
const dotOf = (tab: HTMLElement) => slotOf(tab).querySelector(".cy-tab-dirty") as HTMLElement;
const closeOf = (tab: HTMLElement) => slotOf(tab).querySelector(".cy-tab-close") as HTMLElement;
const shows = (el: HTMLElement) => getComputedStyle(el).opacity === "1";
const spied = () => {
  const spy = fn();
  (window as unknown as { tabsClosed: typeof spy }).tabsClosed = spy;
  return spy;
};
const closedSpy = () => (window as unknown as { tabsClosed: ReturnType<typeof fn> }).tabsClosed;

export const UnsavedTabShowsADotThatBecomesTheCloseButton: Story = {
  tags: ["visual"],
  render: () => <Editor dirty={["a.ts", "b.ts"]} onClose={spied()} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const a = canvas.getByRole("tab", { name: "a.ts" });
    const b = canvas.getByRole("tab", { name: "b.ts" });
    const c = canvas.getByRole("tab", { name: "c.ts" });
    // The name stays the file's; the unsaved state is the tab's description.
    await expect(b).toHaveAccessibleDescription("Unsaved changes");
    await expect(c).not.toHaveAccessibleDescription("Unsaved changes");
    await expect(closeOf(b).querySelector("[aria-label]")).toHaveAttribute(
      "aria-label",
      "Close b.ts, unsaved changes",
    );
    await expect(closeOf(c).querySelector("[aria-label]")).toHaveAttribute("aria-label", "Close c.ts");
    // At rest the dot sits where the close button is, selected or not; a saved tab has no dot.
    await waitFor(() => {
      expect(shows(dotOf(a))).toBe(true);
      expect(shows(dotOf(b))).toBe(true);
      expect(shows(closeOf(b))).toBe(false);
      expect(shows(closeOf(a))).toBe(false);
    });
    await expect(dotOf(c)).toBeNull();
    const dot = dotOf(b).getBoundingClientRect();
    const button = closeOf(b).getBoundingClientRect();
    await expect(Math.abs(dot.left + dot.width / 2 - (button.left + button.width / 2))).toBeLessThan(1.5);
    // Keyboard focus on the tab turns its dot into the close button.
    await userEvent.tab();
    await expect(a).toHaveFocus();
    await waitFor(() => {
      expect(shows(dotOf(a))).toBe(false);
      expect(shows(closeOf(a))).toBe(true);
    });
    await userEvent.click(closeOf(b).querySelector("[aria-label]") as HTMLElement);
    await expect(closedSpy()).toHaveBeenLastCalledWith("b.ts");
    await expect(orderOf(canvasElement)).toBe("a.ts,c.ts");
  },
};

export const HoverTurnsTheDotIntoTheCloseButton: Story = {
  tags: ["!dev"],
  render: () => <Editor dirty={["a.ts", "b.ts"]} />,
  play: async ({ canvas }) => {
    const b = canvas.getByRole("tab", { name: "b.ts" });
    await waitFor(() => expect(shows(dotOf(b)), "dot at rest").toBe(true));
    if (!(await realHover(b))) return;
    await waitFor(() => {
      expect(shows(dotOf(b)), "dot on hover").toBe(false);
      expect(shows(closeOf(b)), "close on hover").toBe(true);
    });
    // Only the hovered tab changes.
    await expect(shows(dotOf(canvas.getByRole("tab", { name: "a.ts" })))).toBe(true);
    await realHover(b, false);
    await waitFor(() => {
      expect(shows(dotOf(b)), "dot after hover").toBe(true);
      expect(shows(closeOf(b)), "close after hover").toBe(false);
    });
  },
};

export const UnsavedLabelsOverride: Story = {
  render: () => (
    <Tabs defaultValue="x" labels={{ unsaved: "Modifié", closeUnsaved: (n) => `Fermer ${n} (modifié)` }}>
      <TabList label="Fichiers">
        <Tab value="x" dirty onClose={() => {}}>
          x.ts
        </Tab>
        <Tab value="y" dirty>
          y.ts
        </Tab>
      </TabList>
    </Tabs>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("tab", { name: "x.ts" })).toHaveAccessibleDescription("Modifié");
    await expect(canvasElement.querySelector(".cy-tab-close [aria-label]")).toHaveAttribute(
      "aria-label",
      "Fermer x.ts (modifié)",
    );
    // Unsaved without a close button: the dot alone, and the same description.
    const y = canvas.getByRole("tab", { name: "y.ts" });
    await expect(y).toHaveAccessibleDescription("Modifié");
    await expect(closeOf(y)).toBeNull();
    await waitFor(() => expect(shows(dotOf(y))).toBe(true));
  },
};

export const MiddleClickCloses: Story = {
  render: () => <Editor onClose={spied()} />,
  play: async ({ canvas, canvasElement }) => {
    const b = canvas.getByRole("tab", { name: "b.ts" });
    const at = { bubbles: true, cancelable: true, button: 1, buttons: 4 };
    // The press does not start the browser's autoscroll.
    const press = new MouseEvent("mousedown", at);
    b.dispatchEvent(press);
    await expect(press.defaultPrevented).toBe(true);
    b.dispatchEvent(new MouseEvent("mouseup", { ...at, buttons: 0 }));
    b.dispatchEvent(new MouseEvent("auxclick", { ...at, buttons: 0 }));
    await expect(closedSpy()).toHaveBeenLastCalledWith("b.ts");
    await expect(orderOf(canvasElement)).toBe("a.ts,c.ts");
    // The selected tab stays selected; other buttons do not close.
    await expect(selected(canvas)).toBe("a.ts");
    const c = canvas.getByRole("tab", { name: "c.ts" });
    c.dispatchEvent(new MouseEvent("auxclick", { ...at, button: 2, buttons: 0 }));
    const left = new MouseEvent("mousedown", { ...at, button: 0, buttons: 1 });
    c.dispatchEvent(left);
    await expect(left.defaultPrevented).toBe(false);
    await expect(orderOf(canvasElement)).toBe("a.ts,c.ts");
  },
};

export const MiddleClickLeavesTabsThatCannotClose: Story = {
  play: async ({ canvas }) => {
    const raw = canvas.getByRole("tab", { name: "Raw" });
    const press = new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 1, buttons: 4 });
    raw.dispatchEvent(press);
    // A tab with no onClose keeps the browser's own middle-click behaviour.
    await expect(press.defaultPrevented).toBe(false);
    raw.dispatchEvent(new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: 1 }));
    await expect(canvas.getAllByRole("tab")).toHaveLength(4);
  },
};

export const TouchRevealsTheCloseButtonOfAnUnsavedTab: Story = {
  tags: ["touch", "!dev"],
  render: () => <Editor dirty={["b.ts"]} onClose={spied()} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const b = canvas.getByRole("tab", { name: "b.ts" });
    await waitFor(() => expect(shows(dotOf(b))).toBe(true));
    // A tap selects the tab and shows its close button in place of the dot.
    await userEvent.pointer({ keys: "[TouchA]", target: b });
    await expect(selected(canvas)).toBe("b.ts");
    await waitFor(() => expect(shows(closeOf(b))).toBe(true));
    const button = closeOf(b).querySelector("[aria-label]") as HTMLElement;
    const hit = getComputedStyle(button, "::before");
    await expect(
      Math.max(button.getBoundingClientRect().height, Number.parseFloat(hit.height) || 0),
    ).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: button });
    await expect(closedSpy()).toHaveBeenLastCalledWith("b.ts");
    await expect(orderOf(canvasElement)).toBe("a.ts,c.ts");
  },
};

export const UnsavedTabsInRightToLeft: Story = {
  render: () => <Editor dir="rtl" dirty={["b.ts"]} />,
  play: async ({ canvas }) => {
    const b = canvas.getByRole("tab", { name: "b.ts" });
    // The dot sits at the tab's end, which is its left edge in right-to-left text.
    await waitFor(() => expect(shows(dotOf(b))).toBe(true));
    const dot = dotOf(b).getBoundingClientRect();
    const label = (b.querySelector(".cy-tab-label") as HTMLElement).getBoundingClientRect();
    await expect(dot.right).toBeLessThanOrEqual(label.left);
  },
};

export const UnsavedTabStableUnderHostileHost: Story = {
  render: () => <Editor dirty={["a.ts"]} />,
  play: async ({ canvasElement }) => {
    const props = ["width", "height", "background-color", "border-radius", "opacity", "inset-inline-end"];
    const dot = computeUnderHostileHost(canvasElement, ".cy-tab-dirty", props);
    await expect(dot.hostile).toEqual(dot.clean);
  },
};

/** Many open files in a narrow strip, with a new-file button after the last tab. */
function ManyFiles({ count = 12, width = 320, dir }: { count?: number; width?: number; dir?: "rtl" }) {
  const [files, setFiles] = useState(() => Array.from({ length: count }, (_, i) => `file-${i + 1}.ts`));
  const [current, setCurrent] = useState("file-1.ts");
  return (
    <div dir={dir} style={{ width }}>
      <Tabs value={current} onChange={setCurrent}>
        <TabList
          label="Open files"
          scrollable
          end={
            <IconButton
              icon={plus}
              label="New file"
              variant="ghost"
              size="sm"
              onClick={() => {
                const next = `file-${files.length + 1}.ts`;
                setFiles((all) => [...all, next]);
                setCurrent(next);
              }}
            />
          }
        >
          {files.map((f) => (
            <Tab key={f} value={f} onClose={() => setFiles((all) => all.filter((x) => x !== f))}>
              {f}
            </Tab>
          ))}
        </TabList>
      </Tabs>
    </div>
  );
}
const scroller = (root: HTMLElement, name: "back" | "forward") =>
  root.querySelector(`[aria-label="Scroll tabs ${name}"]`) as HTMLElement;
/** Visible and taking part in layout (a hidden chevron keeps its space but is not painted or pressable). */
const visible = (el: HTMLElement) => el.checkVisibility({ visibilityProperty: true });
/** How far along the strip has scrolled, from its start (RTL scrollLeft runs from 0 down to -max). */
const along = (list: HTMLElement) => Math.abs(list.scrollLeft);

export const ScrollableShowsChevronsTowardMoreTabs: Story = {
  tags: ["visual"],
  render: () => <ManyFiles />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const list = canvas.getByRole("tablist");
    const back = scroller(canvasElement, "back");
    const forward = scroller(canvasElement, "forward");
    await expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
    // At the start, only the forward chevron shows; neither is in the tab order or the accessibility tree.
    await waitFor(() => {
      expect(visible(forward)).toBe(true);
      expect(visible(back)).toBe(false);
    });
    for (const chevron of [back, forward]) {
      await expect(chevron).toHaveAttribute("tabindex", "-1");
      await expect(chevron.closest('[aria-hidden="true"]')).not.toBeNull();
      await expect(chevron.closest('[role="tablist"]')).toBeNull();
    }
    // Pressing it scrolls the strip forward, and then there is something back too.
    await userEvent.click(forward);
    await waitFor(() => expect(along(list)).toBeGreaterThan(list.clientWidth / 2));
    await waitFor(() => expect(visible(back)).toBe(true));
    // Back returns to the start, where the back chevron goes away again.
    await userEvent.click(back);
    await waitFor(() => expect(along(list)).toBe(0));
    await waitFor(() => expect(visible(back)).toBe(false));
    // The selection is untouched: the chevrons only scroll.
    await expect(selected(canvas)).toBe("file-1.ts");
    // At the far end the forward chevron goes.
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    await waitFor(() => expect(visible(forward)).toBe(false));
    await expect(visible(back)).toBe(true);
    // Arrows keep the focused tab in view.
    const last = canvas.getByRole("tab", { name: "file-12.ts" });
    await expect(last).toHaveFocus();
    await waitFor(() => {
      const l = list.getBoundingClientRect();
      const t = last.getBoundingClientRect();
      expect(t.right).toBeLessThanOrEqual(l.right + 1);
      expect(t.left).toBeGreaterThanOrEqual(l.left - 1);
    });
  },
};

export const WheelScrollsTheStripSideways: Story = {
  render: () => <ManyFiles />,
  play: async ({ canvas }) => {
    const list = canvas.getByRole("tablist");
    const wheel = (deltaY: number, extra: WheelEventInit = {}) => {
      const event = new WheelEvent("wheel", { deltaY, bubbles: true, cancelable: true, ...extra });
      (canvas.getByRole("tab", { name: "file-2.ts" }) as HTMLElement).dispatchEvent(event);
      return event;
    };
    // A vertical wheel turn moves the strip along, instead of scrolling the page.
    await expect(wheel(120).defaultPrevented).toBe(true);
    await waitFor(() => expect(along(list)).toBeGreaterThanOrEqual(100));
    const at = along(list);
    await expect(wheel(-60).defaultPrevented).toBe(true);
    await waitFor(() => expect(along(list)).toBeLessThan(at));
    // Back at the start, a turn toward the start has nowhere to go and is left to the page.
    list.scrollLeft = 0;
    await waitFor(() => expect(along(list)).toBe(0));
    await expect(wheel(-60).defaultPrevented).toBe(false);
    // Ctrl+wheel (zoom) and sideways wheels are the browser's.
    await expect(wheel(120, { ctrlKey: true }).defaultPrevented).toBe(false);
    await expect(wheel(0, { deltaX: 120 }).defaultPrevented).toBe(false);
  },
};

export const ScrollableInRightToLeft: Story = {
  render: () => <ManyFiles dir="rtl" />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const list = canvas.getByRole("tablist");
    const back = scroller(canvasElement, "back");
    const forward = scroller(canvasElement, "forward");
    await waitFor(() => {
      expect(visible(forward)).toBe(true);
      expect(visible(back)).toBe(false);
    });
    // Forward is on the left in right-to-left text, and its chevron points left.
    const strip = list.getBoundingClientRect();
    await expect(forward.getBoundingClientRect().right).toBeLessThanOrEqual(strip.left + 1);
    await userEvent.click(forward);
    await waitFor(() => expect(list.scrollLeft).toBeLessThan(-list.clientWidth / 2));
    await waitFor(() => expect(visible(back)).toBe(true));
    await expect(back.getBoundingClientRect().left).toBeGreaterThanOrEqual(strip.right - 1);
    // The wheel moves toward the end, leftwards.
    list.scrollTo({ left: 0, behavior: "instant" });
    await waitFor(() => expect(list.scrollLeft).toBe(0));
    const event = new WheelEvent("wheel", { deltaY: 120, bubbles: true, cancelable: true });
    list.dispatchEvent(event);
    await expect(event.defaultPrevented).toBe(true);
    await waitFor(() => expect(list.scrollLeft).toBeLessThanOrEqual(-100));
  },
};

export const ScrollableThatFitsShowsNoChevrons: Story = {
  render: () => <ManyFiles count={2} width={600} />,
  play: async ({ canvas, canvasElement }) => {
    const list = canvas.getByRole("tablist");
    await expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
    // Nothing to scroll to: no chevrons, and they take no room.
    await expect(visible(scroller(canvasElement, "back"))).toBe(false);
    await expect(visible(scroller(canvasElement, "forward"))).toBe(false);
    await expect(scroller(canvasElement, "back").getBoundingClientRect().width).toBe(0);
    const first = canvas.getByRole("tab", { name: "file-1.ts" });
    await expect(
      Math.abs(first.getBoundingClientRect().left - list.getBoundingClientRect().left),
    ).toBeLessThan(1);
  },
};

export const EndSlotSitsAfterTheLastTab: Story = {
  render: () => <ManyFiles count={2} width={600} />,
  play: async ({ canvas, userEvent }) => {
    const add = canvas.getByRole("button", { name: "New file" });
    // Outside the tablist (which holds only tabs), right after the last tab, and in the Tab order after the tabs.
    await expect(add.closest('[role="tablist"]')).toBeNull();
    const last = () => slotOf(canvas.getAllByRole("tab").at(-1) as HTMLElement);
    const gap = add.getBoundingClientRect().left - last().getBoundingClientRect().right;
    await expect(gap).toBeGreaterThanOrEqual(0);
    await expect(gap).toBeLessThan(16);
    await userEvent.tab();
    await userEvent.tab();
    await expect(add).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getAllByRole("tab")).toHaveLength(3);
    await expect(selected(canvas)).toBe("file-3.ts");
    await expect(add.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      last().getBoundingClientRect().right,
    );
  },
};

export const EndSlotStaysInViewWhenTabsOverflow: Story = {
  render: () => <ManyFiles />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const add = canvas.getByRole("button", { name: "New file" });
    const box = (canvasElement.querySelector(".cy-tab-strip") as HTMLElement).getBoundingClientRect();
    await expect(box.width).toBeLessThanOrEqual(320);
    await expect(add.getBoundingClientRect().right).toBeLessThanOrEqual(box.right + 1);
    await expect(add.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      scroller(canvasElement, "forward").getBoundingClientRect().right - 1,
    );
    // A new tab is selected and scrolled into view.
    await userEvent.click(add);
    const tab = canvas.getByRole("tab", { name: "file-13.ts" });
    const list = canvas.getByRole("tablist");
    await waitFor(() => {
      expect(tab.getBoundingClientRect().right).toBeLessThanOrEqual(list.getBoundingClientRect().right + 1);
    });
  },
};

export const TouchScrollsWithChevrons: Story = {
  tags: ["touch", "!dev"],
  render: () => <ManyFiles />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const list = canvas.getByRole("tablist");
    const forward = scroller(canvasElement, "forward");
    await waitFor(() => expect(visible(forward)).toBe(true));
    const hit = getComputedStyle(forward, "::before");
    await expect(
      Math.max(forward.getBoundingClientRect().height, Number.parseFloat(hit.height) || 0),
    ).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: forward });
    await waitFor(() => expect(along(list)).toBeGreaterThan(0));
    await expect(selected(canvas)).toBe("file-1.ts");
  },
};

export const ScrollableStableUnderHostileHost: Story = {
  render: () => <ManyFiles />,
  play: async ({ canvasElement }) => {
    const props = ["display", "height", "width", "padding-left", "gap", "overflow-x"];
    for (const selector of ['[role="tablist"]', ".cy-tab-strip"]) {
      const result = computeUnderHostileHost(canvasElement, selector, props);
      await expect(result.hostile).toEqual(result.clean);
    }
  },
};

/** Document tabs with the usual commands on each tab's context menu. */
function FilesWithMenus({ onCommand }: { onCommand?: (command: string, file: string) => void }) {
  const [files, setFiles] = useState(["a.ts", "b.ts", "c.ts", "d.ts"]);
  const [current, setCurrent] = useState("a.ts");
  const run = (command: string, f: string) => {
    onCommand?.(command, f);
    if (command === "close") setFiles((all) => all.filter((x) => x !== f));
    if (command === "others") setFiles([f]);
    if (command === "right") setFiles((all) => all.slice(0, all.indexOf(f) + 1));
  };
  return (
    <Tabs value={current} onChange={setCurrent}>
      <TabList label="Open files" onReorder={setFiles}>
        {files.map((f, i) => (
          <Tab
            key={f}
            value={f}
            onClose={() => run("close", f)}
            contextMenu={[
              { value: "close", label: "Close", shortcut: ["Delete"] },
              { value: "others", label: "Close others", disabled: files.length < 2 },
              { value: "right", label: "Close to the right", disabled: i === files.length - 1 },
              { value: "copy", label: "Copy path" },
            ]}
            onContextMenuSelect={(command) => run(command, f)}
          >
            {f}
          </Tab>
        ))}
      </TabList>
      {files.map((f) => (
        <TabPanel key={f} value={f}>
          Editing {f}
        </TabPanel>
      ))}
      <span data-testid="order" hidden>
        {files.join(",")}
      </span>
    </Tabs>
  );
}
const menuPanel = () => document.querySelector('[role="menu"]:popover-open') as HTMLElement | null;
const commands = () => (window as unknown as { tabCommands: ReturnType<typeof fn> }).tabCommands;
const withCommands = () => {
  const spy = fn();
  (window as unknown as { tabCommands: typeof spy }).tabCommands = spy;
  return <FilesWithMenus onCommand={spy} />;
};

export const RightClickOpensTheTabsMenu: Story = {
  render: withCommands,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const c = canvas.getByRole("tab", { name: "c.ts" });
    await userEvent.pointer({ keys: "[MouseRight]", target: c });
    await waitFor(() => expect(menuPanel()).not.toBeNull());
    await shownFully(menuPanel() as HTMLElement);
    await expect(menuPanel()).toHaveAccessibleName("c.ts actions");
    await userEvent.click(within(menuPanel() as HTMLElement).getByRole("menuitem", { name: "Close others" }));
    await expect(commands()).toHaveBeenLastCalledWith("others", "c.ts");
    await expect(orderOf(canvasElement)).toBe("c.ts");
    await waitFor(() => expect(selected(canvas)).toBe("c.ts"));
    await waitFor(() => expect(menuPanel()).toBeNull());
  },
};

export const AnOpenMenuStaysOutsideTheTabList: Story = {
  render: withCommands,
  play: async ({ canvas, userEvent }) => {
    const b = canvas.getByRole("tab", { name: "b.ts" });
    await userEvent.pointer({ keys: "[MouseRight]", target: b });
    await waitFor(() => expect(menuPanel()).not.toBeNull());
    await shownFully(menuPanel() as HTMLElement);
    // A tablist may hold only tabs, so the menu is beside it (the accessibility check runs with the menu open).
    await expect((menuPanel() as HTMLElement).closest('[role="tablist"]')).toBeNull();
    await expect(menuPanel()).toHaveAccessibleName("b.ts actions");
  },
};

export const ShiftF10OpensTheMenuFromTheKeyboard: Story = {
  render: withCommands,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    const b = canvas.getByRole("tab", { name: "b.ts" });
    await expect(b).toHaveFocus();
    // Both keyboard ways in are announced.
    await expect(b.getAttribute("aria-keyshortcuts")?.split(" ")).toEqual(["Delete", "Shift+F10"]);
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await waitFor(() => expect(menuPanel()).not.toBeNull());
    await waitFor(() => expect(document.activeElement).toHaveTextContent("Close"));
    // Escape closes it and puts focus back on the tab.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(menuPanel()).toBeNull());
    await expect(b).toHaveFocus();
    // The context menu key opens it too; a command that keeps the tab returns focus to it.
    await userEvent.keyboard("{ContextMenu}");
    await waitFor(() => expect(menuPanel()).not.toBeNull());
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    await expect(commands()).toHaveBeenLastCalledWith("right", "b.ts");
    await expect(orderOf(canvasElement)).toBe("a.ts,b.ts");
    await waitFor(() => expect(b).toHaveFocus());
    // Closing the tab itself from its menu moves focus to the tab now selected, as Delete does.
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await waitFor(() => expect(menuPanel()).not.toBeNull());
    await userEvent.keyboard("{Enter}");
    await expect(orderOf(canvasElement)).toBe("a.ts");
    await waitFor(() => expect(canvas.getByRole("tab", { name: "a.ts" })).toHaveFocus());
    // Arrows still move between tabs while no menu is open (they are not swallowed by the menu's target).
    await expect(selected(canvas)).toBe("a.ts");
  },
};

export const ACommandThatKeepsTheTabLeavesFocusAlone: Story = {
  render: withCommands,
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    const a = canvas.getByRole("tab", { name: "a.ts" });
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await waitFor(() => expect(menuPanel()).not.toBeNull());
    await userEvent.keyboard("{End}{Enter}");
    await expect(commands()).toHaveBeenLastCalledWith("copy", "a.ts");
    await waitFor(() => expect(a).toHaveFocus());
    // A later click elsewhere is not pulled back to the tab the menu belonged to.
    const c = canvas.getByRole("tab", { name: "c.ts" });
    await userEvent.click(c);
    await expect(c).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("tab", { name: "b.ts" })).toHaveFocus();
  },
};

export const LongPressOpensTheMenuOnTouch: Story = {
  tags: ["touch", "!dev"],
  render: withCommands,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const b = canvas.getByRole("tab", { name: "b.ts" });
    await userEvent.pointer([{ keys: "[TouchA>]", target: b }]);
    await waitFor(() => expect(menuPanel()).not.toBeNull(), { timeout: 2000 });
    await userEvent.pointer([{ keys: "[/TouchA]", target: b }]);
    await expect(menuPanel()).toHaveAccessibleName("b.ts actions");
    // The tabs are reorderable too: a press held still opens the menu and moves nothing.
    await expect(orderOf(canvasElement)).toBe("a.ts,b.ts,c.ts,d.ts");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(menuPanel()).toBeNull());
  },
};

export const ContextMenuLabelsOverride: Story = {
  render: () => (
    <Tabs defaultValue="x" labels={{ menu: (n) => `Actions de ${n}` }}>
      <TabList label="Fichiers">
        <Tab value="x" contextMenu={[{ value: "close", label: "Fermer" }]} onContextMenuSelect={() => {}}>
          x.ts
        </Tab>
      </TabList>
    </Tabs>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.pointer({ keys: "[MouseRight]", target: canvas.getByRole("tab", { name: "x.ts" }) });
    await waitFor(() => expect(menuPanel()).toHaveAccessibleName("Actions de x.ts"));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(menuPanel()).toBeNull());
  },
};

const LONG = "monthly-revenue-by-region-and-product-line-2026.sql";

function LongNames() {
  return (
    <Tabs defaultValue="long">
      <TabList label="Queries">
        <Tab value="long" onClose={() => {}}>
          {LONG}
        </Tab>
        <Tab value="short">users.sql</Tab>
      </TabList>
    </Tabs>
  );
}
const tipOf = (tab: HTMLElement) => tab.parentElement?.querySelector<HTMLElement>(".cy-tooltip") ?? null;

export const LongLabelsTruncateWithTheFullTextInATooltip: Story = {
  tags: ["visual"],
  render: () => <LongNames />,
  play: async ({ canvas, userEvent }) => {
    const long = canvas.getByRole("tab", { name: LONG });
    const label = long.querySelector(".cy-tab-label") as HTMLElement;
    // Cut short with an ellipsis; the name is still the whole text.
    await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    await expect(getComputedStyle(label).textOverflow).toBe("ellipsis");
    await expect(long.getBoundingClientRect().width).toBeLessThan(400);
    // The full text is a tooltip (never a native title), for the eye only: the name already holds it.
    await expect(long).not.toHaveAttribute("title");
    await waitFor(() => expect(tipOf(long)).toHaveTextContent(LONG));
    await expect(long).not.toHaveAccessibleDescription();
    // Keyboard focus shows it.
    await userEvent.tab();
    await expect(long).toHaveFocus();
    await waitFor(() => expect((tipOf(long) as HTMLElement).matches(":popover-open")).toBe(true));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect((tipOf(long) as HTMLElement).matches(":popover-open")).toBe(false));
    // A label shown in full has no tooltip.
    const short = canvas.getByRole("tab", { name: "users.sql" });
    await expect(tipOf(short)).toBeNull();
    await userEvent.keyboard("{ArrowRight}");
    await expect(short).toHaveFocus();
    await expect(document.querySelector(".cy-tooltip:popover-open")).toBeNull();
  },
};

export const HoverShowsTheFullTextOfALongLabel: Story = {
  render: () => <LongNames />,
  play: async ({ canvas, userEvent }) => {
    const long = canvas.getByRole("tab", { name: LONG });
    await waitFor(() => expect(tipOf(long)).not.toBeNull());
    await userEvent.hover(long);
    await waitFor(() => expect((tipOf(long) as HTMLElement).matches(":popover-open")).toBe(true));
    await shownFully(tipOf(long) as HTMLElement);
    await userEvent.unhover(long);
    await waitFor(() => expect((tipOf(long) as HTMLElement).matches(":popover-open")).toBe(false));
  },
};

export const ALabelThatGrowsTooLongGetsItsTooltip: Story = {
  render: () => {
    function Renaming() {
      const [name, setName] = useState("q.sql");
      return (
        <Tabs defaultValue="q">
          <TabList label="Queries">
            <Tab value="q">{name}</Tab>
          </TabList>
          <Button onClick={() => setName(LONG)}>Rename</Button>
        </Tabs>
      );
    }
    return <Renaming />;
  },
  play: async ({ canvas, userEvent }) => {
    const tab = canvas.getByRole("tab", { name: "q.sql" });
    await expect(tipOf(tab)).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Rename" }));
    // Same element (focus and state survive), now with the tooltip.
    await waitFor(() => expect(tipOf(canvas.getByRole("tab", { name: LONG }))).toHaveTextContent(LONG));
    await expect(canvas.getByRole("tab", { name: LONG })).toBe(tab);
  },
};

export const LongLabelsInRightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <LongNames />
    </div>
  ),
  play: async ({ canvas }) => {
    const long = canvas.getByRole("tab", { name: LONG });
    const label = long.querySelector(".cy-tab-label") as HTMLElement;
    await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    // The ellipsis is at the end of the text, on the left; the close button stays clear of the label.
    const close = (slotOf(long).querySelector(".cy-tab-close") as HTMLElement).getBoundingClientRect();
    await expect(close.right).toBeLessThanOrEqual(label.getBoundingClientRect().left + 1);
  },
};

export const LongLabelsStableUnderHostileHost: Story = {
  render: () => <LongNames />,
  play: async ({ canvasElement }) => {
    const props = ["max-width", "overflow-x", "text-overflow", "white-space", "font-size"];
    const label = computeUnderHostileHost(canvasElement, ".cy-tab-label", props);
    await expect(label.hostile).toEqual(label.clean);
  },
};
