import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { contrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CynosureTheme } from "../../theme/CynosureTheme.js";
import { Badge } from "../Badge/Badge.js";
import { Button } from "../Button/Button.js";
import { Stack } from "../Stack/Stack.js";
import { Prose } from "./Prose.js";

/** What a Markdown renderer produces: plain elements, no classes. */
function Article() {
  return (
    <>
      <h1>Release notes</h1>
      <p>
        This release adds <strong>offline mode</strong>, a faster <em>search</em> and a{" "}
        <a href="#changelog">full changelog</a>. Press <kbd>Ctrl</kbd> and <code>K</code> to search.
      </p>
      <h2>What changed</h2>
      <ul>
        <li>Offline drafts</li>
        <li>
          Search
          <ul>
            <li>Fuzzy matching</li>
          </ul>
        </li>
      </ul>
      <ol>
        <li>Update the app</li>
        <li>Restart it</li>
      </ol>
      <h3>Configuration</h3>
      <pre>
        <code>
          {
            '{\n  "offline": true,\n  "aVeryLongSettingNameThatKeepsGoingWellPastTheEdgeOfTheColumn": "value"\n}'
          }
        </code>
      </pre>
      <blockquote>
        <p>It finally works on the train.</p>
      </blockquote>
      <hr />
      <table>
        <thead>
          <tr>
            <th>Plan</th>
            <th>Seats</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Team</td>
            <td>10</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

const meta = {
  title: "Components/Prose",
  component: Prose,
  args: { size: "md", as: "article" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    as: { control: "inline-radio", options: ["div", "article", "section"] },
  },
  render: (args) => (
    <Prose {...args}>
      <Article />
    </Prose>
  ),
} satisfies Meta<typeof Prose>;
export default meta;
type Story = StoryObj<typeof meta>;

const q = (root: Element, selector: string) => root.querySelector(selector) as HTMLElement;
const css = (el: Element) => getComputedStyle(el);
const px = (value: string) => Number.parseFloat(value);

export const HeadingsStepDownInSize: Story = {
  tags: ["visual"],
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("article")).toBeVisible();
    const size = (s: string) => px(css(q(canvasElement, s)).fontSize);
    await expect(size("h1")).toBeGreaterThan(size("h2"));
    await expect(size("h2")).toBeGreaterThan(size("h3"));
    await expect(size("h3")).toBeGreaterThan(size("p"));
    await expect(Number(css(q(canvasElement, "h2")).fontWeight)).toBeGreaterThan(
      Number(css(q(canvasElement, "p")).fontWeight),
    );
  },
};

export const BlocksAreSpacedApart: Story = {
  play: async ({ canvasElement }) => {
    const root = q(canvasElement, ".cy-prose");
    // The first block touches the top; later blocks are separated, headings more than paragraphs.
    await expect(q(canvasElement, "h1").getBoundingClientRect().top).toBeCloseTo(
      root.getBoundingClientRect().top,
      0,
    );
    await expect(px(css(q(canvasElement, "p")).marginBlockStart)).toBeGreaterThan(0);
    await expect(px(css(q(canvasElement, "h2")).marginBlockStart)).toBeGreaterThan(
      px(css(q(canvasElement, "ul")).marginBlockStart),
    );
  },
};

export const ListsKeepTheirMarkers: Story = {
  play: async ({ canvasElement }) => {
    await expect(css(q(canvasElement, "ul")).listStyleType).toBe("disc");
    await expect(css(q(canvasElement, "ul ul")).listStyleType).toBe("circle");
    await expect(css(q(canvasElement, "ol")).listStyleType).toBe("decimal");
    await expect(px(css(q(canvasElement, "ul")).paddingInlineStart)).toBeGreaterThan(0);
    await expect(css(q(canvasElement, "li")).display).toBe("list-item");
  },
};

export const LinksStandOut: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const link = canvas.getByRole("link", { name: "full changelog" });
    await expect(css(link).textDecorationLine).toBe("underline");
    const page = css(q(canvasElement, ".cy-prose")).color;
    await expect(css(link).color).not.toBe(page);
    // Keyboard: the link shows a focus ring.
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(css(link).outlineStyle).toBe("solid");
  },
};

