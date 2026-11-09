import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { code, info, list } from "../../icons/index.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
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
  tags: ["touch"],
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
    await waitFor(() => expect(listEl).toHaveAttribute("data-more-end"));
    await expect(listEl).not.toHaveAttribute("data-more-start");
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
