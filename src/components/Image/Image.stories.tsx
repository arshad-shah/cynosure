import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, fn, waitFor } from "storybook/test";
import { textContrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { Image } from "./Image.js";

/**
 * Pictures that need no network: an SVG as a data URL. Each call gives a different address, so no story finds its
 * picture already decoded by another one.
 */
let serial = 0;
const picture = (width: number, height: number, fill = "teal") =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><!-- ${++serial} --><rect width="100%" height="100%" fill="${fill}"/><circle cx="25%" cy="25%" r="${height / 6}" fill="gold"/></svg>`,
  )}`;
/** An address that fails at once, also without a network. */
const broken = (n: number) => `data:image/png;base64,AAAA${"A".repeat(n * 4)}`;

/** Far below the screen, so a lazy picture has not started loading: the state before load can be looked at. */
const FarBelow = ({ children }: { children: React.ReactNode }) => (
  <div style={{ paddingBlockStart: 30000 }}>{children}</div>
);

const frameOf = (el: ParentNode, selector = ".cy-image") => el.querySelector(selector) as HTMLElement;
const box = (el: Element) => el.getBoundingClientRect();
const stateOf = (el: ParentNode, selector?: string) => frameOf(el, selector).getAttribute("data-state");
const loaded = (el: ParentNode, selector?: string) =>
  waitFor(() => expect(stateOf(el, selector)).toBe("loaded"), { timeout: 3000 });
const failed = (el: ParentNode, selector?: string) =>
  waitFor(() => expect(stateOf(el, selector)).toBe("error"), { timeout: 3000 });

const HILL = picture(640, 360);

const meta = {
  title: "Components/Image",
  component: Image,
  args: {
    src: HILL,
    alt: "A gold sun over a teal hill",
    onLoad: fn(),
    onError: fn(),
  },
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
    ratio: { control: "text" },
    fit: { control: "inline-radio", options: ["cover", "contain"] },
    position: { control: "text" },
    radius: { control: "inline-radio", options: ["none", "sm", "md", "lg", "card", "full"] },
    loading: { control: "inline-radio", options: ["lazy", "eager"] },
    caption: { control: "text" },
    placeholder: { control: false },
    fallback: { control: false },
  },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}>{Story()}</div>],
} satisfies Meta<typeof Image>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["visual"],
  args: { ratio: 16 / 9, radius: "card" },
  play: async ({ canvas, canvasElement, args }) => {
    const img = canvas.getByRole("img", { name: "A gold sun over a teal hill" });
    await expect(img).toHaveAttribute("src", HILL);
    // Lazy and decoded off the main thread unless asked otherwise.
    await expect(img).toHaveAttribute("loading", "lazy");
    await expect(img).toHaveAttribute("decoding", "async");
    await loaded(canvasElement);
    await expect(args.onLoad).toHaveBeenCalledTimes(1);
    await expect(args.onError).not.toHaveBeenCalled();
    // The picture fills the 16 to 9 box.
    const frame = box(frameOf(canvasElement));
    await expect(frame.height).toBeCloseTo((frame.width * 9) / 16, 0);
    await expect(box(img).width).toBeCloseTo(frame.width, 0);
    await expect(box(img).height).toBeCloseTo(frame.height, 0);
  },
};

const SET = `${picture(320, 180)} 320w, ${picture(640, 360)} 640w`;

export const PassesAttributesToTheImg: Story = {
  args: { srcSet: SET, sizes: "(min-width: 600px) 640px, 100vw", width: 640, height: 360, loading: "eager" },
  play: async ({ canvas, canvasElement }) => {
    const img = canvas.getByRole("img", { name: "A gold sun over a teal hill" });
    await expect(img).toHaveAttribute("srcset", SET);
    await expect(img).toHaveAttribute("sizes", "(min-width: 600px) 640px, 100vw");
    await expect(img).toHaveAttribute("width", "640");
    await expect(img).toHaveAttribute("height", "360");
    await expect(img).toHaveAttribute("loading", "eager");
    await loaded(canvasElement);
    // Dragging and the context menu are the browser's own: nothing is switched off.
    await expect(img).not.toHaveAttribute("draggable");
    await expect(getComputedStyle(img).pointerEvents).toBe("auto");
  },
};

