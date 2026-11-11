import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { Pagination, pageCount, pageRange } from "./Pagination.js";

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  args: {
    count: 10,
    defaultPage: 1,
    siblings: 1,
    boundaries: 1,
    variant: "pages",
    showEdges: false,
    disabled: false,
    size: "md",
    onChange: fn(),
  },
  argTypes: {
    count: { control: { type: "number", min: 0 } },
    page: { control: { type: "number", min: 1 } },
    defaultPage: { control: { type: "number", min: 1 } },
    siblings: { control: { type: "number", min: 0 } },
    boundaries: { control: { type: "number", min: 0 } },
    variant: { control: "inline-radio", options: ["pages", "compact"] },
    showEdges: { control: "boolean" },
    disabled: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md"] },
    getHref: { control: false },
    labels: { control: "object" },
  },
} satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;

/** What the list shows, in order: page numbers and "gap". */
const shown = (root: Element) =>
  [...root.querySelectorAll(".cy-pagination-list > li")]
    .filter((li) => li.matches(".cy-pagination-gap") || li.querySelector(".cy-pagination-page"))
    .map((li) => (li.matches(".cy-pagination-gap") ? "gap" : Number(li.textContent)));

const currentOf = (root: Element) => [...root.querySelectorAll("[aria-current]")];

const pseudo = (el: Element) => {
  const s = getComputedStyle(el, "::before");
  return { w: Number.parseFloat(s.width), h: Number.parseFloat(s.height) };
};

