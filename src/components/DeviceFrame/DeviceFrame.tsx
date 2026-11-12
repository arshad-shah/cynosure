import { type CSSProperties, forwardRef, type ReactNode } from "react";
import { AspectRatio } from "../AspectRatio/AspectRatio.js";

export interface DeviceFrameTokens {
  /** Colour of a phone's or tablet's bezel. Default: the light palette's ink, so the device stays dark in dark mode. */
  bezel: string;
  /** Hairline around the frame, which keeps it apart from a background of the same colour. */
  edge: string;
  /** Shadow under the frame. */
  shadow: string;
  /** Fill of the screen behind the content. */
  screen: string;
  /** Width of a portrait phone; a landscape phone is as tall as this. */
  phoneWidth: string;
  /** Width of a portrait tablet; a landscape tablet is as tall as this. */
  tabletWidth: string;
  /** Corner radius of the browser window. */
  browserRadius: string;
  /** Fill of the browser's top bar. */
  browserBar: string;
  /** Colour of the three window dots in the browser bar. */
  dot: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    deviceFrame: DeviceFrameTokens;
  }
}

/** The device drawn around the content. */
export type DeviceFrameDevice = "phone" | "tablet" | "browser";

export interface DeviceFrameProps {
  /** The device drawn around the content. Default "phone". */
  device?: DeviceFrameDevice;
  /** Which way a phone or tablet is held. The browser ignores it. Default "portrait". */
  orientation?: "portrait" | "landscape";
  /**
   * Width divided by height of the screen, as drawn in portrait (phone and tablet) or as is (browser). Landscape uses
   * its inverse. Default: 9 / 19.5 for a phone, 3 / 4 for a tablet, 16 / 10 for a browser.
   */
  ratio?: number;
  /** Address shown in the browser bar (decoration: it is not a link and is not announced). Browser only. */
  url?: string;
  /**
   * Accessible name. With it the frame is a `figure` with this name; without it the frame is decoration and adds
   * nothing to the accessibility tree, so the content keeps its own semantics.
   */
  label?: string;
  /** What the screen shows: a screenshot, a video or a live demo. Each child is stretched to the screen and clipped. */
  children?: ReactNode;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only (width, margin, placement). The height follows from the width. Restyle through tokens. */
  style?: CSSProperties;
}

const RATIOS: Record<DeviceFrameDevice, number> = { phone: 9 / 19.5, tablet: 3 / 4, browser: 16 / 10 };

/** A phone, tablet or browser window drawn around a screenshot or a live demo, at any width. */
export const DeviceFrame = forwardRef<HTMLElement, DeviceFrameProps>(function DeviceFrame(
  { device = "phone", orientation = "portrait", ratio, url, label, children, className, style },
  ref,
) {
  const upright = ratio !== undefined && ratio > 0 && Number.isFinite(ratio) ? ratio : RATIOS[device];
  const turned = device !== "browser" && orientation === "landscape";
  const screen = turned ? 1 / upright : upright;
  const Root = label ? "figure" : "div";
  return (
    <Root
      ref={ref as never}
      aria-label={label || undefined}
      className={`cy-device-frame${className ? ` ${className}` : ""}`}
      data-device={device}
      data-orientation={device === "browser" ? undefined : orientation}
      style={{ "--_screen-ratio": screen, ...style } as CSSProperties}
    >
      <div className="cy-device-frame-body">
        {device === "browser" && (
          <div className="cy-device-frame-bar" aria-hidden="true">
            <span className="cy-device-frame-dots">
              <span />
              <span />
              <span />
            </span>
            {url && (
              <span className="cy-device-frame-url" dir="ltr">
                {url}
              </span>
            )}
          </div>
        )}
        <AspectRatio ratio={screen} className="cy-device-frame-screen">
          {children}
        </AspectRatio>
      </div>
    </Root>
  );
});