export const CodeIsMonospacedAndWraps: Story = {
  render: (args) => (
    <div style={{ inlineSize: 320 }}>
      <Prose {...args}>
        <Article />
      </Prose>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const inline = q(canvasElement, "p code");
    const pre = q(canvasElement, "pre");
    await expect(css(inline).fontFamily).toContain("monospace");
    await expect(css(inline).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    // A long line wraps inside the block: no page overflow, and no scroll region keyboard users cannot reach.
    await expect(pre.getBoundingClientRect().width).toBeLessThanOrEqual(320);
    await expect(pre.scrollWidth).toBeLessThanOrEqual(pre.clientWidth);
    await expect(css(pre).whiteSpace).toBe("pre-wrap");
  },
};

export const LinesStayReadable: Story = {
  render: (args) => (
    <div style={{ inlineSize: 2000 }}>
      <Prose {...args}>
        <p>{"A long paragraph. ".repeat(60)}</p>
      </Prose>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const p = q(canvasElement, "p");
    const em = px(css(p).fontSize);
    // About 70 characters a line at most, however wide the page.
    await expect(p.getBoundingClientRect().width).toBeLessThan(em * 50);
  },
};

export const ComponentsInsideKeepTheirStyles: Story = {
  render: (args) => (
    <Stack gap="6">
      <Prose {...args}>
        <h2>Plans</h2>
        <p>
          Status: <Badge tone="success">Live</Badge>
        </p>
        <Button>Upgrade</Button>
      </Prose>
      <div className="outside">
        <Badge tone="success">Live</Badge>
        <Button>Upgrade</Button>
      </div>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const props = [
      "font-family",
      "font-size",
      "font-weight",
      "color",
      "margin-top",
      "padding-left",
      "line-height",
    ];
    const read = (el: Element) => Object.fromEntries(props.map((p) => [p, css(el).getPropertyValue(p)]));
    // Prose stops at Cynosure components: inside it they look exactly as they do outside.
    for (const selector of [".cy-badge", ".cy-button"]) {
      const inside = q(q(canvasElement, ".cy-prose"), selector);
      const outside = q(q(canvasElement, ".outside"), selector);
      await expect({ selector, ...read(inside) }).toEqual({ selector, ...read(outside) });
    }
  },
};

export const HostClassesStillWin: Story = {
  render: (args) => (
    <Prose {...args}>
      <style>{".token-keyword{color:rgb(0, 90, 0)}"}</style>
      <pre>
        <code>
          <span className="token-keyword">const</span> x = 1;
        </code>
      </pre>
    </Prose>
  ),
  play: async ({ canvasElement }) => {
    // A syntax highlighter's classes beat Prose's colour reset.
    await expect(css(q(canvasElement, ".token-keyword")).color).toBe("rgb(0, 90, 0)");
  },
};

export const FollowsTheTextDirection: Story = {
  render: (args) => (
    <div dir="rtl">
      <Prose {...args}>
        <Article />
      </Prose>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const ul = q(canvasElement, "ul");
    const li = q(canvasElement, "li");
    // Indented from the right, and the quote rule is on the right.
    await expect(ul.getBoundingClientRect().right - li.getBoundingClientRect().right).toBeGreaterThan(0);
    await expect(px(css(q(canvasElement, "blockquote")).borderRightWidth)).toBeGreaterThan(0);
  },
};

export const ReadableInLightAndDark: Story = {
  render: (args) => (
    <Stack gap="4">
      {(["light", "dark"] as const).map((mode) => (
        <CynosureTheme key={mode} mode={mode}>
          <div className="surface" style={{ background: "var(--cy-color-surface)", padding: 8 }}>
            <Prose {...args}>
              <Article />
            </Prose>
          </div>
        </CynosureTheme>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    for (const surface of canvasElement.querySelectorAll(".surface")) {
      const page = css(surface).backgroundColor;
      for (const selector of ["p", "h1", "a", "blockquote", "td"]) {
        const el = q(surface, selector);
        await expect({ selector, ok: contrast(css(el).color, page) >= 4.5 }).toEqual({ selector, ok: true });
      }
      const code = q(surface, "p code");
      await expect(contrast(css(code).color, css(code).backgroundColor)).toBeGreaterThanOrEqual(4.5);
    }
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = [
      "font-size",
      "font-weight",
      "line-height",
      "color",
      "margin-top",
      "padding-left",
      "list-style-type",
      "letter-spacing",
      "text-transform",
      "box-sizing",
    ];
    for (const selector of [
      ".cy-prose",
      "h1",
      "h2",
      "p",
      "strong",
      "a",
      "ul",
      "li",
      "pre",
      "code",
      "blockquote",
      "td",
    ]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
