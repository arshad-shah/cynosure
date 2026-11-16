import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { ROOT_ATTRIBUTES, rootAttributesStory } from "../../test/root-attributes.js";
import { HtmlPreview, htmlPolicy } from "./HtmlPreview.js";

const PAGE = `<h1>Order shipped</h1><p>Your parcel is on its way.</p>`;
const WITH_IMAGE = `<p>Logo:</p><img src="https://images.example.com/logo.png" alt="Logo">`;

const meta = {
  title: "Components/Feedback and display/HtmlPreview",
  component: HtmlPreview,
  args: { label: "Response preview", html: PAGE },
  argTypes: {
    html: { control: "text" },
    remoteImages: { control: "boolean" },
    ratio: { control: "number" },
  },
  decorators: [(Story) => <div style={{ inlineSize: 480 }}>{Story()}</div>],
} satisfies Meta<typeof HtmlPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

const frameOf = (el: Element) => el.querySelector("iframe") as HTMLIFrameElement;
/** The policy written into the frame's document. */
const policyOf = (el: Element) =>
  /http-equiv="Content-Security-Policy" content="([^"]*)"/.exec(frameOf(el).srcdoc)?.[1] ?? "";

export const ShowsHtmlInASandbox: Story = {
  play: async ({ canvas, canvasElement }) => {
    const frame = frameOf(canvasElement);
    // A named frame, with every sandbox restriction.
    await expect(frame).toHaveAccessibleName("Response preview");
    await expect(frame.getAttribute("sandbox")).toBe("");
    // The document is the HTML after a policy that blocks everything but inline styles and embedded pictures.
    await expect(frame.srcdoc).toContain(PAGE);
    await expect(frame.srcdoc.indexOf("Content-Security-Policy")).toBeLessThan(frame.srcdoc.indexOf(PAGE));
    const policy = policyOf(canvasElement);
    await expect(policy).toContain("default-src 'none'");
    await expect(policy).toContain("img-src data: blob:;");
    await expect(policy).not.toContain("https:");
    // No notice: nothing remote to block.
    await expect(canvas.queryByRole("button", { name: "Show remote images" })).toBeNull();
  },
};

export const ScriptsNeverRun: Story = {
  args: {
    html: `<script>parent.postMessage("ran", "*")</script><img src=x onerror="parent.postMessage('ran','*')">`,
  },
  play: async ({ canvasElement }) => {
    let ran = false;
    const listen = (e: MessageEvent) => {
      if (e.data === "ran") ran = true;
    };
    window.addEventListener("message", listen);
    await waitFor(() => expect(frameOf(canvasElement)).toBeInTheDocument());
    // Load the document again now that we listen, so a script that did run could not have done so unheard.
    const frame = frameOf(canvasElement) as HTMLIFrameElement;
    frame.srcdoc = `${frame.srcdoc} `;
    await new Promise((r) => setTimeout(r, 300));
    window.removeEventListener("message", listen);
    await expect(ran).toBe(false);
    await expect(policyOf(canvasElement)).toContain("script-src 'none'");
  },
};

export const RemoteImagesAreAnOptIn: Story = {
  args: { html: WITH_IMAGE, onRemoteImagesChange: fn() },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    // Remote pictures are blocked, and a notice offers to show them.
    await expect(policyOf(canvasElement)).not.toContain("https:");
    await expect(canvas.getByText("Remote images are blocked to protect your privacy.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Show remote images" }));
    await expect(args.onRemoteImagesChange).toHaveBeenCalledWith(true);
    // Now the policy lets https pictures (and only pictures) load, and the notice is gone.
    await waitFor(() => expect(policyOf(canvasElement)).toContain("img-src data: blob: https:;"));
    await expect(policyOf(canvasElement)).toContain("default-src 'none'");
    await expect(canvas.queryByRole("button", { name: "Show remote images" })).toBeNull();
  },
};

export const RemoteImagesControlled: Story = {
  render: (args) => {
    function Controlled() {
      const [on, setOn] = useState(true);
      return (
        <>
          <HtmlPreview {...args} html={WITH_IMAGE} remoteImages={on} onRemoteImagesChange={setOn} />
          <output data-testid="on">{String(on)}</output>
        </>
      );
    }
    return <Controlled />;
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(policyOf(canvasElement)).toContain("https:");
    await expect(canvas.queryByText(/Remote images are blocked/)).toBeNull();
  },
};

export const FindsRemoteReferencesOfEveryKind: Story = {
  render: () => (
    <>
      <HtmlPreview label="srcset" html={`<img srcset="https://a.example/x.png 2x">`} />
      <HtmlPreview label="css" html={`<div style="background:url('http://a.example/b.png')"></div>`} />
      <HtmlPreview
        label="none"
        html={`<img src="data:image/png;base64,AAAA"><a href="https://a.example">link</a>`}
      />
    </>
  ),
  play: async ({ canvas }) => {
    // A link is not loaded, so it is no reason for the notice; srcset and CSS pictures are.
    await expect(canvas.getAllByRole("button", { name: "Show remote images" })).toHaveLength(2);
  },
};

export const WithoutTheNotice: Story = {
  args: { html: WITH_IMAGE, notice: false },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("button", { name: "Show remote images" })).toBeNull();
  },
};

export const SizedByRatioOrTokens: Story = {
  render: () => (
    <>
      <HtmlPreview label="Wide" html={PAGE} ratio={2} />
      <div style={{ ["--cy-html-preview-height" as string]: "150px" }}>
        <HtmlPreview label="Tall" html={PAGE} />
      </div>
    </>
  ),
  play: async ({ canvasElement }) => {
    const [wide, tall] = [...canvasElement.querySelectorAll("iframe")] as HTMLIFrameElement[];
    const w = (wide as HTMLIFrameElement).getBoundingClientRect();
    await expect(w.width).toBeCloseTo(480, 0);
    await expect(w.height).toBeCloseTo(240, 0);
    await expect((tall as HTMLIFrameElement).getBoundingClientRect().height).toBeCloseTo(150, 0);
  },
};

export const Labels: Story = {
  args: {
    html: WITH_IMAGE,
    labels: { blocked: "Externe Bilder sind blockiert.", allow: "Bilder anzeigen" },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Externe Bilder sind blockiert.")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Bilder anzeigen" })).toBeVisible();
  },
};

export const PolicyHelper: Story = {
  play: async () => {
    await expect(htmlPolicy(false)).toBe(
      "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:; form-action 'none'; base-uri 'none'",
    );
    await expect(htmlPolicy(true)).toContain("img-src data: blob: https:;");
  },
};

export const StableUnderHostileHost: Story = {
  args: { html: WITH_IMAGE },
  play: async ({ canvasElement }) => {
    // Its own parts; the notice is Notice's and is tested there.
    const cases: [string, string[]][] = [
      [".cy-html-preview", ["display", "width", "font-size", "box-sizing", "row-gap"]],
      [
        ".cy-html-preview-frame",
        ["display", "width", "height", "box-sizing", "border-top-width", "background-color"],
      ],
    ];
    for (const [selector, props] of cases) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};

export const PassesIdDataAndRef: Story = rootAttributesStory<HTMLDivElement>(
  (ref) => <HtmlPreview ref={ref} label="Preview" html={PAGE} {...ROOT_ATTRIBUTES} />,
  "cy-html-preview",
);
