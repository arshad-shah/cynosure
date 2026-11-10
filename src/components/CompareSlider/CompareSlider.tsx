import { bindPointer } from "@arshad-shah/detent";
import { type CSSProperties, type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { stepKey } from "../../foundations/keys.js";
import { clamp } from "../../foundations/math.js";

export interface CompareSliderTokens {
  /** Colour of the divider line and grip. */
  divider: string;
  /** Size of the grip on the divider. */
  gripSize: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    compareSlider: CompareSliderTokens;
  }
}

export interface CompareSliderLabels {
  /** Name of the divider. Default: "Comparison". */
  divider: string;
  /** Spoken position. Default: "40% before". */
  position: (percent: number) => string;
  /** Tags shown on the two sides. Defaults: "Before", "After". */
  before: string;
  after: string;
}

export interface CompareSliderProps {
  /** Shown on the start side of the divider (e.g. the original image). */
  before: ReactNode;
  /** Shown on the other side (e.g. the edited image). Both should be the same size. */
  after: ReactNode;
  /** Divider position: percent of the width showing `before`. */
  value?: number | undefined;
  defaultValue?: number;
  onChange?: ((value: number) => void) | undefined;
  /** Show the Before and After tags. Default true. */
  showTags?: boolean;
  labels?: Partial<CompareSliderLabels>;
  className?: string;
  /** Layout only. Restyle through --cy-compare-slider-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: CompareSliderLabels = {
  divider: "Comparison",
  position: (p) => `${p}% before`,
  before: "Before",
  after: "After",
};

/**
 * Before and after, one over the other, split by a divider people move: drag anywhere (mouse, pen or a held finger),
 * click to jump, or focus the divider and use the arrow keys. An APG slider.
 */
export function CompareSlider({
  before,
  after,
  value,
  defaultValue = 50,
  onChange,
  showTags = true,
  labels,
  className,
  style,
}: CompareSliderProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const area = useRef<HTMLDivElement>(null);
  const divider = useRef<HTMLDivElement>(null);
  const controlled = value !== undefined;
  const [own, setOwn] = useState(defaultValue);
  const position = clamp(controlled ? value : own, 0, 100);
  const set = (next: number) => {
    const v = Math.round(clamp(next, 0, 100) * 10) / 10;
    if (!controlled) setOwn(v);
    onChange?.(v);
  };
  const latest = useRef(set);
  latest.current = set;
  const fromX = (x: number) => {
    const box = (area.current as HTMLDivElement).getBoundingClientRect();
    return ((x - box.left) / box.width) * 100;
  };

  // Dragging through detent: mouse and pen start at once, a finger after a short hold (a swipe still scrolls).
  useEffect(() => {
    const bound = bindPointer(area.current as HTMLDivElement, {
      distance: 0,
      onStart: ({ point }) => {
        divider.current?.focus({ preventScroll: true });
        latest.current(fromX(point.x));
      },
      onMove: ({ point }) => latest.current(fromX(point.x)),
    });
    return () => bound.destroy();
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // The pictures do not mirror in RTL, so neither do the keys.
    const next = stepKey(event, { value: position, min: 0, max: 100, step: 1 });
    if (next === undefined) return;
    event.preventDefault();
    set(next);
  };

  const shown = Math.round(position);
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents: clicking the picture jumps the divider; the divider itself is the keyboard control
    <div
      ref={area}
      className={className ? `cy-compare-slider ${className}` : "cy-compare-slider"}
      style={{ "--_pos": `${position}%`, ...style } as CSSProperties}
      onClick={(event) => set(fromX(event.clientX))}
    >
      <div className="cy-compare-slider-layer cy-reset" data-side="after">
        {after}
      </div>
      <div className="cy-compare-slider-layer cy-reset" data-side="before">
        {before}
      </div>
      {showTags && (
        <>
          <span className="cy-compare-slider-tag cy-reset" data-side="before" aria-hidden="true">
            {text.before}
          </span>
          <span className="cy-compare-slider-tag cy-reset" data-side="after" aria-hidden="true">
            {text.after}
          </span>
        </>
      )}
      <div
        ref={divider}
        role="slider"
        tabIndex={0}
        aria-label={text.divider}
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={shown}
        aria-valuetext={text.position(shown)}
        className="cy-compare-slider-divider cy-reset"
        onKeyDown={onKeyDown}
      >
        <span className="cy-compare-slider-grip cy-reset" aria-hidden="true" />
      </div>
    </div>
  );
}