/** The pixel value of a length token where `el` is. */
const lengthOf = (el: Element, value: string) => {
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;inline-size:${value}`;
  el.append(probe);
  const width = probe.getBoundingClientRect().width;
  probe.remove();
  return width;
};

export const LandmarkAndCurrentPage: Story = {
  tags: ["visual"],
  args: { defaultPage: 5 },
  play: async ({ canvas, canvasElement }) => {
    const nav = canvas.getByRole("navigation", { name: "Pagination" });
    await expect(nav.tagName).toBe("NAV");
    await expect(within(nav).getByRole("list").tagName).toBe("OL");
    // Exactly one control is the current page, and its name says "current" once (aria-current says it).
    const current = currentOf(canvasElement);
    await expect(current).toHaveLength(1);
    await expect(current[0]).toHaveAttribute("aria-current", "page");
    await expect(current[0]).toHaveAccessibleName("Page 5");
    await expect(current[0]).toHaveTextContent("5");
    await expect(shown(canvasElement)).toEqual([1, "gap", 4, 5, 6, "gap", 10]);
    await expect(canvas.getByRole("button", { name: "Previous page" })).toBeEnabled();
    await expect(canvas.getByRole("button", { name: "Next page" })).toBeEnabled();
    // No first and last controls unless asked for.
    await expect(canvas.queryByRole("button", { name: "First page" })).toBeNull();
    await expect(canvas.queryByRole("button", { name: "Last page" })).toBeNull();
  },
};

export const VisibleRange: Story = {
  args: { count: 10, defaultPage: 1 },
  play: async ({ canvasElement, canvas, userEvent }) => {
    const g = "gap";
    const cases: [args: [number, number, number?, number?], expected: (number | "gap")[]][] = [
      // count 1 and 2: everything, no gaps
      [[1, 1], [1]],
      [
        [1, 2],
        [1, 2],
      ],
      [
        [2, 2, 0],
        [1, 2],
      ],
      [
        [2, 2, 2],
        [1, 2],
      ],
      // count 7: fits the seven slots of siblings 1
      [
        [1, 7],
        [1, 2, 3, 4, 5, 6, 7],
      ],
      [
        [4, 7],
        [1, 2, 3, 4, 5, 6, 7],
      ],
      [
        [7, 7],
        [1, 2, 3, 4, 5, 6, 7],
      ],
      [
        [1, 7, 0],
        [1, 2, 3, g, 7],
      ],
      [
        [4, 7, 0],
        [1, g, 4, g, 7],
      ],
      [
        [7, 7, 0],
        [1, g, 5, 6, 7],
      ],
      [
        [4, 7, 2],
        [1, 2, 3, 4, 5, 6, 7],
      ],
      // count 10
      [
        [1, 10],
        [1, 2, 3, 4, 5, g, 10],
      ],
      [
        [4, 10],
        [1, 2, 3, 4, 5, g, 10],
      ],
      [
        [5, 10],
        [1, g, 4, 5, 6, g, 10],
      ],
      [
        [7, 10],
        [1, g, 6, 7, 8, 9, 10],
      ],
      [
        [10, 10],
        [1, g, 6, 7, 8, 9, 10],
      ],
      [
        [1, 10, 0],
        [1, 2, 3, g, 10],
      ],
      [
        [5, 10, 0],
        [1, g, 5, g, 10],
      ],
      [
        [10, 10, 0],
        [1, g, 8, 9, 10],
      ],
      [
        [1, 10, 2],
        [1, 2, 3, 4, 5, 6, 7, g, 10],
      ],
      [
        [5, 10, 2],
        [1, 2, 3, 4, 5, 6, 7, g, 10],
      ],
      [
        [6, 10, 2],
        [1, g, 4, 5, 6, 7, 8, 9, 10],
      ],
      [
        [10, 10, 2],
        [1, g, 4, 5, 6, 7, 8, 9, 10],
      ],
      // count 100
      [
        [1, 100],
        [1, 2, 3, 4, 5, g, 100],
      ],
      [
        [50, 100],
        [1, g, 49, 50, 51, g, 100],
      ],
      [
        [100, 100],
        [1, g, 96, 97, 98, 99, 100],
      ],
      [
        [50, 100, 0],
        [1, g, 50, g, 100],
      ],
      [
        [50, 100, 2],
        [1, g, 48, 49, 50, 51, 52, g, 100],
      ],
      [
        [100, 100, 2],
        [1, g, 94, 95, 96, 97, 98, 99, 100],
      ],
      // boundaries
      [
        [50, 100, 1, 2],
        [1, 2, g, 49, 50, 51, g, 99, 100],
      ],
      [
        [1, 100, 1, 2],
        [1, 2, 3, 4, 5, 6, g, 99, 100],
      ],
      [
        [50, 100, 1, 0],
        [g, 49, 50, 51, g],
      ],
      [
        [1, 100, 1, 0],
        [1, 2, 3, 4, g],
      ],
      [
        [100, 100, 1, 0],
        [g, 97, 98, 99, 100],
      ],
      // unsafe input: nothing, or the nearest sensible range
      [[1, 0], []],
      [[1, -4], []],
      [[1, Number.NaN], []],
      [
        [-9, 10],
        [1, 2, 3, 4, 5, g, 10],
      ],
      [
        [99, 10],
        [1, g, 6, 7, 8, 9, 10],
      ],
      [
        [5, 10, -1, -1],
        [g, 5, g],
      ],
      [
        [5, 10.9, 1.9],
        [1, g, 4, 5, 6, g, 10],
      ],
    ];
    for (const [args, expected] of cases)
      await expect(pageRange(...args), `pageRange(${args})`).toEqual(expected);
    // The list is the same length on every page, so controls do not move under the pointer.
    for (const [count, siblings] of [
      [10, 1],
      [100, 0],
      [100, 2],
    ] as const) {
      const lengths = new Set(
        Array.from({ length: count }, (_, i) => pageRange(i + 1, count, siblings).length),
      );
      await expect([...lengths]).toEqual([siblings * 2 + 5]);
    }
    // Every page is reachable and listed once, in order.
    for (let page = 1; page <= 100; page++) {
      const pages = pageRange(page, 100).filter((p) => p !== "gap");
      await expect(pages).toContain(page);
      await expect(pages).toEqual([...new Set(pages)].sort((a, b) => a - b));
    }

    await expect(pageCount(0, 10)).toBe(1);
    await expect(pageCount(1, 10)).toBe(1);
    await expect(pageCount(10, 10)).toBe(1);
    await expect(pageCount(11, 10)).toBe(2);
    await expect(pageCount(95, 10)).toBe(10);
    await expect(pageCount(100, 25)).toBe(4);
    await expect(pageCount(5, 0)).toBe(1);
    await expect(pageCount(5, -2)).toBe(1);
    await expect(pageCount(-5, 10)).toBe(1);
    await expect(pageCount(Number.NaN, 10)).toBe(1);

    // The DOM shows what the function says, page after page.
    await expect(shown(canvasElement)).toEqual(pageRange(1, 10));
    for (let page = 2; page <= 10; page++) {
      await userEvent.click(canvas.getByRole("button", { name: "Next page" }));
      await expect(shown(canvasElement)).toEqual(pageRange(page, 10));
      await expect(currentOf(canvasElement)).toHaveLength(1);
      await expect(currentOf(canvasElement)[0]).toHaveAccessibleName(`Page ${page}`);
    }
  },
};

export const SiblingsAndBoundaries: Story = {
  args: { count: 100, defaultPage: 50, siblings: 2, boundaries: 2 },
  play: async ({ canvasElement }) => {
    await expect(shown(canvasElement)).toEqual([1, 2, "gap", 48, 49, 50, 51, 52, "gap", 99, 100]);
  },
};

export const UncontrolledPointerAndKeyboard: Story = {
  args: { defaultPage: 4 },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const page = (n: number) => canvas.getByRole("button", { name: `Page ${n}` });
    await userEvent.click(page(5));
    await expect(args.onChange).toHaveBeenLastCalledWith(5, expect.anything());
    await expect(page(5)).toHaveAttribute("aria-current", "page");
    await expect(page(4)).not.toHaveAttribute("aria-current");
    // The pressed number keeps focus although the set of numbers moved along.
    await expect(shown(canvasElement)).toEqual([1, "gap", 4, 5, 6, "gap", 10]);
    await expect(page(5)).toHaveFocus();

    // Plain buttons: Tab to the next, Enter and Space press it.
    await userEvent.tab();
    await expect(page(6)).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onChange).toHaveBeenLastCalledWith(6, expect.anything());
    await expect(page(6)).toHaveFocus();
    await userEvent.tab();
    await expect(page(7)).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(args.onChange).toHaveBeenLastCalledWith(7, expect.anything());
    await expect(page(7)).toHaveFocus();
    await expect(currentOf(canvasElement)).toHaveLength(1);

    // No arrow-key pattern: arrows neither move focus nor change the page.
    await userEvent.keyboard("{ArrowRight}{ArrowLeft}{Home}{End}");
    await expect(page(7)).toHaveFocus();
    await expect(page(7)).toHaveAttribute("aria-current", "page");
    await expect(args.onChange).toHaveBeenCalledTimes(3);

    // Pressing the current page again changes nothing.
    await userEvent.click(page(7));
    await expect(args.onChange).toHaveBeenCalledTimes(3);
  },
};

export const ControlledStaysUntilTheParentMoves: Story = {
  args: { page: 3 },
  render: (args) => {
    function Controlled() {
      const [page, setPage] = useState(3);
      return (
        <div style={{ display: "grid", gap: 12 }}>
          <div data-testid="stuck">
            <Pagination {...args} />
          </div>
          <div data-testid="moving">
            <Pagination count={10} page={page} onChange={setPage} labels={{ nav: "Results" }} />
          </div>
          <Button onClick={() => setPage(9)}>Jump to 9</Button>
        </div>
      );
    }
    return <Controlled />;
  },
  play: async ({ args, canvas, userEvent }) => {
    // The parent ignores the change: the page stays.
    const stuck = canvas.getByTestId("stuck");
    await userEvent.click(within(stuck).getByRole("button", { name: "Page 5" }));
    await userEvent.click(within(stuck).getByRole("button", { name: "Next page" }));
    await expect(args.onChange).toHaveBeenCalledTimes(2);
    await expect(args.onChange).toHaveBeenNthCalledWith(1, 5, expect.anything());
    await expect(args.onChange).toHaveBeenNthCalledWith(2, 4, expect.anything());
    await expect(currentOf(stuck)[0]).toHaveAccessibleName("Page 3");

    // The parent follows the change, and can move the page itself.
    const moving = canvas.getByTestId("moving");
    await userEvent.click(within(moving).getByRole("button", { name: "Page 4" }));
    await expect(currentOf(moving)[0]).toHaveAccessibleName("Page 4");
    await userEvent.click(canvas.getByRole("button", { name: "Jump to 9" }));
    await expect(currentOf(moving)[0]).toHaveAccessibleName("Page 9");
    await expect(shown(moving)).toEqual([1, "gap", 6, 7, 8, 9, 10]);
    // Focus is left where the person put it.
    await expect(canvas.getByRole("button", { name: "Jump to 9" })).toHaveFocus();
  },
};

export const OutOfRangeIsClamped: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      <Pagination count={5} defaultPage={99} labels={{ nav: "Too high" }} />
      <Pagination count={5} page={-3} labels={{ nav: "Too low" }} />
      <Pagination count={5} page={Number.NaN} labels={{ nav: "Not a number" }} />
      <Pagination count={5.7} page={2.6} labels={{ nav: "Fractions" }} />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const nav = (name: string) => canvas.getByRole("navigation", { name });
    await expect(currentOf(nav("Too high"))[0]).toHaveAccessibleName("Page 5");
    await expect(within(nav("Too high")).getByRole("button", { name: "Next page" })).toBeDisabled();
    // Previous goes from the clamped page, not from 99.
    await userEvent.click(within(nav("Too high")).getByRole("button", { name: "Previous page" }));
    await expect(currentOf(nav("Too high"))[0]).toHaveAccessibleName("Page 4");
    await expect(currentOf(nav("Too low"))[0]).toHaveAccessibleName("Page 1");
    await expect(within(nav("Too low")).getByRole("button", { name: "Previous page" })).toBeDisabled();
    await expect(currentOf(nav("Not a number"))[0]).toHaveAccessibleName("Page 1");
    await expect(currentOf(nav("Fractions"))[0]).toHaveAccessibleName("Page 3");
    await expect(shown(nav("Fractions"))).toEqual([1, 2, 3, 4, 5]);
  },
};

export const OnePageRendersNothing: Story = {
  render: () => (
    <div data-testid="empty">
      <Pagination count={1} />
      <Pagination count={0} />
      <Pagination count={-3} page={7} />
      <Pagination count={Number.NaN} variant="compact" showEdges />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId("empty")).toBeEmptyDOMElement();
    await expect(canvas.queryByRole("navigation")).toBeNull();
  },
};

export const PreviousNextAndEdges: Story = {
  args: { showEdges: true, defaultPage: 2 },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const control = (name: string) => canvas.getByRole("button", { name });
    const current = () => currentOf(canvasElement)[0];
    // Order: first, previous, pages, next, last.
    const names = within(canvas.getByRole("list"))
      .getAllByRole("button")
      .map((b) => b.getAttribute("aria-label"));
    await expect(names.slice(0, 2)).toEqual(["First page", "Previous page"]);
    await expect(names.slice(-2)).toEqual(["Next page", "Last page"]);

    await userEvent.click(control("Next page"));
    await expect(args.onChange).toHaveBeenLastCalledWith(3, expect.anything());
    await userEvent.click(control("Previous page"));
    await userEvent.click(control("Previous page"));
    await expect(args.onChange).toHaveBeenLastCalledWith(1, expect.anything());
    await expect(current()).toHaveAccessibleName("Page 1");
    // At the start, previous and first are disabled, and out of the Tab order as Button's disabled is.
    await expect(control("Previous page")).toBeDisabled();
    await expect(control("First page")).toBeDisabled();
    await expect(control("Next page")).toBeEnabled();
    await expect(control("Last page")).toBeEnabled();
    // Previous had focus and can no longer hold it: focus is on the current page.
    await expect(current()).toHaveFocus();
    const calls = (args.onChange as ReturnType<typeof fn>).mock.calls.length;
    await userEvent.click(control("Previous page"));
    await userEvent.click(control("First page"));
    await expect(args.onChange).toHaveBeenCalledTimes(calls);

    await userEvent.click(control("Last page"));
    await expect(args.onChange).toHaveBeenLastCalledWith(10, expect.anything());
    await expect(current()).toHaveAccessibleName("Page 10");
    await expect(control("Next page")).toBeDisabled();
    await expect(control("Last page")).toBeDisabled();
    await expect(control("Previous page")).toBeEnabled();
    await expect(current()).toHaveFocus();

    await userEvent.click(control("First page"));
    await expect(args.onChange).toHaveBeenLastCalledWith(1, expect.anything());
    await expect(current()).toHaveFocus();

    // Keyboard to the end: Next keeps focus while it works, then hands it to the current page.
    control("Next page").focus();
    for (let page = 2; page <= 9; page++) {
      await userEvent.keyboard("{Enter}");
      await expect(control("Next page")).toHaveFocus();
    }
    await userEvent.keyboard("{Enter}");
    await expect(current()).toHaveAccessibleName("Page 10");
    await expect(current()).toHaveFocus();
  },
};

export const EllipsesAreNotControls: Story = {
  args: { count: 100, defaultPage: 50, showEdges: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const gaps = [...canvasElement.querySelectorAll(".cy-pagination-gap")];
    await expect(gaps).toHaveLength(2);
    for (const gap of gaps) {
      await expect(gap).toHaveAttribute("aria-hidden", "true");
      await expect(gap.querySelector("button, a, [tabindex], [role]")).toBeNull();
      await expect(gap.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
      await expect(gap.textContent).toBe("");
    }
    // Assistive technology gets only the controls: nine list items, each a button.
    await expect(canvas.getAllByRole("listitem")).toHaveLength(9);
    // Tab visits every control once, in order, and never an ellipsis.
    const stops: (string | null)[] = [];
    for (let i = 0; i < 9; i++) {
      await userEvent.tab();
      stops.push(document.activeElement?.getAttribute("aria-label") ?? null);
    }
    await expect(stops).toEqual([
      "First page",
      "Previous page",
      "Page 1",
      "Page 49",
      "Page 50",
      "Page 51",
      "Page 100",
      "Next page",
      "Last page",
    ]);
    await userEvent.tab();
    await expect(canvas.getByRole("navigation")).not.toContainElement(document.activeElement as HTMLElement);
  },
};

export const LinksToEveryPage: Story = {
  args: { getHref: (page) => `#page-${page}`, defaultPage: 1, showEdges: true },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    // The addresses are checked; following them would only move this test page.
    canvasElement.addEventListener("click", (event) => event.preventDefault());
    const link = (name: string) => canvas.getByRole("link", { name });
    await expect(link("Page 2")).toHaveAttribute("href", "#page-2");
    await expect(link("Page 10")).toHaveAttribute("href", "#page-10");
    await expect(link("Next page")).toHaveAttribute("href", "#page-2");
    await expect(link("Last page")).toHaveAttribute("href", "#page-10");
    // The current page is a link too, to its own address, and it is the one marked as current.
    await expect(link("Page 1")).toHaveAttribute("href", "#page-1");
    await expect(link("Page 1")).toHaveAttribute("aria-current", "page");
    await expect(currentOf(canvasElement)).toHaveLength(1);
    await expect(canvas.queryByRole("button", { name: "Page 1" })).toBeNull();
    // Previous and first lead nowhere on page 1: disabled buttons, not links.
    await expect(canvas.getByRole("button", { name: "Previous page" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "First page" })).toBeDisabled();
    await expect(canvas.getAllByRole("link")).toHaveLength(8);
    // Pressing the current page changes nothing.
    await userEvent.click(link("Page 1"));
    await expect(args.onChange).not.toHaveBeenCalled();

    // A click with a modifier opens the address elsewhere: this page stays.
    await userEvent.keyboard("{Control>}");
    await userEvent.click(link("Page 3"));
    await userEvent.keyboard("{/Control}{Meta>}");
    await userEvent.click(link("Page 3"));
    await userEvent.keyboard("{/Meta}{Shift>}");
    await userEvent.click(link("Page 3"));
    await userEvent.keyboard("{/Shift}{Alt>}");
    await userEvent.click(link("Page 3"));
    await userEvent.keyboard("{/Alt}");
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(currentOf(canvasElement)[0]).toHaveAccessibleName("Page 1");

    // A plain click still tells onChange and moves.
    await userEvent.click(link("Page 3"));
    await expect(args.onChange).toHaveBeenLastCalledWith(3, expect.anything());
    const current = link("Page 3");
    await expect(current).toHaveAttribute("aria-current", "page");
    await expect(link("Page 1")).not.toHaveAttribute("aria-current");
    // The link that was pressed is now the current page, and focus stays on it.
    await expect(current).toHaveFocus();
    await expect(link("Previous page")).toHaveAttribute("href", "#page-2");
    await expect(link("First page")).toHaveAttribute("href", "#page-1");
    await expect(link("Next page")).toHaveAttribute("href", "#page-4");
    await userEvent.click(link("Next page"));
    await expect(args.onChange).toHaveBeenLastCalledWith(4, expect.anything());
    await expect(link("Next page")).toHaveFocus();
  },
};

