import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  type SyntheticEvent,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { image } from "../../icons/image.js";
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

type Outcome = "loaded" | "error";

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
    onLoad,
    onError,
    className,
    style,
  },
  ref,
) {
  const captionId = useId();
  const el = useRef<HTMLImageElement>(null);
  useImperativeHandle(ref, () => el.current as HTMLImageElement);
  // One outcome per picture: a new `src` starts again from "loading", whatever happened to the last one.
  const key = `${src} ${srcSet ?? ""}`;
  const [settled, setSettled] = useState<{ key: string; outcome: Outcome }>();
  const state = settled?.key === key ? settled.outcome : "loading";

  // A picture that finished before React attached (cached, or sent in the server's HTML) fires no event here.
  useClientLayoutEffect(() => {
    const img = el.current as HTMLImageElement;
    if (!img.complete) return;
    if (img.naturalWidth > 0) return setSettled({ key, outcome: "loaded" });
    // Finished with no size: broken, or a picture without one of its own (some SVG). Decoding tells them apart.
    let current = true;
    const settle = (outcome: Outcome) => () => {
      if (current) setSettled({ key, outcome });
    };
    new Promise((resolve) => resolve(img.decode())).then(settle("loaded"), settle("error"));
    return () => {
      current = false;
    };
  }, [key]);

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
            setSettled({ key, outcome: "loaded" });
            onLoad?.(event);
          }}
          onError={(event) => {
            setSettled({ key, outcome: "error" });
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
      className={!caption && className ? `cy-image ${className}` : "cy-image"}
      data-state={state}
      data-fit={fit}
      data-radius={radius}
      data-ratio={ratio === undefined ? undefined : ""}
      style={caption ? undefined : style}
    >
      {ratio === undefined ? content : <AspectRatio ratio={ratio}>{content}</AspectRatio>}
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
