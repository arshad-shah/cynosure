import { type ReactNode, useState } from "react";
import { expect, userEvent, waitFor } from "storybook/test";
import { Button } from "../components/Button/Button.js";

/** How a region is blocked in `blockingStory`: not at all, `inert`, or `disabled`. */
export type Blocking = "none" | "inert" | "disabled";

/**
 * A story checking a component's `inert` and `disabled` (`BlockProps`): `draw(blocking, inside)` renders the
 * component with `data-testid="region"` around `inside` (a Button). While blocked nothing in it can be focused or
 * clicked; `disabled` dims it and `inert` does not; unblocked it works again.
 */
export function blockingStory(
  draw: (props: { inert: boolean; disabled: boolean }, inside: ReactNode) => ReactNode,
) {
  function Harness() {
    const [blocking, setBlocking] = useState<Blocking>("none");
    const [clicks, setClicks] = useState(0);
    return (
      <>
        <Button data-testid="none" onClick={() => setBlocking("none")}>
          Unblock
        </Button>
        <Button data-testid="inert" onClick={() => setBlocking("inert")}>
          Inert
        </Button>
        <Button data-testid="disabled" onClick={() => setBlocking("disabled")}>
          Disabled
        </Button>
        {draw(
          { inert: blocking === "inert", disabled: blocking === "disabled" },
          <Button data-testid="inside" onClick={() => setClicks((n) => n + 1)}>
            Run
          </Button>,
        )}
        <output data-testid="clicks">{clicks}</output>
      </>
    );
  }
  return {
    render: () => <Harness />,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
      const get = (id: string) => canvasElement.querySelector(`[data-testid="${id}"]`) as HTMLElement;
      const region = () => get("region");
      const inside = () => get("inside");
      const clicks = () => get("clicks");
      // Unblocked: the button inside takes focus and clicks.
      inside().focus();
      await expect(inside()).toHaveFocus();
      await userEvent.click(inside());
      await expect(clicks()).toHaveTextContent("1");
      await expect(getComputedStyle(region()).opacity).toBe("1");

      for (const mode of ["inert", "disabled"] as const) {
        await userEvent.click(get(mode));
        await waitFor(() => expect(region().inert).toBe(true));
        // The browser refuses focus inside an inert region, and a click there lands on nothing.
        inside().focus();
        await expect(inside()).not.toHaveFocus();
        const box = inside().getBoundingClientRect();
        const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
        await expect(inside().contains(hit)).toBe(false);
        await expect(Number(getComputedStyle(region()).opacity)).toBe(mode === "disabled" ? 0.5 : 1);
      }

      await userEvent.click(get("none"));
      await waitFor(() => expect(region().inert).toBe(false));
      await expect(region()).not.toHaveAttribute("data-cy-disabled");
      inside().focus();
      await expect(inside()).toHaveFocus();
    },
  };
}
