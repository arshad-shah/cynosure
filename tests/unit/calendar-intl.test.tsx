import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { Calendar } from "../../src/components/Calendar/Calendar";
import { firstDayOfWeek, weekendDays } from "../../src/components/Calendar/dates";

afterEach(() => vi.restoreAllMocks());

/** Counts the `Intl` objects of `kind` built while `run` runs. */
function counting(kind: "DateTimeFormat" | "Locale", run: () => void) {
  let built = 0;
  const Real = Intl[kind] as unknown as new (...args: unknown[]) => object;
  vi.spyOn(Intl, kind).mockImplementation(
    class extends Real {
      constructor(...args: unknown[]) {
        super(...args);
        built++;
      }
    } as never,
  );
  run();
  vi.restoreAllMocks();
  return built;
}

it("builds a locale's date names once, not on every render (a month is about 40 names)", () => {
  const draw = (locale: string) =>
    renderToString(<Calendar defaultValue="2026-11-10" locale={locale} monthPicker today="2026-11-10" />);
  const first = draw("en-GB");
  const fresh = counting("DateTimeFormat", () => draw("de-DE"));
  // One per kind of name: weekday (long, short), full date, day number, title, and the month picker's months and year.
  expect(fresh).toBeGreaterThan(0);
  expect(fresh).toBeLessThanOrEqual(8);
  // Drawn again, the names are the same and no formatter is built.
  let again = "";
  expect(
    counting("DateTimeFormat", () => {
      again = draw("en-GB");
    }),
  ).toBe(0);
  expect(again).toBe(first);
});

it("reads a locale's week once", () => {
  const before = [firstDayOfWeek("ar-EG"), weekendDays("ar-EG")];
  let after: unknown[] = [];
  expect(
    counting("Locale", () => {
      after = [firstDayOfWeek("ar-EG"), weekendDays("ar-EG")];
    }),
  ).toBe(0);
  expect(after).toEqual(before);
});