/** A client-side router: `onChange` stops the browser following the link and navigates itself. */
export const RouterPreventsTheLinkAndNavigatesItself: Story = {
  args: { getHref: (page) => `#router-page-${page}`, defaultPage: 2 },
  render: (args) => {
    function Routed() {
      const [route, setRoute] = useState("/members?page=2");
      return (
        <div style={{ display: "grid", gap: 12 }}>
          <Pagination
            {...args}
            onChange={(page, event) => {
              event.preventDefault();
              setRoute(`/members?page=${page}`);
              args.onChange?.(page, event);
            }}
          />
          <output data-testid="route">{route}</output>
        </div>
      );
    }
    return <Routed />;
  },
  play: async ({ args, canvas, userEvent }) => {
    // What the browser is left to do with each click, seen after every handler has run.
    const prevented: boolean[] = [];
    const watch = (event: Event) => {
      prevented.push(event.defaultPrevented);
      event.preventDefault(); // the test page itself never moves
    };
    document.addEventListener("click", watch);
    const before = location.href;
    try {
      await userEvent.click(canvas.getByRole("link", { name: "Page 3" }));
      // onChange reports the page and gets the event; the link was not followed.
      await expect(args.onChange).toHaveBeenCalledTimes(1);
      const [page, event] = (args.onChange as ReturnType<typeof fn>).mock.calls[0] as [number, Event];
      await expect(page).toBe(3);
      await expect(event.type).toBe("click");
      await expect(prevented).toEqual([true]);
      await expect(location.href).toBe(before);
      await expect(canvas.getByTestId("route")).toHaveTextContent("/members?page=3");
      await expect(canvas.getByRole("link", { name: "Page 3" })).toHaveAttribute("aria-current", "page");
      // From the keyboard too.
      canvas.getByRole("link", { name: "Next page" }).focus();
      await userEvent.keyboard("{Enter}");
      await expect(args.onChange).toHaveBeenLastCalledWith(4, expect.anything());
      await expect(prevented).toEqual([true, true]);
      await expect(canvas.getByTestId("route")).toHaveTextContent("/members?page=4");
      // A modified click is the browser's (a new tab): onChange is not asked, so nothing is prevented.
      await userEvent.keyboard("{Control>}");
      await userEvent.click(canvas.getByRole("link", { name: "Page 5" }));
      await userEvent.keyboard("{/Control}");
      await expect(args.onChange).toHaveBeenCalledTimes(2);
      await expect(prevented).toEqual([true, true, false]);
      await expect(location.href).toBe(before);
    } finally {
      document.removeEventListener("click", watch);
    }
  },
};

