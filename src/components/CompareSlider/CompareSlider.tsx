import { type CSSProperties, type KeyboardEvent, type ReactNode, useRef } from "react";
import { useControllableState } from "../../foundations/controllable.js";
import { useDrag } from "../../foundations/drag.js";
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
  /** The divider's starting position when uncontrolled, 0 to 100. Default 50. */
  defaultValue?: number;
  /** Called as the divider moves (drag, click or keys), with the new position, 0 to 100. */
  onChange?: ((value: number) => void) | undefined;
  /** Show the Before and After tags. Default true. */
  showTags?: boolean;
  /** Replace the built-in English text: the divider's name, its spoken position and the two tags. */
  labels?: Partial<CompareSliderLabels>;
  /** Added to the root element, for layout. */
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
  const [own, setOwn] = useControllableState(value, defaultValue, onChange);
  const position = clamp(own, 0, 100);
  const set = (next: number) => {
    const v = Math.round(clamp(next, 0, 100) * 10) / 10;
    // Only a real move is a change: a key at an end, or a pointer resting on one spot, tells nobody.
    if (v !== position) setOwn(v);
  };
  const fromX = (x: number) => {
    const box = (area.current as HTMLDivElement).getBoundingClientRect();
    return ((x - box.left) / box.width) * 100;
  };

  // Dragging through detent: the press jumps the divider there and a drag follows. The picture keeps touch-action
  // pan-y, so a sideways finger drags at once and an upward swipe still scrolls the page (the browser then cancels the
  // drag, which puts the divider back, as Escape does).
  const dragFrom = useRef(position);
  useDrag(area, {
    touchAction: "css",
    onStart: ({ point }) => {
      dragFrom.current = position;
      divider.current?.focus({ preventScroll: true });
      set(fromX(point.x));
    },
    onMove: ({ point }) => set(fromX(point.x)),
    onEnd: (_, cancelled) => cancelled && set(dragFrom.current),
  });

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // The pictures do not mirror in RTL, so neither do the keys.
    const next = stepKey(event, { value: position, min: 0, max: 100, step: 1 });
    if (next === undefined) return;
    event.preventDefault();
    set(next);
  };

  const shown = Math.round(position);
  return (
    <div
      ref={area}
      className={className ? `cy-compare-slider ${className}` : "cy-compare-slider"}
      style={{ "--_pos": `${position}%`, ...style } as CSSProperties}
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