export const DecorativeIsHiddenFromAssistiveTechnology: Story = {
  args: { alt: "", ratio: 2 },
  play: async ({ canvas, canvasElement }) => {
    await loaded(canvasElement);
    // An empty alt takes the picture out of the accessibility tree: nothing has the image role.
    await expect(canvas.queryByRole("img")).toBeNull();
    await expect(canvasElement.querySelector("img")).toHaveAttribute("alt", "");
    await expect(canvas.getByRole("presentation")).toBe(canvasElement.querySelector("img"));
  },
};

export const PlaceholderUntilLoaded: Story = {
  args: { ratio: 2, src: picture(400, 200) },
  render: (args) => (
    <FarBelow>
      <Image {...args} />
    </FarBelow>
  ),
  play: async ({ canvasElement }) => {
    const frame = frameOf(canvasElement);
    const img = canvasElement.querySelector("img") as HTMLImageElement;
    await expect(frame).toHaveAttribute("data-state", "loading");
    // The Skeleton stands in, hidden from assistive technology, and covers the whole box.
    const skeleton = frame.querySelector(".cy-image-placeholder > .cy-skeleton") as HTMLElement;
    await expect(skeleton).toHaveAttribute("aria-hidden", "true");
    const bone = box(skeleton.querySelector(".cy-skeleton-bone") as Element);
    await expect(bone.width).toBeCloseTo(box(frame).width, 0);
    await expect(bone.height).toBeCloseTo(box(frame).height, 0);
    await expect(getComputedStyle(img).opacity).toBe("0");
    // The space is already reserved: 2 to 1.
    const before = box(frame).height;
    await expect(before).toBeCloseTo(box(frame).width / 2, 0);

    img.scrollIntoView();
    await loaded(canvasElement);
    await expect(frame.querySelector(".cy-image-placeholder")).toBeNull();
    await expect(frame.querySelector(".cy-skeleton")).toBeNull();
    await waitFor(() => expect(getComputedStyle(img).opacity).toBe("1"), { timeout: 3000 });
    // Nothing moved when the picture arrived.
    await expect(box(frame).height).toBe(before);
  },
};

export const CustomPlaceholder: Story = {
  args: { ratio: 2, src: picture(400, 200), placeholder: <span className="blur">Loading the hill</span> },
  render: (args) => (
    <FarBelow>
      <Image {...args} />
    </FarBelow>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText("Loading the hill")).toBeInTheDocument();
    // It replaces the Skeleton.
    await expect(canvasElement.querySelector(".cy-skeleton")).toBeNull();
    (canvasElement.querySelector("img") as HTMLElement).scrollIntoView();
    await loaded(canvasElement);
    await expect(canvas.queryByText("Loading the hill")).toBeNull();
  },
};

export const NaturalSizeReservesItsSpace: Story = {
  args: { src: picture(400, 200), width: 400, height: 200 },
  render: (args) => (
    <FarBelow>
      <div className="narrow" style={{ inlineSize: 200 }}>
        <Image {...args} />
      </div>
    </FarBelow>
  ),
  play: async ({ canvasElement }) => {
    const frame = frameOf(canvasElement);
    await expect(frame).toHaveAttribute("data-state", "loading");
    // No ratio: `width` and `height` reserve the space, scaled down to the container.
    const before = box(frame);
    await expect(before.width).toBeCloseTo(200, 0);
    await expect(before.height).toBeCloseTo(100, 0);
    const bone = box(frame.querySelector(".cy-skeleton-bone") as Element);
    await expect(bone.height).toBeCloseTo(100, 0);
    (canvasElement.querySelector("img") as HTMLElement).scrollIntoView();
    await loaded(canvasElement);
    await expect(box(frame).height).toBe(before.height);
    await expect(box(frame).width).toBe(before.width);
  },
};