export const Compact: Story = {
  tags: ["visual"],
  args: { variant: "compact", defaultPage: 3 },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await expect(canvas.getByRole("navigation", { name: "Pagination" })).toBeVisible();
    // Only previous and next, around the text.
    await expect(canvas.getAllByRole("button").map((b) => b.getAttribute("aria-label"))).toEqual([
      "Previous page",
      "Next page",
    ]);
    await expect(canvasElement.querySelector(".cy-pagination-page")).toBeNull();
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("Page 3 of 10");
    await expect(status).toBeVisible();
    const before = canvas.getByRole("button", { name: "Previous page" }).getBoundingClientRect();
    const after = canvas.getByRole("button", { name: "Next page" }).getBoundingClientRect();
    await expect(status.getBoundingClientRect().left).toBeGreaterThanOrEqual(before.right);
    await expect(status.getBoundingClientRect().right).toBeLessThanOrEqual(after.left);

    // The same polite live region gets the new text, so the change is announced.
    await userEvent.click(canvas.getByRole("button", { name: "Next page" }));
    await expect(args.onChange).toHaveBeenLastCalledWith(4, expect.anything());
    await expect(canvas.getByRole("status")).toBe(status);
    await expect(status).toHaveTextContent("Page 4 of 10");
    await expect(canvas.getByRole("button", { name: "Next page" })).toHaveFocus();

    for (let i = 0; i < 3; i++) await userEvent.click(canvas.getByRole("button", { name: "Previous page" }));
    await expect(status).toHaveTextContent("Page 1 of 10");
    await expect(canvas.getByRole("button", { name: "Previous page" })).toBeDisabled();
    // Previous can no longer hold focus: it goes to the control that still works.
    await expect(canvas.getByRole("button", { name: "Next page" })).toHaveFocus();
  },
};

