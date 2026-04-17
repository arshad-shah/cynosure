import { type ReactElement, useContext } from 'react';
import { DateRangePickerStateContext, type DateValue } from 'react-aria-components';
import { presetButton, presetRail, presetRailLabel } from './DateRangePicker.css.js';

export interface DateRangePreset {
  label: string;
  value: { start: DateValue; end: DateValue };
}

export interface DateRangePickerPresetsProps {
  presets: DateRangePreset[];
  /** Rail heading; defaults to "Quick ranges". */
  heading?: string;
}

/**
 * Left-rail of quick-range presets. Must render inside a RAC `DateRangePicker` —
 * it reads `DateRangePickerStateContext` to commit and close on click.
 */
export function DateRangePickerPresets({
  presets,
  heading = 'Quick ranges',
}: DateRangePickerPresetsProps): ReactElement | null {
  const state = useContext(DateRangePickerStateContext);
  if (!state || presets.length === 0) return null;

  const current = state.value;

  return (
    <div className={presetRail}>
      <div className={presetRailLabel}>{heading}</div>
      {presets.map((p) => {
        const active =
          current?.start != null &&
          current?.end != null &&
          current.start.compare(p.value.start) === 0 &&
          current.end.compare(p.value.end) === 0;
        return (
          <button
            key={p.label}
            type="button"
            className={presetButton}
            data-active={active ? 'true' : undefined}
            onClick={() => {
              state.setValue(p.value);
              state.setOpen(false);
            }}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
