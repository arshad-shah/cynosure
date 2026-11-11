// @vitest-environment jsdom
import { render } from "preact";
import { act } from "preact/test-utils";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../../src/components/Button/Button";

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

describe("Button under preact/compat", () => {
  it("fires onClick and toggles aria-pressed", () => {
    const root = document.createElement("div");
    document.body.append(root);
    act(() => render(<Toggle />, root));
    const button = root.querySelector("button") as HTMLButtonElement;
    expect(button.textContent).toBe("Bold");
    expect(button.getAttribute("aria-pressed")).toBe("false");
    act(() => button.click());
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });
});