export const CompactWithEdges: Story = {
  args: { variant: "compact", showEdges: true, defaultPage: 9 },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Last page" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Page 10 of 10");
    await expect(canvas.getByRole("button", { name: "Next page" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Last page" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "First page" })).toHaveFocus();
  },
};

export const LabelsOverride: Story = {
  args: {
    showEdges: true,
    defaultPage: 3,
    labels: {
      nav: "Pagination des résultats",
      previous: "Page précédente",
      next: "Page suivante",
      first: "Première page",
      last: "Dernière page",
      page: (n) => `Page numéro ${n}`,
      status: (page, count) => `${page} sur ${count}`,
    },
  },
  render: (args) => (
    <div style={{ display: "grid", gap: 12 }}>
      <Pagination {...args} />
      <Pagination {...args} variant="compact" labels={{ ...args.labels, nav: "Compacte" }} />
    </div>
  ),
  play: async ({ canvas }) => {
    const nav = canvas.getByRole("navigation", { name: "Pagination des résultats" });
    for (const name of [
      "Page précédente",
      "Page suivante",
      "Première page",
      "Dernière page",
      "Page numéro 4",
    ])
      await expect(within(nav).getByRole("button", { name })).toBeVisible();
    await expect(within(nav).getByRole("button", { name: "Page numéro 3" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    const compact = canvas.getByRole("navigation", { name: "Compacte" });
    await expect(within(compact).getByRole("status")).toHaveTextContent("3 sur 10");
    await expect(canvas.queryByRole("button", { name: "Next page" })).toBeNull();
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultPage: 5, showEdges: true },
  render: (args) => (
    <div style={{ display: "grid", gap: 12 }}>
      <Pagination {...args} />
      <Pagination {...args} getHref={(page) => `#page-${page}`} labels={{ nav: "Links" }} />
    </div>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const buttons = canvas.getAllByRole("button");
    await expect(buttons).toHaveLength(18);
    for (const button of buttons) {
      await expect(button).toBeDisabled();
      await userEvent.click(button);
      await userEvent.pointer({ keys: "[TouchA]", target: button });
    }
    await expect(args.onChange).not.toHaveBeenCalled();
    // Disabled controls are not links either, and the current page is still marked.
    await expect(canvas.queryByRole("link")).toBeNull();
    for (const nav of canvas.getAllByRole("navigation"))
      await expect(currentOf(nav)[0]).toHaveAccessibleName("Page 5");
    await userEvent.tab();
    for (const nav of canvas.getAllByRole("navigation"))
      await expect(nav).not.toContainElement(document.activeElement as HTMLElement);
  },
};

export const FocusMovesOnWhenTheControlGoes: Story = {
  render: () => {
    function Shrinking() {
      const [count, setCount] = useState(3);
      const [off, setOff] = useState(false);
      return (
        <div style={{ display: "grid", gap: 12 }}>
          <div data-testid="shrinking">
            {/* The list ends when its last page is opened (a filter that leaves one page). */}
            <Pagination count={count} onChange={(page) => page === 3 && setCount(1)} />
          </div>
          <Pagination count={5} disabled={off} onChange={() => setOff(true)} labels={{ nav: "Saving" }} />
        </div>
      );
    }
    return <Shrinking />;
  },
  play: async ({ canvas, userEvent }) => {
    // Every control is disabled by the press: there is nothing to focus, and nothing breaks.
    const saving = canvas.getByRole("navigation", { name: "Saving" });
    await userEvent.click(within(saving).getByRole("button", { name: "Page 2" }));
    await expect(currentOf(saving)[0]).toHaveAccessibleName("Page 2");
    await expect(within(saving).getByRole("button", { name: "Page 1" })).toBeDisabled();
    // The whole pagination goes away with the press.
    await userEvent.click(within(canvas.getByTestId("shrinking")).getByRole("button", { name: "Page 3" }));
    await expect(canvas.getByTestId("shrinking")).toBeEmptyDOMElement();
  },
};

export const RightToLeft: Story = {
  args: { defaultPage: 5, showEdges: true },
  render: (args) => (
    <div style={{ display: "grid", gap: 12 }}>
      <div dir="rtl" data-testid="rtl">
        <Pagination {...args} />
      </div>
      <div data-testid="ltr">
        <Pagination {...args} labels={{ nav: "Left to right" }} />
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const left = (el: Element) => el.getBoundingClientRect().left;
    const rtl = within(canvas.getByTestId("rtl"));
    const ltr = within(canvas.getByTestId("ltr"));
    const order = ["First page", "Previous page", "Page 1", "Page 5", "Page 10", "Next page", "Last page"];
    // Previous is on the right and the pages run right to left.
    const rtlLefts = order.map((name) => left(rtl.getByRole("button", { name })));
    await expect(rtlLefts).toEqual([...rtlLefts].sort((a, b) => b - a));
    const ltrLefts = order.map((name) => left(ltr.getByRole("button", { name })));
    await expect(ltrLefts).toEqual([...ltrLefts].sort((a, b) => a - b));
    // The chevrons are mirrored, so previous points right (towards where it goes).
    for (const name of ["First page", "Previous page", "Next page", "Last page"]) {
      const flipped = rtl.getByRole("button", { name }).querySelector(".cy-icon") as Element;
      const plain = ltr.getByRole("button", { name }).querySelector(".cy-icon") as Element;
      await expect(getComputedStyle(flipped).scale).toBe("-1 1");
      await expect(getComputedStyle(plain).scale).toBe("none");
    }
  },
};

export const SizesFollowTokens: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 12 }}>
      <Pagination {...args} count={100} defaultPage={50} size="sm" labels={{ nav: "Small" }} />
      <Pagination {...args} count={100} defaultPage={50} labels={{ nav: "Medium" }} />
      <Pagination {...args} variant="compact" size="sm" labels={{ nav: "Small compact" }} />
      <Pagination
        {...args}
        className="spaced"
        style={
          {
            "--cy-pagination-gap": "10px",
            "--cy-pagination-page-padding": "14px",
            "--cy-pagination-muted-color": "rgb(1, 2, 3)",
            marginBlockStart: 8,
          } as React.CSSProperties
        }
        labels={{ nav: "Themed" }}
      />
      <Pagination
        {...args}
        variant="compact"
        style={{ "--cy-pagination-muted-color": "rgb(1, 2, 3)" } as React.CSSProperties}
        labels={{ nav: "Themed compact" }}
      />
    </div>
  ),
  play: async ({ canvas }) => {
    const nav = (name: string) => canvas.getByRole("navigation", { name });
    for (const [name, size] of [
      ["Small", "sm"],
      ["Medium", "md"],
    ] as const) {
      const root = nav(name);
      const height = lengthOf(root, `var(--cy-control-height-${size})`);
      await expect(root).toHaveAttribute("data-size", size);
      for (const button of within(root).getAllByRole("button")) {
        const box = button.getBoundingClientRect();
        await expect(box.height).toBeCloseTo(height, 1);
        // Numbers are at least square; the arrows are square.
        await expect(box.width).toBeGreaterThanOrEqual(height - 0.01);
      }
      // One and two digits are the same width, so the row is steady; the ellipsis takes one square too.
      await expect(
        within(root).getByRole("button", { name: "Page 1" }).getBoundingClientRect().width,
      ).toBeCloseTo(within(root).getByRole("button", { name: "Page 50" }).getBoundingClientRect().width, 1);
      const gap = root.querySelector(".cy-pagination-gap") as Element;
      await expect(gap.getBoundingClientRect().width).toBeCloseTo(height, 1);
      await expect(getComputedStyle(root).fontSize).toBe(
        `${lengthOf(root, `var(--cy-font-size-${size})`)}px`,
      );
      await expect(getComputedStyle(root.querySelector("ol") as Element).columnGap).toBe(
        `${lengthOf(root, "var(--cy-space-2)")}px`,
      );
    }
    await expect(
      within(nav("Small")).getByRole("button", { name: "Page 1" }).getBoundingClientRect().height,
    ).toBeLessThan(
      within(nav("Medium")).getByRole("button", { name: "Page 1" }).getBoundingClientRect().height,
    );
    const status = within(nav("Small compact")).getByRole("status");
    await expect(getComputedStyle(status).fontSize).toBe(getComputedStyle(nav("Small")).fontSize);

    // Component tokens.
    const themed = nav("Themed");
    await expect(themed).toHaveClass("cy-pagination", "spaced");
    await expect(getComputedStyle(themed).marginTop).toBe("8px");
    await expect(getComputedStyle(themed.querySelector("ol") as Element).columnGap).toBe("10px");
    const page = within(themed).getByRole("button", { name: "Page 2" });
    await expect(getComputedStyle(page).paddingInlineStart).toBe("14px");
    await expect(getComputedStyle(page).paddingInlineEnd).toBe("14px");
    await expect(getComputedStyle(themed.querySelector(".cy-pagination-gap") as Element).color).toBe(
      "rgb(1, 2, 3)",
    );
    await expect(getComputedStyle(within(nav("Themed compact")).getByRole("status")).color).toBe(
      "rgb(1, 2, 3)",
    );
    // The current page is filled and the others are not.
    const current = currentOf(themed)[0] as Element;
    await expect(getComputedStyle(current).backgroundColor).not.toBe(getComputedStyle(page).backgroundColor);
  },
};

