import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useCanvasSize } from "../../foundations/canvas-size.js";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { useImageOutcome } from "../../foundations/image-outcome.js";
import { image } from "../../icons/image.js";
import type { Tone } from "../../tokens/schema.js";
import { AspectRatio, type AspectRatioRadius } from "../AspectRatio/AspectRatio.js";
import { Skeleton } from "../Skeleton/Skeleton.js";

export interface ImageTokens {
  /** Corner radius of every Image, whatever its `radius` prop says. */
  radius: string;
  /** Fill of the box shown when the picture fails to load. */
  fallbackBackground: string;
  /** Icon and text colour of that box. */
  fallbackColor: string;
  /** Space between the picture and its caption. */
  captionGap: string;
  /** Text colour of the caption. */
  captionColor: string;
  /** Outline colour of a region with no `tone`. */
  regionColor: string;
  /** Outline width of a region. */
  regionWidth: string;
}

/** An area of the picture to outline (a code found in a scan, a face, a crop), in the picture's own pixels. */
export interface ImageRegion {
  /** From the picture's left edge, in its natural pixels. */
  x: number;
  /** From the picture's top edge, in its natural pixels. */
  y: number;
  width: number;
  height: number;
  /** A short tag shown at the region's top-start corner ("Code 1"). */
  label?: string | undefined;
  /** Colour of the outline and its tag. Default: the `--cy-image-region-color` token (the accent). */
  tone?: Tone | undefined;
  /** A stable key, when regions are added and removed. Default: its index. */
  id?: string | undefined;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    image: ImageTokens;
  }
}

export interface ImageProps {
  /** Address of the picture. Changing it loads the new picture, also after a failure. */
  src: string;
  /** What the picture shows, for people who cannot see it. `""` marks it decorative and hides it from them. */
  alt: string;
  /** Candidate files for different screen densities or widths, as on `<img>`. */
  srcSet?: string | undefined;
  /** With `srcSet`: how wide the picture is shown, as on `<img>`. */
  sizes?: string | undefined;
  /** Natural width in pixels. With `height` and no `ratio`, it reserves the picture's space before it loads. */
  width?: number | undefined;
  /** Natural height in pixels. */
  height?: number | undefined;
  /**
   * Width divided by height of the box the picture fills (`16 / 9`, `"4/3"`), kept at any width with AspectRatio.
   * Without it the picture has its natural size, no wider than its container.
   */
  ratio?: number | string | undefined;
  /** With `ratio`: `cover` fills the box and crops, `contain` shows the whole picture. Default "cover". */
  fit?: "cover" | "contain";
  /** With `ratio`: which part stays in view when cropped, as CSS `object-position` (`"top"`, `"20% 80%"`). */
  position?: string | undefined;
  /** Rounds the corners from the radius tokens. Default "none". */
  radius?: AspectRatioRadius;
  /** `lazy` waits until the picture is near the screen; `eager` loads it at once. Default "lazy". */
  loading?: "lazy" | "eager";
  /** Shown while the picture loads, in place of the Skeleton. */
  placeholder?: ReactNode;
  /** Shown when the picture fails, in place of the box with an icon and the `alt` text. */
  fallback?: ReactNode;
  /**
   * Drawn over the picture, on the picture's own box (not the frame's: a `contain` picture's letterbox is left out, a
   * `cover` picture's cropped part is included), so it moves and scales with the picture: a safe-zone ring, crop marks,
   * a grid. Its content is stretched to that box (an SVG with a `viewBox` scales with it). Shown once the picture has
   * loaded; never while it loads or after it fails. It takes no presses, and is decorative unless `overlayLabel` is set.
   */
  overlay?: ReactNode;
  /**
   * Areas of the picture to outline, in the picture's own (natural) pixels, e.g. where each code was found in a scan.
   * Drawn on the overlay's box, so they land on the picture at any size, `fit` and `position`, under `overlay`'s
   * content. Decorative unless `overlayLabel` is set; then each region's label is read too.
   */
  regions?: readonly ImageRegion[] | undefined;
  /** Names the overlay (and the regions) for assistive technology, as an image of its own ("Safe zone, 80% of the icon"). */
  overlayLabel?: string | undefined;
  /** A caption under the picture: wraps it in a `figure` named by the caption. */
  caption?: ReactNode;
  /** Called when the picture has loaded. */
  onLoad?: ((event: SyntheticEvent<HTMLImageElement>) => void) | undefined;
  /** Called when the picture fails to load. The fallback is shown as well. */
  onError?: ((event: SyntheticEvent<HTMLImageElement>) => void) | undefined;
  /** Added to the root element (the `figure` when there is a caption), for layout. */
  className?: string;
  /** Layout only (width, margin, placement), on the root element. Restyle through --cy-image-* tokens. */
  style?: CSSProperties;
}

interface OverlayProps {
  regions: readonly ImageRegion[] | undefined;
  frame: RefObject<HTMLElement | null>;
  img: RefObject<HTMLImageElement | null>;
  fit: "cover" | "contain";
  position: string | undefined;
  label: string | undefined;
  children: ReactNode;
}

const KEYWORDS: Record<string, string> = {
  left: "0%",
  top: "0%",
  center: "50%",
  right: "100%",
  bottom: "100%",
};

/** A computed `object-position` as [x, y] (browsers give percents and pixels; keywords are read too, y first or not). */
function positionOf(value: string): [string | undefined, string | undefined] {
  const [a, b = "center"] = value.split(" ");
  const [x, y] = a === "top" || a === "bottom" || b === "left" || b === "right" ? [b, a] : [a, b];
  return [KEYWORDS[x ?? ""] ?? x, KEYWORDS[y ?? ""] ?? y];
}

