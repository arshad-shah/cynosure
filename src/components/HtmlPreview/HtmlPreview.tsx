import { type CSSProperties, forwardRef } from "react";
import type { RootAttributes } from "../../foundations/attributes.js";
import { useControllableState } from "../../foundations/controllable.js";
import { FrameBase } from "../../foundations/FrameBase/FrameBase.js";
import { Button } from "../Button/Button.js";
import { Notice } from "../Notice/Notice.js";

export interface HtmlPreviewTokens {
  /** Height of the frame without `ratio`. */
  height: string;
  /** Behind the document: HTML is written for a light page unless it says otherwise. */
  background: string;
  /** Corner radius of the frame. */
  radius: string;
  /** Space between the notice and the frame. */
  gap: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    htmlPreview: HtmlPreviewTokens;
  }
}

export interface HtmlPreviewLabels {
  /** The notice when remote images are blocked. Default "Remote images are blocked to protect your privacy." */
  blocked: string;
  /** Its button. Default "Show remote images". */
  allow: string;
}

export interface HtmlPreviewProps extends RootAttributes {
  /** Names the frame ("Response preview"). */
  label: string;
  /** The HTML to show: a whole document or a fragment. It is never trusted: no script in it runs. */
  html: string;
  /**
   * Let `https:` images load (an email's pictures, a page's logo). Off, only pictures embedded in the HTML (`data:`,
   * `blob:`) show, so opening the preview tells no server that it was opened.
   */
  remoteImages?: boolean | undefined;
  /** Whether remote images load at first, when uncontrolled. Default false. */
  defaultRemoteImages?: boolean;
  /** Called when the notice's button turns remote images on. */
  onRemoteImagesChange?: ((on: boolean) => void) | undefined;
  /** While remote images are blocked and the HTML refers to one, show a notice with a button to load them. Default true. */
  notice?: boolean;
  /** Width divided by height of the frame (`16 / 9`). Default: the `--cy-html-preview-height` token. */
  ratio?: number | string | undefined;
  /** Replace the built-in English text of the notice. */
  labels?: Partial<HtmlPreviewLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-html-preview-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: HtmlPreviewLabels = {
  blocked: "Remote images are blocked to protect your privacy.",
  allow: "Show remote images",
};

/**
 * The content security policy the preview's document gets: nothing loads or runs but inline styles and embedded
 * pictures, fonts and media; with `remoteImages`, `https:` pictures too. Forms go nowhere and no base is set.
 */
export function htmlPolicy(remoteImages: boolean): string {
  return [
    "default-src 'none'",
    "script-src 'none'",
    "style-src 'unsafe-inline'",
    `img-src data: blob:${remoteImages ? " https:" : ""}`,
    "font-src data:",
    "media-src data: blob:",
    "form-action 'none'",
    "base-uri 'none'",
  ].join("; ");
}

/** A picture the HTML would fetch from a server: in src, srcset, poster or background attributes, or a CSS url(). */
const REMOTE =
  /(?:\b(?:src|srcset|poster|background)\s*=\s*["']?[^"'>]*?|url\(\s*["']?\s*|@import\s+["']?)(?:https?:)?\/\//i;

const escapeAttr = (text: string) => text.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

/**
 * Untrusted HTML shown safely: an email body, an HTTP response, a template. It is drawn in a frame with every sandbox
 * restriction and a content security policy, so no script runs and nothing loads but embedded pictures; remote
 * images are an opt-in, offered by a notice when the HTML refers to them.
 */
export const HtmlPreview = forwardRef<HTMLDivElement, HtmlPreviewProps>(function HtmlPreview(
  {
    label,
    html,
    remoteImages,
    defaultRemoteImages = false,
    onRemoteImagesChange,
    notice = true,
    ratio,
    labels,
    className,
    style,
    ...rest
  },
  ref,
) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [remote, setRemote] = useControllableState(remoteImages, defaultRemoteImages, onRemoteImagesChange);
  const doc = `<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${escapeAttr(
    htmlPolicy(remote),
  )}"><meta name="referrer" content="no-referrer">${html}`;
  const blocked = notice && !remote && REMOTE.test(html);
  return (
    <div
      ref={ref}
      {...rest}
      className={className ? `cy-html-preview ${className}` : "cy-html-preview"}
      data-ratio={ratio === undefined ? undefined : ""}
      style={ratio === undefined ? style : ({ "--_ratio": ratio, ...style } as CSSProperties)}
    >
      {blocked && (
        <Notice
          tone="info"
          size="sm"
          action={
            <Button size="sm" variant="soft" onClick={() => setRemote(true)}>
              {text.allow}
            </Button>
          }
        >
          {text.blocked}
        </Notice>
      )}
      <FrameBase label={label} srcDoc={doc} className="cy-html-preview-frame" />
    </div>
  );
});
