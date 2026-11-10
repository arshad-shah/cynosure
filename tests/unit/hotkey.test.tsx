// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { matchesHotkey, useHotkey } from "../../src/foundations/hotkey";

afterEach(cleanup);

function Listen({ combo, onHit }: { combo: string | false; onHit: () => void }) {
  useHotkey(combo, onHit);
  return (
    <div>
      <input aria-label="field" />
      <div data-cy-hotkeys="off">
        <input aria-label="editor" />
      </div>
      <button type="button">elsewhere</button>
    </div>
  );
}

describe("useHotkey", () => {
  it("matches modifiers exactly, with mod meaning Control off Apple platforms", () => {
    const at = (init: KeyboardEventInit) => new KeyboardEvent("keydown", init);
    expect(matchesHotkey("mod+k", at({ key: "k", ctrlKey: true }))).toBe(true);
    expect(matchesHotkey("mod+k", at({ key: "K", ctrlKey: true }))).toBe(true);
    expect(matchesHotkey("mod+k", at({ key: "k", ctrlKey: true, shiftKey: true }))).toBe(false);
    expect(matchesHotkey("mod+k", at({ key: "k" }))).toBe(false);
    expect(matchesHotkey("shift+?", at({ key: "?", shiftKey: true }))).toBe(true);
  });

  it("fires from anywhere, including text fields when the combo has a modifier", () => {
    const hit = vi.fn();
    const { getByLabelText, getByText } = render(<Listen combo="mod+k" onHit={hit} />);
    fireEvent.keyDown(getByText("elsewhere"), { key: "k", ctrlKey: true });
    fireEvent.keyDown(getByLabelText("field"), { key: "k", ctrlKey: true });
    expect(hit).toHaveBeenCalledTimes(2);
  });

  it("leaves plain keys to text fields, and respects data-cy-hotkeys=off", () => {
    const hit = vi.fn();
    const { getByLabelText, getByText, rerender } = render(<Listen combo="/" onHit={hit} />);
    fireEvent.keyDown(getByLabelText("field"), { key: "/" });
    expect(hit).not.toHaveBeenCalled();
    fireEvent.keyDown(getByText("elsewhere"), { key: "/" });
    expect(hit).toHaveBeenCalledTimes(1);
    rerender(<Listen combo="mod+k" onHit={hit} />);
    fireEvent.keyDown(getByLabelText("editor"), { key: "k", ctrlKey: true });
    expect(hit).toHaveBeenCalledTimes(1);
  });

  it("ignores events already handled, and can be switched off", () => {
    const hit = vi.fn();
    const { getByText, rerender } = render(<Listen combo="mod+k" onHit={hit} />);
    const target = getByText("elsewhere");
    target.addEventListener("keydown", (e) => e.preventDefault(), { once: true });
    fireEvent.keyDown(target, { key: "k", ctrlKey: true });
    expect(hit).not.toHaveBeenCalled();
    rerender(<Listen combo={false} onHit={hit} />);
    fireEvent.keyDown(target, { key: "k", ctrlKey: true });
    expect(hit).not.toHaveBeenCalled();
  });
});