/** One `object-position` component (a percent of the free space, or pixels) as an offset; anything else centres. */
const offsetOf = (part: string | undefined, free: number) =>
  part?.endsWith("px")
    ? Number.parseFloat(part)
    : ((part?.endsWith("%") ? Number.parseFloat(part) : 50) * free) / 100;

/**
 * The overlay on the picture's own box: the image's content box as `object-fit` and `object-position` draw it in the
 * img's box, measured again whenever the frame resizes. Rendered only once the picture has loaded.
 */
function Overlay({ frame, img, fit, position, label, regions, children }: OverlayProps) {
  const size = useCanvasSize(frame);
  const [rect, setRect] = useState<CSSProperties | null>(null);
  const [natural, setNatural] = useState({ width: 1, height: 1 });
  useClientLayoutEffect(() => {
    const pic = img.current;
    if (!pic?.naturalWidth || !pic.naturalHeight) return;
    if (pic.naturalWidth !== natural.width || pic.naturalHeight !== natural.height)
      setNatural({ width: pic.naturalWidth, height: pic.naturalHeight });
    const [w, h] = [pic.offsetWidth, pic.offsetHeight];
    const pick = fit === "contain" ? Math.min : Math.max;
    const scale = pick(w / pic.naturalWidth, h / pic.naturalHeight);
    const [width, height] = [pic.naturalWidth * scale, pic.naturalHeight * scale];
    const [x, y] = positionOf(getComputedStyle(pic).objectPosition);
    setRect({
      left: pic.offsetLeft + offsetOf(x, w - width),
      top: pic.offsetTop + offsetOf(y, h - height),
      width,
      height,
    });
  }, [size.width, size.height, fit, position]);
  if (!rect) return null;
  return (
    <span
      className="cy-image-overlay"
      style={rect}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      {regions && regions.length > 0 && (
        <span className="cy-image-regions cy-reset">
          {regions.map((region, i) => (
            <span
              key={region.id ?? i}
              className="cy-image-region"
              data-tone={region.tone}
              style={{
                left: `${(region.x / natural.width) * 100}%`,
                top: `${(region.y / natural.height) * 100}%`,
                width: `${(region.width / natural.width) * 100}%`,
                height: `${(region.height / natural.height) * 100}%`,
              }}
            >
              {region.label && <span className="cy-image-region-label">{region.label}</span>}
            </span>
          ))}
        </span>
      )}
      {children}
    </span>
  );
}

/** A picture that keeps its space while it loads, shows a placeholder until then and a fallback when it fails. */
export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  {
    src,
    alt,
    srcSet,
    sizes,
    width,
    height,
    ratio,
    fit = "cover",
    position,
    radius = "none",
    loading = "lazy",
    placeholder,
    fallback,
    caption,
    overlay,
    regions,
    overlayLabel,
    onLoad,
    onError,
    className,
    style,
  },
  ref,
) {
  const captionId = useId();
  const frameRef = useRef<HTMLElement>(null);
  const el = useRef<HTMLImageElement>(null);
  useImperativeHandle(ref, () => el.current as HTMLImageElement);
  // One outcome per picture: a new `src` starts again from "loading", whatever happened to the last one. Before
  // script runs the state is "pending" and the picture shows as the browser has it (pages never hydrated).
  const key = `${src} ${srcSet ?? ""}`;
  const picture = useImageOutcome(el, key);
  const state = picture.outcome;

  const content = (
    <>
      {state === "error" ? (
        <span
          className="cy-image-fallback"
          data-default={fallback === undefined ? "" : undefined}
          aria-hidden={fallback === undefined && alt === "" ? true : undefined}
          style={
            ratio === undefined && width && height
              ? { inlineSize: width, aspectRatio: `${width} / ${height}` }
              : undefined
          }
        >
          {fallback ?? (
            <>
              <Icon icon={image} />
              {alt && <span className="cy-image-alt cy-reset">{alt}</span>}
            </>
          )}
        </span>
      ) : (
        <img
          // A new element for each picture, so `complete` never describes the one before.
          key={key}
          ref={el}
          className="cy-image-img cy-reset"
          src={src}
          alt={alt}
          srcSet={srcSet}
          sizes={sizes}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
          style={position === undefined ? undefined : { objectPosition: position }}
          onLoad={(event) => {
            picture.loaded();
            onLoad?.(event);
          }}
          onError={(event) => {
            picture.failed();
            onError?.(event);
          }}
        />
      )}
      {state === "loading" && (
        <span className="cy-image-placeholder cy-reset">
          {placeholder ?? <Skeleton shape="block" height="100%" />}
        </span>
      )}
    </>
  );

  const Frame = ratio === undefined ? "span" : "div";
  const frame = (
    <Frame
      ref={frameRef as RefObject<HTMLDivElement & HTMLSpanElement>}
      className={!caption && className ? `cy-image ${className}` : "cy-image"}
      data-state={state}
      data-fit={fit}
      data-radius={radius}
      data-ratio={ratio === undefined ? undefined : ""}
      style={caption ? undefined : style}
    >
      {ratio === undefined ? content : <AspectRatio ratio={ratio}>{content}</AspectRatio>}
      {(overlay !== undefined || (regions && regions.length > 0)) && state === "loaded" && (
        <Overlay
          frame={frameRef}
          img={el}
          fit={fit}
          position={position}
          label={overlayLabel}
          regions={regions}
        >
          {overlay}
        </Overlay>
      )}
    </Frame>
  );
  if (!caption) return frame;
  return (
    <figure
      className={className ? `cy-image-figure ${className}` : "cy-image-figure"}
      aria-labelledby={captionId}
      style={style}
    >
      {frame}
      <figcaption id={captionId} className="cy-image-caption">
        {caption}
      </figcaption>
    </figure>
  );
});
