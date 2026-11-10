import { act, useState, version } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "../../src/components/Button/Button";
import { Combobox } from "../../src/components/Combobox/Combobox";
import { Select } from "../../src/components/Select/Select";
import { Slider } from "../../src/components/Slider/Slider";
import { TextField } from "../../src/components/TextField/TextField";

// React 18 only runs act() warnings-free when told it is in a test environment.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement | undefined;
const mount = (ui: React.ReactNode) => {
  const el = document.createElement("div");
  document.body.append(el);
  host = el;
  const root = createRoot(el);
  act(() => root.render(ui));
  return el;
};
afterEach(() => host?.remove());

describe("Cynosure on React 18", () => {
  it("runs against React 18, not the repo's React", () => {
    expect(version.startsWith("18.")).toBe(true);
  });

  it("Button fires onClick and mirrors pressed state", () => {
    const onClick = vi.fn();
    function Toggle() {
      const [on, setOn] = useState(false);
      return (
        <Button
          pressed={on}
          onClick={() => {
            onClick();
            setOn(!on);
          }}
        >
          Bold
        </Button>
      );
    }
    const host = mount(<Toggle />);
    const button = host.querySelector("button") as HTMLButtonElement;
    expect(button.type).toBe("button");
    act(() => button.click());
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });

  it("TextField labels its input, reports changes and shows its error", () => {
    const onChange = vi.fn();
    const host = mount(<TextField label="Name" defaultValue="Ada" error="Too short" onChange={onChange} />);
    const input = host.querySelector("input") as HTMLInputElement;
    const label = host.querySelector(`label[for="${input.id}"]`);
    expect(label?.textContent).toContain("Name");
    expect(input.value).toBe("Ada");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("Too short");
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      setter?.call(input, "Ada Lovelace");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(onChange).toHaveBeenCalled();
  });

  it("Select renders a combobox and takes part in a form", () => {
    const host = mount(
      <form>
        <Select
          label="Fruit"
          name="fruit"
          defaultValue="pear"
          options={[
            { value: "apple", label: "Apple" },
            { value: "pear", label: "Pear" },
          ]}
        />
      </form>,
    );
    const trigger = host.querySelector('[role="combobox"]') as HTMLElement;
    expect(trigger.textContent).toContain("Pear");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    const form = host.querySelector("form") as HTMLFormElement;
    expect(new FormData(form).get("fruit")).toBe("pear");
  });

  it("Slider moves with the keyboard and submits its value", () => {
    const onChange = vi.fn();
    const host = mount(
      <form>
        <Slider label="Volume" name="volume" defaultValue={40} onChange={onChange} />
      </form>,
    );
    const thumb = host.querySelector('[role="slider"]') as HTMLElement;
    expect(thumb.getAttribute("aria-valuenow")).toBe("40");
    act(() => {
      thumb.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    });
    expect(onChange).toHaveBeenCalledWith(100);
    expect(thumb.getAttribute("aria-valuenow")).toBe("100");
    expect(new FormData(host.querySelector("form") as HTMLFormElement).get("volume")).toBe("100");
  });

  it("Combobox filters as you type and chooses with Enter", () => {
    const onChange = vi.fn();
    const host = mount(
      <Combobox
        label="Fruit"
        onChange={onChange}
        options={[
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
        ]}
      />,
    );
    const input = host.querySelector('[role="combobox"]') as HTMLInputElement;
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, "ban");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(input.getAttribute("aria-expanded")).toBe("true");
    const options = [...host.querySelectorAll('[role="option"]')].map((o) => o.textContent);
    expect(options).toEqual(["Banana"]);
    act(() => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
    expect(onChange).toHaveBeenCalledWith("banana");
    expect(input.value).toBe("Banana");
  });
});
