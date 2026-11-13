import { type CSSProperties, forwardRef, type ReactNode, useEffect, useRef } from "react";
import { mergeRefs } from "../../foundations/refs.js";
import { close as closeIcon, minus, windowMaximize, windowRestore } from "../../icons/index.js";
import { IconButton } from "../IconButton/IconButton.js";

export interface TitleBarTokens {
  /** Bar height. In overlay mode the window's `titlebar-area-height` wins when the browser gives one. */
  height: string;
  /** Bar background. */
  bg: string;
  /** Text colour of the bar and its title. */
  ink: string;
  /** Colour of the line under the bar. */
  border: string;
  /** Space at the bar's ends, after `leadingInset` (none beside the window controls). */
  paddingInline: string;
  /** Space between the leading, title and trailing content. */
  gap: string;
  /** Font size of the centre title. */
  titleFontSize: string;
  /** Width of each window control (they are as tall as the bar). */
  controlWidth: string;
  /** Fill of the close control on hover. */
  closeHoverBg: string;
  /** Icon colour of the close control on hover. */
  closeHoverInk: string;
  /** Stacking order in overlay mode, where the bar is fixed to the top of the window. */
  z: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    titleBar: TitleBarTokens;
  }
}

/** The window controls TitleBar draws at its inline end; each button shows only when its callback is given. */
export interface TitleBarControls {
  /** Minimizes the window. Shows the Minimize button. */
  minimize?: (() => void) | undefined;
  /** Maximizes the window, or restores it when `maximized`. Shows the Maximize/Restore button. */
  toggleMaximize?: (() => void) | undefined;
  /** Closes the window. Shows the Close button. */
  close?: (() => void) | undefined;
  /** The window is maximized: the middle button shows the restore icon and is named Restore. */
  maximized?: boolean | undefined;
}

/** Built-in strings, overridable. */
export interface TitleBarLabels {
  minimize: string;
  maximize: string;
  restore: string;
  close: string;
}

const LABELS: TitleBarLabels = {
  minimize: "Minimize",
  maximize: "Maximize",
  restore: "Restore",
  close: "Close",
};

export interface TitleBarProps {
  /** The title, centred on the bar (it ends in an ellipsis when there is no room). Any content: text, a SearchField. */
  children?: ReactNode;
  /** Content at the inline start, such as a Menubar or the app's mark. */
  leading?: ReactNode;
  /** Content at the inline end, before the window controls, such as IconButtons. */
  trailing?: ReactNode;
  /**
   * Pixels kept clear at the inline start for window buttons the system draws over the bar (macOS traffic lights:
   * about 80). A fixed number, since the system draws them at a fixed size whatever the theme's scale. Default 0.
   */
  leadingInset?: number;
  /**
   * Window Controls Overlay (installed web apps, Electron's `titleBarOverlay`): the bar is fixed to the window's title
   * bar area, `env(titlebar-area-x/y/width/height)`, so it never runs under the controls the system draws. Without
   * those values it falls back to the top of the window, full width and the `height` token. Offset the page's content
   * with `onHeightChange`. Default false.
   */
  overlay?: boolean;
  /**
   * Window controls drawn by the app (Linux, frameless windows): minimize, maximize or restore, and close, as tall as
   * the bar at its inline end. Leave out where the system draws them (macOS, Window Controls Overlay).
   */
  controls?: TitleBarControls | undefined;
  /**
   * Called with the bar's height (border box, in pixels) on mount and whenever it changes, to offset content under
   * an overlay bar or to place the system's own window buttons (Electron's traffic-light position).
   */
  onHeightChange?: ((height: number) => void) | undefined;
  /** Accessible name of the bar (a group). Default "Title bar". */
  label?: string;
  /** Names of the window controls, for other languages. */
  labels?: Partial<TitleBarLabels>;
  /** Layout only. */
  className?: string;
  /** Layout only. Restyle through --cy-title-bar-* tokens. */
  style?: CSSProperties;
}

/**
 * The title bar of an installed app that draws its own (a frameless Electron window, a web app with Window Controls
 * Overlay). The whole bar drags the window; every control inside opts out, so it stays clickable.
 */
export const TitleBar = forwardRef<HTMLDivElement, TitleBarProps>(function TitleBar(
  {
    children,
    leading,
    trailing,
    leadingInset = 0,
    overlay = false,
    controls,
    onHeightChange,
    label = "Title bar",
    labels,
    className,
    style,
  },
  forwarded,
) {
  const own = useRef<HTMLDivElement | null>(null);

  // Report the border-box height (a ResizeObserver entry's content box would leave out the bottom border), once per
  // change, with the latest callback.
  const notify = useRef(onHeightChange);
  notify.current = onHeightChange;
  const watching = onHeightChange !== undefined;
  useEffect(() => {
    const el = own.current;
    if (!el || !watching) return;
    let last = -1;
    const report = () => {
      const height = el.getBoundingClientRect().height;
      if (height === last) return;
      last = height;
      notify.current?.(height);
    };
    report();
    const observer = new ResizeObserver(report);
    observer.observe(el);
    return () => observer.disconnect();
  }, [watching]);

  const text = { ...LABELS, ...labels };
  const hasControls = !!(controls && (controls.minimize || controls.toggleMaximize || controls.close));
  const control = (key: "minimize" | "maximize" | "close", name: string, onClick: () => void) => (
    <IconButton
      key={key}
      icon={
        key === "minimize"
          ? minus
          : key === "close"
            ? closeIcon
            : controls?.maximized
              ? windowRestore
              : windowMaximize
      }
      label={name}
      variant="ghost"
      tooltipPlacement="bottom"
      onClick={onClick}
      className={`cy-title-bar-control${key === "close" ? " cy-title-bar-close" : ""}`}
      wrapperClassName="cy-title-bar-control-anchor"
    />
  );

  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset is a form part; the bar is a named group of chrome.
    <div
      ref={mergeRefs(own, forwarded)}
      role="group"
      aria-label={label}
      className={`cy-title-bar${className ? ` ${className}` : ""}`}
      data-overlay={overlay ? "" : undefined}
      style={leadingInset ? ({ ...style, "--_inset": `${leadingInset}px` } as CSSProperties) : style}
    >
      <div className="cy-title-bar-leading cy-reset">{leading}</div>
      <div className="cy-title-bar-title cy-reset">{children}</div>
      <div className="cy-title-bar-trailing cy-reset">
        {trailing}
        {hasControls && controls ? (
          <div className="cy-title-bar-controls cy-reset">
            {controls.minimize && control("minimize", text.minimize, controls.minimize)}
            {controls.toggleMaximize &&
              control("maximize", controls.maximized ? text.restore : text.maximize, controls.toggleMaximize)}
            {controls.close && control("close", text.close, controls.close)}
          </div>
        ) : null}
      </div>
    </div>
  );
});
