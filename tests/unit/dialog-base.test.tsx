// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CommandPalette } from "../../src/components/CommandPalette/CommandPalette";
import { Dialog } from "../../src/components/Dialog/Dialog";
import { ProgressOverlay } from "../../src/components/ProgressOverlay/ProgressOverlay";
import { DialogBase } from "../../src/foundations/DialogBase/DialogBase";

afterEach(cleanup);

// jsdom (where products run their unit tests) has `<dialog>` but not its `showModal`, `show` or `close`.
describe("DialogBase without the dialog API", () => {
  it("renders an open dialog and closes it without throwing", () => {
    expect(typeof HTMLDialogElement.prototype.showModal).toBe("undefined");
    const { rerender } = render(<DialogBase open aria-label="Plain" />);
    expect(screen.getByLabelText("Plain").tagName).toBe("DIALOG");
    rerender(<DialogBase open={false} aria-label="Plain" />);
    rerender(<DialogBase open modal={false} aria-label="Plain" />);
  });

  it("renders an open Dialog with its content", () => {
    render(
      <Dialog title="Rename" open>
        Pick a name
      </Dialog>,
    );
    expect(screen.getByText("Pick a name")).toBeTruthy();
  });

  it("renders an open CommandPalette and ProgressOverlay", () => {
    render(
      <>
        <CommandPalette open commands={[{ id: "new", label: "New file" }]} onRun={() => {}} />
        <ProgressOverlay open title="Exporting" />
      </>,
    );
    expect(screen.getByText("New file")).toBeTruthy();
    expect(screen.getByText("Exporting")).toBeTruthy();
  });
});