export const NaturalSizeWithoutARatio: Story = {
  args: { src: picture(120, 60), loading: "eager" },
  render: (args) => (
    <div className="wide" style={{ inlineSize: 400 }}>
      <Image {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await loaded(canvasElement);
    // A small picture is not blown up to the container.
    const frame = box(frameOf(canvasElement));
    await expect(frame.width).toBeCloseTo(120, 0);
    await expect(frame.height).toBeCloseTo(60, 0);
    await expect(frameOf(canvasElement).tagName).toBe("SPAN");
  },
};

export const FallbackOnError: Story = {
  tags: ["visual"],
  args: { src: broken(1), ratio: 2, loading: "eager" },
  play: async ({ canvas, canvasElement, args }) => {
    await failed(canvasElement);
    await expect(args.onError).toHaveBeenCalledTimes(1);
    await expect(args.onLoad).not.toHaveBeenCalled();
    // The broken picture is gone; the alt text is on screen with the image icon, in the same 2 to 1 box.
    await expect(canvasElement.querySelector("img")).toBeNull();
    const text = canvas.getByText("A gold sun over a teal hill");
    await expect(text).toBeVisible();
    const fallback = canvasElement.querySelector(".cy-image-fallback") as HTMLElement;
    await expect(fallback.querySelector("svg.cy-icon")).toHaveAttribute("aria-hidden", "true");
    await expect(fallback).not.toHaveAttribute("aria-hidden");
    const frame = box(frameOf(canvasElement));
    await expect(frame.height).toBeCloseTo(frame.width / 2, 0);
    await expect(box(fallback).height).toBeCloseTo(frame.height, 0);
    await expect(canvasElement.querySelector(".cy-image-placeholder")).toBeNull();
    // Quiet, but readable.
    await expect(textContrast(text)).toBeGreaterThanOrEqual(4.5);
  },
};

export const DecorativeFallbackStaysSilent: Story = {
  args: { src: broken(2), alt: "", ratio: 2, loading: "eager" },
  play: async ({ canvasElement }) => {
    await failed(canvasElement);
    const fallback = canvasElement.querySelector(".cy-image-fallback") as HTMLElement;
    // Only the icon, and nothing for assistive technology.
    await expect(fallback).toHaveAttribute("aria-hidden", "true");
    await expect(fallback.textContent).toBe("");
    await expect(fallback.querySelector("svg.cy-icon")).not.toBeNull();
  },
};

export const CustomFallback: Story = {
  args: { src: broken(3), ratio: 2, loading: "eager", fallback: <strong>No preview</strong> },
  play: async ({ canvas, canvasElement, args }) => {
    await failed(canvasElement);
    await expect(canvas.getByText("No preview")).toBeVisible();
    // It replaces the default box: no icon, no alt text, no fill.
    await expect(canvas.queryByText("A gold sun over a teal hill")).toBeNull();
    await expect(canvasElement.querySelector(".cy-icon")).toBeNull();
    const fallback = canvasElement.querySelector(".cy-image-fallback") as HTMLElement;
    await expect(fallback).not.toHaveAttribute("data-default");
    await expect(fallback).not.toHaveAttribute("aria-hidden");
    await expect(getComputedStyle(fallback).paddingTop).toBe("0px");
    await expect(args.onError).toHaveBeenCalledTimes(1);
  },
};

export const FallbackKeepsTheReservedSize: Story = {
  args: { src: broken(4), width: 400, height: 200, loading: "eager" },
  render: (args) => (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ inlineSize: 200 }}>
        <Image {...args} className="sized" />
      </div>
      <Image {...args} width={undefined} height={undefined} className="unsized" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await failed(canvasElement, ".sized");
    await failed(canvasElement, ".unsized");
    // Without a ratio the fallback takes the size `width` and `height` reserved, scaled to the container.
    const sized = box(frameOf(canvasElement, ".sized"));
    await expect(sized.width).toBeCloseTo(200, 0);
    await expect(sized.height).toBeCloseTo(100, 0);
    // With neither, it is as big as its icon and text need.
    const unsized = box(frameOf(canvasElement, ".unsized"));
    await expect(unsized.height).toBeGreaterThan(24);
    await expect(unsized.width).toBeLessThanOrEqual(420);
  },
};

