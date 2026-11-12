import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Calendar } from "../../src/components/Calendar/Calendar";
import { ThemeToggle } from "../../src/components/ThemeToggle/ThemeToggle";
import { CynosureTheme } from "../../src/theme/CynosureTheme";
import { useCynosureTheme } from "../../src/theme/use-cynosure-theme";
import { createTheme } from "../../src/tokens";

describe("server rendering (Important 6)", () => {
  it("renders the system mode on the server without reading storage, so hydration matches", () => {
    let reads = 0;
    const storage = {
      get: () => {
        reads++;
        return "dark";
      },
      set: () => {},
    };
    const html = renderToString(<ThemeToggle storage={storage} />);
    expect(reads).toBe(0);
    expect(html).toMatch(/value="system"[^>]*checked|checked[^>]*value="system"/);
  });
  it("resolves the theme on the server as light with normal contrast, the first client render's values", () => {
    const Probe = () => {
      const { palette, colors } = useCynosureTheme();
      return <span data-palette={palette} data-bg={colors.bg} />;
    };
    expect(renderToString(<Probe />)).toContain(
      `data-palette="light" data-bg="${createTheme().palettes.light.bg}"`,
    );
    const html = renderToString(
      <CynosureTheme mode="system">
        <Probe />
      </CynosureTheme>,
    );
    expect(html).toContain('data-palette="light"');
  });
});

describe("Calendar on the server", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
  /** The calendar rendered as a server would, on a device with this date and language. */
  const serve = (now: string, language: string) => {
    vi.useFakeTimers({ toFake: ["Date"], now: new Date(`${now}T12:00:00`) });
    vi.stubGlobal("navigator", { language });
    return renderToString(<Calendar defaultValue="2026-11-10" monthPicker />);
  };

  it("renders the same markup whatever the server's date and language, so hydration matches", () => {
    // The device's date, its language and the default Intl locale are only known in the browser: they settle there.
    const made: unknown[] = [];
    const DateTimeFormat = Intl.DateTimeFormat;
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
      class extends DateTimeFormat {
        constructor(locale?: string | string[], options?: Intl.DateTimeFormatOptions) {
          super(locale, options);
          made.push(locale);
        }
      } as typeof Intl.DateTimeFormat,
    );
    const a = serve("2026-11-10", "en-US");
    const b = serve("2026-11-12", "ar-SA");
    expect(a).toBe(b);
    expect(made.length).toBeGreaterThan(0);
    expect(made).not.toContain(undefined);
    // Nothing is marked as today until the browser says which day that is.
    expect(a).not.toContain('aria-current="date"');
  });

  it("uses what it is given on the server: the locale, the first day of the week and today", () => {
    const html = renderToString(
      <Calendar defaultValue="2026-11-10" locale="fr-FR" weekStartsOn={0} today="2026-11-10" />,
    );
    expect(html).toContain("novembre 2026");
    expect(html.indexOf("dimanche")).toBeLessThan(html.indexOf("lundi"));
    expect(html).toMatch(
      /aria-current="date"[^>]*data-date="2026-11-10"|data-date="2026-11-10"[^>]*aria-current="date"/,
    );
  });
});
