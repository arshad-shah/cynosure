import type { CSSProperties } from "react";
import { monitor } from "../../icons/monitor.js";
import { moon } from "../../icons/moon.js";
import { sun } from "../../icons/sun.js";
import { type ColorMode, type ColorModeStorage, useColorMode } from "../../theme/use-color-mode.js";
import type { Size } from "../../tokens/schema.js";
import { IconButton } from "../IconButton/IconButton.js";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl.js";

export interface ThemeToggleProps {
  /** Controlled mode; omit to manage and persist it internally. */
  value?: ColorMode;
  onChange?: (mode: ColorMode) => void;
  /** Persistence for uncontrolled use (localStorage by default; chrome.storage works too). */
  storage?: ColorModeStorage;
  size?: Size;
  /**
   * `segmented` (default): three choices side by side. `cycle`: one icon button that steps light → dark → system
   * (for tight headers); its name says the current mode and the next one ("Colour mode: Light. Switch to Dark").
   */
  variant?: "segmented" | "cycle";
  labels?: {
    label?: string;
    light?: string;
    dark?: string;
    system?: string;
    /** The cycle button's name. Default "Colour mode: Light. Switch to Dark". */
    cycle?: (current: string, next: string) => string;
  };
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

/** Light / dark / system switch: a SegmentedControl with Facet icons. Pair with `<CynosureTheme mode={…}>`. */
export function ThemeToggle({
  value,
  onChange,
  storage,
  size = "md",
  variant = "segmented",
  labels,
  className,
  style,
}: ThemeToggleProps) {
  const color = useColorMode(storage ? { storage } : {});
  const mode = value ?? color.mode;
  const set = (next: ColorMode) => {
    if (value === undefined) color.setMode(next);
    onChange?.(next);
  };
  if (variant === "cycle") {
    const order: ColorMode[] = ["light", "dark", "system"];
    const names = {
      light: labels?.light ?? "Light",
      dark: labels?.dark ?? "Dark",
      system: labels?.system ?? "System",
    };
    const icons = { light: sun, dark: moon, system: monitor };
    const next = order[(order.indexOf(mode) + 1) % order.length] as ColorMode;
    const name = (labels?.cycle ?? ((c, n) => `${labels?.label ?? "Colour mode"}: ${c}. Switch to ${n}`))(
      names[mode],
      names[next],
    );
    return (
      <IconButton
        icon={icons[mode]}
        label={name}
        variant="ghost"
        size={size}
        className={className ? `cy-theme-toggle-cycle ${className}` : "cy-theme-toggle-cycle"}
        {...(style ? { style } : {})}
        onClick={() => set(next)}
      />
    );
  }
  return (
    <SegmentedControl
      label={labels?.label ?? "Colour mode"}
      iconOnly
      size={size}
      className={className}
      style={style}
      value={mode}
      onChange={(next) => set(next as ColorMode)}
      options={[
        { value: "light", label: labels?.light ?? "Light", icon: sun },
        { value: "dark", label: labels?.dark ?? "Dark", icon: moon },
        { value: "system", label: labels?.system ?? "System", icon: monitor },
      ]}
    />
  );
}
