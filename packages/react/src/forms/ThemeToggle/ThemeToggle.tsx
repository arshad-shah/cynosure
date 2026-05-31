import { type LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { ToggleGroup, ToggleGroupItem } from '../../feedback/ToggleGroup/ToggleGroup.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../../overlay/DropdownMenu/DropdownMenu.js';
import { Tooltip } from '../../overlay/Tooltip/Tooltip.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { useTheme } from '../../theme/hooks/useTheme.js';
import { IconButton } from '../IconButton/IconButton.js';
import { Switch } from '../Switch/Switch.js';

/** The three theme modes a `ThemeToggle` can surface. */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Visual presentation of the toggle.
 * - `icon` — a single icon button that cycles through `modes` (compact, great
 *   for app headers).
 * - `switch` — a sun/moon switch for a binary light↔dark choice.
 * - `segmented` — an attached segmented control with one button per mode.
 * - `menu` — an icon button that opens a dropdown of mode options.
 */
export type ThemeToggleVariant = 'icon' | 'switch' | 'segmented' | 'menu';

/** Control scale. */
export type ThemeToggleSize = 'sm' | 'md' | 'lg';

/** Props for the {@link ThemeToggle} component. */
export interface ThemeToggleProps {
  /**
   * Presentation. One of `icon`, `switch`, `segmented`, `menu`.
   * @default "icon"
   */
  variant?: ThemeToggleVariant;
  /**
   * Control scale. One of `sm`, `md`, `lg`.
   * @default "md"
   */
  size?: ThemeToggleSize;
  /**
   * Modes to offer, in order. Drives the `icon` cycle order, the `segmented`
   * buttons, and the `menu` items. Drop `'system'` if your `ThemeProvider`
   * sets `enableSystem={false}`. The `switch` variant is always binary
   * (light↔dark) and ignores this list.
   * @default ["light", "dark", "system"]
   */
  modes?: ThemeMode[];
  /** Override the visible/accessible label for one or more modes. */
  labels?: Partial<Record<ThemeMode, string>>;
  /** Override the icon for one or more modes. */
  icons?: Partial<Record<ThemeMode, ReactNode>>;
  /**
   * Show the text label next to the icon in the `segmented` variant (the
   * `menu` variant always shows labels; `icon` never does).
   * @default false
   */
  showLabels?: boolean;
  /**
   * Accessible name for the control (and heading text for the `menu`
   * variant).
   * @default "Toggle theme"
   */
  label?: string;
  /** Additional class names on the root element. */
  className?: string;
}

const ICON_FOR: Record<ThemeMode, LucideIcon> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const DEFAULT_LABELS: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

const ICON_PX: Record<ThemeToggleSize, number> = { sm: 16, md: 18, lg: 20 };

const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

/**
 * A drop-in theme switcher built from Cynosure components. Reads and writes the
 * active theme via {@link useTheme}, so it must render inside a
 * `<ThemeProvider>`. Choose a `variant` to fit the surface — a compact icon
 * button, a sun/moon switch, a segmented control, or a dropdown menu — and the
 * selection persists through the provider's storage like any other
 * `setTheme()` call.
 */
export function ThemeToggle({
  variant = 'icon',
  size = 'md',
  modes = ['light', 'dark', 'system'],
  labels,
  icons,
  showLabels = false,
  label = 'Toggle theme',
  className,
}: ThemeToggleProps): ReactElement {
  const { theme, colorScheme, setTheme } = useTheme();

  const list = modes.length > 0 ? modes : (['light', 'dark'] as ThemeMode[]);
  const px = ICON_PX[size];
  const labelFor = (mode: ThemeMode): string => labels?.[mode] ?? DEFAULT_LABELS[mode];
  const iconFor = (mode: ThemeMode): ReactNode => {
    const custom = icons?.[mode];
    if (custom !== undefined) return custom;
    const Icon = ICON_FOR[mode];
    return <Icon size={px} aria-hidden />;
  };

  // The mode whose icon represents the current state. Falls back to the first
  // configured mode when the active theme isn't one we render (e.g. a custom
  // theme name), so the trigger always shows something sensible.
  const activeMode: ThemeMode = (list as string[]).includes(theme)
    ? (theme as ThemeMode)
    : (list[0] ?? 'light');

  if (variant === 'switch') {
    const isDark = colorScheme === 'dark';
    return (
      <Inline gap="2" align="center" className={className}>
        <span aria-hidden style={{ display: 'inline-flex' }}>
          {iconFor('light')}
        </span>
        <Switch
          size={size}
          checked={isDark}
          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        >
          <span style={visuallyHidden}>{labels?.dark ?? label}</span>
        </Switch>
        <span aria-hidden style={{ display: 'inline-flex' }}>
          {iconFor('dark')}
        </span>
      </Inline>
    );
  }

  if (variant === 'segmented') {
    return (
      <ToggleGroup
        type="single"
        value={activeMode}
        // Single-select groups emit `''` when the active item is re-pressed;
        // ignore that so a theme is always selected.
        onValueChange={(value) => {
          if (value) setTheme(value);
        }}
        size={size}
        variant="outline"
        attached
        aria-label={label}
        className={className}
      >
        {list.map((mode) => (
          <ToggleGroupItem
            key={mode}
            value={mode}
            aria-label={showLabels ? undefined : labelFor(mode)}
          >
            <Inline as="span" gap="2" align="center">
              {iconFor(mode)}
              {showLabels ? labelFor(mode) : null}
            </Inline>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    );
  }

  if (variant === 'menu') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            variant="ghost"
            size={size}
            label={label}
            icon={iconFor(activeMode)}
            className={className}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
            {list.map((mode) => (
              <DropdownMenuRadioItem key={mode} value={mode}>
                <Inline as="span" gap="2" align="center">
                  {iconFor(mode)}
                  {labelFor(mode)}
                </Inline>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // variant === 'icon' — cycle through the configured modes on click.
  const idx = list.indexOf(activeMode);
  const next = list[(idx + 1) % list.length] ?? activeMode;
  return (
    <Tooltip content={`${labelFor(activeMode)} theme`}>
      <IconButton
        variant="ghost"
        size={size}
        label={`${label} — current: ${labelFor(activeMode)}`}
        icon={iconFor(activeMode)}
        onClick={() => setTheme(next)}
        className={className}
      />
    </Tooltip>
  );
}
