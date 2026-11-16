import { type ReactNode, type RefObject, useEffect, useRef, useState } from "react";
import { expect } from "storybook/test";

/** The root attributes a story passes: an id, two `data-*` attributes and a ref. */
export const ROOT_ATTRIBUTES = { id: "tip", "data-state": "ready", "data-row": 3 } as const;

/**
 * A story checking that a component passes `id` and any `data-*` attribute to its root (the element with `rootClass`)
 * and forwards its ref there. `draw` renders the component with `{...ROOT_ATTRIBUTES}` and the ref.
 */
export function rootAttributesStory<E extends HTMLElement>(
  draw: (ref: RefObject<E | null>) => ReactNode,
  rootClass: string,
) {
  function WithRef() {
    const ref = useRef<E>(null);
    const [seen, setSeen] = useState("");
    useEffect(() => setSeen(`${ref.current?.id}:${ref.current?.dataset.state}`), []);
    return (
      <>
        {draw(ref)}
        <output data-testid="ref">{seen}</output>
      </>
    );
  }
  return {
    render: () => <WithRef />,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
      const root = canvasElement.querySelector("#tip") as HTMLElement;
      await expect(root).toHaveClass(rootClass);
      await expect(root).toHaveAttribute("data-state", "ready");
      await expect(root).toHaveAttribute("data-row", "3");
      // The ref is that same element.
      await expect(canvasElement.querySelector('[data-testid="ref"]')).toHaveTextContent("tip:ready");
    },
  };
}
