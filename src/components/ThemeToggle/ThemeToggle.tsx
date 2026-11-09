import type { CSSProperties } from "react";
import { monitor } from "../../icons/monitor.js";
import { moon } from "../../icons/moon.js";
import { sun } from "../../icons/sun.js";
import { type ColorMode, type ColorModeStorage, useColorMode } from "../../theme/use-color-mode.js";
import type { Size } from "../../tokens/schema.js";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl.js";

export interface ThemeToggleProps {
  /** Controlled mode; omit to manage and persist it internally. */
  value?: ColorMode;
  onChange?: (mode: ColorMode) => void;
  /** Persistence for uncontrolled use (localStorage by default; chrome.storage works too). */
  storage?: ColorModeStorage;
  size?: Size;
  labels?: { label?: string; light?: string; dark?: string; system?: string };
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
  labels,
  className,
  style,
}: ThemeToggleProps) {
  const color = useColorMode(storage ? { storage } : {});
  const mode = value ?? color.mode;
  return (
    <SegmentedControl
      label={labels?.label ?? "Colour mode"}
      iconOnly
      size={size}
      className={className}
      style={style}
      value={mode}
      onChange={(next) => {
        if (value === undefined) color.setMode(next as ColorMode);
        onChange?.(next as ColorMode);
      }}
      options={[
        { value: "light", label: labels?.light ?? "Light", icon: sun },
        { value: "dark", label: labels?.dark ?? "Dark", icon: moon },
        { value: "system", label: labels?.system ?? "System", icon: monitor },
      ]}
    />
  );
}
