// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Tab, TabList, TabPanel } from "../../src/components/Tabs/Tabs";

afterEach(cleanup);

describe("Tabs parts", () => {
  it("explain when used outside <Tabs>", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TabList label="x" />)).toThrow("<TabList> must be inside <Tabs>");
    expect(() => render(<Tab value="a">A</Tab>)).toThrow("<Tab> must be inside <Tabs>");
    expect(() => render(<TabPanel value="a" />)).toThrow("<TabPanel> must be inside <Tabs>");
    quiet.mockRestore();
  });
});

describe("AccordionItem", () => {
  it("explains when used outside <Accordion>", async () => {
    const { AccordionItem } = await import("../../src/components/Accordion/Accordion");
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<AccordionItem value="a" summary="A" />)).toThrow(
      "<AccordionItem> must be inside <Accordion>",
    );
    quiet.mockRestore();
  });
});
