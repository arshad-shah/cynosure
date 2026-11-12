import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { code, info, list } from "../../icons/index.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { asIfPrinting } from "../../test/print.js";
import { Button } from "../Button/Button.js";
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