export const RefIsTheNav: Story = {
  render: (args) => {
    function WithRef() {
      const ref = useRef<HTMLElement>(null);
      const [tag, setTag] = useState("");
      return (
        <>
          <Pagination {...args} ref={ref} />
          <Button
            onClick={() => setTag(`${ref.current?.tagName}:${ref.current?.getAttribute("aria-label")}`)}
          >
            Read ref
          </Button>
          <span data-testid="tag">{tag}</span>
        </>
      );
    }
    return <WithRef />;
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Read ref" }));
    await expect(canvas.getByTestId("tag")).toHaveTextContent("NAV:Pagination");
  },
};

export const NoOverflowAt320: Story = {
  args: { count: 100, showEdges: true },
  render: (args) => (
    <div data-testid="phone" style={{ inlineSize: 320, display: "grid", gap: 12 }}>
      <Pagination {...args} defaultPage={1} labels={{ nav: "Start" }} />
      <Pagination {...args} defaultPage={50} labels={{ nav: "Middle" }} />
      <Pagination {...args} defaultPage={100} siblings={2} boundaries={2} labels={{ nav: "End" }} />
      <Pagination {...args} defaultPage={100} variant="compact" labels={{ nav: "Compact" }} />
    </div>
  ),
  play: async ({ canvas }) => {
    const phone = canvas.getByTestId("phone");
    const edge = phone.getBoundingClientRect();
    await expect(edge.width).toBe(320);
    await expect(phone.scrollWidth).toBeLessThanOrEqual(320);
    for (const nav of canvas.getAllByRole("navigation")) {
      await expect(nav.scrollWidth).toBeLessThanOrEqual(nav.clientWidth);
      // Every control is inside the 320px, whole: the row wraps instead of running off the side.
      for (const control of within(nav).getAllByRole("button")) {
        const box = control.getBoundingClientRect();
        await expect(box.left).toBeGreaterThanOrEqual(edge.left - 0.5);
        await expect(box.right).toBeLessThanOrEqual(edge.right + 0.5);
        await expect(box.width).toBeGreaterThan(0);
      }
    }
    // The compact variant stays on one line.
    const compact = within(canvas.getByRole("navigation", { name: "Compact" })).getAllByRole("button");
    await expect(new Set(compact.map((b) => Math.round(b.getBoundingClientRect().top))).size).toBe(1);
  },
};