const GOOD = picture(300, 150, "navy");
const OTHER = picture(300, 150, "maroon");
const BAD = broken(5);

export const ChangingSrcTriesAgain: Story = {
  args: { ratio: 2, loading: "eager" },
  render: (args) => {
    function Gallery() {
      const [src, setSrc] = useState(BAD);
      return (
        <div style={{ display: "grid", gap: 8 }}>
          <Image {...args} src={src} />
          <div style={{ display: "flex", gap: 8 }}>
            <Button onClick={() => setSrc(GOOD)}>Good</Button>
            <Button onClick={() => setSrc(OTHER)}>Other</Button>
            <Button onClick={() => setSrc(BAD)}>Bad</Button>
          </div>
        </div>
      );
    }
    return <Gallery />;
  },
  play: async ({ canvas, canvasElement, args, userEvent }) => {
    await failed(canvasElement);
    await expect(canvas.queryByRole("img")).toBeNull();

    // After a failure, a new address is tried and shown.
    await userEvent.click(canvas.getByRole("button", { name: "Good" }));
    await loaded(canvasElement);
    await expect(canvas.getByRole("img", { name: "A gold sun over a teal hill" })).toHaveAttribute(
      "src",
      GOOD,
    );
    await expect(canvasElement.querySelector(".cy-image-fallback")).toBeNull();
    await expect(args.onLoad).toHaveBeenCalledTimes(1);

    // From one working picture to another: loading again, then loaded.
    await userEvent.click(canvas.getByRole("button", { name: "Other" }));
    await waitFor(() => expect(args.onLoad).toHaveBeenCalledTimes(2));
    await loaded(canvasElement);
    await expect(canvas.getByRole("img")).toHaveAttribute("src", OTHER);
    await expect(canvasElement.querySelector(".cy-image-placeholder")).toBeNull();

    // And a working picture can fail later.
    await userEvent.click(canvas.getByRole("button", { name: "Bad" }));
    await failed(canvasElement);
    await expect(args.onError).toHaveBeenCalledTimes(2);
    await expect(canvas.getByText("A gold sun over a teal hill")).toBeVisible();
  },
};

const SERVED = picture(300, 150, "indigo");
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const AlreadyLoadedBeforeReactAttaches: Story = {
  render: () => <div className="server" />,
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector(".server") as HTMLElement;
    const ui = <Image src={SERVED} alt="Served picture" ratio={2} loading="eager" />;
    // The server's HTML arrives and the browser loads the picture before any script runs.
    host.innerHTML = renderToString(ui);
    const img = host.querySelector("img") as HTMLImageElement;
    await waitFor(() => expect(img.complete && img.naturalWidth > 0).toBe(true));
    await pause(50);
    await expect(host.querySelector(".cy-image-placeholder")).not.toBeNull();
    const app = hydrateRoot(host, ui);
    try {
      // No load event will come any more: the finished picture is noticed on mount.
      await loaded(host);
      await expect(host.querySelector(".cy-image-placeholder")).toBeNull();
      await expect(host.querySelector("img")).toBe(img);
    } finally {
      app.unmount();
    }
  },
};

export const AlreadyFailedBeforeReactAttaches: Story = {
  render: () => <div className="server" />,
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector(".server") as HTMLElement;
    const ui = <Image src={broken(6)} alt="Served picture" ratio={2} loading="eager" />;
    host.innerHTML = renderToString(ui);
    const img = host.querySelector("img") as HTMLImageElement;
    await waitFor(() => expect(img.complete).toBe(true));
    await pause(50);
    const app = hydrateRoot(host, ui);
    try {
      await failed(host);
      await expect(host.querySelector(".cy-image-placeholder")).toBeNull();
      await expect(host.querySelector(".cy-image-alt")).toHaveTextContent("Served picture");
    } finally {
      app.unmount();
    }
  },
};

