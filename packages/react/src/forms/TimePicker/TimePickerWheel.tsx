import { Time } from '@internationalized/date';
import { type ReactElement, useEffect, useMemo, useRef } from 'react';
import { useLocale } from 'react-aria-components';
import type { TimeValue } from 'react-aria-components';
import {
  wheelColumn,
  wheelColumnsThree,
  wheelColumnsTwo,
  wheelItem,
  wheelLabel,
  wheelList,
} from './TimePicker.css.js';

export interface TimePickerWheelProps {
  value: TimeValue | null;
  onChange: (value: Time) => void;
  /** `12` / `24` force the hour cycle. Omitted = auto-detect from locale. */
  hourCycle?: 12 | 24;
  /** Step between minute values. Defaults to `1`. */
  minuteStep?: number;
}

/** Three-column scroll-snap wheel UI for picking an hour/minute/period. */
export function TimePickerWheel({
  value,
  onChange,
  hourCycle,
  minuteStep = 1,
}: TimePickerWheelProps): ReactElement {
  const { locale } = useLocale();

  const resolvedHourCycle = useMemo<12 | 24>(() => {
    if (hourCycle) return hourCycle;
    const hour12 = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hour12;
    return hour12 ? 12 : 24;
  }, [hourCycle, locale]);

  const current = useMemo<Time>(() => {
    if (!value) return new Time(0, 0);
    return new Time(value.hour, value.minute, value.second);
  }, [value]);

  const is24 = resolvedHourCycle === 24;

  const hours = useMemo(() => {
    if (is24) return Array.from({ length: 24 }, (_, i) => i);
    return Array.from({ length: 12 }, (_, i) => i + 1);
  }, [is24]);

  const minutes = useMemo(() => {
    const step = Math.max(1, Math.floor(minuteStep));
    const out: number[] = [];
    for (let m = 0; m < 60; m += step) out.push(m);
    return out;
  }, [minuteStep]);

  const currentPeriod: 'AM' | 'PM' = current.hour < 12 ? 'AM' : 'PM';
  const currentDisplayHour = is24 ? current.hour : current.hour % 12 === 0 ? 12 : current.hour % 12;

  function onPickHour(h: number): void {
    if (is24) {
      onChange(new Time(h, current.minute, current.second));
      return;
    }
    const realHour = currentPeriod === 'AM' ? (h === 12 ? 0 : h) : h === 12 ? 12 : h + 12;
    onChange(new Time(realHour, current.minute, current.second));
  }

  function onPickMinute(m: number): void {
    onChange(new Time(current.hour, m, current.second));
  }

  function onPickPeriod(p: 'AM' | 'PM'): void {
    if (p === currentPeriod) return;
    const nextHour = p === 'AM' ? current.hour - 12 : current.hour + 12;
    onChange(new Time(nextHour, current.minute, current.second));
  }

  const step = Math.max(1, Math.floor(minuteStep));
  const snappedMinute = current.minute - (current.minute % step);

  return (
    <div className={is24 ? wheelColumnsTwo : wheelColumnsThree}>
      <WheelColumn
        label="Hour"
        items={hours}
        selected={currentDisplayHour}
        format={(n) => String(n).padStart(2, '0')}
        onPick={onPickHour}
      />
      <WheelColumn
        label="Minute"
        items={minutes}
        selected={snappedMinute}
        format={(n) => String(n).padStart(2, '0')}
        onPick={onPickMinute}
      />
      {is24 ? null : (
        <WheelColumn<'AM' | 'PM'>
          label="Period"
          items={['AM', 'PM']}
          selected={currentPeriod}
          format={(p) => p}
          onPick={onPickPeriod}
        />
      )}
    </div>
  );
}

interface WheelColumnProps<T extends string | number> {
  label: string;
  items: T[];
  selected: T;
  format: (value: T) => string;
  onPick: (value: T) => void;
}

function WheelColumn<T extends string | number>({
  label,
  items,
  selected,
  format,
  onPick,
}: WheelColumnProps<T>): ReactElement {
  const selectedRef = useRef<HTMLButtonElement | null>(null);

  // `selected` is needed because the ref is reassigned when it changes — the
  // effect must re-run to scroll the new selected button into view.
  // biome-ignore lint/correctness/useExhaustiveDependencies: ref target changes with selected
  useEffect(() => {
    const el = selectedRef.current;
    if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
  }, [selected]);

  return (
    <div className={wheelColumn}>
      <span className={wheelLabel}>{label}</span>
      <div className={wheelList} aria-label={label}>
        {items.map((item) => {
          const isSelected = item === selected;
          return (
            <button
              key={String(item)}
              ref={isSelected ? selectedRef : undefined}
              type="button"
              aria-pressed={isSelected}
              data-selected={isSelected ? 'true' : undefined}
              className={wheelItem}
              onClick={() => onPick(item)}
            >
              {format(item)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
