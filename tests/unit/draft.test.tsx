// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { useDraft } from "../../src/foundations/draft";

afterEach(cleanup);

let api: ReturnType<typeof useDraft> | undefined;

function Typed() {
  const input = useRef<HTMLInputElement>(null);
  const draft = useDraft(input, (text) => (/^\d*$/.test(text) ? null : "Digits only"));
  api = draft;
  return (
    <input
      ref={input}
      aria-label="code"
      value={draft.draft ?? ""}
      onChange={(event) => draft.setDraft(event.target.value)}
    />
  );
}

describe("useDraft", () => {
  it("marks the input invalid while the draft fails its check, and settle clears draft and problem", () => {
    render(<Typed />);
    const input = screen.getByRole("textbox", { name: "code" }) as HTMLInputElement;
    expect(input.validationMessage).toBe("");
    fireEvent.change(input, { target: { value: "12a" } });
    expect(input.validationMessage).toBe("Digits only");
    act(() => api?.setProblem("Digits only"));
    expect(api?.problem).toBe("Digits only");
    fireEvent.change(input, { target: { value: "12" } });
    expect(input.validationMessage).toBe("");
    fireEvent.change(input, { target: { value: "x" } });
    act(() => api?.settle());
    expect(api?.draft).toBeNull();
    expect(api?.problem).toBeNull();
    expect(input.validationMessage).toBe("");
  });
});