const TALL = picture(200, 400);

export const FitAndPosition: Story = {
  args: { src: TALL, ratio: 2, loading: "eager" },
  render: (args) => (
    <div style={{ display: "grid", gap: 8 }}>
      <Image {...args} className="cover" />
      <Image {...args} fit="contain" className="contain" />
      <Image {...args} position="top" className="top" />
      <Image {...args} position="20% 80%" className="point" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const img = (name: string) =>
      getComputedStyle(frameOf(canvasElement, name).querySelector("img") as Element);
    for (const name of [".cover", ".contain", ".top", ".point"]) await loaded(canvasElement, name);
    // Cover by default, centred.
    await expect(img(".cover").objectFit).toBe("cover");
    await expect(img(".cover").objectPosition).toBe("50% 50%");
    await expect(img(".contain").objectFit).toBe("contain");
    await expect(img(".top").objectPosition).toBe("50% 0%");
    await expect(img(".point").objectPosition).toBe("20% 80%");
  },
};

const RADII = ["none", "sm", "md", "lg", "card", "full"] as const;

export const RadiusFollowsTheTokens: Story = {
  args: { ratio: 1, loading: "eager" },
  render: (args) => (
    <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(3, 1fr)" }}>
      {RADII.map((radius) => (
        <Image key={radius} {...args} radius={radius} className={`r-${radius}`} />
      ))}
      <Image src={HILL} alt="" loading="eager" className="r-default" />
      <div style={{ "--cy-image-radius": "7px" } as CSSProperties}>
        <Image {...args} className="r-token" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const probe = document.createElement("div");
    frameOf(canvasElement).after(probe);
    const token = (name: string) => {
      probe.style.borderRadius = `var(--cy-radius-${name})`;
      return getComputedStyle(probe).borderTopLeftRadius;
    };
    const radius = (name: string) => getComputedStyle(frameOf(canvasElement, `.r-${name}`));
    try {
      for (const name of RADII.filter((r) => r !== "none")) {
        await expect(radius(name).borderTopLeftRadius).toBe(token(name));
        // The picture is clipped to the corners.
        await expect(radius(name).overflow).toBe("hidden");
      }
      await expect(radius("card").borderTopLeftRadius).not.toBe("0px");
      await expect(radius("none").borderTopLeftRadius).toBe("0px");
      await expect(radius("default").borderTopLeftRadius).toBe("0px");
      // The component token sets every Image's corners.
      await expect(radius("token").borderTopLeftRadius).toBe("7px");
    } finally {
      probe.remove();
    }
  },
};

export const CaptionMakesAFigure: Story = {
  tags: ["visual"],
  args: {
    ratio: 2,
    loading: "eager",
    caption: "The hill at noon",
    className: "mine",
    style: { inlineSize: 300 },
  },
  play: async ({ canvas, canvasElement }) => {
    await loaded(canvasElement);
    // The figure is named by its caption, and holds the picture.
    const figure = canvas.getByRole("figure", { name: "The hill at noon" });
    await expect(figure.tagName).toBe("FIGURE");
    const caption = canvas.getByText("The hill at noon");
    await expect(caption.tagName).toBe("FIGCAPTION");
    await expect(figure).toContainElement(canvas.getByRole("img", { name: "A gold sun over a teal hill" }));
    // className and style are on the figure, the outermost element; the picture follows its width.
    await expect(figure).toHaveClass("cy-image-figure", "mine");
    await expect(frameOf(canvasElement)).not.toHaveClass("mine");
    await expect(box(figure).width).toBeCloseTo(300, 0);
    await expect(box(frameOf(canvasElement)).width).toBeCloseTo(300, 0);
    await expect(box(frameOf(canvasElement)).height).toBeCloseTo(150, 0);
    // The caption sits under the picture, in the smaller, quieter text.
    await expect(box(caption).top).toBeGreaterThanOrEqual(box(frameOf(canvasElement)).bottom);
    await expect(textContrast(caption)).toBeGreaterThanOrEqual(4.5);
    // No browser margin around the figure.
    await expect(getComputedStyle(figure).marginLeft).toBe("0px");
  },
};