export const TouchHitAreas: Story = {
  tags: ["touch", "!dev"],
  args: { defaultPage: 5, showEdges: true, size: "sm" },
  render: (args) => (
    <div style={{ display: "grid", gap: 24, padding: 12 }}>
      <Pagination {...args} />
      <Pagination {...args} variant="compact" labels={{ nav: "Compact" }} />
      <Pagination {...args} getHref={(page) => `#page-${page}`} labels={{ nav: "Links" }} />
    </div>
  ),
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    canvasElement.addEventListener("click", (event) => event.preventDefault());
    await expect(matchMedia("(pointer: coarse)").matches).toBe(true);
    for (const nav of canvas.getAllByRole("navigation")) {
      const controls = [...nav.querySelectorAll(".cy-button")];
      for (const control of controls) {
        const hit = pseudo(control);
        await expect(Math.min(hit.w, hit.h)).toBeGreaterThanOrEqual(44);
        // The visible control keeps its small size.
        await expect(control.getBoundingClientRect().height).toBeLessThan(44);
      }
      // Neighbours stand far enough apart that their hit areas do not overlap.
      const centres = controls.map((c) => {
        const box = c.getBoundingClientRect();
        return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
      });
      for (let i = 1; i < centres.length; i++) {
        const a = centres[i - 1] as { x: number; y: number };
        const b = centres[i] as { x: number; y: number };
        await expect(Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y))).toBeGreaterThanOrEqual(44 - 0.01);
      }
    }
    const nav = canvas.getByRole("navigation", { name: "Pagination" });
    await userEvent.pointer({
      keys: "[TouchA]",
      target: within(nav).getByRole("button", { name: "Page 6" }),
    });
    await expect(args.onChange).toHaveBeenLastCalledWith(6, expect.anything());
    await userEvent.pointer({
      keys: "[TouchA]",
      target: within(nav).getByRole("button", { name: "Next page" }),
    });
    await expect(args.onChange).toHaveBeenLastCalledWith(7, expect.anything());
    await expect(currentOf(nav)[0]).toHaveAccessibleName("Page 7");
    const links = canvas.getByRole("navigation", { name: "Links" });
    await userEvent.pointer({
      keys: "[TouchA]",
      target: within(links).getByRole("link", { name: "Page 4" }),
    });
    await expect(currentOf(links)[0]).toHaveAccessibleName("Page 4");
  },
};

const STABLE = [
  "display",
  "color",
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
  "text-transform",
  "box-sizing",
  "margin-top",
  "padding-inline-start",
  "column-gap",
  "width",
  "height",
];

export const StableUnderHostileHost: Story = {
  args: { count: 100, defaultPage: 50, showEdges: true },
  render: (args) => (
    <div style={{ display: "grid", gap: 12 }}>
      <Pagination {...args} />
      <Pagination {...args} variant="compact" labels={{ nav: "Compact" }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const selector of [
      ".cy-pagination",
      ".cy-pagination-list",
      ".cy-pagination-item",
      ".cy-pagination-gap",
      ".cy-pagination-gap .cy-icon",
      ".cy-pagination-page",
      ".cy-pagination-page[aria-current]",
      ".cy-icon-button",
      ".cy-icon-button .cy-icon",
      ".cy-pagination-status",
    ]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, STABLE);
      await expect(hostile, selector).toEqual(clean);
    }
    await waitFor(() => expect(canvasElement.querySelector(".cy-pagination")).toBeVisible());
  },
};
