import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  clampDate,
  firstDayOfWeek,
  fromISODate,
  isISODate,
  toISODate,
} from "../../src/components/Calendar/dates.js";
import { formatTime, parseTime } from "../../src/components/TimeField/TimeField.js";

describe("dates", () => {
  it("reads only real dates", () => {
    expect(isISODate("2026-11-10")).toBe(true);
    expect(isISODate("2026-02-30")).toBe(false);
    expect(isISODate("2028-02-29")).toBe(true);
    expect(isISODate("2026-1-5")).toBe(false);
    expect(isISODate("soon")).toBe(false);
  });
  it("keeps years below 100 as written", () => {
    expect(toISODate(fromISODate("0042-03-04") as Date)).toBe("0042-03-04");
  });
  it("adds days and months, keeping month ends", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addMonths("2027-01-31", 1)).toBe("2027-02-28");
    expect(addMonths("2028-01-31", 1)).toBe("2028-02-29");
    expect(addMonths("2026-11-10", -12)).toBe("2025-11-10");
  });
  it("clamps to limits that may be missing", () => {
    expect(clampDate("2026-01-01", "2026-02-01")).toBe("2026-02-01");
    expect(clampDate("2026-12-01", undefined, "2026-06-30")).toBe("2026-06-30");
    expect(clampDate("2026-05-05")).toBe("2026-05-05");
  });
  it("finds the first day of the week, or Monday", () => {
    expect(firstDayOfWeek("not a locale!")).toBe(1);
    expect([0, 1, 6]).toContain(firstDayOfWeek("en-US"));
  });
});

describe("times", () => {
  it("reads times loosely and refuses what is not one", () => {
    expect(parseTime("9")).toBe(9 * 3600);
    expect(parseTime("0930")).toBe(9.5 * 3600);
    expect(parseTime("9:30 p.m.")).toBe(21.5 * 3600);
    expect(parseTime("12pm")).toBe(12 * 3600);
    expect(parseTime("12:00:59")).toBe(12 * 3600 + 59);
    expect(parseTime("0 am")).toBeNull();
    expect(parseTime("24:00")).toBeNull();
    expect(parseTime("12:60")).toBeNull();
  });
  it("writes HH:MM, wrapping past midnight", () => {
    expect(formatTime(-60)).toBe("23:59");
    expect(formatTime(86400 + 61, true)).toBe("00:01:01");
  });
});
