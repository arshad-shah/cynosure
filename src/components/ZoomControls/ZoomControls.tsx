import type { CSSProperties } from "react";
import { MAX_PERCENT, MIN_PERCENT, type ZoomSetting, zoomStep } from "../../foundations/zoom.js";
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
}

export interface ZoomControlsProps {
  /** The setting now (fit or a percent). */
  zoom: ZoomSetting;
  /** The percent it comes to now (DocumentViewport's `onScaleChange` times 100): shown, and stepped from. */
  percent: number;
  onZoomChange: (zoom: ZoomSetting) => void;
  /** The percents offered in the menu. Default 50, 75, 100, 125, 150, 200, 400. */
  presets?: number[];
  size?: Size;
  labels?: Partial<ZoomControlsLabels>;
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
};

/**
 * Zoom out, the current percent (a menu of fit modes and preset percents) and zoom in, for a DocumentViewport or any
 * zoomable view. An APG toolbar: one tab stop, arrow keys between the three.
 */
export function ZoomControls({
  zoom,
  percent,
  onZoomChange,
  presets = [50, 75, 100, 125, 150, 200, 400],
  size = "sm",
  labels,
  className,
  style,
}: ZoomControlsProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const shown = Math.round(percent);
  const choice = zoom.kind === "percent" ? `${zoom.value}` : zoom.kind;
  const items: MenuItem[] = [
    { value: "fit-width", label: text.fitWidth },
    { value: "fit-page", label: text.fitPage },
    ...presets.map((p) => ({ value: `${p}`, label: `${p}%` })),
  ].map((item) => ({ ...item, kind: "radio" as const, checked: item.value === choice, keepOpen: false }));
  const step = (direction: 1 | -1) => onZoomChange({ kind: "percent", value: zoomStep(shown, direction) });
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
        disabled={shown <= MIN_PERCENT}
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
        disabled={shown >= MAX_PERCENT}
        onClick={() => step(1)}
      />
    </Toolbar>
  );
}
