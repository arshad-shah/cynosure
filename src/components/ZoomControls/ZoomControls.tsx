import type { CSSProperties } from "react";
import { MAX_PERCENT, MIN_PERCENT, ZOOM_STEPS, type ZoomSetting, zoomStep } from "../../foundations/zoom.js";
import { zoomActualSize } from "../../icons/zoom-actual-size.js";
import { zoomFitPage } from "../../icons/zoom-fit-page.js";
import { zoomIn } from "../../icons/zoom-in.js";
import { zoomOut } from "../../icons/zoom-out.js";
import type { Size } from "../../tokens/schema.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Menu, type MenuItem } from "../Menu/Menu.js";
import { Toolbar } from "../Toolbar/Toolbar.js";

export interface ZoomControlsLabels {
  /** The toolbar. Default "Zoom". */
  group: string;
  zoomIn: string;
  zoomOut: string;
  /** The menu button, read with the percent. Default "Zoom 125%". */
  menu: (percent: number) => string;
  fitWidth: string;
  fitPage: string;
  /** The `fit` button. Default "Fit to view". */
  fit: string;
  /** The `actual-size` button. Default "Actual size". */
  actualSize: string;
}

/** A fit mode the menu can offer: `fit-width` fits the content's width, `fit-page` the whole content. */
export type ZoomFit = "fit-width" | "fit-page";

/** A button after zoom in: `fit` fits the whole content (`fit-page`), `actual-size` goes to 100%. */
export type ZoomButton = "fit" | "actual-size";

export interface ZoomControlsProps {
  /**
   * The setting now (fit or a percent): marks the menu's choice. Leave it out for a view that only has a percent (a
   * PanZoomCanvas): the preset equal to `percent` is marked.
   */
  zoom?: ZoomSetting | undefined;
  /**
   * The percent it comes to now (DocumentViewport's `onScaleChange` times 100, a PanZoomCanvas's `view.scale` times
   * 100): shown, and stepped from.
   */
  percent: number;
  /**
   * Called with the new setting when the person zooms in or out, presses a button or picks one from the menu. A
   * PanZoomCanvas applies it with its handle's `zoom(setting)`.
   */
  onZoomChange: (zoom: ZoomSetting) => void;
  /** The fit modes the menu offers, in this order. `[]` for a view with no fit modes in its menu. Default both. */
  fits?: readonly ZoomFit[];
  /** Buttons after zoom in, in this order: `fit` (fit the whole content) and `actual-size` (100%). Default none. */
  buttons?: readonly ZoomButton[];
  /** The percents zoom in and out step through. Default 25, 33, 50, 67, 75, 90, 100, 110, 125 … 800. */
  steps?: readonly number[];
  /** The smallest percent zoom out goes to (a PanZoomCanvas's `min`). Default 25. */
  min?: number;
  /** The largest percent zoom in goes to (a PanZoomCanvas's `max`). Default 800. */
  max?: number;
  /** The percents offered in the menu (those between `min` and `max`). Default 50, 75, 100, 125, 150, 200, 400. */
  presets?: number[];
  /** Size of the three buttons. Default "sm". */
  size?: Size;
  /** Replace the built-in English text: the names of the toolbar, the buttons and the fit modes. */
  labels?: Partial<ZoomControlsLabels>;
  /** Added to the toolbar element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: ZoomControlsLabels = {
  group: "Zoom",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  menu: (percent) => `Zoom ${percent}%`,
  fitWidth: "Fit width",
  fitPage: "Fit page",
  fit: "Fit to view",
  actualSize: "Actual size",
};
const DOCUMENT_FITS: readonly ZoomFit[] = ["fit-width", "fit-page"];

/**
 * Zoom out, the current percent (a menu of fit modes and preset percents) and zoom in, for a DocumentViewport or any
 * zoomable view. An APG toolbar: one tab stop, arrow keys between the three.
 */
export function ZoomControls({
  zoom,
  percent,
  onZoomChange,
  min = MIN_PERCENT,
  max = MAX_PERCENT,
  presets = [50, 75, 100, 125, 150, 200, 400],
  fits = DOCUMENT_FITS,
  buttons,
  steps = ZOOM_STEPS,
  size = "sm",
  labels,
  className,
  style,
}: ZoomControlsProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const shown = Math.round(percent);
  const choice = !zoom ? `${shown}` : zoom.kind === "percent" ? `${zoom.value}` : zoom.kind;
  const items: MenuItem[] = [
    ...fits.map((fit) => ({ value: fit, label: fit === "fit-width" ? text.fitWidth : text.fitPage })),
    ...presets.filter((p) => p >= min && p <= max).map((p) => ({ value: `${p}`, label: `${p}%` })),
  ].map((item) => ({ ...item, kind: "radio" as const, checked: item.value === choice, keepOpen: false }));
  const step = (direction: 1 | -1) =>
    onZoomChange({ kind: "percent", value: zoomStep(shown, direction, min, max, steps) });
  return (
    <Toolbar
      label={text.group}
      className={className ? `cy-zoom-controls ${className}` : "cy-zoom-controls"}
      {...(style ? { style } : {})}
    >
      <IconButton
        icon={zoomOut}
        label={text.zoomOut}
        variant="ghost"
        size={size}
        disabled={shown <= min}
        onClick={() => step(-1)}
      />
      <Menu
        label={text.group}
        items={items}
        onSelect={(value) =>
          onZoomChange(
            value === "fit-width" || value === "fit-page"
              ? { kind: value }
              : { kind: "percent", value: Number(value) },
          )
        }
        trigger={(props) => (
          <Button
            {...props}
            variant="ghost"
            size={size}
            aria-label={text.menu(shown)}
            className="cy-zoom-controls-value"
          >
            {`${shown}%`}
          </Button>
        )}
      />
      <IconButton
        icon={zoomIn}
        label={text.zoomIn}
        variant="ghost"
        size={size}
        disabled={shown >= max}
        onClick={() => step(1)}
      />
      {buttons?.map((button) =>
        button === "fit" ? (
          <IconButton
            key={button}
            icon={zoomFitPage}
            label={text.fit}
            variant="ghost"
            size={size}
            onClick={() => onZoomChange({ kind: "fit-page" })}
          />
        ) : (
          <IconButton
            key={button}
            icon={zoomActualSize}
            label={text.actualSize}
            variant="ghost"
            size={size}
            disabled={100 < min || 100 > max}
            onClick={() => onZoomChange({ kind: "percent", value: 100 })}
          />
        ),
      )}
    </Toolbar>
  );
}
