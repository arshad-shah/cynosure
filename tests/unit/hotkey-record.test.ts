// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { hotkeyFromEvent, matchesHotkey, shortcutKeys } from "../../src/foundations/hotkey";

const at = (init: KeyboardEventInit) => new KeyboardEvent("keydown", init);

afterEach(() => vi.restoreAllMocks());

describe("hotkeyFromEvent", () => {
  it("writes Control as mod off Apple platforms, Command as meta, in a fixed order", () => {
    expect(
      hotkeyFromEvent(at({ key: "P", code: "KeyP", ctrlKey: true, shiftKey: true }), { apple: false }),
    ).toBe("mod+shift+p");
    expect(
      hotkeyFromEvent(at({ key: "k", code: "KeyK", metaKey: true, ctrlKey: true, altKey: true }), {
        apple: false,
      }),
    ).toBe("mod+meta+alt+k");
  });

  it("writes Command as mod on Apple platforms, Control as ctrl", () => {
    expect(
      hotkeyFromEvent(at({ key: "p", code: "KeyP", metaKey: true, shiftKey: true }), { apple: true }),
    ).toBe("mod+shift+p");
    expect(
      hotkeyFromEvent(at({ key: "k", code: "KeyK", metaKey: true, ctrlKey: true }), { apple: true }),
    ).toBe("mod+ctrl+k");
  });

  it("records the physical letter or digit when a modifier changes the character", () => {
    // Option+K on macOS types "˚"; Option+E is a dead key; Shift+1 types "!"; a Cyrillic layout types "л".
    expect(hotkeyFromEvent(at({ key: "˚", code: "KeyK", altKey: true }), { apple: true })).toBe("alt+k");
    expect(hotkeyFromEvent(at({ key: "Dead", code: "KeyE", altKey: true }), { apple: true })).toBe("alt+e");
    expect(
      hotkeyFromEvent(at({ key: "!", code: "Digit1", ctrlKey: true, shiftKey: true }), { apple: false }),
    ).toBe("mod+shift+1");
    expect(hotkeyFromEvent(at({ key: "л", code: "KeyK", ctrlKey: true }), { apple: false })).toBe("mod+k");
    // A letter the layout really types wins over its position (AZERTY's A sits on KeyQ).
    expect(hotkeyFromEvent(at({ key: "a", code: "KeyQ", ctrlKey: true }), { apple: false })).toBe("mod+a");
    // Punctuation without a letter or digit position stays as typed.
    expect(
      hotkeyFromEvent(at({ key: "?", code: "Slash", ctrlKey: true, shiftKey: true }), { apple: false }),
    ).toBe("mod+shift+?");
  });

  it("names keys the way useHotkey and Kbd write them", () => {
    expect(hotkeyFromEvent(at({ key: " ", code: "Space", ctrlKey: true }), { apple: false })).toBe(
      "mod+space",
    );
    expect(hotkeyFromEvent(at({ key: "ArrowUp", code: "ArrowUp", altKey: true }), { apple: false })).toBe(
      "alt+arrowup",
    );
    expect(
      hotkeyFromEvent(at({ key: "+", code: "Equal", ctrlKey: true, shiftKey: true }), { apple: false }),
    ).toBe("mod+shift++");
    expect(
      hotkeyFromEvent(at({ key: "Escape", code: "Escape", shiftKey: true }), {
        apple: false,
        allowBare: true,
      }),
    ).toBe("shift+escape");
    expect(shortcutKeys("mod+space", false)).toEqual(["Ctrl", "Space"]);
  });

  it("waits while only modifiers are held, and ignores keys it cannot name", () => {
    for (const key of ["Control", "Shift", "Alt", "Meta", "AltGraph", "CapsLock", "OS"])
      expect(hotkeyFromEvent(at({ key, ctrlKey: true }), { apple: false })).toBeNull();
    expect(
      hotkeyFromEvent(at({ key: "Dead", code: "Backquote", altKey: true }), { apple: false }),
    ).toBeNull();
    expect(hotkeyFromEvent(at({ key: "Unidentified", ctrlKey: true }), { apple: false })).toBeNull();
    expect(hotkeyFromEvent(at({ key: "", ctrlKey: true }), { apple: false })).toBeNull();
  });

  it("needs Control, Command or Alt unless bare keys are allowed; function keys are always enough", () => {
    expect(hotkeyFromEvent(at({ key: "k", code: "KeyK" }), { apple: false })).toBeNull();
    expect(hotkeyFromEvent(at({ key: "K", code: "KeyK", shiftKey: true }), { apple: false })).toBeNull();
    expect(hotkeyFromEvent(at({ key: "Enter", code: "Enter" }), { apple: false })).toBeNull();
    expect(hotkeyFromEvent(at({ key: "k", code: "KeyK" }), { apple: false, allowBare: true })).toBe("k");
    expect(hotkeyFromEvent(at({ key: "/", code: "Slash" }), { apple: false, allowBare: true })).toBe("/");
    expect(hotkeyFromEvent(at({ key: "F2", code: "F2" }), { apple: false })).toBe("f2");
    expect(hotkeyFromEvent(at({ key: "F12", code: "F12", shiftKey: true }), { apple: false })).toBe(
      "shift+f12",
    );
  });

  it("defaults to this platform", () => {
    vi.spyOn(navigator, "platform", "get").mockReturnValue("MacIntel");
    expect(hotkeyFromEvent(at({ key: "k", code: "KeyK", metaKey: true }))).toBe("mod+k");
    vi.spyOn(navigator, "platform", "get").mockReturnValue("Win32");
    expect(hotkeyFromEvent(at({ key: "k", code: "KeyK", ctrlKey: true }))).toBe("mod+k");
  });
});

describe("recorded shortcuts round-trip through matchesHotkey", () => {
  const cases: KeyboardEventInit[] = [
    { key: "P", code: "KeyP", ctrlKey: true, shiftKey: true },
    { key: "˚", code: "KeyK", altKey: true },
    { key: "Dead", code: "KeyE", altKey: true, ctrlKey: true },
    { key: "!", code: "Digit1", ctrlKey: true, shiftKey: true },
    { key: "л", code: "KeyK", ctrlKey: true },
    { key: "?", code: "Slash", ctrlKey: true, shiftKey: true },
    { key: " ", code: "Space", ctrlKey: true },
    { key: "+", code: "Equal", ctrlKey: true, shiftKey: true },
    { key: "ArrowLeft", code: "ArrowLeft", altKey: true },
    { key: "F5", code: "F5" },
    { key: "Enter", code: "Enter", metaKey: true, ctrlKey: true },
  ];

  for (const platform of ["Win32", "MacIntel"])
    it(`on ${platform}`, () => {
      vi.spyOn(navigator, "platform", "get").mockReturnValue(platform);
      for (const init of cases) {
        const event = at(init);
        const combo = hotkeyFromEvent(event);
        expect(combo, JSON.stringify(init)).not.toBeNull();
        expect(matchesHotkey(combo as string, event), combo as string).toBe(true);
        // A different modifier set does not match the recorded shortcut.
        expect(matchesHotkey(combo as string, at({ ...init, altKey: !init.altKey })), combo as string).toBe(
          false,
        );
      }
    });

  it("matches space written as a word", () => {
    expect(matchesHotkey("mod+space", at({ key: " ", ctrlKey: true }))).toBe(true);
    expect(matchesHotkey("space", at({ key: " " }))).toBe(true);
    expect(matchesHotkey("mod+space", at({ key: "s", ctrlKey: true }))).toBe(false);
  });
});