export const RefClassNameAndStyle: Story = {
  args: { loading: "eager", src: picture(100, 50), className: "mine", style: { marginBlockStart: 12 } },
  render: (args) => (
    <Image
      {...args}
      ref={(el) => {
        if (el) el.dataset.ref = el.tagName;
      }}
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    await loaded(canvasElement);
    // The ref is the img itself; className and style are on the root.
    await expect(canvas.getByRole("img")).toHaveAttribute("data-ref", "IMG");
    const frame = frameOf(canvasElement);
    await expect(frame).toHaveClass("cy-image", "mine");
    await expect(getComputedStyle(frame).marginTop).toBe("12px");
  },
};

export const SameInRightToLeft: Story = {
  args: { ratio: 2, loading: "eager", position: "left top" },
  render: (args) => (
    <div dir="rtl">
      <Image {...args} caption="التلة عند الظهر" />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await loaded(canvasElement);
    const img = canvas.getByRole("img");
    // A picture is not mirrored, and `position` is physical, as in CSS.
    await expect(getComputedStyle(img).objectPosition).toBe("0% 0%");
    await expect(getComputedStyle(img).transform).toBe("none");
    await expect(box(img).left).toBeCloseTo(box(frameOf(canvasElement)).left, 0);
    // The caption starts at the right-hand edge, under the picture.
    const caption = canvas.getByText("التلة عند الظهر");
    await expect(canvas.getByRole("figure", { name: "التلة عند الظهر" })).toHaveClass("cy-image-figure");
    await expect(getComputedStyle(caption).direction).toBe("rtl");
    await expect(box(caption).right).toBeCloseTo(box(frameOf(canvasElement)).right, 0);
  },
};

export const StableUnderHostileHost: Story = {
  args: { loading: "eager" },
  render: (args) => (
    <div style={{ display: "grid", gap: 8 }}>
      <Image {...args} ratio={2} radius="card" caption="The hill at noon" className="boxed" />
      <div>
        <Image {...args} src={picture(120, 60)} width={120} height={60} className="natural" />
      </div>
      <Image {...args} src={broken(7)} ratio={4} className="failed" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await loaded(canvasElement, ".boxed .cy-image");
    await loaded(canvasElement, ".natural");
    await failed(canvasElement, ".failed");
    await waitFor(() =>
      expect(getComputedStyle(canvasElement.querySelector(".natural img") as Element).opacity).toBe("1"),
    );
    const text = ["font-size", "font-weight", "line-height", "letter-spacing", "text-transform", "color"];
    // The host sheet sets `img { max-width: 100%; height: auto; display: block }`, and resizes and recolours all.
    const cases: [string, string[]][] = [
      [".boxed", ["display", "margin-top", "box-sizing", ...text]],
      [".boxed .cy-image", ["display", "width", "height", "overflow", "border-top-left-radius", ...text]],
      [".boxed img", ["display", "position", "width", "height", "max-width", "object-fit", "opacity"]],
      [".boxed figcaption", ["display", "box-sizing", ...text]],
      [".natural", ["display", "width", "height", "box-sizing", "vertical-align"]],
      [".natural img", ["display", "width", "height", "max-width", "box-sizing"]],
      [
        ".failed .cy-image-fallback",
        ["display", "width", "height", "padding-top", "background-color", ...text],
      ],
      [".failed .cy-image-alt", ["box-sizing", ...text]],
      [".failed .cy-icon", ["width", "height"]],
    ];
    for (const [selector, props] of cases) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
    await expect(box(frameOf(canvasElement, ".natural")).height).toBeCloseTo(60, 0);
  },
};
